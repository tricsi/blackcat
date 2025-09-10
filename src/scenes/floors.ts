import { COLOR_TRANSPARENT, LAYER_PLAYER, LAYER_WALL, SPRITE_WALL } from "../config"
import { setSpeed } from "../modules/entity/components/body"
import { getPosition } from "../modules/entity/components/transform"
import {
    addChild,
    createEntity,
    getChildren,
    getData,
    removeChild,
    setData,
    TEntity
} from "../modules/entity/entity"
import { irnd, max, rnd } from "../modules/math"
import { schedule } from "../modules/scheduler"
import { createEnemy, deleteEnemies, setEnemiesSpeed } from "./enemies"
import { setHousesSpeed } from "./houses"
import { createItem, deleteItems, setItemsSpeed } from "./items"
import { startPower } from "./power"

const floors: TEntity = createEntity(["floors", { t: [, [-96, 46]] }])
const maps = [
    "AbwCDewFDewFDe1Gh2Ie2Gh2Ie2Gh2Ie2Gh2Ie1FDe1Jk2Le2Jk2Le2Jk2Le2Jk2Le1FDe1Jk2Le2Jk2Le2Jk2Le2Jk2Le1F",
    "AbhCDehFDehFDEGh2IEGh1IEGh2IEFDEJk2LEJk1LEJk2LEFDEJk2LEJk1LEJk2LEF",
    "AbaCDeaFDeaFDEGh1IEGh1IEFDEJk1LEJk1LEFDEJk1LEJk1LEF"
]
const widths = [35, 20, 13]

let enemyPercent: number = 0
let floorSpeed: number = 0
let lastFloor: number = 0
let floorAdd: boolean = true

export function initFloors() {
    resetFloors()
    schedule(update)
    return floors
}

function createFloor(x: number, y: number, type: number = irnd(maps.length - 1)): number {
    const width = widths[type]
    const floor = createEntity([
        "wall",
        {
            b: [],
            t: [, [x, y]]
        },
        [
            [
                "map",
                {
                    m: [SPRITE_WALL, maps[type], width, 6]
                }
            ],
            [
                "poly",
                {
                    p: [[0, 0, width * 8, 300], LAYER_WALL, LAYER_PLAYER],
                    c: COLOR_TRANSPARENT
                }
            ]
        ]
    ])
    setData(floor, width * 8)
    setSpeed(floor, floorSpeed)
    addChild(floors, floor)
    return width
}

export function resetFloors() {
    const children = getChildren(floors)
    while (children.length) removeChild(floors, children.pop())
    deleteItems()
    deleteEnemies()
    createEnemy(155, -24, 150, true)
    createFloor(-8, -24, 0)
    floorAdd = true
}

export function createBoss() {
    const x = irnd(8) * 8 + 32 + lastFloor
    createFloor(x, -24, 1)
    createEnemy(x + 140, -24, 120, true)
    floorAdd = false
}

export function setEnemyPercent(value: number) {
    enemyPercent = value / 100
}

export function getFloorsSpeed(): number {
    return floorSpeed
}

export function setFloorsSpeed(speed: number) {
    floorSpeed = speed
    getChildren(floors).forEach((child) => setSpeed(child, speed))
    setItemsSpeed(speed)
    setEnemiesSpeed(speed)
    setHousesSpeed(speed / 7)
}

function update() {
    lastFloor = 0
    const children = getChildren(floors)
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        const width = getData(child)
        const [x] = getPosition(child)
        if (x <= -width) {
            removeChild(floors, child)
        } else {
            lastFloor = max(x + width, lastFloor)
        }
    }
    if (lastFloor < 196) {
        startPower()
    }
    while (lastFloor < 196 && floorAdd) {
        const x = !lastFloor ? 0 : irnd(8) * 8 + 32 + lastFloor
        const y = (irnd(4) + 1) * -8
        const frame = irnd(3)
        const width = createFloor(x, y)
        lastFloor = x + width * 8
        let i = irnd(4) + 2
        while (i < width - 2) {
            rnd() > enemyPercent ? createItem(x + i * 8, y, frame) : createEnemy(x + i * 8, y)
            i += irnd(6) + 6
        }
    }
}
