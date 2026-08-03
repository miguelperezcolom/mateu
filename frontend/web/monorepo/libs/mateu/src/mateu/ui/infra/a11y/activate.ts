/**
 * Making a non-button behave like a button.
 *
 * Plenty of Mateu widgets are built from `<div>`s that respond to a click: a task-queue card, a
 * kanban card, a calendar event, a gantt bar, a tree node. A `<div>` with `@click` is invisible to
 * the keyboard and announced as nothing — the feature simply does not exist for anyone not using
 * a mouse.
 *
 * The fix is always the same three things, which is exactly why it belongs here rather than being
 * retyped at every site:
 *   - `role="button"` (or `option`, `tab`, …) so it is announced as something you can operate,
 *   - `tabindex="0"` so it can be reached,
 *   - Enter and Space so it can be operated. Native buttons respond to both; a handler bound only
 *     to `click` gets Enter for free on some elements and Space on almost none.
 *
 * Usage in a Lit template — three bindings next to the existing `@click`:
 *
 *   <div role="button" tabindex="0"
 *        @click=${() => this.pick(item)}
 *        @keydown=${onActivate(() => this.pick(item))}>
 *
 * Space is prevented from its default (scrolling the page) but Enter is not, so a control inside
 * a form keeps whatever the form does with Enter.
 */

/**
 * Returns a keydown handler that runs `handler` on Enter or Space, mirroring a native button.
 *
 * `' '` is the modern key value; `'Spacebar'` is the legacy one still emitted by older engines.
 */
export const onActivate = (handler: (event: KeyboardEvent) => void) => (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        handler(event)
        return
    }
    if (event.key === ' ' || event.key === 'Spacebar') {
        // Space scrolls the page by default; a button must not.
        event.preventDefault()
        handler(event)
    }
}

/**
 * Roving-tabindex arrow navigation for a list or grid of activatable items.
 *
 * A list of twenty cards where every card is tabbable costs the keyboard user twenty presses to
 * step past it. The accepted pattern is that the GROUP holds one tab stop and the arrows move
 * within it, which is what this implements: pass the current index and the item count, get back
 * the index the key implies (or `null` when the key means nothing here).
 *
 * `columns` turns it into a grid: Up/Down then move by a row instead of by one item.
 */
export const nextIndexForKey = (
    key: string,
    current: number,
    count: number,
    options: { columns?: number; loop?: boolean } = {},
): number | null => {
    if (count <= 0) return null
    const columns = Math.max(1, options.columns ?? 1)
    const loop = options.loop ?? false
    const clamp = (i: number) => {
        if (loop) return (i + count) % count
        return Math.max(0, Math.min(count - 1, i))
    }
    switch (key) {
        case 'ArrowRight': return clamp(current + 1)
        case 'ArrowLeft': return clamp(current - 1)
        case 'ArrowDown': return clamp(current + columns)
        case 'ArrowUp': return clamp(current - columns)
        case 'Home': return 0
        case 'End': return count - 1
        default: return null
    }
}

/**
 * Shared focus-ring styling for the elements made activatable this way.
 *
 * Native controls come with a focus ring; a `<div role="button">` does not, so without this the
 * element is reachable but the user cannot see where they are — which is barely better than not
 * being reachable at all. `:focus-visible` shows it for keyboard use and not for mouse clicks.
 */
export const ACTIVATABLE_FOCUS_CSS = `
    [role="button"]:focus-visible,
    [role="option"]:focus-visible,
    [role="tab"]:focus-visible,
    [role="gridcell"]:focus-visible,
    [role="treeitem"]:focus-visible,
    [tabindex]:focus-visible {
        outline: 2px solid var(--lumo-primary-color, #3b5bdb);
        outline-offset: 2px;
        border-radius: var(--lumo-border-radius-s, 4px);
    }
`
