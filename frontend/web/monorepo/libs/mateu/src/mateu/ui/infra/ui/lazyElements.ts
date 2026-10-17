/**
 * Optional custom elements, loaded on first use.
 *
 * Most screens never show a chat, a workflow or form designer, a planning board, a gantt, a
 * matrix grid or a capture field, yet their code (≈3k lines plus sortablejs) used to ride in the
 * eagerly loaded bundle of every page. Each one now lives in its own chunk: the renderer that
 * draws the tag calls `ensureElement(tag)`, which imports the module the first time and resolves
 * once the element is defined. The template does not wait for it — an element created before its
 * definition upgrades in place when the chunk arrives, keeping the properties and attributes it
 * was given (Lit's ReactiveElement replays them), so the first paint costs one chunk download.
 *
 * Code that creates one of these tags itself, outside a Mateu renderer, awaits
 * `ensureElement(tag)` first (or imports the element's module directly).
 */
const loaders: Record<string, () => Promise<unknown>> = {
    'mateu-chat': () => import('./mateu-chat'),
    'mateu-workflow': () => import('./mateu-workflow'),
    'mateu-form-editor': () => import('./mateu-form-editor'),
    'mateu-planning-board': () => import('./mateu-planning-board'),
    'mateu-gantt': () => import('./mateu-gantt'),
    'mateu-matrix-grid': () => import('./mateu-matrix-grid'),
    'mateu-signature-pad': () => import('./mateu-signature-pad'),
    'mateu-camera-capture': () => import('./mateu-camera-capture'),
}

const loading = new Map<string, Promise<void>>()

/**
 * Adds a tag a renderer loads on demand (a design-system element only one renderer uses, say).
 * The first registration of a tag wins, so a renderer cannot replace one of Mateu's own.
 */
export function registerLazyElement(tag: string, load: () => Promise<unknown>): void {
    if (!(tag in loaders)) loaders[tag] = load
}

/** The tags this registry can load on demand. */
export const lazyElementTags = (): string[] => Object.keys(loaders)

/**
 * Makes sure the custom element `tag` is defined, importing its module the first time. Resolves
 * immediately for a tag that is already defined; rejects for a tag this registry does not know.
 * A failed load (a network error) is forgotten, so the next call tries again.
 */
export function ensureElement(tag: string): Promise<void> {
    if (customElements.get(tag)) return Promise.resolve()
    const pending = loading.get(tag)
    if (pending) return pending
    const load = loaders[tag]
    if (!load) return Promise.reject(new Error(`mateu: no lazy element registered for <${tag}>`))
    const promise = load()
        .then(() => customElements.whenDefined(tag))
        .then(() => undefined)
        .catch((e) => {
            loading.delete(tag)
            console.warn(`mateu: could not load <${tag}>`, e)
            throw e
        })
    loading.set(tag, promise)
    return promise
}

/** For a renderer: start loading `tag` and go on drawing (the element upgrades when it arrives). */
export function requireElement(tag: string): void {
    ensureElement(tag).catch(() => { /* already reported; the next render retries */ })
}
