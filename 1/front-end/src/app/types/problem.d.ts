declare module '../../../../../2/problem.js' {
  export function isSufficientCoverage(
    desiredDistance: [number, number],
    desiredLight: [number, number],
    hardwareCameras: Array<{
      distance: [number, number];
      light: [number, number];
    }>
  ): boolean;
}
