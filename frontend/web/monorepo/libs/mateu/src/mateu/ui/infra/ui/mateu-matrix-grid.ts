import { css, html, LitElement, nothing } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type MatrixGrid from '@mateu/shared/apiClients/dtos/componentmetadata/MatrixGrid'
import type { MatrixRow } from '@mateu/shared/apiClients/dtos/componentmetadata/MatrixGrid'

/**
 * A MATRIX of values (`MatrixGrid` on the wire): rows — metrics or types, grouped in collapsible
 * sections — by columns, typically dates (the shape of an availability grid). A column group (the
 * month) spans its columns; a tone tints a column or a cell; a link cell runs `cellActionId` and a
 * cell of an editable row is edited in place (Enter/F2/double click, Enter or blur commits, Escape
 * cancels) and commits through `editActionId`, both with `{ _rowId, _columnId, _value }`.
 * Collapsing is client-side state. Design-system neutral (Lumo variables with fallbacks).
 */

export type MatrixLine =
    | { kind: 'section', id: string, title: string, collapsed: boolean }
    | { kind: 'row', row: MatrixRow, sectionId: string, indented: boolean }

/** The lines to paint, given which sections are collapsed (pure: tested without a DOM). */
export const matrixLinesOf = (grid: MatrixGrid, collapsed: ReadonlySet<string>): MatrixLine[] => {
    const lines: MatrixLine[] = []
    for (const section of grid.sections ?? []) {
        const titled = !!section.title
        const isCollapsed = titled && collapsed.has(section.id)
        if (titled) lines.push({ kind: 'section', id: section.id, title: section.title!, collapsed: isCollapsed })
        if (!isCollapsed) for (const row of section.rows ?? []) lines.push({ kind: 'row', row, sectionId: section.id, indented: titled })
    }
    return lines
}

/** The sections that start collapsed. */
export const initiallyCollapsed = (grid: MatrixGrid): Set<string> =>
    new Set((grid.sections ?? []).filter((s) => s.title && s.collapsed).map((s) => s.id))

/** The column groups as spans: [{ label, span }] — empty when no column declares a group. */
export const columnGroupsOf = (grid: MatrixGrid): { label: string, span: number }[] => {
    const columns = grid.columns ?? []
    if (!columns.some((c) => c.group)) return []
    const out: { label: string, span: number }[] = []
    for (const c of columns) {
        const label = c.group ?? ''
        const last = out[out.length - 1]
        if (last && last.label === label) last.span++
        else out.push({ label, span: 1 })
    }
    return out
}

const TONES = new Set(['info', 'success', 'warning', 'danger', 'neutral'])
/** The tone of a cell: its own, else its column's (unknown tones ignored). */
export const toneOf = (cellTone?: string | null, columnTone?: string | null): string =>
    (cellTone && TONES.has(cellTone) ? cellTone : columnTone && TONES.has(columnTone) ? columnTone : '')

@customElement('mateu-matrix-grid')
export class MateuMatrixGrid extends LitElement {

    @property({ attribute: false }) grid: MatrixGrid | undefined
    @state() collapsed = new Set<string>()
    @state() editing: { rowId: string, columnIndex: number } | undefined
    private seenGrid: MatrixGrid | undefined

    willUpdate(changed: Map<string, unknown>) {
        // a NEW grid from the server keeps what the user folded; the first one takes its defaults
        if (changed.has('grid') && this.grid && !this.seenGrid) this.collapsed = initiallyCollapsed(this.grid)
        if (changed.has('grid')) { this.seenGrid = this.grid; this.editing = undefined }
    }

    private toggle(id: string) {
        const next = new Set(this.collapsed)
        if (next.has(id)) next.delete(id); else next.add(id)
        this.collapsed = next
    }

    private dispatch(actionId: string, rowId: string, columnIndex: number, value: string) {
        const column = this.grid?.columns?.[columnIndex]
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: { _rowId: rowId, _columnId: column?.id, _value: value } },
            bubbles: true,
            composed: true,
        }))
    }

    private commit(row: MatrixRow, columnIndex: number, input: HTMLInputElement) {
        if (!this.editing) return
        this.editing = undefined
        const before = row.cells?.[columnIndex]?.value ?? ''
        if (input.value !== before && this.grid?.editActionId) this.dispatch(this.grid.editActionId, row.id, columnIndex, input.value)
    }

    private renderCell(row: MatrixRow, columnIndex: number) {
        const grid = this.grid!
        const cell = row.cells?.[columnIndex] ?? {}
        const column = grid.columns?.[columnIndex]
        const tone = toneOf(cell.tone, column?.tone)
        const editable = !!(row.editable && grid.editActionId)
        const label = `${row.label ?? ''}, ${column?.label ?? ''}: ${cell.value ?? ''}`
        if (this.editing && this.editing.rowId === row.id && this.editing.columnIndex === columnIndex) {
            return html`<td class="cell ${tone} editing"><input aria-label="${label}" .value="${cell.value ?? ''}"
                @keydown="${(e: KeyboardEvent) => {
                    if (e.key === 'Enter') this.commit(row, columnIndex, e.target as HTMLInputElement)
                    if (e.key === 'Escape') this.editing = undefined
                }}"
                @blur="${(e: Event) => this.commit(row, columnIndex, e.target as HTMLInputElement)}" /></td>`
        }
        const startEdit = () => { this.editing = { rowId: row.id, columnIndex } }
        if (cell.link && grid.cellActionId) {
            return html`<td class="cell ${tone}"><button class="link" type="button" aria-label="${label}"
                @click="${() => this.dispatch(grid.cellActionId!, row.id, columnIndex, cell.value ?? '')}">${cell.value}</button></td>`
        }
        return html`<td class="cell ${tone} ${editable ? 'editable' : ''}" tabindex="${editable ? '0' : nothing}"
            aria-label="${editable ? label : nothing}"
            @dblclick="${editable ? startEdit : nothing}"
            @keydown="${editable ? (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit() } } : nothing}">${cell.value}</td>`
    }

    updated() {
        (this.renderRoot.querySelector('td.editing input') as HTMLInputElement | null)?.focus()
    }

    render() {
        const grid = this.grid
        if (!grid) return nothing
        const columns = grid.columns ?? []
        const groups = columnGroupsOf(grid)
        return html`
            <div class="scroller">
                <table>
                    <thead>
                        ${groups.length ? html`<tr>
                            <th class="corner" rowspan="2">${grid.rowHeaderLabel ?? ''}</th>
                            ${groups.map((g) => html`<th class="group" colspan="${g.span}">${g.label}</th>`)}
                        </tr>` : nothing}
                        <tr>
                            ${groups.length ? nothing : html`<th class="corner">${grid.rowHeaderLabel ?? ''}</th>`}
                            ${columns.map((c) => html`<th class="col ${toneOf(null, c.tone)}" scope="col">${c.label ?? c.id}</th>`)}
                        </tr>
                    </thead>
                    <tbody>
                        ${matrixLinesOf(grid, this.collapsed).map((line) => line.kind === 'section'
                            ? html`<tr class="section"><th scope="rowgroup" class="rowhead">
                                    <button type="button" class="toggle" aria-expanded="${line.collapsed ? 'false' : 'true'}"
                                            @click="${() => this.toggle(line.id)}"><span class="chevron" aria-hidden="true">${line.collapsed ? '▸' : '▾'}</span>${line.title}</button>
                                </th>${columns.map(() => html`<td class="cell section-cell"></td>`)}</tr>`
                            : html`<tr class="${line.row.emphasis ? 'emphasis' : ''}">
                                    <th scope="row" class="rowhead ${line.indented ? 'indented' : ''}">${line.row.label}</th>
                                    ${columns.map((_, i) => this.renderCell(line.row, i))}
                                </tr>`)}
                    </tbody>
                </table>
            </div>
        `
    }

    static styles = css`
        :host { display: block; max-width: 100%; }
        .scroller { overflow: auto; max-height: 36rem; border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px); }
        table { border-collapse: separate; border-spacing: 0; font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-body-text-color, #1a1a1a); }
        th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); white-space: nowrap; background: var(--lumo-base-color, #fff); }
        thead th { position: sticky; top: 0; z-index: 2; font-weight: 600; text-align: end; }
        thead tr:nth-child(2) th { top: 2rem; }
        thead th.group { text-align: start; }
        th.corner, th.rowhead { position: sticky; left: 0; z-index: 1; text-align: start; min-width: 12rem; }
        th.corner { z-index: 3; }
        th.rowhead.indented { padding-inline-start: 1.6rem; font-weight: 500; }
        td.cell { text-align: end; min-width: 4.5rem; }
        tr.emphasis td, tr.emphasis th { font-weight: 700; }
        tr.section th, tr.section td { background: var(--lumo-contrast-5pct, #f5f5f5); }
        .toggle { font: inherit; font-weight: 600; background: none; border: 0; padding: 0; cursor: pointer; color: inherit; display: inline-flex; gap: 0.4rem; }
        .chevron { width: 1em; }
        .link { font: inherit; background: none; border: 0; padding: 0; cursor: pointer; color: var(--lumo-primary-text-color, #0b6bcb); text-decoration: underline; }
        td.editable { cursor: text; box-shadow: inset 0 -2px 0 var(--lumo-contrast-20pct, rgba(0,0,0,.2)); }
        td.editing input { width: 4rem; font: inherit; text-align: end; }
        button:focus-visible, td.editable:focus-visible { outline: 2px solid var(--lumo-primary-color, #0b6bcb); outline-offset: -2px; }
        .info { background-color: rgba(0, 110, 200, 0.08); }
        .success { background-color: rgba(30, 140, 60, 0.10); }
        .warning { background-color: rgba(220, 140, 0, 0.16); }
        .danger { background-color: rgba(200, 40, 30, 0.10); color: #b3261e; }
        .neutral { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-matrix-grid': MateuMatrixGrid
    }
}
