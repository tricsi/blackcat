export const X = 0
export const Y = 1
export const Z = 2
export const W = 3

export const R = 0
export const G = 1
export const B = 2
export const A = 3

export const { abs, ceil, cos, floor, max, min, pow, random, round, sign, sin, sqrt, PI } = Math

/**
 * Applies a callback to each element of an array, writing results to the output array.
 *
 * @param out - The output array to write results to.
 * @param obj - The input array to iterate over.
 * @param callback - Function to apply to each element and index.
 * @returns The output array.
 */
export function each(
    out: number[],
    obj: number[],
    callback: (v: number, i: number) => number,
): number[] {
    obj.forEach((v, i) => i < out.length && (out[i] = callback(v, i)))
    return out
}

/**
 * Checks if all elements in an array (or a single value) are equal to a given value.
 *
 * @param obj - The array or value to check.
 * @param value - The value to compare against (default: 0).
 * @returns True if all elements (or the value) are equal to `value`.
 */
export const eq = (obj: number | number[], value: number = 0) =>
    obj instanceof Array ? obj.find((v) => v !== value) === undefined : obj === value

/**
 * Copies values from one array to another.
 *
 * @param out - The output array.
 * @param obj - The input array.
 * @returns The output array with copied values.
 */
export const copy = (out: number[], obj: number[]) => each(out, obj, (v) => v)

/**
 * Sets the output array to the provided values.
 *
 * @param out - The output array.
 * @param obj - The values to set.
 * @returns The output array with new values.
 */
export const set = (out: number[], ...obj: number[]) => copy(out, obj)

/**
 * Adds two arrays element-wise and writes the result to the output array.
 *
 * @param obj1 - The first input array.
 * @param obj2 - The second input array.
 * @param out - The output array (default: obj1).
 * @returns The output array with summed values.
 */
export const add = (obj1: number[], obj2: number[], out: number[] = obj1) =>
    each(out, obj2, (v, i) => obj1[i] + v)

/**
 * Subtracts the second array from the first element-wise and writes the result to the output array.
 *
 * @param obj1 - The first input array.
 * @param obj2 - The second input array.
 * @param out - The output array (default: obj1).
 * @returns The output array with subtracted values.
 */
export const sub = (obj1: number[], obj2: number[], out: number[] = obj1) =>
    each(out, obj2, (v, i) => obj1[i] - v)

/**
 * Divides the first array by the second element-wise and writes the result to the output array.
 *
 * @param obj1 - The numerator array.
 * @param obj2 - The denominator array.
 * @param out - The output array (default: obj1).
 * @returns The output array with divided values.
 */
export const div = (obj1: number[], obj2: number[], out: number[] = obj1) =>
    each(out, obj2, (v, i) => obj1[i] / v)

/**
 * Multiplies two arrays element-wise and writes the result to the output array.
 *
 * @param obj1 - The first input array.
 * @param obj2 - The second input array.
 * @param out - The output array (default: obj1).
 * @returns The output array with multiplied values.
 */
export const multiply = (obj1: number[], obj2: number[], out: number[] = obj1) =>
    each(out, obj2, (v, i) => obj1[i] * v)

/**
 * Scales all elements of an array by a value and writes the result to the output array.
 *
 * @param obj - The input array.
 * @param value - The scale factor.
 * @param out - The output array (default: obj).
 * @returns The output array with scaled values.
 */
export const scale = (obj: number[], value: number, out: number[] = obj) =>
    each(out, obj, (v) => v * value)

/**
 * Reverses the sign of all elements in an array and writes the result to the output array.
 *
 * @param obj - The input array.
 * @param out - The output array (default: obj).
 * @returns The output array with negated values.
 */
export const reverse = (obj: number[], out: number[] = obj) => each(out, obj, (v) => -v)

/**
 * Converts a hex color string to a normalized Float32Array of RGBA values.
 *
 * @param value - The hex color string.
 * @returns A Float32Array of 4 normalized color values.
 */
export const hex = (value: string) =>
    new Float32Array(4).fill(1).map((v, i) => (value.length <= i ? v : parseInt(value[i], 16) / 15))

/**
 * Returns a random integer between 0 and max (inclusive), optionally using a seed.
 *
 * @param max - The maximum value.
 * @param seed - Optional seed value.
 * @returns A random integer.
 */
export const irnd = (max: number, seed: number = 0) => rnd(max, seed, 1)

/**
 * Returns a random number between 0 and max, optionally using a seed and rounding.
 *
 * @param max - The maximum value (default: 1).
 * @param seed - Optional seed value.
 * @param rounded - If true, rounds the result.
 * @returns A random number.
 */
export function rnd(max: number = 1, seed: number = 0, rounded: number = 0): number {
    if (max <= 0) {
        return max
    }
    const mod = 233280
    rnd.seed = (rnd.seed * 9301 + 49297) % mod
    seed = seed ? rnd.seed * seed % mod : rnd.seed
    const value = (seed / mod) * max
    return rounded ? round(value) : value
}

rnd.seed = random()
