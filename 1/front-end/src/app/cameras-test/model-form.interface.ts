import { FormArray, FormControl, FormGroup } from '@angular/forms';

export interface HardwareCamera {
  distance: [number, number];
  light: [number, number];
  cameraIndex: number;
}

export interface ProcessCoverageResult {
  result: string;
  compatibleCameras: HardwareCamera[];
}

export interface CameraForm {
  distance: FormGroup<{
    min: FormControl<number | null>;
    max: FormControl<number | null>;
  }>;
  light: FormGroup<{
    min: FormControl<number | null>;
    max: FormControl<number | null>;
  }>;
}

export interface CamerasTestForm {
  desiredDistance: FormGroup<{
    min: FormControl<number | null>;
    max: FormControl<number | null>;
  }>;
  desiredLight: FormGroup<{
    min: FormControl<number | null>;
    max: FormControl<number | null>;
  }>;
  hardwareCameras: FormArray<FormGroup<CameraForm>>;
}

export interface CamerasTestFormRaw {
  desiredDistance: { min: number | null; max: number | null };
  desiredLight: { min: number | null; max: number | null };
  hardwareCameras: {
    distance: { min: number | null; max: number | null };
    light: { min: number | null; max: number | null };
  }[];
}
