import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CamerasTestComponent } from './cameras-test.component';
import { of, throwError } from 'rxjs';

describe('CamerasTestComponent', () => {
  let component: CamerasTestComponent;
  let fixture: ComponentFixture<CamerasTestComponent>;
  let fb: FormBuilder;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CamerasTestComponent],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(CamerasTestComponent);
    component = fixture.componentInstance;
    fb = TestBed.inject(FormBuilder);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization and Management', () => {
    it('should initialize the form with default values', () => {
      expect(component.form.value).toEqual({
        desiredDistance: { min: null, max: null },
        desiredLight: { min: null, max: null },
        hardwareCameras: [],
      });
    });

    it('should add and remove hardware cameras correctly', () => {
      component.addHardwareCamera();
      component.addHardwareCamera();
      expect(component.hardwareCameras.length).toBe(2);

      component.removeHardwareCamera(0);
      expect(component.hardwareCameras.length).toBe(1);
    });

    it('should mark the form as touched if no cameras remain after removal', () => {
      const markAsTouchedSpy = jest.spyOn(component.form, 'markAsTouched');
      component.addHardwareCamera();

      component.removeHardwareCamera(0);
      expect(component.hardwareCameras.length).toBe(0);
      expect(markAsTouchedSpy).toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should mark the form as invalid if required fields are missing', () => {
      expect(component.form.valid).toBe(false);

      component.form.patchValue({
        desiredDistance: { min: 10, max: 20 },
        desiredLight: { min: 30, max: 40 },
      });

      expect(component.form.valid).toBe(false);

      component.addHardwareCamera();
      component.hardwareCameras.at(0)?.patchValue({
        distance: { min: 5, max: 15 },
        light: { min: 20, max: 50 },
      });

      expect(component.form.valid).toBe(true);
    });

    it('should validate min and max range correctly', () => {
      const group = fb.group({
        min: fb.control(10),
        max: fb.control(5),
      });

      const invalidResult = component['minMaxValidator'](group);
      expect(invalidResult).toEqual({ invalidRange: true });

      group.patchValue({ min: 5, max: 10 });
      const validResult = component['minMaxValidator'](group);
      expect(validResult).toBeNull();
    });
  });

  describe('State Management', () => {
    it('should reset all properties to their initial state when resetState is called', () => {
      component.result = 'Some Result';
      component.errorMessage = 'Some Error';
      component.compatibleCameras = [{ distance: [0, 10], light: [20, 50], cameraIndex: 1 }];
      component.loading$.next(false);

      component.resetState();

      expect(component.result).toBeNull();
      expect(component.errorMessage).toBeNull();
      expect(component.compatibleCameras).toEqual([]);
      expect(component.loading$.value).toBe(true);
    });
  });

  describe('Coverage Processing', () => {
    it('should return insufficient coverage when validateRawCoverage fails', done => {
      const mockRawValue = {
        desiredDistance: { min: null, max: null },
        desiredLight: { min: null, max: null },
        hardwareCameras: [],
      };

      component['processRawCoverage'](mockRawValue).subscribe(result => {
        expect(result).toEqual({ result: 'Insufficient Coverage', compatibleCameras: [] });
        done();
      });
    });

    it('should return sufficient coverage with compatible cameras when validation passes', done => {
      const mockRawValue = {
        desiredDistance: { min: 5, max: 15 },
        desiredLight: { min: 10, max: 20 },
        hardwareCameras: [{ distance: { min: 5, max: 15 }, light: { min: 10, max: 20 } }],
      };

      component['processRawCoverage'](mockRawValue).subscribe(result => {
        expect(result.result).toBe('Sufficient Coverage');
        expect(result.compatibleCameras.length).toBe(1);
        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should set the correct error message and log the error', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = 'Test error';

      component['handleError'](mockError);

      expect(component.errorMessage).toBe(mockError);
      expect(errorSpy).toHaveBeenCalledWith('Error occurred:', mockError);

      errorSpy.mockRestore();
    });

    it('should set a default error message if none is provided', () => {
      component['handleError'](null);

      expect(component.errorMessage).toBe('An error occurred');
    });

    it('should catch errors and call handleError in testCoverage()', fakeAsync(() => {
      const mockError = 'Test error';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const handleErrorSpy = jest.spyOn<any, any>(component, 'handleError');

      jest.spyOn(component, 'processRawCoverage').mockImplementation(() => {
        return throwError(mockError);
      });

      component.testCoverage();

      tick(500);
      expect(handleErrorSpy).toHaveBeenCalledWith(mockError);
    }));
  });

  describe('testCoverage()', () => {
    it('should reset the state and process the raw value correctly', fakeAsync(() => {
      jest.spyOn(component, 'resetState');
      jest
        .spyOn(component, 'processRawCoverage')
        .mockReturnValue(of({ result: 'Sufficient Coverage', compatibleCameras: [] }));

      component.testCoverage();

      tick(500);
      expect(component.resetState).toHaveBeenCalled();
      expect(component.result).toBe('Sufficient Coverage');
      expect(component.compatibleCameras).toEqual([]);
    }));

    it('should finalize the loading state after processing', fakeAsync(() => {
      component.loading$.next(true);

      jest
        .spyOn(component, 'processRawCoverage')
        .mockReturnValue(of({ result: 'Sufficient Coverage', compatibleCameras: [] }));

      component.testCoverage();

      tick(500);
      expect(component.loading$.value).toBe(false);
    }));
  });

  describe('Validators', () => {
    it('should return { required: true } if the form array is empty', () => {
      const emptyArray = fb.array([]);
      const result = component['requiredArrayValidator'](emptyArray);

      expect(result).toEqual({ required: true });
    });

    it('should return null if the form array has elements', () => {
      const nonEmptyArray = fb.array([fb.group({})]);
      const result = component['requiredArrayValidator'](nonEmptyArray);

      expect(result).toBeNull();
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the correct error message for group-level invalidRange error', () => {
      const group = component.form.get('desiredDistance') as FormGroup;
      group.setErrors({ invalidRange: true });

      const errorMessage = component.getErrorMessage('desiredDistance', 'min');
      expect(errorMessage).toBe('Invalid range: Min should not exceed Max.');
    });

    it('should return the correct error message for control-level required error', () => {
      const control = component.form.get('desiredDistance.min');
      control?.setErrors({ required: true });

      const errorMessage = component.getErrorMessage('desiredDistance', 'min');
      expect(errorMessage).toBe('Value is required.');
    });

    it('should return the correct error message for control-level min error', () => {
      const control = component.form.get('desiredDistance.min');
      control?.setErrors({ min: true });

      const errorMessage = component.getErrorMessage('desiredDistance', 'min');
      expect(errorMessage).toBe('Value must be greater than or equal to 0.');
    });

    it('should return the default error message for unknown errors', () => {
      const control = component.form.get('desiredDistance.min');
      control?.setErrors({ unknownError: true });

      const errorMessage = component.getErrorMessage('desiredDistance', 'min');
      expect(errorMessage).toBe('Invalid value.');
    });
  });
  describe('validateRawCoverage()', () => {
    it('should return false if hardwareCameras array is empty', () => {
      const invalidRawValue = {
        desiredDistance: { min: 5, max: 15 },
        desiredLight: { min: 10, max: 20 },
        hardwareCameras: [],
      };

      const result = component['validateRawCoverage'](invalidRawValue);
      expect(result).toBe(false);
    });

    it('should return true if hardwareCameras array is not empty', () => {
      const validRawValue = {
        desiredDistance: { min: 5, max: 15 },
        desiredLight: { min: 10, max: 20 },
        hardwareCameras: [{ distance: { min: 5, max: 15 }, light: { min: 10, max: 20 } }],
      };

      const result = component['validateRawCoverage'](validRawValue);
      expect(result).toBe(true);
    });
  });
});
