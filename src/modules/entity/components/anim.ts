import { TEntity, FACTORIES, getComponents, setParam } from "../entity"
import { floor, min } from "../../math"
import { setFrame } from "./sprite"

/** AnimProps [track, loop, speed] */
type TAnimProp = [number, number?, number?]

const NAME = "a"

FACTORIES.a = (
    tracks: number[] | number[][],
    speed = 0,
    loop = 0,
    track = 0,
    offset = 0,
    now = 0,
) => [tracks, track, loop, speed, offset, now]

export const playAnim = (
    [, { a }]: TEntity,
    [track = a[1], loop = a[2], speed = a[3]]: TAnimProp = [,,],
    reset = true,
) => {
    if (a) {
        a[1] = track
        a[2] = loop
        a[3] = speed
        if (reset) a[5] = 0
    }
}

export const setTracks = (entity: TEntity, value: number[] | number[][]) => setParam(entity, NAME, 0, value)

export const stopAnim = (entity: TEntity, reset = true) => playAnim(entity, [0], reset)

export const animSystem = (entity: TEntity, delta: number) => {
    const { s, a } = getComponents(entity)
    if (s && a) {
        const [tracks, track, loop, speed, offset, now] = a
        const frames = (Array.isArray(tracks[track]) ? tracks[track] : tracks) as number[]
        if (frames?.length) {
            speed &&
                (a[5] = min(now + delta, loop ? (loop * (frames.length - 1)) / speed : Number.MAX_VALUE))
            setFrame(entity, frames[floor((a[5] * speed) % frames.length)] + offset)
        }
    }
}
