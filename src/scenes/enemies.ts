import { emit, TEvent } from "../modules/event"
import {
    COLOR_BLACK,
    COLOR_TRANSPARENT,
    COLOR_WHITE,
    EVENT_BOSS,
    EVENT_KILL,
    EVENT_SCORE,
    LAYER_ENEMY,
    LAYER_PLAYER,
    SPRITE_BIRD
} from "../config"
import { playAnim } from "../modules/entity/components/anim"
import { getAccelerate, setAccelerate, setSpeed } from "../modules/entity/components/body"
import { getPosition, setPosition, setScale } from "../modules/entity/components/transform"
import {
    addChild,
    createEntity,
    getChild,
    getChildren,
    getData,
    removeChild,
    setData,
    TEntity,
    TEntityProps
} from "../modules/entity/entity"
import { on } from "../modules/event"
import { add, irnd, rnd, Y } from "../modules/math"
import { schedule } from "../modules/scheduler"
import { setColor } from "../modules/entity/components/color"

const enemies: TEntity = createEntity(["enemies", { t: [, [-96, 39]] }])
const enemyPrefab: TEntityProps = [
    ,
    {
        b: [, , [200]],
        t: [[8, 7]]
    },
    [
        [
            "poly",
            {
                p: [[7, 8, 4], LAYER_ENEMY, LAYER_PLAYER],
                c: COLOR_TRANSPARENT
            }
        ],
        [
            "img",
            {
                s: SPRITE_BIRD,
                a: [[[0], [1, 2, 3, 4], [1, 2]], 10, 1]
            }
        ]
    ]
]

const score = 100
let enemySpeed: number = 0

export function createEnemy(
    x: number,
    y: number,
    trigger: number = irnd(150) + 30,
    boss: boolean = false
) {
    const child = createEntity(enemyPrefab)
    setPosition(child, x, boss ? y - 2 : y)
    setSpeed(child, enemySpeed)
    setScale(child, boss ? 1.3 : 1)
    setColor(child, boss ? COLOR_BLACK : COLOR_WHITE)
    setData(child, [trigger, boss ? score * 10 : score])
    return addChild(enemies, child)
}

export function deleteEnemies() {
    const children = getChildren(enemies)
    while (children.length) removeChild(enemies, children.pop())
}

export function initEnemies() {
    on(EVENT_KILL, onKill)
    schedule(update)
    return enemies
}

export function setEnemiesSpeed(speed: number) {
    enemySpeed = speed
    getChildren(enemies).forEach((child) => setSpeed(child, speed))
}

export function getEnemyScorePosition(enemy: TEntity): number[] {
    return add(add([-10, -10], getPosition(enemy)), getPosition(enemies))
}

const onKill = ([enemy]: TEvent<TEntity>) => {
    const data = getData(enemy)
    if (data) {
        setSpeed(enemy, 0, 0)
        setScale(enemy, 1, -1)
        setAccelerate(enemy, 0, 250, rnd(2))
        playAnim(getChild(enemy, "img"), [2, 1])
        setData(enemy, undefined)
        if (data[1] > score) {
            emit(EVENT_BOSS)
        }
        emit(EVENT_SCORE, [data[1], ...getEnemyScorePosition(enemy)])
    }
}

function update() {
    const children = getChildren(enemies)
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        const [x] = getPosition(child)
        const data = getData(child)
        if (x <= -120) {
            removeChild(enemies, child)
        } else if (data && x < data[0] && !getAccelerate(child)[Y]) {
            playAnim(getChild(child, "img"), [1, 0], false)
            setAccelerate(child, 0, -200)
        }
    }
}
