import { kill, TTimerToken } from "../modules/scheduler"
import { getAlpha } from "../modules/entity/components/color"
import {
    COLOR_BLACK,
    EVENT_BOSS,
    EVENT_COLLECT,
    EVENT_DEATH,
    EVENT_SCORE,
    EVENT_START,
    FONT_REGULAR,
    FONT_TINY
} from "../config"
import { setAlpha } from "../modules/entity/components/color"
import { setText } from "../modules/entity/components/text"
import { setPosition, setScale } from "../modules/entity/components/transform"
import { addChild, createEntity, getChild, removeChild, TEntity } from "../modules/entity/entity"
import { on, TEvent } from "../modules/event"
import { schedule, timer, unschedule } from "../modules/scheduler"
import { ceil, max } from "../modules/math"
import { storage } from "../modules/utils"

const name = "Black Cat"
const end = "Game Over"
const hud: TEntity = createEntity([
    "hud",
    ,
    [
        [
            "score",
            {
                t: [, [-94, -52], 0.7],
                x: [FONT_REGULAR]
            }
        ],
        [
            "time",
            {
                t: [, [94, -52], 0.7],
                x: [FONT_REGULAR, , 2]
            }
        ],
        [
            "press",
            {
                t: [, [0, 40]],
                x: [FONT_TINY, "Click to Start", 1, 1]
            }
        ],
        [
            "overlay",
            ,
            [
                [
                    "text",
                    {
                        t: [, , 2],
                        x: [FONT_REGULAR, end, 1, 1]
                    }
                ],
                [
                    "high",
                    {
                        t: [, [0, -52], 0.7],
                        x: [FONT_REGULAR, , 1, 0]
                    }
                ],
                [
                    "poly",
                    {
                        p: [[-100, -100, 200, 200]],
                        c: COLOR_BLACK
                    }
                ]
            ]
        ],
        [
            "logo",
            {
                t: [, [0, -20]]
            },
            [
                [
                    "power",
                    {
                        t: [, , 2],
                        x: [FONT_REGULAR, , 1, 1]
                    }
                ],
                [
                    "text",
                    {
                        t: [, , 2],
                        x: [FONT_REGULAR, name, 1, 1],
                        c: COLOR_BLACK
                    }
                ],
                [
                    "shade",
                    {
                        t: [, [0, 1.9], 2],
                        x: [FONT_REGULAR, name, 1, 1]
                    }
                ],
                [
                    "title",
                    {
                        t: [, [0, 15]],
                        x: [FONT_REGULAR, "on a Hot Tin Roof", 1, 1]
                    }
                ]
            ]
        ],
        ["values"]
    ]
])

const logo = getChild(hud, "logo")
const press = getChild(hud, "press")
const values = getChild(hud, "values")
const overlay = getChild(hud, "overlay")
const timeText = getChild(hud, "time")
const scoreText = getChild(hud, "score")
const powerText = getChild(logo, "power")
const overlayText = getChild(overlay, "text")
const highText = getChild(overlay, "high")

let skipToken: TTimerToken
let score: number = 0
let high: number = storage("high") || 0
let time: number = 0

export function initHud() {
    setAlpha(overlay, 0)
    on(EVENT_START, onStart)
    on(EVENT_DEATH, onDeath)
    on(EVENT_SCORE, onScore)
    on(EVENT_COLLECT, onCollect)
    on(EVENT_BOSS, onBoss)
    return hud
}

export function setInfo(text: string = "") {
    setText(press, text)
}

export function setScore(value: number) {
    score = value
    setText(scoreText, `score ${score}`)
}

export async function playHudIntro(time: number) {
    timer(time, (t) => {
        const tt = 1 - t * t
        setScale(logo, (1 - 0.33) * tt + 0.33)
        setPosition(logo, 0, -31 * t - 20)
    })
}

function createValue(value: number, x: number, y: number) {
    return createEntity([
        "value",
        {
            t: [[], [x, y]],
            x: [FONT_TINY, `+${value}`, 1, 1]
        }
    ])
}

function update(delta: number) {
    time = max(time - delta, 0)
    setText(timeText, `${ceil(time)} SEC`)
}

async function onStart() {
    time = 60
    skipToken && kill(skipToken, true)
    const overlayAlpha = getAlpha(overlay)
    await timer(0.3, (t) => {
        const tt = 1 - t
        setAlpha(press, tt)
        overlayAlpha && setAlpha(overlay, tt)
    })
    schedule(update)
    setText(overlayText, end)
}

async function onDeath() {
    unschedule(update)
    if (score > high) {
        high = score
        storage("high", high)
    }
    setText(highText, "High Score " + high)
    skipToken = [1]
    await timer(
        0.3,
        (t) => {
            setAlpha(press, t)
            setAlpha(overlay, t)
        },
        1,
        skipToken
    )
    skipToken = null
}

async function onScore([[value, x, y]]: TEvent<number[]>) {
    const child = createValue(value, x, y)
    addChild(values, child)
    await timer(0.5, (t) => {
        const tt = 1 - t ** 4
        setAlpha(child, tt)
        setPosition(child, (x + 68) * tt - 68, (y + 48) * tt - 48)
    })
    removeChild(values, child)
    setScore(score + value)
}

function onCollect([[collected]]: TEvent<[Set<number>]>) {
    let text = ""
    for (let i = 0; i < name.length; i++) {
        text = text + (collected.has(i - 6) ? name[i] : " ")
    }
    setText(powerText, text)
}

function onBoss() {
    setText(overlayText, "The End")
}
