import input from "."
import { emit } from "../event"
import { abs } from "../math"
import { schedule } from "../scheduler"

const THRESHOLD = 0.1

schedule(() => {
    const [gamepad] = navigator.getGamepads()
    gamepad?.buttons.forEach(({ value }, num) => {
        const code = "Btn" + num
        if (!value !== !input(code)) {
            input(code, value)
            emit(value ? "down" : "up", code)
        }
    })
    gamepad?.axes.forEach((value, num) => {
        input("Axe" + num, abs(value) > THRESHOLD ? value : 0)
    })
})
