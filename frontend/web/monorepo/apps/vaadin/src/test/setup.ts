/**
 * Vaadin's Lumo injector adopts a stylesheet into every root a component connects in; jsdom has
 * constructible stylesheets but no `adoptedStyleSheets` on documents and shadow roots. A plain
 * array property is enough for the components to connect (tests assert behaviour, not styling).
 */
if (typeof document !== 'undefined') {
    for (const proto of [Document.prototype, ShadowRoot.prototype] as object[]) {
        if (!('adoptedStyleSheets' in proto)) {
            const sheets = new WeakMap<object, CSSStyleSheet[]>()
            Object.defineProperty(proto, 'adoptedStyleSheets', {
                configurable: true,
                get(this: object) {
                    if (!sheets.has(this)) sheets.set(this, [])
                    return sheets.get(this)
                },
                set(this: object, value: CSSStyleSheet[]) { sheets.set(this, [...value]) },
            })
        }
    }
}

/**
 * Two more gaps of jsdom that vaadin trips over (as unhandled errors that fail the run, not as
 * test failures): overlays (combo box, date pickers) listen on `window.visualViewport`, and the
 * grid toggles `element.part`. Minimal stand-ins, enough for the components to connect and leave.
 */
if (typeof window !== 'undefined') {
    if (!window.visualViewport) {
        Object.defineProperty(window, 'visualViewport', {
            configurable: true,
            value: Object.assign(new EventTarget(), { width: 1024, height: 768, offsetLeft: 0, offsetTop: 0, scale: 1 }),
        })
    }
    if (!('part' in Element.prototype)) {
        Object.defineProperty(Element.prototype, 'part', {
            configurable: true,
            get(this: Element) {
                const el = this
                const tokens = () => (el.getAttribute('part') ?? '').split(/\s+/).filter(Boolean)
                const write = (list: string[]) => el.setAttribute('part', list.join(' '))
                return {
                    get length() { return tokens().length },
                    contains: (t: string) => tokens().includes(t),
                    add: (...ts: string[]) => write([...new Set([...tokens(), ...ts])]),
                    remove: (...ts: string[]) => write(tokens().filter((t) => !ts.includes(t))),
                    toggle: (t: string, force?: boolean) => {
                        const on = force ?? !tokens().includes(t)
                        write(on ? [...new Set([...tokens(), t])] : tokens().filter((x) => x !== t))
                        return on
                    },
                    toString: () => tokens().join(' '),
                }
            },
        })
    }
}
