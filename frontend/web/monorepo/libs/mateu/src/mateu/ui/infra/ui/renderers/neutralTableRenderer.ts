import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import { html, nothing } from "lit";

/*
 * Design-system-neutral table renderer — a plain HTML <table>, no `@vaadin`. Shared by the core
 * Grid / Table switch entries and by BasicComponentRenderer.renderTableComponent (crud listing).
 * The Vaadin adapter overrides these with the vaadin-grid based gridRenderer / <mateu-table> for
 * sorting, editing, virtual scrolling, etc.; sapui5 has its own ui5-table. Cells are plain text.
 */

interface Col { id: string; label: string; autoWidth?: boolean; width?: string }

const extractColumns = (component: ClientSideComponent): Col[] => {
    const md = component.metadata as any
    const cols = (md?.content ?? md?.columns ?? []) as ClientSideComponent[]
    return cols
        .filter(c => c && (c.metadata as any))
        .map(c => {
            const gc = c.metadata as GridColumn
            return { id: c.id ?? '', label: (gc?.label ?? c.id ?? '') as string, autoWidth: (gc as any)?.autoWidth, width: (gc as any)?.width }
        })
}

const cellText = (row: any, colId: string): string => {
    const v = row?.[colId]
    if (v == null) return ''
    if (typeof v === 'object') return v.text ?? v.label ?? v.value ?? ''
    return String(v)
}

export const renderNeutralTable = (component: ClientSideComponent, rows: any[], emptyMessage?: string) => {
    const columns = extractColumns(component)
    const th = 'text-align:left; padding:.45rem .6rem; border-bottom:2px solid var(--lumo-contrast-20pct,rgba(0,0,0,.2)); font-weight:600; white-space:nowrap; color: var(--lumo-secondary-text-color,#556);'
    const td = 'padding:.4rem .6rem; border-bottom:1px solid var(--lumo-contrast-10pct,rgba(0,0,0,.08)); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:24rem;'
    return html`
        <div style="overflow:auto; width:100%; ${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            <table style="border-collapse:collapse; width:100%; font-size: var(--lumo-font-size-s,.875rem);">
                <thead><tr>${columns.map(c => html`<th style="${th}">${c.label}</th>`)}</tr></thead>
                <tbody>
                    ${(rows ?? []).length === 0
                        ? html`<tr><td colspan="${Math.max(1, columns.length)}" style="padding:1.5rem; text-align:center; color: var(--lumo-secondary-text-color,#888);">${emptyMessage ?? 'No data.'}</td></tr>`
                        : rows.map(row => html`<tr>${columns.map(c => html`<td style="${td}" title="${cellText(row, c.id)}">${cellText(row, c.id)}</td>`)}</tr>`)}
                </tbody>
            </table>
        </div>
    `
}

/** Rows for a Grid metadata (page content, or the state override the vaadin grid also honors). */
export const gridRows = (component: ClientSideComponent, state: any): any[] => {
    const md = component.metadata as any
    if (component.id && state && state[component.id]) return state[component.id]
    return md?.page?.content ?? []
}
