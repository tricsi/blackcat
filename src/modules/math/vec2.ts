import { cos, each, scale, sin, sqrt, X, Y } from "."

/**
 * Dot production of 2d vectors
 * 
 * @param vec1 - Input vertor 1
 * @param vec2 - Input vertor 2
 * @returns Output vector
 */
export const v2dot = ([x1, y1]: number[], [x2, y2]: number[]) => x1 * x2 + y1 * y2

/**
 * Vector lenght square
 * 
 * @param vec - Input vector
 * @returns length square value
 */
export const v2len2 = (vec: number[]) => v2dot(vec, vec)

/**
 * Vector lenght
 * 
 * @param vec - Input vector
 * @returns length value
 */
export const v2len = (vec: number[]) => sqrt(v2len2(vec))

/**
 * Prepares a vector by rotating it 90 degrees counterclockwise.
 *
 * @param out - The vector to modify.
 * @returns The rotated vector.
 */
export function v2prep(out: number[]): number[] {
    const [x, y] = out
    out[X] = y
    out[Y] = -x
    return out
}

/**
 * Normalizes a vector to unit length.
 *
 * @param out - The vector to normalize.
 * @returns The normalized vector.
 */
export function v2norm(out: number[]): number[] {
    const d = v2len(out)
    return d > 0 ? scale(out, 1 / d) : out
}

/**
 * Rotates a vector by a given angle (in radians).
 *
 * @param out - The vector to rotate.
 * @param angle - The angle in radians.
 * @returns The rotated vector.
 */
export function v2rotate(out: number[], angle: number): number[] {
    const [x, y] = out
    const s = sin(angle)
    const c = cos(angle)
    out[X] = x * c - y * s
    out[Y] = x * s + y * c
    return out
}

/**
 * Projects a vector onto another vector.
 *
 * @param out - The vector to project.
 * @param vec - The vector to project onto.
 * @returns The projected vector.
 */
export function v2project(out: number[], vec: number[]): number[] {
    const amt = v2dot(out, vec) / v2len2(vec)
    return each(out, vec, v => v * amt) as number[]
}

/**
 * Projects a vector onto a normalized vector.
 *
 * @param out - The vector to project.
 * @param vec - The normalized vector to project onto.
 * @returns The projected vector.
 */
export function v2projectN(out: number[], vec: number[]): number[] {
    const amt = v2dot(out, vec)
    return each(out, vec, v => v * amt) as number[]
}

/**
 * Reflects a vector about an axis.
 *
 * @param out - The vector to reflect.
 * @param axis - The axis to reflect about.
 * @returns The reflected vector.
 */
export function v2reflect(out: number[], axis: number[]): number[] {
    const [x, y] = out
    scale(v2project(out, axis), 2)
    out[X] -= x
    out[Y] -= y
    return out
}

/**
 * Reflects a vector about a normalized axis.
 *
 * @param out - The vector to reflect.
 * @param axis - The normalized axis to reflect about.
 * @returns The reflected vector.
 */
export function v2reflectN(out: number[], axis: number[]): number[] {
    const [x, y] = out
    scale(v2projectN(out, axis), 2)
    out[X] -= x
    out[Y] -= y
    return out
}

/**
 * Transforms a 2D vector by a 3x3 matrix.
 *
 * @param out - The vector to transform.
 * @param mat - The 3x3 matrix (as a Float32Array).
 * @returns The transformed vector.
 */
export function v2m3(out: number[], mat: Float32Array): number[] {
    const [x, y] = out
    out[X] = mat[0] * x + mat[3] * y + mat[6]
    out[Y] = mat[1] * x + mat[4] * y + mat[7]
    return out
}
