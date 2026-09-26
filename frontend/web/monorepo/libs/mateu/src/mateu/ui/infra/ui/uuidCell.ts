import { html, TemplateResult } from "lit";

/**
 * A cell whose whole value is a canonical UUID shows only its last block — "…-0994d4bb705b" — with
 * the whole UUID in its tooltip, and copying it copies the whole UUID too.
 *
 * <p>An identifier column of UUIDs is 36 characters of noise that pushes every other column off the
 * screen, and the last block is what a person actually compares by eye. Only the DISPLAY changes: the
 * row keeps the full value, so navigation, actions and selection are untouched. Detection is by the
 * value alone (8-4-4-4-12 hex, the whole cell), so it reaches every remote without a backend change;
 * a value that merely contains a UUID is left as it is.
 */
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUuid = (value: unknown): value is string =>
    typeof value === 'string' && UUID.test(value)

/** "…-<last block>" for a UUID; any other value as it is. */
export const abbreviateUuid = (value: unknown): unknown =>
    isUuid(value) ? '…-' + value.substring(value.lastIndexOf('-') + 1) : value

/**
 * Copying the abbreviated text puts the whole UUID on the clipboard: what a person copies an id for
 * is to paste it somewhere that needs all of it.
 */
export const copyWholeUuid = (uuid: string) => (e: ClipboardEvent) => {
    if (!e.clipboardData) return
    e.clipboardData.setData('text/plain', uuid)
    e.preventDefault()
}

/**
 * The cell's content: the abbreviation wrapped in a span that carries the whole UUID (tooltip, copy
 * and data-uuid), or the value untouched when it is not a UUID.
 */
export const uuidAwareText = (value: unknown): unknown =>
    isUuid(value)
        ? html`<span class="mateu-uuid" data-uuid="${value}" title="${value}"
                     @copy="${copyWholeUuid(value)}">${abbreviateUuid(value)}</span>` as TemplateResult
        : value
