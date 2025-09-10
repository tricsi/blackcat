import { emit, on } from "../event"
import { DOC } from "../utils"

const DATA: { [code: string]: number } = {}

export default function input(code: string, value?: number) {
    return value !== undefined ? (DATA[code] = value) : DATA[code] || 0
}

function update(e: KeyboardEvent, down: number): boolean {
    const code = e.code
    if (DATA[code] !== down) {
        DATA[code] = down
        emit(down ? "down" : "up", code)
    }
    return false
}

on("keydown", (e: KeyboardEvent) => update(e, 1), DOC)
    ("keyup", (e: KeyboardEvent) => update(e, 0), DOC)
