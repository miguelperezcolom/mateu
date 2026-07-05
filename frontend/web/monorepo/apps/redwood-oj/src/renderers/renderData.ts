import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import Component from "@mateu/shared/apiClients/dtos/Component.ts"
import Grid from "@mateu/shared/apiClients/dtos/componentmetadata/Grid.ts"
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts"
import VirtualList from "@mateu/shared/apiClients/dtos/componentmetadata/VirtualList.ts"
import Directory from "@mateu/shared/apiClients/dtos/componentmetadata/Directory.ts"
import CustomField from "@mateu/shared/apiClients/dtos/componentmetadata/CustomField.ts"
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"
import '../components/mateu-redwood-table'

// ─────────────────────────────────────────────────────────────────────────────
// Data components (parity phase 3). The read-only Grid (and the inline `grid` field
// stereotype, which reuses it) is a plain Redwood-styled HTML table: oj-c-table needs the
// imperative mount dance mateu-redwood-table implements for the Crud path, which is not
// worth repeating for read-only display grids. The fluent Table component DOES delegate to
// mateu-redwood-table (rows arrive in data[id].page, exactly what it consumes).
// ─────────────────────────────────────────────────────────────────────────────

const SECONDARY = 'var(--oj-core-text-color-secondary, #666)'
const DIVIDER = 'var(--oj-core-divider-color, #e0e0e0)'

const HEADER_CELL = `text-align: left; padding: 0.5rem 0.75rem; border-bottom: 2px solid ${DIVIDER}; color: ${SECONDARY}; font-size: 0.8125rem; font-weight: 600; white-space: nowrap;`
const CELL = `padding: 0.5rem 0.75rem; border-bottom: 1px solid ${DIVIDER};`

const badgeVariant = (type: string | undefined): string => {
    const t = (type ?? '').toUpperCase()
    if (t === 'SUCCESS') return 'successSubtle'
    if (t === 'DANGER' || t === 'ERROR') return 'dangerSubtle'
    if (t === 'WARNING') return 'warningSubtle'
    if (t === 'INFO') return 'infoSubtle'
    return 'neutral'
}

const dispatchRowAction = (target: EventTarget | null, actionId: string, item: any) => {
    target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters: item },
        bubbles: true,
        composed: true
    }))
}

export const renderGridCellValue = (item: any, col: GridColumn): TemplateResult => {
    const value = item[col.id]
    if (col.stereotype === 'button' || col.dataType === 'action') {
        const label = value?.label ?? value?.text ?? col.text ?? col.label ?? 'View'
        const actionId = value?.methodNameInCrud ?? col.actionId ?? col.id
        return html`<oj-c-button
            data-oj-binding-provider="preact"
            label="${label}"
            chroming="borderless"
            @ojAction="${(e: Event) => dispatchRowAction(e.target, actionId, item)}"
        ></oj-c-button>`
    }
    if (col.dataType === 'status') {
        if (value == null) return html``
        return html`<oj-c-badge
            data-oj-binding-provider="preact"
            label="${value.message ?? '' + value}"
            variant="${badgeVariant(value.type)}"
        ></oj-c-badge>`
    }
    if (col.dataType === 'bool' || col.dataType === 'boolean') {
        return html`<span aria-label="${value ? 'yes' : 'no'}">${value ? '✓' : '✕'}</span>`
    }
    return html`${value ?? ''}`
}

// Group columns are flattened (the plain table carries no grouped header row).
const flattenColumns = (content: ClientSideComponent[] | undefined): GridColumn[] => {
    const cols: GridColumn[] = []
    content?.forEach(column => {
        const md = column.metadata as any
        if (md?.type === ComponentMetadataType.GridGroupColumn) {
            cols.push(...flattenColumns(md.columns ?? md.content ?? column.children))
        } else if (md) {
            cols.push({ ...md, id: md.id ?? column.id } as GridColumn)
        }
    })
    return cols
}

// Reused by the inline `grid` field stereotype (renderField.ts).
export const renderPlainGrid = (cols: GridColumn[], rows: any[], tree = false, onRowClick?: (e: Event, item: any) => void): TemplateResult => {
    const renderRow = (item: any, depth: number): TemplateResult[] => {
        const row = html`
            <tr style="${onRowClick ? 'cursor: pointer;' : ''}" @click="${onRowClick ? (e: Event) => onRowClick(e, item) : nothing}">
                ${cols.map((col, i) => html`
                    <td style="${CELL} ${i === 0 && tree ? `padding-left: ${0.75 + depth * 1.25}rem;` : ''} ${col.align ? `text-align: ${col.align};` : ''}">
                        ${renderGridCellValue(item, col)}
                    </td>`)}
            </tr>`
        const children: any[] = tree ? (item.children ?? []) : []
        return [row, ...children.flatMap((child: any) => renderRow(child, depth + 1))]
    }
    return html`
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr>${cols.map(col => html`<th style="${HEADER_CELL} ${col.align ? `text-align: ${col.align};` : ''}" width="${col.width ?? nothing}">${col.label ?? ''}</th>`)}</tr>
            </thead>
            <tbody>
                ${rows.length === 0
                    ? html`<tr><td colspan="${cols.length}" style="${CELL} color: ${SECONDARY}; text-align: center;">No data.</td></tr>`
                    : rows.flatMap(item => renderRow(item, 0))}
            </tbody>
        </table>`
}

export const renderGrid = (component: ClientSideComponent, state: any): TemplateResult => {
    const metadata = component.metadata as Grid
    const cols = flattenColumns(metadata.content)
    let rows: any[] = metadata.page?.content ?? []
    if (component.id && state && Array.isArray(state[component.id])) {
        rows = state[component.id]
    }
    return html`
        <div style="width: 100%; overflow-x: auto; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${renderPlainGrid(cols, rows, metadata.tree)}
        </div>`
}

// Fluent Table component → mateu-redwood-table (same component the Crud path uses; rows
// arrive in data[id].page).
export const renderTable = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => html`
    <mateu-redwood-table
        id="${component.id}"
        .metadata="${component.metadata}"
        .data="${data}"
        .state="${state}"
        .appState="${appState}"
        .appData="${appData}"
        baseUrl="${baseUrl ?? ''}"
        style="${component.style ?? nothing}"
        class="${component.cssClasses ?? nothing}"
        slot="${component.slot ?? nothing}"
    >
        ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
    </mateu-redwood-table>`

// Pages are already server-side windows, so a scrollable container keeps lists bounded
// (same decision as the sapui5 port — JET's list-view would need its own data provider).
export const renderVirtualList = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as VirtualList
    const items: any[] = metadata.page?.content ?? []
    return html`
        <div style="overflow-y: auto; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${items.map(item => renderComponent(container, item as Component, baseUrl, state, data, appState, appData))}
        </div>`
}

// Columns of link groups.
export const renderDirectory = (component: ClientSideComponent): TemplateResult => {
    const renderItem = (item: MenuOption): TemplateResult => item.submenus
        ? html`
            <div style="min-width: 12rem;">
                <div class="oj-typography-subheading-sm" style="margin-bottom: 0.5rem;">${item.label ?? ''}</div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${item.submenus.map(sub => renderItem(sub))}
                </div>
            </div>`
        : html`<a class="oj-link-standalone" href="${item.path ?? nothing}">${item.label}</a>`
    const metadata = component.metadata as Directory
    return html`
        <div style="display: flex; gap: 3rem; align-items: flex-start; flex-wrap: wrap; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${metadata.menu.map(item => renderItem(item))}
        </div>`
}

// Label + arbitrary content.
export const renderCustomField = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as CustomField
    return html`
        <div style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}" data-colspan="${metadata.colspan || nothing}">
            ${metadata.label ? html`<div style="font-size: 0.75rem; color: ${SECONDARY}; margin-bottom: 4px;">${metadata.label}</div>` : nothing}
            <div>${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}</div>
        </div>`
}

// ── MessageList / MessageInput (chat building blocks) ────────────────────────
export const renderMessageList = (component: ClientSideComponent): TemplateResult => {
    // The wire metadata carries no items yet (the reference renderer shows demo content);
    // messages may arrive in the component state under the component id.
    const messages: { text: string, userName?: string }[] = (component as any).state?.items
        ?? (component.metadata as any)?.items
        ?? []
    return html`
        <div style="display: flex; flex-direction: column; gap: 0.75rem; padding: 0.5rem; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${messages.map(m => html`
                <div style="display: flex; gap: 0.5rem; align-items: flex-start;">
                    <oj-c-avatar data-oj-binding-provider="preact" size="xs"
                                 initials="${(m.userName ?? '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('')}"></oj-c-avatar>
                    <div>
                        ${m.userName ? html`<div style="font-size: 0.75rem; color: ${SECONDARY};">${m.userName}</div>` : nothing}
                        <div>${m.text}</div>
                    </div>
                </div>
            `)}
        </div>`
}

export const renderMessageInput = (component: ClientSideComponent): TemplateResult => {
    const submit = (e: Event) => {
        const wrap = (e.target as HTMLElement).closest('.rw-message-input')
        const input = wrap?.querySelector('oj-c-input-text') as any
        const value = input?.rawValue ?? input?.value ?? ''
        if (!value) return
        ;(e.target as HTMLElement).dispatchEvent(new CustomEvent('submit', {
            detail: { value },
            bubbles: true,
            composed: true
        }))
        if (input) input.value = ''
    }
    return html`
        <div class="rw-message-input ${component.cssClasses ?? ''}"
             style="display: flex; gap: 0.5rem; align-items: center; ${component.style ?? ''}"
             slot="${component.slot ?? nothing}">
            <oj-c-input-text data-oj-binding-provider="preact" label-edge="none" placeholder="Message" style="flex: 1;"
                             @ojValueAction="${submit}"></oj-c-input-text>
            <oj-c-button data-oj-binding-provider="preact" label="Send" chroming="callToAction" @ojAction="${submit}"></oj-c-button>
        </div>`
}
