import {
    SPRITE_CAT,
    COLOR_BLACK,
    COLOR_TRANSPARENT,
    EVENT_DEATH,
    EVENT_JUMP,
    EVENT_START,
    LAYER_WALL,
    LAYER_PLAYER,
    LAYER_ENEMY,
    EVENT_KILL,
    EVENT_LOSE as EVENT_LOSE,
    CONTROLS,
    EVENT_SCORE,
    LAYER_ITEM,
    EVENT_HIT,
    EVENT_COLLECT,
    COLOR_WHITE
} from "../config"
import { playAnim } from "../modules/entity/components/anim"
import { getSpeed, setAccelerate, setSpeed } from "../modules/entity/components/body"
import { setColor } from "../modules/entity/components/color"
import { getPolygon, setHandler } from "../modules/entity/components/polygon"
import {
    getPosition,
    getTransform,
    setPosition,
    setRotate,
    setScale,
    transformSystem
} from "../modules/entity/components/transform"
import {
    createEntity,
    getChild,
    getData,
    getParent,
    removeChild,
    TEntity,
    traverse
} from "../modules/entity/entity"
import { emit, off, on, TEvent } from "../modules/event"
import { add, rnd, X, Y } from "../modules/math"
import { computePolygon, IResponse } from "../modules/math/sat"
import { schedule, unschedule } from "../modules/scheduler"
import { getItemScorePosition, getItemType } from "./items"
import { startTrail, stopTrail } from "./trail"

const startPos = [-50, 22]
const player: TEntity = createEntity([
    "cat",
    {
        t: [, [...startPos]],
        b: [, , [170]]
    },
    [
        [
            "poly",
            {
                p: [[-12, -8, 28, 9], LAYER_PLAYER],
                c: COLOR_TRANSPARENT
            }
        ],
        [
            "img",
            {
                s: SPRITE_CAT,
                c: COLOR_BLACK,
                t: [[16, 18]],
                a: [[[1, 2, 3], [4, 1, 2, 3], [0], [1]], 10, 1, 2]
            }
        ]
    ]
])
const floor = new Set<TEntity>()
const anim = () => getChild(player, "img")

let jumps = 0
let dead = true
let active = true
let superCat = false

export function initPlayer() {
    setHandler(LAYER_WALL, wallHandler)
    setHandler(LAYER_ITEM, itemHandler)
    setHandler(LAYER_ENEMY, enemyHandler)
    on(EVENT_COLLECT, onCollect)
    return player
}

export function bindPlayer() {
    schedule(update)
    on("down", onDown)
    on("up", onUp)
    on(EVENT_HIT, onHit)
}

export function unbindPlayer() {
    unschedule(update)
    off("down", onDown)
    off("up", onUp)
    off(EVENT_HIT, onHit)
}

export function resetPlayer() {
    jumps = 0
    dead = false
    active = true
    setPosition(player, ...startPos)
    setAccelerate(player, 0, 450, 0, 0)
    setSpeed(player, 0, 0, 0, 0)
    setScale(player, 1)
    setRotate(player, 0)
}

export function isDead() {
    return dead
}

function onCollect([[, trigger]]: TEvent<[Set<number>, boolean]>) {
    if (superCat === trigger) {
        return
    }
    superCat = trigger
    if (superCat) {
        setColor(anim(), COLOR_WHITE)
        startTrail(player, 6, -10)
    } else {
        setColor(anim(), COLOR_BLACK)
        stopTrail()
    }
}

function onDown([code]: TEvent<string>) {
    if (CONTROLS.includes(code)) {
        if (dead) {
            emit(EVENT_START)
        } else if (active && (floor.size || jumps < 1)) {
            const [x] = getSpeed(player)
            setSpeed(player, x, -500)
            playAnim(anim(), [0, 1])
            emit(EVENT_JUMP, jumps++)
        }
    }
}

function onUp([code]: TEvent<string>) {
    if (CONTROLS.includes(code)) {
        const [x, y] = getSpeed(player)
        y < 0 && setSpeed(player, x, y / 4)
    }
}

function onHit() {
    active = false
    spinEntity(player)
    playAnim(anim(), [3, 0])
}

function spinEntity(entity: TEntity) {
    setSpeed(entity, 50, -200)
    setAccelerate(entity, 0, 500, rnd(2), rnd(20) - 10)
}

function wallHandler(res: IResponse, wallPoly: TEntity, playerPoly: TEntity) {
    floor.delete(wallPoly)
    if (res && active) {
        if (res.v[Y] < 0) {
            jumps = 0
            floor.add(wallPoly)
            const [x, y] = getSpeed(player)
            if (y > 0) {
                setSpeed(player, x, 0)
            }
        }
        add(getPosition(player), res.v)
        traverse(player, transformSystem)
        computePolygon(getPolygon(playerPoly), getTransform(playerPoly))
    }
}

function itemHandler(res: IResponse, itemPoly: TEntity) {
    if (res && active) {
        const item = getParent(itemPoly)
        const type = getItemType(item)
        if (!superCat && res.n[Y] < 0 && type === 3) {
            emit(EVENT_HIT)
            return
        }
        spinEntity(item)
        removeChild(item, itemPoly)
        emit(EVENT_SCORE, [getData(item), ...getItemScorePosition(item)])
    }
}

function enemyHandler(res: IResponse, enemyPoly: TEntity, playerPoly: TEntity) {
    if (res && active) {
        const enemy = getParent(enemyPoly)
        if (!getData(enemy)) return
        if (superCat || res.n[Y] < 0) {
            jumps = 0
            const [x, y] = getSpeed(player)
            if (y > 0) {
                setSpeed(player, x, 0)
            }
        } else {
            emit(EVENT_HIT)
        }
        add(getPosition(player), res.v)
        traverse(player, transformSystem)
        computePolygon(getPolygon(playerPoly), getTransform(playerPoly))
        emit(active ? EVENT_KILL : EVENT_LOSE, enemy)
    }
}

function update(delta: number) {
    if (!dead) {
        const [x, y] = getPosition(player)
        if (y > 100 || x < -150) {
            dead = true
            emit(EVENT_DEATH)
        } else if (x < startPos[X]) {
            setPosition(player, 5 * delta + x)
        }
        if (active) {
            playAnim(anim(), floor.size ? [1, 0] : [0, 1], false)
        }
    }
}
