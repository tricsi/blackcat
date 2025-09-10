/** Root document element */
export const DOC = document

/** Body element */
export const BODY = DOC.body

/** Mobile device type (android|iphone|ipad|ipod) */
export const MOBILE = () => navigator.userAgent
    .toLowerCase()
    .match(/android|iphone|ipad|ipod/)
    ?.shift()

/**
 * Selects the first element that matches the given CSS selector.
 *
 * @param query - The CSS selector string.
 * @param element - The root element or document to query within (default: DOC).
 * @returns The first matching element, or undefined if not found.
 */
export function $<T = Element>(query: string, element: Element | Document = DOC): T | undefined {
    return element.querySelector(query) as T | undefined
}

/**
 * Removes and returns the last item from an array, or creates a new one using the factory if empty.
 *
 * @param items - The array to pull from.
 * @param factory - Function to create a new item if the array is empty.
 * @returns The pulled or newly created item.
 */
export function pull<T>(items: T[], factory: () => T): T {
    return items.pop() || factory()
}

/**
 * Requests fullscreen mode for the given element.
 *
 * @param element - The element to make fullscreen (default: BODY).
 * @returns A promise that resolves when fullscreen is entered, or the fullscreen element if already in fullscreen.
 */
export async function fullscreen(element = BODY) {
    return DOC.fullscreenElement || (await element.requestFullscreen())
}

/**
 * Gets or sets a value in localStorage (or a custom Storage), with optional prefix.
 *
 * @param name - The storage key name.
 * @param value - The value to store (omit to get, null to remove).
 * @param store - The Storage object to use (default: localStorage).
 * @returns The stored value, parsed from JSON, or null if not found.
 */
export function storage<T = any>(name: string, value?: T, store: Storage = localStorage): T | null {
    const { prefix = "" } = BODY.dataset
    name = prefix + name
    if (value !== undefined) {
        value !== null ? store.setItem(name, JSON.stringify(value)) : store.removeItem(name)
        return value
    }
    try {
        const item = store.getItem(name)
        if (item) {
            return JSON.parse(item) as T
        }
    } catch {}
    return null
}

/**
 * Gets or sets a value in sessionStorage (or a custom Storage), with optional prefix.
 *
 * @param name - The storage key name.
 * @param value - The value to store (omit to get, null to remove).
 * @returns The stored value, parsed from JSON, or null if not found.
 */
export function session<T = any>(name: string, value?: T): T | null {
    return storage(name, value, sessionStorage)
}
