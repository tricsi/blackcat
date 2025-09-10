import { cos, eq, sin } from "."

/** Zero 2D transform matrix */
export const ZERO = [
    1, 0, 0,
    0, 1, 0,
    0, 0, 1
]

/**
 * Creates a new 3x3 transform matrix as a Float32Array.
 *
 * @returns A new 3x3 transform matrix.
 */
export function m3(): Float32Array {
    return new Float32Array(ZERO)
}

/**
 * Sets the values of a 3x3 matrix from another matrix or array.
 *
 * @param out - The matrix to set values on.
 * @param mat - The source matrix or array (default: zero transform matrix).
 * @returns The updated matrix.
 */
export function m3set(out: Float32Array, mat: number[] | Float32Array = ZERO): Float32Array {
    out.set(mat)
    return out
}

/**
 * Sets up a 3x3 orthographic projection matrix for the given width and height.
 *
 * @param out - The matrix to set values on.
 * @param width - The width of the projection.
 * @param height - The height of the projection.
 * @returns The updated projection matrix.
 */
export function m3project(out: Float32Array, width: number, height: number): Float32Array {
    out[0] = 2 / width
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = -2 / height
    out[5] = 0
    out[6] = -1
    out[7] = 1
    out[8] = 1
    return out
}

/**
 * Multiplies two 3x3 matrices and writes the result to the output matrix.
 *
 * @param out - The first matrix and the output.
 * @param mat - The second matrix to multiply.
 * @returns The multiplied matrix.
 */
export function m3multiply(out: Float32Array, mat: Float32Array): Float32Array {
    const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = out
    const [b00, b01, b02, b10, b11, b12, b20, b21, b22] = mat
    out[0] = b00 * a00 + b01 * a10 + b02 * a20
    out[1] = b00 * a01 + b01 * a11 + b02 * a21
    out[2] = b00 * a02 + b01 * a12 + b02 * a22
    out[3] = b10 * a00 + b11 * a10 + b12 * a20
    out[4] = b10 * a01 + b11 * a11 + b12 * a21
    out[5] = b10 * a02 + b11 * a12 + b12 * a22
    out[6] = b20 * a00 + b21 * a10 + b22 * a20
    out[7] = b20 * a01 + b21 * a11 + b22 * a21
    out[8] = b20 * a02 + b21 * a12 + b22 * a22
    return out
}

/**
 * Applies a translation to a 3x3 matrix.
 *
 * @param out - The matrix to translate.
 * @param param1 - The translation vector [x, y].
 * @returns The translated matrix.
 */
export function m3translate(out: Float32Array, [x, y]: number[]): Float32Array {
    if (x || y) {
        const [a00, a01, a02, a10, a11, a12, a20, a21, a22] = out
        out[6] = x * a00 + y * a10 + a20
        out[7] = x * a01 + y * a11 + a21
        out[8] = x * a02 + y * a12 + a22
    }
    return out
}

/**
 * Applies a scale transformation to a 3x3 matrix.
 *
 * @param out - The matrix to scale.
 * @param scale - The scale factor (number or [x, y] array).
 * @returns The scaled matrix.
 */
export function m3scale(out: Float32Array, scale: number | number[]): Float32Array {
    if (!eq(scale, 1)) {
        let x, y
        if (scale instanceof Array) {
            [x, y] = scale
        } else {
            x = scale
            y = scale
        }
        out[0] *= x
        out[1] *= x
        out[2] *= x
        out[3] *= y
        out[4] *= y
        out[5] *= y
    }
    return out
}

/**
 * Applies a rotation (in radians) to a 3x3 matrix.
 *
 * @param out - The matrix to rotate.
 * @param rad - The angle in radians.
 * @returns The rotated matrix.
 */
export function m3rotate(out: Float32Array, rad: number): Float32Array {
    if (rad) {
        const s = sin(rad)
        const c = cos(rad)
        const [a00, a01, a02, a10, a11, a12] = out
        out[0] = c * a00 + s * a10
        out[1] = c * a01 + s * a11
        out[2] = c * a02 + s * a12
        out[3] = c * a10 - s * a00
        out[4] = c * a11 - s * a01
        out[5] = c * a12 - s * a02
    }
    return out
}
