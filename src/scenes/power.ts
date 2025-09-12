import { getPosition } from "../modules/entity/components/transform"
import { getChild, getData, setData, setDisabled } from "../modules/entity/entity"
import {
    COLOR_TRANSPARENT,
    EVENT_COLLECT,
    EVENT_SCORE,
    EVENT_START,
    FONT_REGULAR,
    LAYER_PLAYER,
    LAYER_POWER
} from "../config"
import { setAlpha } from "../modules/entity/components/color"
import { createEntity } from "../modules/entity/entity"
import { kill, timer, TTimerToken } from "../modules/scheduler"
import { setSpeed } from "../modules/entity/components/body"
import { setPosition } from "../modules/entity/components/transform"
import { setText } from "../modules/entity/components/text"
import { setHandler } from "../modules/entity/components/polygon"
import { IResponse } from "../modules/math/sat"
import { emit, on } from "../modules/event"
import { startTrail, stopTrail } from "./trail"

const startPos = [110, -30]
const power = createEntity([
    "power",
    {
        t: [[2.5, 3.5], [...startPos], 1.2],
        b: []
    },
    [
        [
            "text",
            {
                x: [FONT_REGULAR]
            }
        ],
        [
            "poly",
            {
                p: [[-1, 0, 7, 7], LAYER_POWER, LAYER_PLAYER],
                c: COLOR_TRANSPARENT
            }
        ]
    ]
])

const text = getChild(power, "text")
const poly = getChild(power, "poly")
const collected = new Set<number>()
const letters = "CAT"

let letterIndex = 0
let skipToken: TTimerToken

export function initPower() {
    setHandler(LAYER_POWER, powerHandler)
    on(EVENT_START, resetPower)
    return power
}

export async function startPower() {
    if (skipToken) return
    setText(text, letters[letterIndex])
    setData(power, letterIndex)
    setSpeed(power, -50)
    setAlpha(power, 1)
    setPosition(power, ...startPos)
    setDisabled(poly, 0)
    letterIndex = ++letterIndex % letters.length
    skipToken = [1]
    await startTrail(power, 5, -5)
    skipToken = null
    setSpeed(power, 0)
}

async function powerHandler(res: IResponse) {
    if (res) {
        skipToken && kill(skipToken, true)
        skipToken = [1]
        setSpeed(power, 0)
        setDisabled(poly)
        const [x, y] = getPosition(power)
        emit(EVENT_SCORE, [250, x, y])
        stopTrail()
        await timer(
            .3,
            (t) => {
                const tt = 1 - t ** 4
                setAlpha(power, tt)
                setPosition(power, x * tt, (y + 50) * tt - 50)
            },
            0,
            skipToken
        )
        const index = getData(power, 0)
        collected.add(index)
        const triggered = letters.length === collected.size
        emit(EVENT_COLLECT, [collected, triggered])
        if (triggered) {
            await timer(7, undefined, 0, skipToken)
            resetPower()
        }
        skipToken = null
    }
}

function resetPower() {
    skipToken && kill(skipToken, true)
    skipToken = null
    letterIndex = 0
    collected.clear()
    setSpeed(power, 0)
    setPosition(power, ...startPos)
    emit(EVENT_COLLECT, [collected, false])
}
