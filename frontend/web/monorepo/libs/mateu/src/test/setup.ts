/**
 * Browser APIs jsdom does not implement but components touch on render (layout observers, media
 * queries, scrolling). No-op stand-ins: the tests assert behaviour, not layout. Only installed in
 * the jsdom environment; node-environment suites are untouched.
 */
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    class NoopObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
        takeRecords() { return [] }
    }
    const w = window as unknown as Record<string, unknown>
    if (!w.ResizeObserver) w.ResizeObserver = NoopObserver
    if (!w.IntersectionObserver) w.IntersectionObserver = NoopObserver
    if (!window.matchMedia) {
        window.matchMedia = ((query: string) => ({
            matches: false, media: query, onchange: null,
            addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {},
            dispatchEvent: () => false,
        })) as unknown as typeof window.matchMedia
    }
    // Vaadin's Lumo registers custom properties on load
    const g = globalThis as unknown as { CSS?: Record<string, unknown> }
    if (!g.CSS) g.CSS = {}
    if (!g.CSS.registerProperty) g.CSS.registerProperty = () => {}
    if (!g.CSS.supports) g.CSS.supports = () => false
    if (!g.CSS.escape) g.CSS.escape = (s: string) => String(s).replace(/[^\w-]/g, (c) => '\\' + c)
    if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {}
    if (!Element.prototype.scrollTo) Element.prototype.scrollTo = () => {}
    if (!Element.prototype.scrollBy) Element.prototype.scrollBy = () => {}
}
