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

export interface FoldoutFitOptions {
    overviewPx?: number
    stripPx?: number
    defaultPanelPx?: number
    remPx?: number
    gapPx?: number
}

export interface FoldoutFitPanel { open?: boolean | null; autoOpen?: boolean | null; width?: string | null }

/** A panel's CSS width in px: px / rem / em / a bare number / % of the row; else null. */
export function foldoutWidthPx(width: string | null | undefined, available: number, remPx = 16): number | null {
    const m = /^(\d+(?:\.\d+)?)(px|rem|em|%)?$/.exec((width ?? '').trim())
    if (!m) return null
    const n = Number.parseFloat(m[1])
    if (m[2] === 'rem' || m[2] === 'em') return n * remPx
    if (m[2] === '%') return n * available / 100
    return n
}

/**
 * Which panels are open on first paint (conformance/client/foldout-auto.json — the same rule in
 * Redwood, React Native and IntelliJ). A panel with autoOpen (the author wrote no `open:`) opens
 * while it fits in `available` px, in declaration order; any other panel follows `open`. The
 * overview, the panels declared open and every folded strip are counted first; each auto panel then
 * takes its width in place of its strip. An unknown width (null / <= 0) opens every auto panel.
 */
export function foldoutOpenStates(
    panels: FoldoutFitPanel[] | null | undefined,
    available: number | null | undefined,
    options: FoldoutFitOptions = {},
): boolean[] {
    const list = panels ?? []
    const { overviewPx = 400, stripPx = 48, defaultPanelPx = 352, remPx = 16, gapPx = 0 } = options
    const auto = (p: FoldoutFitPanel | null | undefined) => p?.autoOpen === true
    if (available == null || available <= 0) {
        return list.map(p => auto(p) || p?.open !== false)
    }
    const widthOf = (p: FoldoutFitPanel) => foldoutWidthPx(p.width, available, remPx) ?? defaultPanelPx
    let used = overviewPx
    for (const p of list) {
        used += gapPx + (!auto(p) && p?.open !== false ? widthOf(p) : stripPx)
    }
    return list.map(p => {
        if (!auto(p)) return p?.open !== false
        const grown = used - stripPx + widthOf(p)
        if (grown > available) return false
        used = grown
        return true
    })
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
 * Whether a read-only field should be drawn as plain text (label above, value below) instead of a
 * read-only input — what Redwood draws for every read-only field. A CRUD's view page is a DETAIL,
 * not a form: all its fields arrive readOnly and must read as label + value, foldout or not (the
 * wire carries no "view page" flag — Page.readOnly is false and pageType is "form" — so the rule
 * is the field's own readOnly). Lists, statuses, Amounts (dataType money), booleans, images,
 * uploads and the stereotypes with their own rendering (html, markdown, links, icons, colors,
 * stars…) keep it. A plain number declared money (stereotype money) reads as text like its
 * neighbours — formatted as money by the renderer.
 * `inFoldout` is kept for callers; it no longer narrows the rule.
 */
export function readOnlyAsPlainText(field: { readOnly?: boolean; stereotype?: string; dataType?: string } | null | undefined, _inFoldout?: boolean): boolean {
    if (!field?.readOnly) {
        return false
    }
    const keepOwn = new Set(['grid', 'fileUpload', 'image', 'uploadableImage', 'signature', 'camera', 'badge',
        'bulletedList', 'html', 'richText', 'markdown', 'link', 'icon', 'color', 'stars', 'slider', 'toggle',
        'popover', 'plainText', 'status', 'password'])
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

/**
 * A read-only grid (a list on a record's view page, e.g. a booking's payments) reads as a plain
 * table: every row visible (no fixed height, no inner vertical scroll) and the columns sharing the
 * width they have (a small minimum, growing evenly, nothing frozen) with the cells wrapping — so
 * no horizontal scroll either. An editable grid keeps its widths and its 10-row viewport.
 */
export function readOnlyGridLayout(readOnly: boolean | undefined, rowCount: number): { allRowsVisible: boolean; theme: string | undefined } {
    return readOnly
        ? { allRowsVisible: true, theme: 'wrap-cell-content' }
        : { allRowsVisible: rowCount < 10, theme: undefined }
}

export function fitColumnToWidth<T extends { metadata?: any }>(column: T): T {
    const md = column?.metadata
    if (!md || md.type === 'GridGroupColumn') return column
    return { ...column, metadata: { ...md, width: '3rem', autoWidth: false, flexGrow: '1', frozen: false, frozenToEnd: false } }
}

/**
 * An editable grid's per-row editor button (the `_select` column the server adds last, "Edit") is
 * frozen to the END: a row with many fields is a wide grid, and the button sat past the horizontal
 * scroll. Done here, not on the wire, so it holds whatever backend drew the grid.
 */
export function freezeRowEditorButton<T extends { metadata?: object }>(column: T): T {
    const md = column?.metadata as { id?: string; stereotype?: string } | undefined
    if (!md || md.id !== '_select' || md.stereotype !== 'button') return column
    return { ...column, metadata: { ...md, frozenToEnd: true } }
}

/** A vertical scroller met under the pointer: where it is and how far it can go. */
export interface VerticalScroller { scrollTop: number; scrollHeight: number; clientHeight: number }

/**
 * The mouse WHEEL over the foldout pages the row of panels, as Redwood's foldout does: wheel down
 * (deltaY > 0) goes towards the right folds, up goes back. Returns the horizontal scroll to apply,
 * or null to leave the event alone:
 * - a mostly-horizontal gesture (trackpad swipe, shift+wheel) already scrolls the row natively;
 * - an inner element under the pointer that can still scroll vertically that way keeps the wheel;
 * - once the row is at its start (wheel up) or end (wheel down) the page scrolls normally.
 */
export function wheelToRow(
    deltaX: number,
    deltaY: number,
    scrollLeft: number,
    maxScrollLeft: number,
    innerScrollers: VerticalScroller[] = [],
): number | null {
    if (deltaY === 0 || Math.abs(deltaX) >= Math.abs(deltaY)) {
        return null
    }
    const down = deltaY > 0
    for (const s of innerScrollers) {
        const room = down ? s.scrollHeight - s.clientHeight - s.scrollTop : s.scrollTop
        if (room > 1) {
            return null
        }
    }
    if (maxScrollLeft <= 1) {
        return null
    }
    if (down && scrollLeft >= maxScrollLeft - 1) {
        return null
    }
    if (!down && scrollLeft <= 1) {
        return null
    }
    return deltaY
}
