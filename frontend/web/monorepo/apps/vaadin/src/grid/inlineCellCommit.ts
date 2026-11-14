/**
 * When an inline-edited listing cell may send what it holds — the rule that keeps a search from
 * writing one row's values into another.
 *
 * <p>vaadin-grid RECYCLES its cells: after a search the same editor element is handed the row now
 * shown in its slot, and Lit sets the new value BEFORE it swaps the event listener. An editor that
 * announces programmatic changes (`value-changed` of a combo/date picker, `checked-changed` of a
 * checkbox) therefore reported the NEW row's value to the OLD row's listener, and the listing saved
 * it — a search for "le guin" stored the Fellowship of the Ring as ScienceFiction (3.0-beta.68).
 *
 * <p>So a cell commits only when all three hold:
 * <ol>
 *   <li>the editor fired a USER event (`change`) — never a value-binding notification;</li>
 *   <li>the edit STARTED on this very row (focus on the editor recorded the row; a recycled editor
 *       that now shows another row, or one nobody focused, commits nothing);</li>
 *   <li>the value differs from the row's own current value (a checkbox's init event, an empty
 *       text over a null).</li>
 * </ol>
 */
const editStarts = new WeakMap<EventTarget, object>()

/** The user put the focus on `editor` while it showed `row`: an edit of THAT row starts. */
export const noteEditStart = (editor: EventTarget | null, row: object) => {
    if (editor) editStarts.set(editor, row)
}

/** The value a cell holds and the one its editor reports are the same (no edit happened). */
export const sameCellValue = (current: unknown, next: unknown): boolean => {
    if (current === next) return true
    const blank = (v: unknown) => v == null || v === ''
    if (blank(current) && blank(next)) return true
    if (blank(current) || blank(next)) return false
    const primitive = (v: unknown) => ['string', 'number', 'boolean'].includes(typeof v)
    return primitive(current) && primitive(next) && String(current) === String(next)
}

/**
 * Whether the user's `change` on `editor`, showing `row`, carrying `value` for `columnId`, is an
 * edit of that row's cell to send.
 */
export const isCellEdit = (editor: EventTarget | null, row: Record<string, unknown>, columnId: string, value: unknown): boolean =>
    !!editor && editStarts.get(editor) === row && !sameCellValue(row[columnId], value)
