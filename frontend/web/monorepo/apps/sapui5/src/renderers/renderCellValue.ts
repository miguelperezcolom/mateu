import { html, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn";
import { StatusType } from "@mateu/shared/apiClients/dtos/componentmetadata/StatusType";

/** Maps a Mateu StatusType to a SAP UI5 ui5-tag color-scheme (1-10). */
export const statusColorScheme = (type: StatusType | undefined): string => {
    if (type === StatusType.SUCCESS) return '8'
    if (type === StatusType.DANGER) return '1'
    if (type === StatusType.WARNING) return '6'
    if (type === StatusType.INFO) return '4'
    return '5'
}

/** Renders a status value ({ message, type }) as a ui5-tag. */
export const renderStatusValue = (value: any): TemplateResult => {
    if (!value) return html``
    const message = value.message ?? String(value)
    return html`<ui5-tag color-scheme="${statusColorScheme(value.type)}">${message}</ui5-tag>`
}

/**
 * Plain-text rendering of a cell value, for contexts that can only take a string (the ui5-li
 * `description` line in the list/masterDetail layouts). Status objects print their message,
 * booleans print ✓/✗ — everything else stringifies (never [object Object]).
 */
export const cellText = (item: any, col: GridColumn): string => {
    const value = item[col.id]
    if (value == null) return ''
    if (col.dataType === 'bool' || typeof value === 'boolean') return value ? '✓' : '✗'
    if (typeof value === 'object') {
        return String(value.message ?? value.label ?? value.text ?? value.value ?? '')
    }
    return String(value)
}

export type CellActionDispatcher = (actionId: string, item: any) => void

/**
 * Renders a single cell value for a grid/table row, honouring the column dataType/stereotype.
 * Shared by mateu-sapui5-table (Crud/Table) and the sapui5 Grid renderer.
 */
export const renderCellValue = (item: any, col: GridColumn, dispatchAction: CellActionDispatcher): TemplateResult => {
    const type = col.dataType ?? ''
    const stereotype = col.stereotype ?? ''
    const value = item[col.id]

    if (type === 'status') return renderStatusValue(value)

    if (type === 'bool') {
        return value
            ? html`<ui5-icon name="accept"></ui5-icon>`
            : html`<ui5-icon name="decline"></ui5-icon>`
    }

    if (type === 'money' || stereotype === 'money') {
        if (value == null) return html``
        return html`${new Intl.NumberFormat(undefined, { minimumFractionDigits: 2 }).format(Number(value))}`
    }

    if (type === 'link' || stereotype === 'link') {
        const text = typeof value === 'object' ? (value?.text ?? '') : (value ?? '')
        const actionId = col.actionId
        if (actionId) {
            return html`<ui5-link @click="${(e: Event) => {
                e.preventDefault()
                dispatchAction(actionId, item)
            }}">${text}</ui5-link>`
        }
        const href = typeof value === 'object' ? (value?.href ?? value?.url ?? '') : ''
        return html`<a href="${href}">${text}</a>`
    }

    if (type === 'icon' || stereotype === 'icon') {
        const icons: string[] = Array.isArray(value)
            ? value
            : (value ? String(value).split(',') : [])
        return html`${icons.map(i => html`<ui5-icon name="${i.trim().replace(/^vaadin:|^lumo:/, '')}"></ui5-icon>`)}`
    }

    if (stereotype === 'html') {
        return html`${unsafeHTML(value ?? '')}`
    }

    if (stereotype === 'image') {
        const src = typeof value === 'object' ? (value?.url ?? value?.src ?? '') : (value ?? '')
        if (!src) return html``
        return html`<img src="${src}" style="max-height: 3rem; object-fit: contain;" />`
    }

    if (stereotype === 'button') {
        const label = col.text ?? col.label ?? ''
        const actionId = col.actionId ?? col.id
        return html`<ui5-button design="Transparent"
            @click="${(e: Event) => { e.stopPropagation(); dispatchAction(actionId, item) }}"
        >${label}</ui5-button>`
    }

    if (type === 'action') {
        const text = typeof value === 'object' ? (value?.text ?? value?.label ?? '') : ''
        const actionId = typeof value === 'object'
            ? (value?.methodNameInCrud ?? value?.actionId ?? value?.id ?? col.id)
            : (col.actionId ?? col.id)
        return html`<ui5-button design="Transparent"
            @click="${(e: Event) => { e.stopPropagation(); dispatchAction(actionId, item) }}"
        >${text}</ui5-button>`
    }

    if (type === 'actionGroup' || type === 'menu') {
        const actions: any[] = typeof value === 'object' && value?.actions
            ? value.actions
            : (Array.isArray(value) ? value : [])
        return html`${actions.map(a => {
            const aId = a.methodNameInCrud ?? a.actionId ?? a.id ?? ''
            return html`<ui5-button design="Transparent"
                @click="${(e: Event) => { e.stopPropagation(); dispatchAction(aId, item) }}"
            >${a.label ?? a.text ?? aId}</ui5-button>`
        })}`
    }

    return html`${value ?? ''}`
}
