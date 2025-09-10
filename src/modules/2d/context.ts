import VERTEX_SHADER from "./shader/2D.vert"
import FRAGMENT_SHADER from "./shader/2D.frag"
import { on } from "../event"
import { floor, multiply, set, X, Y } from "../math"
import {
    bindBuffer,
    compileShader,
    createProgram,
    createTexture,
    setAttribute,
    setUniform
} from "../webgl2"
import { m3, m3project, m3scale } from "../math/mat3"
import { IPolygon } from "../math/sat"

export type TSprite = [string, number, number, number, number]
export type TSpritesheet = { size: number[]; frames: Record<string, number[]>; src: string; dot: number[] }

const SIZE: number = 8192
const IMG = new Image()
const VEC: number[] = [0, 0]
const UV = new Float32Array(SIZE * 6)
const POS = new Float32Array(SIZE * 6)
const TINT = new Float32Array(SIZE * 12)
const PROJ: Float32Array = m3()
// const LIGHTS: number = 8
// const LIGHT = new Float32Array(LIGHTS * 4)
// const COLOR = new Float32Array(LIGHTS * 4)
const DPR = devicePixelRatio

let GL: WebGL2RenderingContext,
    PRG: WebGLProgram,
    RES: number[],
    COUNT: number = 0,
    DATA: TSpritesheet


// export function setLight(data: number[], rgba: number[] = [1, 1, 1, 1], index: number = 0) {
//     LIGHT.set(data, index * 4)
//     COLOR.set(rgba, index * 4)
// }
// export function clearLights() {
//     LIGHT.fill(0)
//     COLOR.fill(1)
// }

export function createContext(
    canvas: HTMLCanvasElement,
    SPRITESHEET: TSpritesheet,
    onLoad: () => void
) {
    GL = canvas.getContext("webgl2")
    RES = [canvas.width, canvas.height]
    PRG = createProgram(
        GL,
        compileShader(GL, GL.VERTEX_SHADER, VERTEX_SHADER),
        compileShader(GL, GL.FRAGMENT_SHADER, FRAGMENT_SHADER)
    )
    DATA = SPRITESHEET
    GL.enable(GL.BLEND)
    GL.clearColor(0, 0, 0, 0)
    GL.blendFunc(GL.ONE, GL.ONE_MINUS_SRC_ALPHA)
    GL.useProgram(PRG)
    on(
        "load",
        () => {
            GL.bindTexture(GL.TEXTURE_2D, createTexture(GL, IMG))
            on("resize", resizeContext, window)
            resizeContext()
            onLoad()
        },
        IMG
    )
    IMG.src = SPRITESHEET.src
}

export function renderContext(clear = true) {
    setUniform(GL, PRG, "uRes", new Float32Array([GL.canvas.width, GL.canvas.height]))
    setUniform(GL, PRG, "uProj", PROJ as Float32Array)
    // setUniform(GL, PRG, "uLight", LIGHT, 4)
    // setUniform(GL, PRG, "uColor", COLOR, 4)
    bindBuffer(GL, "aUv", UV)
    setAttribute(GL, PRG, "aUv", 2)
    bindBuffer(GL, "aPos", POS)
    setAttribute(GL, PRG, "aPos", 2)
    bindBuffer(GL, "aTint", TINT)
    setAttribute(GL, PRG, "aTint", 4)
    clear && GL.clear(GL.COLOR_BUFFER_BIT)
    GL.drawArrays(GL.TRIANGLES, 0, COUNT * 3)
    COUNT = 0
}

function resizeContext() {
    const [w, h] = RES
    const canvas = GL.canvas as HTMLCanvasElement
    let { width, height } = canvas.getBoundingClientRect()
    width *= DPR
    height *= DPR
    canvas.width = width
    canvas.height = height
    m3project(PROJ, width, height)
    m3scale(PROJ, set(VEC, width / w, height / h))
    GL.viewport(0, 0, width, height)
}

function addMesh([, w, h]: TSprite, [a00, a01, , a10, a11, , a20, a21]: Float32Array) {
    a00 *= w
    a01 *= w
    a10 *= h
    a11 *= h
    POS.set(
        [
            a20,
            a21,
            a00 + a20,
            a01 + a21,
            a10 + a20,
            a11 + a21,
            a10 + a20,
            a11 + a21,
            a00 + a20,
            a01 + a21,
            a00 + a10 + a20,
            a01 + a11 + a21
        ],
        COUNT * 6
    )
}

function addUv([name, w, h, extrude, frame]: TSprite) {
    const [sw, sh, margin] = DATA.size
    const m = extrude ? extrude * 2 : margin
    const p = m / sw
    let [x, y] = DATA.frames[name]
    x = (x + extrude) / sw
    y = (y + extrude) / sh
    w /= sw
    h /= sh
    x += (w + p) * floor(frame)
    UV.set([x, y, x + w, y, x, y + h, x, y + h, x + w, y, x + w, y + h], COUNT * 6)
}

function addTint(tint: number[] = [1, 1, 1, 1], vert: number) {
    for (let i = 0; i < vert; i++) {
        TINT.set(tint, COUNT * 12 + i * 4)
    }
}

export function createSprite(name: string, w: number, h: number, extrude = 0, frame = 0): TSprite {
    return [name, w, h, extrude, frame]
}

export function drawSprite(sprite: TSprite, mat: Float32Array, tint?: number[]) {
    if (COUNT < SIZE && sprite[0] in DATA.frames) {
        addMesh(sprite, mat)
        addUv(sprite)
        addTint(tint, 6)
        COUNT += 2
    }
}

export function drawPoly({ c }: IPolygon, tint?: number[]) {
    const [UX, UY] = DATA.dot
    for (let i = 2; i < c.length; i++) {
        POS.set([...c[0], ...c[i - 1], ...c[i]], COUNT * 6)
        UV.set([UX, UY, UX, UY, UX, UY], COUNT * 6)
        addTint(tint, 3)
        COUNT++
    }
}

export function raycast(pos: number[]): number[] {
    const [w, h] = RES
    const canvas = GL.canvas as HTMLCanvasElement
    const { x, y, width, height } = canvas.getBoundingClientRect()
    return multiply([pos[X] - x, pos[Y] - y], set(VEC, w / width, h / height))
}