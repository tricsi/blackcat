import { SPRITE_HOUSE } from "../config"
import { setSpeed } from "../modules/entity/components/body"
import { getPosition, setPosition } from "../modules/entity/components/transform"
import { addChild, createEntity, getChildren, getData, TEntity } from "../modules/entity/entity"
import { X, Y } from "../modules/math"
import { schedule, timer } from "../modules/scheduler"

const houses: TEntity = createEntity(["houses", { t: [, [-96, 54]] }])

let houseSpeed: number = 0

function createHouse(x: number, y: number, scale: number = 1, tint: number = 1) {
    return createEntity([
        "house",
        {
            b: [, , [scale * houseSpeed]],
            d: [scale],
            t: [[0, 48], [x, y], scale],
            m: [SPRITE_HOUSE, "ABCDEFGHIJKLEFGHIJKLEFGHIJKL", 4, 6],
            c: [tint, tint - 0.1, tint - 0.2, 1]
        }
    ])
}

function update() {
    const children = getChildren(houses)
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        const scale = getData(child)
        const [x] = getPosition(child)
        if (x <= -32 * scale) {
            setPosition(child, 196)
        }
    }
}

export function setHousesSpeed(speed: number) {
    houseSpeed = speed
    getChildren(houses).forEach((child) => {
        setSpeed(child, speed * getData(child))
    })
}

export async function playHouseIntro(time: number) {
    const children = getChildren(houses)
    const posY = children.map(house => getPosition(house)[Y])
    await timer(time, t => {
        children.forEach((child, i) => {
            const posX = getPosition(child)[X]
            setPosition(child, posX, posY[i] * (1 - t))
        })
    })
}

export function initHouses() {
    addChild(houses, createHouse(100, 40, 2, 0.7))
    addChild(houses, createHouse(50, 30, 1.5, 0.8))
    addChild(houses, createHouse(170, 26, 1.3, 0.9))
    addChild(houses, createHouse(0, 20, 1))
    addChild(houses, createHouse(120, 20, 1))
    schedule(update)
    return houses
}
