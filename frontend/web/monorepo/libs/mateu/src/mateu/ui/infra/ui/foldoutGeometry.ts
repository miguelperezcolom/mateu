/**
 * Pure layout rules of the Vaadin foldout, kept apart from the element so they can be tested
 * without a browser. They mirror what the Redwood renderer does with the authentic
 * oj-sp-foldout-layout (apps/redwood main-start-page.html + app.css):
 *
 * - the overview is a FIXED rail (25rem) — it neither grows nor shrinks;
 * - a panel with a declared wire width (FoldoutPanel.width) is fixed to that width — flex, min and
 *   max all set to it, so the row never squeezes it nor stretches it; the leftover of a row goes
 *   into the gaps (space-between), not into the panels;
 * - a panel that arrives with open=false is a narrow vertical strip with its title, and opens on
 *   click;
 * - when the panels don't fit, the row pages and a row of dots tells which sections are in view.
 */

/** Width of the overview rail, as Redwood's (22rem of content + 3rem of panel padding). */
export const FOLDOUT_OVERVIEW_WIDTH = '25rem'

/** Width of a folded (closed) panel: just its vertical title strip. */
export const FOLDOUT_STRIP_WIDTH = '3rem'

/**
 * Inline style of a section: its declared width fixed (flex basis, min and max), never wider than
 * the row itself — on a phone a 44rem panel takes the whole row and the carousel pages it. A section
 * with no declared width keeps the stylesheet default (it shares the row).
 */
export function foldoutSectionStyle(width: string | null | undefined, open = true): string {
    if (!open) {
        return `flex: 0 0 ${FOLDOUT_STRIP_WIDTH}; width: ${FOLDOUT_STRIP_WIDTH}; min-width: ${FOLDOUT_STRIP_WIDTH}; max-width: ${FOLDOUT_STRIP_WIDTH};`
    }
    const w = (width ?? '').trim()
    if (!w) {
        return ''
    }
    return `flex: 0 0 min(${w}, 100%); width: min(${w}, 100%); min-width: min(${w}, 100%); max-width: min(${w}, 100%);`
}

/** The open/closed state of each panel as the wire sends it: closed only when open === false. */
export function initialOpenStates(panels: { open?: boolean | null }[] | null | undefined): boolean[] {
    return (panels ?? []).map(p => p?.open !== false)
}

/**
 * Keeps what the user toggled when the same panels arrive again (a repaint of the page sends the
 * panels anew); a different set of panels starts from the wire.
 */
export function mergeOpenStates(
    previous: boolean[] | null | undefined,
    previousKey: string,
    panels: { title?: string | null; open?: boolean | null }[] | null | undefined,
): { states: boolean[]; key: string } {
    const key = (panels ?? []).map(p => p?.title ?? '').join('\u0001')
    if (previous && key === previousKey && previous.length === (panels ?? []).length) {
        return { states: previous, key }
    }
    return { states: initialOpenStates(panels), key }
}

export interface Span { left: number; right: number }

/**
 * Which sections are in view, for the paging dots: a section counts when at least half of it — or
 * half of the row, for a section wider than the row — lies inside the row.
 */
export function visibleSections(rail: Span, sections: Span[]): boolean[] {
    const railWidth = Math.max(0, rail.right - rail.left)
    return sections.map(s => {
        const width = Math.max(0, s.right - s.left)
        if (width === 0 || railWidth === 0) {
            return false
        }
        const overlap = Math.max(0, Math.min(s.right, rail.right) - Math.max(s.left, rail.left))
        return overlap >= Math.min(width, railWidth) / 2
    })
}

/**
 * Whether a read-only field inside a foldout should be drawn as plain text (label above, value
 * below — what Redwood draws for a record's read-only page) instead of a read-only input. Lists,
 * statuses, money, booleans, images and uploads keep their own read-only rendering.
 */
export function readOnlyAsPlainText(field: { readOnly?: boolean; stereotype?: string; dataType?: string } | null | undefined, inFoldout: boolean): boolean {
    if (!inFoldout || !field?.readOnly) {
        return false
    }
    const keepOwn = new Set(['grid', 'fileUpload', 'image', 'uploadableImage', 'signature', 'camera', 'badge', 'bulletedList'])
    if (field.stereotype && keepOwn.has(field.stereotype)) {
        return false
    }
    const ownTypes = new Set(['status', 'money', 'bool', 'boolean', 'array', 'file', 'range'])
    return !(field.dataType && ownTypes.has(field.dataType))
}

/**
 * Whether a node sits inside the given element, crossing shadow roots on the way up (a field is
 * nested several shadow roots deep under the foldout that slots it).
 */
export function isInside(node: Node | null | undefined, tagName: string): boolean {
    const wanted = tagName.toUpperCase()
    let current: Node | null | undefined = node
    while (current) {
        if ((current as Element).tagName === wanted) {
            return true
        }
        current = current.parentNode ?? ((current as ShadowRoot).host as Node | undefined) ?? null
    }
    return false
}
