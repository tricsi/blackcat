import { SPRITE_PTC } from "../config"
import { setAccelerate, setSpeed } from "../modules/entity/components/body"
import { setAlpha, setColor } from "../modules/entity/components/color"
import { setFrame } from "../modules/entity/components/sprite"
import { getPosition, setPosition, setScale } from "../modules/entity/components/transform"
import {
    addChild,
    createEntity,
    getChildren,
    removeChild,
    TEntity,
    TEntityProps
} from "../modules/entity/entity"
import { rnd } from "../modules/math"
import { kill, timer, TTimerToken } from "../modules/scheduler"
import { pull } from "../modules/utils"

const trail = createEntity(["tail"])
const color = [0.6, 0, 0.3]
const particlePool: TEntity[] = []
const particlePrefab: TEntityProps = [
    "ptc",
    {
        b: [],
        t: [[1.5, 1.5]],
        s: SPRITE_PTC
    }
]

let skipToken: TTimerToken
let emitter: TEntity
let xOffset: number = 0

export function initTrail() {
    return trail
}

export function stopTrail() {
    if (skipToken) {
        kill(skipToken, true)
        skipToken = null
    }
}

export function resetTrail() {
    stopTrail()
    const particles = getChildren(trail)
    for (let i = particles.length - 1; i >= 0; i--) {
        removeChild(trail, particles[i])
        particlePool.push(particles[i])
    }
}

export async function startTrail(source: TEntity, time: number, x: number = 0) {
    stopTrail()
    emitter = source
    xOffset = x
    skipToken = [1]
    await timer(0.1, createParticle, time * 10, skipToken)
    skipToken = null
}

async function createParticle(time: number) {
    for (let i = 0; i < color.length; i++) {
        color[i] = (color[i] + time) % 1
    }
    if (time === 0) {
        const item = pull(particlePool, () => createEntity(particlePrefab))
        const [x, y] = getPosition(emitter)
        setFrame(item, 2)
        setColor(item, [...color, 1])
        setSpeed(item, -100, -rnd(40), 0, 0)
        setPosition(item, x + xOffset, y)
        setAccelerate(item, 0, 60, 0, rnd(10) - 5)
        addChild(trail, item)
        await timer(1, (t) => {
            const tt = 1 - t * t
            setAlpha(item, tt)
            setScale(item, tt * 1.6)
        })
        removeChild(trail, item)
        particlePool.push(item)
    }
}
