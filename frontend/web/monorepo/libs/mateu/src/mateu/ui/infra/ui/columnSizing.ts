/**
 * DEFAULT column sizing of a listing — for the columns that declare no width. The same rule the
 * Redwood renderer applies (apps/redwood/poc/core/listing.mjs `columnSizingOf`):
 *
 *  - COMPACT columns fit their content and do not grow: identifiers, numbers, amounts, dates and
 *    times, booleans, statuses, enums (a column with value labels), row actions and buttons;
 *  - TEXT columns (string, primary, anything else) grow and share what is left, each by its
 *    `weight` (default 1: `weight: 2` grows twice as much);
 *  - a declared `width` or `flexGrow` wins, exactly as before (an explicit `autoWidth` keeps its
 *    meaning: start from the content, and grow unless `flexGrow: "0"` says otherwise).
 *  - when NO column grows, the compact ones share the width instead of leaving a gap.
 *
 * On vaadin-grid that is `auto-width` (the content, measured) for every one of them, + `flex-grow` 0
 * for the compact ones and `flex-grow` = weight for the text ones (which start from their content
 * and take the rest); the grid scrolls horizontally when the widths do not fit. (A YAML column
 * arrives with autoWidth false from the browser-side expander: without it a text column started at
 * vaadin-grid's 100px and was cut.)
 */
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";

const COMPACT_DATA_TYPES = ['integer', 'number', 'double', 'decimal', 'long', 'float', 'money', 'bool', 'boolean',
    'status', 'date', 'time', 'dateTime', 'dateRange', 'range', 'action', 'actionGroup', 'menu']
const COMPACT_STEREOTYPES = ['money', 'button', 'toggle', 'checkbox', 'badge', 'stars', 'color', 'numberRange', 'dateRange']

type ColumnLike = Partial<Pick<GridColumn, 'identifier' | 'dataType' | 'stereotype' | 'valueLabels' | 'width' | 'flexGrow' | 'weight' | 'autoWidth'>>

/** Whether a column FITS its content by default (instead of growing). */
export const isCompactColumn = (c: ColumnLike | null | undefined): boolean => {
    if (!c) return false
    if (c.identifier) return true
    if (c.dataType && COMPACT_DATA_TYPES.includes(c.dataType)) return true
    if (c.stereotype && COMPACT_STEREOTYPES.includes(c.stereotype)) return true
    return !!(c.valueLabels && Object.keys(c.valueLabels).length)
}

/** Whether the column declares its own sizing: a width (other than "auto") or a flexGrow. */
export const declaresSizing = (c: ColumnLike | null | undefined): boolean => {
    if (!c) return false
    const width = typeof c.width === 'string' ? c.width.trim() : c.width
    if (width && width !== 'auto') return true
    return c.flexGrow != null && String(c.flexGrow).trim() !== ''
}

/** The vaadin-grid sizing of ONE column that declares none: compact → fit, text → grow by weight. */
export const defaultSizingOf = <T extends ColumnLike>(c: T): T => {
    if (declaresSizing(c)) return c
    if (isCompactColumn(c)) return { ...c, autoWidth: true, flexGrow: '0' }
    const weight = typeof c.weight === 'number' && c.weight > 0 ? c.weight : 1
    return { ...c, autoWidth: true, flexGrow: String(weight) }
}

interface ColumnNode { metadata?: any }

const isGroup = (n: ColumnNode) => n?.metadata?.type === 'GridGroupColumn'

// one sized copy per wire node (and mode): a listing re-renders often, and a NEW column object on
// every render makes vaadin-grid's column renderers run again (and fail on a detached column)
const memo = new WeakMap<object, Map<string, ColumnNode>>()
const memoized = (n: ColumnNode, mode: string, make: () => ColumnNode): ColumnNode => {
    if (!n || typeof n !== 'object') return n
    let byMode = memo.get(n)
    if (!byMode) { byMode = new Map(); memo.set(n, byMode) }
    let out = byMode.get(mode)
    if (!out) { out = make(); byMode.set(mode, out) }
    return out
}

/**
 * The listing's columns (wire nodes: GridColumn or GridGroupColumn with its own columns) with the
 * default sizing applied to every leaf column that declares none. Returns new nodes (the same ones
 * for the same wire nodes); the wire's are untouched.
 */
export const withDefaultColumnSizing = <N extends ColumnNode>(columns: N[]): N[] => {
    const nodes = columns ?? []
    const leaves = (ns: ColumnNode[]): any[] => ns.flatMap(n => isGroup(n) ? leaves(n.metadata.columns ?? []) : [n?.metadata])
    const grows = (c: any) => c && String(c.flexGrow ?? '1') !== '0'
    // nothing would grow: the compact DEFAULTS share the width (from their content), the declared stay
    const share = !leaves(nodes).some(c => c && grows(declaresSizing(c) ? c : defaultSizingOf(c)))
    const mode = share ? 'share' : 'size'
    const sizeLeaf = (n: ColumnNode): ColumnNode => !n?.metadata ? n : memoized(n, mode, () => {
        const sized = defaultSizingOf(n.metadata)
        return { ...n, metadata: share && !declaresSizing(n.metadata) ? { ...sized, flexGrow: '1' } : sized }
    })
    return nodes.map(n => isGroup(n)
        ? memoized(n, mode, () => ({ ...n, metadata: { ...n.metadata, columns: (n.metadata.columns ?? []).map(sizeLeaf) } }))
        : sizeLeaf(n)) as N[]
}
