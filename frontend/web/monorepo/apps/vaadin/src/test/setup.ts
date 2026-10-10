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
