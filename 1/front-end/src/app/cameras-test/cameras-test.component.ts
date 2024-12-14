import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { isSufficientCoverage } from '../../../../../2/problem.js';
import {
  CameraForm,
  CamerasTestForm,
  CamerasTestFormRaw,
  HardwareCamera,
  ProcessCoverageResult,
} from './model-form.interface';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, delay, finalize, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-cameras-test',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cameras-test.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CamerasTestComponent {
  form: FormGroup<CamerasTestForm>;
  result: string | null = null;
  errorMessage: string | null = null;
  compatibleCameras: HardwareCamera[] = [];
  loading$ = new BehaviorSubject<boolean>(false);

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group<CamerasTestForm>({
      desiredDistance: this.fb.group(
        {
          min: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
          max: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
        },
        { validators: this.minMaxValidator }
      ),
      desiredLight: this.fb.group(
        {
          min: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
          max: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
        },
        { validators: this.minMaxValidator }
      ),
      hardwareCameras: this.fb.array<FormGroup<CameraForm>>([], [this.requiredArrayValidator]),
    });
  }

  get hardwareCameras(): FormArray<FormGroup<CameraForm>> {
    return this.form.get('hardwareCameras') as FormArray<FormGroup<CameraForm>>;
  }

  addHardwareCamera(): void {
    const cameraGroup = this.fb.group<CameraForm>({
      distance: this.fb.group({
        min: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
        max: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      }),
      light: this.fb.group({
        min: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
        max: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      }),
    });
    this.hardwareCameras.push(cameraGroup);
  }

  removeHardwareCamera(index: number): void {
    this.hardwareCameras.removeAt(index);
    if (this.hardwareCameras.length === 0) {
      this.form.markAsTouched();
    }
  }

  testCoverage(): void {
    this.resetState();
    const rawValue = this.form.getRawValue();

    of(rawValue)
      .pipe(
        delay(500), // Simulate network latency
        switchMap(value => this.processRawCoverage(value)),
        take(1),
        catchError((error: unknown) => {
          this.handleError(error);
          return of({ result: 'Error', compatibleCameras: [] });
        }),
        finalize(() => this.loading$.next(false)) // End loading state
      )
      .subscribe(({ result, compatibleCameras }: ProcessCoverageResult) =>
        this.updateState(result, compatibleCameras)
      );
  }

  processRawCoverage(rawValue: CamerasTestFormRaw): Observable<ProcessCoverageResult> {
    if (!this.validateRawCoverage(rawValue)) {
      return of({ result: 'Insufficient Coverage', compatibleCameras: [] });
    }

    const { desiredDistance, desiredLight, hardwareCameras } = rawValue;

    const hardwareArray = hardwareCameras.map((camera, index) => ({
      distance: [camera.distance.min || 0, camera.distance.max || 0] as [number, number],
      light: [camera.light.min || 0, camera.light.max || 0] as [number, number],
      cameraIndex: index + 1,
    }));

    const isCovered = this.checkCoverage(
      { min: desiredDistance.min ?? 0, max: desiredDistance.max ?? 0 },
      { min: desiredLight.min ?? 0, max: desiredLight.max ?? 0 },
      hardwareArray
    );
    const compatibleCameras = isCovered
      ? this.getCompatibleCameras(
          { min: desiredDistance.min ?? 0, max: desiredDistance.max ?? 0 },
          { min: desiredLight.min ?? 0, max: desiredLight.max ?? 0 },
          hardwareArray
        )
      : [];

    return of({
      result: isCovered ? 'Sufficient Coverage' : 'Insufficient Coverage',
      compatibleCameras,
    });
  }

  resetState(): void {
    this.result = null;
    this.errorMessage = null;
    this.compatibleCameras = [];
    this.loading$.next(true);
  }

  //#region Form HTML Helpers
  isInvalid(groupPath: string, controlName: string): boolean {
    const control = this.form.get(`${groupPath}.${controlName}`);
    return (control?.invalid && control?.touched) || false;
  }

  getErrorMessage(groupPath: string, controlName: string): string {
    const control = this.form.get(`${groupPath}.${controlName}`);
    const group = this.form.get(groupPath) as FormGroup;

    // Check group-level error first
    if (group?.hasError('invalidRange')) return 'Invalid range: Min should not exceed Max.';

    // Check control-level errors
    if (control?.hasError('required')) return 'Value is required.';
    if (control?.hasError('min')) return 'Value must be greater than or equal to 0.';

    return 'Invalid value.';
  }
  //#endregion

  //#region Private Helper Methods

  private checkCoverage(
    desiredDistance: { min: number; max: number },
    desiredLight: { min: number; max: number },
    hardwareArray: HardwareCamera[]
  ): boolean {
    return isSufficientCoverage(
      [desiredDistance.min ?? 0, desiredDistance.max ?? 0],
      [desiredLight.min ?? 0, desiredLight.max ?? 0],
      hardwareArray
    );
  }

  private getCompatibleCameras(
    desiredDistance: { min: number; max: number },
    desiredLight: { min: number; max: number },
    hardwareArray: HardwareCamera[]
  ): HardwareCamera[] {
    return hardwareArray.filter(camera => {
      return (
        camera.distance[0] <= desiredDistance.max &&
        camera.distance[1] >= desiredDistance.min &&
        camera.light[0] <= desiredLight.max &&
        camera.light[1] >= desiredLight.min
      );
    });
  }

  private updateState(result: string, compatibleCameras: HardwareCamera[]): void {
    this.result = result;
    this.compatibleCameras = [...compatibleCameras];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleError(error: any): void {
    console.error('Error occurred:', error);
    this.errorMessage = error ?? 'An error occurred';
  }

  private validateRawCoverage(rawValue: CamerasTestFormRaw): boolean {
    const { desiredDistance, desiredLight, hardwareCameras } = rawValue;

    if (!desiredDistance.min || !desiredDistance.max || !desiredLight.min || !desiredLight.max) {
      return false;
    }

    if (!hardwareCameras.length) {
      return false;
    }

    return hardwareCameras.every(camera => camera.distance && camera.light);
  }

  private minMaxValidator(group: FormGroup): { [key: string]: boolean } | null {
    const min = group.get('min')?.value;
    const max = group.get('max')?.value;
    return min !== null && max !== null && min > max ? { invalidRange: true } : null;
  }

  private requiredArrayValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formArray = control as FormArray; // Cast control to FormArray
    return formArray.length > 0 ? null : { required: true };
  }
  //#endregion
}
