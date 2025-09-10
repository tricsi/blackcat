import { getFrame } from "../modules/entity/components/sprite"
import { COLOR_TRANSPARENT, LAYER_ITEM, LAYER_PLAYER, SPRITE_ITEMS } from "../config"
import { setSpeed } from "../modules/entity/components/body"
import { setFrame } from "../modules/entity/components/sprite"
import { getPosition, setPosition } from "../modules/entity/components/transform"
import {
    addChild,
    createEntity,
    getChild,
    getChildren,
    removeChild,
    TEntity,
    TEntityProps
} from "../modules/entity/entity"
import { abs, add } from "../modules/math"
import { schedule } from "../modules/scheduler"

const items: TEntity = createEntity(["items", { t: [, [-96, 46]] }])
const itemPrefab: TEntityProps = [
    "item",
    {
        b: [],
        d: [25],
        t: [[8, 14]]
    },
    [
        [
            "poly",
            {
                p: [[2, 2, 12, 12], LAYER_ITEM, LAYER_PLAYER],
                c: COLOR_TRANSPARENT
            }
        ],
        [
            "img",
            {
                s: SPRITE_ITEMS
            }
        ]
    ]
]
let itemSpeed: number = 0

export function initItems() {
    schedule(update)
    return items
}

export function createItem(x: number, y: number, type: number = 0) {
    const item = createEntity(itemPrefab)
    setPosition(item, x, y)
    setSpeed(item, itemSpeed)
    setFrame(getChild(item, "img"), type)
    return addChild(items, item)
}

export function getItemType(item: TEntity): number {
    return getFrame(getChild(item, "img"))
}

export function getItemScorePosition(item: TEntity): number[] {
    return add(add([-2, -25], getPosition(item)), getPosition(items))
}

export function deleteItems() {
    const children = getChildren(items)
    while (children.length) removeChild(items, children.pop())
}

export function setItemsSpeed(speed: number) {
    itemSpeed = speed
    getChildren(items).forEach((child) => setSpeed(child, speed))
}

function update() {
    const children = getChildren(items)
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i]
        const [x, y] = getPosition(child)
        if (x <= -120 || abs(y) >= 120) {
            removeChild(items, child)
        }
    }
}
