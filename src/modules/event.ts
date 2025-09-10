export type TEvent<T = any> = [T, string]
export type TListener = (event?: TEvent) => void
export type TListeners = Map<string, Set<TListener>>

const defaultListeners: TListeners = new Map<string, Set<TListener>>()

function parse(event: string) {
    return event
        .replace(/[^-_\w]+/, " ")
        .trim()
        .split(" ")
        .filter((v) => !!v)
}

/**
 * Registers an event listener for one or more event names.
 * 
 * @param event - The event name(s), separated by spaces or special characters.
 * @param listener - The callback function to invoke when the event is emitted.
 * @param listeners - Optional custom listeners map or EventTarget; defaults to internal map.
 * @returns The `on` function for chaining.
 */
export function on(
    event: string,
    listener: TListener | EventListenerOrEventListenerObject,
    listeners: any = defaultListeners
) {
    for (const name of parse(event)) {
        listeners instanceof Map
            ? listeners.get(name)?.add(listener) ||
              listeners.set(name, new Set<TListener>().add(listener as TListener))
            : listeners.addEventListener(name, listener, false)
    }
    return on
}

/**
 * Removes an event listener for one or more event names.
 * 
 * @param event - The event name(s), separated by spaces or special characters.
 * @param listener - The callback function to remove.
 * @param listeners - Optional custom listeners map or EventTarget; defaults to internal map.
 * @returns The `off` function for chaining.
 */
export function off(
    event: string,
    listener: TListener | EventListenerOrEventListenerObject,
    listeners: any = defaultListeners
) {
    for (const name of parse(event)) {
        listeners instanceof Map
            ? listeners.get(name)?.delete(listener)
            : listeners.removeEventListener(name, listener, false)
    }
    return off
}

/**
 * Emits an event, invoking all listeners registered for the event name and for "all".
 * 
 * @param name - The event name to emit.
 * @param data - Optional data to pass to listeners.
 * @param listeners - Optional custom listeners map; defaults to internal map.
 * @returns The `emit` function for chaining.
 */
export function emit(name: string, data?: any, listeners: any = defaultListeners) {
    const event: TEvent = [data, name]
    listeners.get("all")?.forEach((listener: TListener) => listener(event))
    listeners.get(name)?.forEach((listener: TListener) => listener(event))
    return emit
}
