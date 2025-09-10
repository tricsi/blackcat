import { floor, set, } from "../math"
import { m3, m3scale, m3set, m3translate } from "../math/mat3"
import { drawSprite, TSprite } from "./context"

export type TTilemap = [TSprite, number[], number[], number, number]

const MAT = m3()
const VEC = [0, 0]

export function createTilemap(tiles: TSprite, map: string, w: number, h: number): TTilemap {
    const data = new Array(w * h).fill(-1)
    const flips = new Array(w * h).fill(0)
    let i = 0
    let j = 0
    while (i < map.length) {
        let tile = map.charAt(i++)
        let flip = "|-+".indexOf(tile) + 1
        let count = 1
        if (flip) {
            tile = map.charAt(i++)
        }
        if (tile.match(/[A-Z]/)) {
            tile = tile.toLowerCase()
        } else {
            count = parseInt(map.charAt(i++), 36) + 1
        }
        if (tile !== "0") {
            data.fill(parseInt(tile, 36) - 10, j, j + count)
            flips.fill(flip, j, j + count)
        }
        j += count
    }
    return [tiles, data, flips, w, h]
}

export function drawTilemap([sprite, data, flips, width]: TTilemap, mat: Float32Array, tint?: number[]) {
    const [, w, h] = sprite
    data.forEach((frame, idx) => {
        if (frame >= 0) {
            const x = idx % width
            const y = floor(idx / width)
            const flip = flips[idx]
            m3translate(m3set(MAT, mat), set(VEC, x * w, y * h))
            if (flip) {
                m3scale(MAT, set(VEC, flip & 1 ? -1 : 1, flip & 2 ? -1 : 1))
            }
            sprite[4] = frame
            drawSprite(sprite, MAT, tint)
        }
    })
}
