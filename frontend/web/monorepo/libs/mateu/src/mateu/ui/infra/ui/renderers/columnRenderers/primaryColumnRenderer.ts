import { html, nothing } from "lit";
import type { GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import type GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";

/**
 * Rich "primary" cell (coherence-plan #6): a leading avatar/icon + the title (the column value) with
 * an optional secondary caption line — 2–3 row fields composed into one cell, the 80% table pattern
 * without hand-building the cell. `captionPath`/`leadingPath` name the other row fields to read.
 */
export const renderPrimaryCell = (item: any, column: GridColumn, vaadinColumn: VaadinGridColumn) => {
    const title = item[vaadinColumn.path!] ?? ''
    const caption = column.captionPath ? item[column.captionPath] : undefined
    const leading = column.leadingPath ? item[column.leadingPath] : undefined
    return html`
        <span style="display: flex; align-items: center; gap: var(--lumo-space-s); overflow: hidden;">
            ${leading ? html`<img src="${leading}" alt="" loading="lazy"
                style="width: 2rem; height: 2rem; border-radius: 50%; object-fit: cover; flex-shrink: 0;" />` : nothing}
            <span style="display: flex; flex-direction: column; overflow: hidden;">
                <span style="font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${title}</span>
                ${caption ? html`<span style="color: var(--lumo-secondary-text-color); font-size: var(--lumo-font-size-s); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${caption}</span>` : nothing}
            </span>
        </span>`
}
