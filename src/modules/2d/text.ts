import { m3, m3set, m3translate } from "../math/mat3"
import { set } from "../math"
import { createSprite, drawSprite, TSprite } from "./context"

/** [Font, Text, LetterSpace, LineGap, Align, Baseline] */
export type TText = [TSprite, string?, number?, number?, number?, number?]

const ABC = "+-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ,.!?$"
const MAT = m3()
const VEC = [0, 0]

export function createText(
    font: TSprite,
    value = "",
    align = 0,
    baseline = 0,
    letterSpace = 1,
    lineGap = 1
): TText {
    return [createSprite(...font), value, align, baseline, letterSpace, lineGap]
}

export function drawText(
    [font, text, align, baseline, letterSpace, lineGap]: TText,
    mat: Float32Array,
    tint?: number[]
) {
    m3set(MAT, mat)
    const [, w, h] = font
    const lines = text.split("\n")
    m3translate(MAT, set(VEC, 0, (((h + lineGap) * lines.length - lineGap) * baseline) / -2))
    for (const line of lines) {
        let x = (((w + letterSpace) * line.length - letterSpace) * align) / -2
        m3translate(MAT, set(VEC, x, 0))
        for (let j = 0; j < line.length; j++) {
            const frame = ABC.indexOf(line.charAt(j).toUpperCase())
            if (frame >= 0) {
                font[4] = frame
                drawSprite(font, MAT, tint)
            }
            m3translate(MAT, set(VEC, w + letterSpace, 0))
            x += w + letterSpace
        }
        m3translate(MAT, set(VEC, -x, h + lineGap))
    }
}
