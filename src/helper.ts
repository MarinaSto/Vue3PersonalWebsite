/**
 * Generate a random color with desired saturation lightness and transparecy.
 * @param saturation number between 0 and 100.
 * @param lightness number between 0 and 100.
 * @param alpha number between 0 and 1.
 * @returns
 */
export function randomColorHsla(
  saturation = 40,
  lightness = 60,
  alpha = 0.5
): string {
  saturation = trim(saturation, 0, 100);
  lightness = trim(lightness, 0, 100);
  alpha = trim(alpha, 0, 100);
  const c = Math.floor(Math.random() * 360);
  return `hsla(${c},${Math.floor(saturation)}%,${Math.floor(
    lightness
  )}%,${alpha}`;
}

/**
 * Trim a value between a min and a max.
 * @param x value to trim.
 * @param min minumum value.
 * @param max maximum value.
 */
export function trim(x: number, min: number, max: number): number {
  return x < min ? min : x > max ? max : x;
}

/**
 * Create random integer number in the desired range.
 * @param min min possible value.
 * @param max max possible value.
 */
export function rng(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min);
}
