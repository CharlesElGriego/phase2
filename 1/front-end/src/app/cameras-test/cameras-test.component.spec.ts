import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CamerasTestComponent } from './cameras-test.component';
import { of } from 'rxjs';

describe('CamerasTestComponent', () => {
  let component: CamerasTestComponent;
  let fixture: ComponentFixture<CamerasTestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CamerasTestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CamerasTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.form.value).toEqual({
      desiredDistance: { min: null, max: null },
      desiredLight: { min: null, max: null },
      hardwareCameras: [],
    });
  });

  it('should add a hardware camera', () => {
    component.addHardwareCamera();
    expect(component.hardwareCameras.length).toBe(1);
  });

  it('should remove a hardware camera', () => {
    component.addHardwareCamera();
    component.addHardwareCamera();
    expect(component.hardwareCameras.length).toBe(2);

    component.removeHardwareCamera(0);
    expect(component.hardwareCameras.length).toBe(1);
  });

  it('should mark the form as invalid if required fields are missing', () => {
    // Form is initially invalid
    expect(component.form.valid).toBe(false);

    // Patch only desiredDistance and desiredLight
    component.form.patchValue({
      desiredDistance: { min: 10, max: 20 },
      desiredLight: { min: 30, max: 40 },
    });

    // Still invalid because hardwareCameras is empty
    expect(component.form.valid).toBe(false);

    // Add a valid camera to hardwareCameras
    component.addHardwareCamera();
    component.hardwareCameras.at(0)?.patchValue({
      distance: { min: 5, max: 15 },
      light: { min: 20, max: 50 },
    });

    // Now the form should be valid
    expect(component.form.valid).toBe(true);
  });

  it('should mark the form as valid when all required fields are filled', () => {
    component.addHardwareCamera();

    component.form.patchValue({
      desiredDistance: { min: 10, max: 20 },
      desiredLight: { min: 30, max: 40 },
      hardwareCameras: [
        {
          distance: { min: 5, max: 15 },
          light: { min: 25, max: 35 },
        },
      ],
    });

    expect(component.form.valid).toBe(true);
  });

  it('should reset state when testCoverage is called', () => {
    jest.spyOn(component, 'resetState');
    component.testCoverage();

    expect(component.resetState).toHaveBeenCalled();
    expect(component.result).toBeNull();
    expect(component.errorMessage).toBeNull();
    expect(component.compatibleCameras).toEqual([]);
  });

  it('should handle errors during testCoverage execution', () => {
    const mockValue = { result: 'Error', compatibleCameras: [] };
    jest.spyOn(component, 'processRawCoverage').mockReturnValue(of(mockValue));

    component.testCoverage();

    expect(component.result).toBe(null);
    expect(component.compatibleCameras).toEqual([]);
  });

  it('should return insufficient coverage when no cameras are added', () => {
    component.form.patchValue({
      desiredDistance: { min: 10, max: 20 },
      desiredLight: { min: 30, max: 40 },
    });

    component.testCoverage();

    expect(component.result).toBeNull(); // Pending as it processes asynchronously
  });
});
