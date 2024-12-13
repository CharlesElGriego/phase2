// @ts-check // Enables TypeScript checks for JSDoc comments.
/**
 * Checks if the set of hardware cameras covers the desired ranges.
 *
 * @param {Array<number>} desiredDistance - The range of subject distances [min, max].
 * @param {Array<number>} desiredLight - The range of light levels [min, max].
 * @param {Array<{ distance: [number, number], light: [number, number] }>} hardwareCameras
 * - A list of hardware cameras, each with a range of subject distances and light levels.
 *
 * @returns {boolean} True if the hardware cameras cover the desired ranges, False otherwise.
 */

export function isSufficientCoverage(
  desiredDistance,
  desiredLight,
  hardwareCameras
) {
  // Validate input
  if (
    !hardwareCameras ||
    !Array.isArray(hardwareCameras) ||
    hardwareCameras.length === 0
  ) {
    return false; // No hardware cameras provided
  }

  // Ensure valid ranges (non-negative values)
  if (
    desiredDistance[0] < 0 ||
    desiredDistance[1] < 0 ||
    desiredLight[0] < 0 ||
    desiredLight[1] < 0
  ) {
    throw new Error('Desired ranges cannot have negative values.');
  }

  for (const camera of hardwareCameras) {
    if (
      camera.distance[0] < 0 ||
      camera.distance[1] < 0 ||
      camera.light[0] < 0 ||
      camera.light[1] < 0
    ) {
      throw new Error('Hardware camera ranges cannot have negative values.');
    }
  }

  // Check distance coverage
  hardwareCameras.sort((a, b) => a.distance[0] - b.distance[0]);
  let currentDistanceEnd = desiredDistance[0];
  for (const { distance } of hardwareCameras) {
    if (distance[0] > currentDistanceEnd) {
      return false; // Gap in coverage
    }
    currentDistanceEnd = Math.max(currentDistanceEnd, distance[1]);
    if (currentDistanceEnd >= desiredDistance[1]) {
      break;
    }
  }
  if (currentDistanceEnd < desiredDistance[1]) {
    return false; // Coverage does not extend far enough
  }

  // Check light coverage
  hardwareCameras.sort((a, b) => a.light[0] - b.light[0]);
  let currentLightEnd = desiredLight[0];
  for (const { light } of hardwareCameras) {
    if (light[0] > currentLightEnd) {
      return false; // Gap in coverage
    }
    currentLightEnd = Math.max(currentLightEnd, light[1]);
    if (currentLightEnd >= desiredLight[1]) {
      break;
    }
  }

  return currentLightEnd >= desiredLight[1]; // Check final coverage
}

// Example Usage
const desiredDistance = [0.5, 10.0];
const desiredLight = [100, 1000];
const hardwareCameras = [
  { distance: [0.5, 5.0], light: [100, 500] },
  { distance: [5.0, 10.0], light: [500, 1000] },
];

console.log(
  // @ts-ignore
  isSufficientCoverage(desiredDistance, desiredLight, hardwareCameras)
);
console.log(isSufficientCoverage(desiredDistance, desiredLight, [])); // false
// @ts-ignore
console.log(isSufficientCoverage(desiredDistance, desiredLight, null)); // false
// @ts-ignore
console.log(isSufficientCoverage(desiredDistance, desiredLight, undefined)); // false
