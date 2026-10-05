import { html, nothing, TemplateResult } from "lit";
import { columnBodyRenderer } from "@vaadin/grid/lit";

/**
 * A leading column with a chevron on every row that opens a detail when clicked — pointing right
 * while closed, down while open. Without it, a grid whose rows expand on click looks like any other
 * grid, and nothing says that the row hides more.
 *
 * <p>Only a signal: the click that toggles the detail is the row's own (active-item-changed), so the
 * icon is not a button and takes no focus. Grids that open the detail with a button
 * (useButtonForDetail) already have one and do not use this.
 *
 * @param skip rows that never open a detail (e.g. a listing's group marker rows) get no chevron
 * @param isOpen whether the row's detail is open, when the grid's own detailsOpened does not say
 *               it (multi-line rows keep every row's details area open for the extra lines)
 */
export function detailIndicatorColumn(skip?: (row: any) => boolean, isOpen?: (row: any) => boolean): TemplateResult {
    return html`
        <vaadin-grid-column
                width="2.25rem"
                flex-grow="0"
                ${columnBodyRenderer<any>((row, { detailsOpened }) => skip?.(row) ? nothing : html`
                    <vaadin-icon
                            icon="${(isOpen ? isOpen(row) : detailsOpened) ? 'lumo:angle-down' : 'lumo:angle-right'}"
                            aria-hidden="true"
                            style="color: var(--lumo-secondary-text-color); width: var(--lumo-icon-size-s); height: var(--lumo-icon-size-s);"
                    ></vaadin-icon>`, [isOpen])}
        ></vaadin-grid-column>`
}
