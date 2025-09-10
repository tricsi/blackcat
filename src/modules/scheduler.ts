import { on } from "./event"
import { DOC } from "./utils"

export type TTask = (delta: number) => void

/** TTimerProp [Scale, Skip, Task] */
export type TTimerToken = [number, number?, TTask?]

/** TTaskData [Callback, Weight] */
type TTaskData = [TTask, number]

/** Scheduler config */
export const SCHEDULER = { scale: 1, delta: 1 / 75, time: now() }
const TASKS: TTaskData[] = []

/**
 * Resets the scheduler's internal time to the current time.
 */
function reset() {
    SCHEDULER.time = now()
}

/**
 * Returns the current time in seconds using high-resolution timer.
 * 
 * @returns The current time in seconds.
 */
export function now(): number {
    return performance.now() / 1000
}

/**
 * Continuously updates the scheduler, invoking all scheduled tasks if enough time has passed.
 * Should be called once to start the update loop.
 */
export function update() {
    requestAnimationFrame(update)
    const time = now()
    const delta = time - SCHEDULER.time
    if (delta > SCHEDULER.delta) {
        SCHEDULER.time = time
        for (const [callback] of TASKS) {
            callback(delta * SCHEDULER.scale)
        }
    }
}

/**
 * Schedules a task to be called on each update, sorted by weight.
 * 
 * @param task - The callback function to schedule.
 * @param weight - Optional weight for ordering execution (lower runs first).
 */
export function schedule(task: TTask, weight = 0) {
    TASKS.push([task, weight])
    TASKS.sort((a, b) => a[1] - b[1])
}

/**
 * Removes a scheduled task from the update loop.
 * 
 * @param callback - The callback function to remove.
 */
export function unschedule(callback: TTask) {
    for (let i = TASKS.length - 1; i >= 0; i--) {
        if (TASKS[i][0] === callback) {
            TASKS.splice(i, 1)
        }
    }
}

/**
 * Runs a timer for a specified duration, calling an update callback and resolving a promise when done.
 * 
 * @param sec - Duration of the timer in seconds.
 * @param update - Optional callback receiving progress (0-1) and loop index.
 * @param loop - Number of times to repeat the timer (default: 0, meaning once).
 * @param token - Optional timer token for controlling the timer.
 * @returns A promise that resolves when the timer completes.
 */
export function timer(
    sec: number,
    update?: (t: number, i: number) => void,
    loop: number = 0,
    token: TTimerToken = [1]
): Promise<void> {
    return new Promise<void>((resolve) => {
        let time = sec
        let index = 0
        token[2] = (delta: number) => {
            const [scale, skip] = token
            time -= delta * scale
            while (time <= 0 && index < loop - 1) {
                time += sec
                update?.(0, ++index)
            }
            if (time <= 0 || skip) {
                unschedule(token[2])
                update?.(1, index)
                resolve()
            } else {
                update?.(1 - time / sec, index)
            }
        }
        schedule(token[2], 99)
        token[2](0)
    })
}

/**
 * Marks a timer token as killed and optionally unschedules its task.
 * 
 * @param props - The timer token to kill.
 * @param force - If true, forcibly unschedules the timer's task.
 */
export function kill(props: TTimerToken, force = false) {
    props[1] = 1
    force && unschedule(props[2])
}

on("visibilitychange", () => DOC.hidden || reset(), DOC)
