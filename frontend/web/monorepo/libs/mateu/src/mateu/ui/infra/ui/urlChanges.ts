/**
 * Announced on `window` whenever Mateu moves the browser URL (a pushState of its own, back/forward).
 *
 * Something on screen may read its inputs off the URL and nothing else tells it the URL moved: a
 * listing reached again with another query (`?ids=A,B` while `?kind=Odd` is on screen) can come
 * back as the very same component, so it is not re-rendered and would keep the old filters.
 */
export const URL_CHANGED_EVENT = 'mateu-url-changed'

export const announceUrlChange = () => {
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(URL_CHANGED_EVENT))
}
