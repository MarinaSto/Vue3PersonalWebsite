/**
 * Generate a random color with desired saturation lightness and transparecy
 * @param {number} saturation number between 0 and 100
 * @param {number} lightness number between 0 and 100
 * @param {number} alpha number between 0 and 1
 * @returns
 */
export function randomColorHsla(saturation = 40, lightness = 60, alpha = 0.5) {
    saturation = trim(saturation, 0, 100);
    lightness = trim(lightness, 0, 100);
    alpha = trim(alpha, 0, 100);
    let c = Math.floor(Math.random() * 360);
    return `hsla(${c},${Math.floor(saturation)}%,${Math.floor(lightness)}%,${alpha}`;
};

export function trim(x, min, max) {
    return x < min ? min : x > max ? max : x;
}

export function rng(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
