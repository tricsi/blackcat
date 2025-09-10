import input from "."
import { emit, on } from "../event"
import { DOC, MOBILE } from "../utils"

const POINTER: number[] = [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]

function update(e?: MouseEvent | Touch, down?: number) {
    if (e) {
        POINTER[0] = e.clientX
        POINTER[1] = e.clientY
        emit("pointer", POINTER)
    }
    if (down !== undefined) {
        const target = "Mouse" + (e instanceof MouseEvent ? e.button : 0)
        input(target, down)
        emit(down ? "down" : "up", target)
    }
}

MOBILE()
    ? on("touchstart", (e: TouchEvent) => update(e.touches[0], 1), DOC)
        ("touchmove", (e: TouchEvent) => update(e.touches[0]), DOC)
        ("touchend", (e: TouchEvent) => update(e.touches[0], 0), DOC)
    : on("contextmenu", (e: MouseEvent) => e.preventDefault(), DOC)
        ("mousemove", (e: MouseEvent) => update(e), DOC)
        ("mousedown", (e: MouseEvent) => update(e, 1), DOC)
        ("mouseup", (e: MouseEvent) => update(e, 0), DOC)

export default POINTER
