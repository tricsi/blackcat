import { MOBILE } from "./../utils"
import input from "."
import { on, TEvent } from "../event"
import { abs, max, min, X, Y } from "../math"
import { BODY } from "../utils"
import POINTER from "./pointer"

const TRIGGER = "Mouse0"
const PERCENT = 0.2
const THRESHOLD = 0.1
let POS: number[] = null

function getJoyValue(value: number): number {
    const maxValue: number = min(BODY.clientWidth, BODY.clientHeight) * PERCENT
    const normal = min(max(value / maxValue, -1), 1)
    return abs(normal) > THRESHOLD ? normal : 0
}

on("down", ([code]: TEvent<string>) => {
    if (code === TRIGGER && MOBILE()) {
        POS = [...POINTER]
    }
})

on("up", ([code]: TEvent<string>) => {
    if (code === TRIGGER && POS) {
        POS = null
        input("Axe0", 0)
        input("Axe1", 0)
    }
})

on("pointer", () => {
    if (POS) {
        input("Axe0", getJoyValue(POINTER[X] - POS[X]))
        input("Axe1", getJoyValue(POINTER[Y] - POS[Y]))
    }
})
