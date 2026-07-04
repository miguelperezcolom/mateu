import { html, LitElement, nothing, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import Component from "@mateu/shared/apiClients/dtos/Component.ts";
import Grid from "@mateu/shared/apiClients/dtos/componentmetadata/Grid.ts";
import GridColumn from "@mateu/shared/apiClients/dtos/componentmetadata/GridColumn.ts";
import VirtualList from "@mateu/shared/apiClients/dtos/componentmetadata/VirtualList.ts";
import ContextMenu from "@mateu/shared/apiClients/dtos/componentmetadata/ContextMenu.ts";
import Markdown from "@mateu/shared/apiClients/dtos/componentmetadata/Markdown.ts";
import CustomField from "@mateu/shared/apiClients/dtos/componentmetadata/CustomField.ts";
import Directory from "@mateu/shared/apiClients/dtos/componentmetadata/Directory.ts";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { renderCellValue } from "@/renderers/renderCellValue.ts";
import '@/components/mateu-sapui5-table';

// Component-level renderers added for parity with the reference (Vaadin) renderer, all built
// with SAP UI5 web components (or plain design-system-neutral markup).

// ── Markdown ─────────────────────────────────────────────────────────────────
// mateu-markdown renders parsed markdown (marked + DOMPurify) as plain HTML typography into
// its light DOM (the element is registered by the shared mateu-component import) — no design
// system involved.
export const renderMarkdown = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Markdown
    return html`
        <mateu-markdown .content=${metadata.markdown}
                        style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
                        slot="${component.slot ?? nothing}"></mateu-markdown>`
}

// ── Grid (read-only data grid, incl. tree mode) ─────────────────────────────
export const renderGrid = (
    container: LitElement,
    component: ClientSideComponent,
    _baseUrl: string | undefined,
    state: any,
    _data: any,
    _appState: any,
    _appData: any
): TemplateResult => {
    const metadata = component.metadata as Grid

    const dispatch = (actionId: string, item: any) => {
        container.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId, parameters: item },
            bubbles: true,
            composed: true
        }))
    }

    // Group columns are flattened: SAP UI5's ui5-table has no column group headers.
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
    const cols = flattenColumns(metadata.content)

    if (metadata.tree) {
        const rows: any[] = metadata.page?.content ?? []
        const treeCol = cols[0]
        const restCols = cols.slice(1)
        const itemDescription = (item: any) => restCols
            .map(c => item[c.id] != null ? `${c.label}: ${item[c.id]}` : '')
            .filter(t => t)
            .join(' · ')
        const renderTreeItem = (item: any): TemplateResult => html`
            <ui5-tree-item
                text="${String(item[treeCol?.id ?? ''] ?? '')}"
                additional-text="${itemDescription(item) || nothing}"
                ?has-children="${(item.children?.length ?? 0) > 0}"
                expanded
            >
                ${item.children?.map((child: any) => renderTreeItem(child))}
            </ui5-tree-item>`
        return html`
            <ui5-tree no-data-text="No data."
                      style="${component.style ?? 'width: 100%;'}" class="${component.cssClasses ?? nothing}"
                      slot="${component.slot ?? nothing}">
                ${rows.map((item: any) => renderTreeItem(item))}
            </ui5-tree>`
    }

    let items: any[] = metadata.page?.content ?? []
    if (component.id && state && state[component.id]) {
        items = state[component.id]
    }

    return html`
        <ui5-table no-data-text="No data." overflow-mode="Popin"
                   style="${component.style ?? 'width: 100%;'}" class="${component.cssClasses ?? nothing}"
                   slot="${component.slot ?? nothing}">
            <ui5-table-header-row slot="headerRow">
                ${cols.map(col => html`
                    <ui5-table-header-cell width="${col.width ?? nothing}">${col.label ?? ''}</ui5-table-header-cell>
                `)}
            </ui5-table-header-row>
            ${items.map((item: any, idx: number) => html`
                <ui5-table-row row-key="${item._rowNumber ?? idx}">
                    ${cols.map(col => html`
                        <ui5-table-cell>${renderCellValue(item, col, dispatch)}</ui5-table-cell>
                    `)}
                </ui5-table-row>
            `)}
        </ui5-table>`
}

// ── Table (fluent Table component; rows arrive in data[id].page) ────────────
export const renderTable = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: any,
    data: any,
    appState: any,
    appData: any
): TemplateResult => html`
    <mateu-sapui5-table
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
    </mateu-sapui5-table>`

// ── VirtualList ──────────────────────────────────────────────────────────────
// SAP UI5 has no free-standing virtualized list web component: render the page content in a
// scrollable container. Pages are already server-side windows, so lists stay bounded.
export const renderVirtualList = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: any,
    data: any,
    appState: any,
    appData: any
): TemplateResult => {
    const metadata = component.metadata as VirtualList
    const items: any[] = metadata.page?.content ?? []
    return html`
        <div style="overflow-y: auto; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">
            ${items.map(item => renderComponent(container, item as Component, baseUrl, state, data, appState, appData))}
        </div>`
}

// ── ContextMenu ──────────────────────────────────────────────────────────────
export const renderContextMenu = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: any,
    data: any,
    appState: any,
    appData: any
): TemplateResult => {
    const metadata = component.metadata as ContextMenu
    const menuId = `ctx-menu-${component.id}`

    const navigate = (target: EventTarget | null, option: MenuOption) => {
        if (!option.path) return
        target?.dispatchEvent(new CustomEvent('update-route', {
            detail: { route: option.path },
            bubbles: true,
            composed: true
        }))
    }

    const renderMenuItems = (options: MenuOption[]): TemplateResult => html`
        ${options.map(option => option.separator
            ? html`<ui5-menu-separator></ui5-menu-separator>`
            : html`
                <ui5-menu-item
                    text="${option.label ?? ''}"
                    ?disabled="${option.disabled}"
                    @click="${(e: Event) => navigate(e.target, option)}"
                >
                    ${option.submenus ? renderMenuItems(option.submenus) : nothing}
                </ui5-menu-item>`)}
    `

    const openMenu = (e: Event) => {
        e.preventDefault()
        const root = (e.currentTarget as HTMLElement).getRootNode() as ParentNode
        const menu = root.querySelector(`#${CSS.escape(menuId)}`) as any
        if (menu) {
            menu.opener = e.currentTarget as HTMLElement
            menu.open = true
        }
    }

    return html`
        <span style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
              slot="${component.slot ?? nothing}"
              @contextmenu="${metadata.activateOnLeftClick ? nothing : openMenu}"
              @click="${metadata.activateOnLeftClick ? openMenu : nothing}">
            ${renderComponent(container, metadata.wrapped, baseUrl, state, data, appState, appData)}
            <ui5-menu id="${menuId}">
                ${renderMenuItems(metadata.menu ?? [])}
            </ui5-menu>
        </span>`
}

// ── Directory (columns of collapsible link groups) ──────────────────────────
export const renderDirectory = (component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as Directory

    const renderItem = (item: MenuOption): TemplateResult => item.submenus
        ? html`
            <ui5-panel header-text="${item.label ?? ''}" style="min-width: 12rem;">
                <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                    ${item.submenus.map(sub => renderItem(sub))}
                </div>
            </ui5-panel>`
        : html`<ui5-link href="${item.path ?? nothing}">${item.label}</ui5-link>`

    return html`
        <div style="display: flex; gap: 3rem; align-items: flex-start; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${metadata.menu.map(item => renderItem(item))}
        </div>`
}

// ── CustomField (label + arbitrary content) ─────────────────────────────────
export const renderCustomField = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: any,
    data: any,
    appState: any,
    appData: any
): TemplateResult => {
    const metadata = component.metadata as CustomField
    return html`
        <div style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}" data-colspan="${metadata.colspan || nothing}">
            ${metadata.label ? html`<ui5-label show-colon>${metadata.label}</ui5-label>` : nothing}
            <div>${renderComponent(container, metadata.content, baseUrl, state, data, appState, appData)}</div>
        </div>`
}

// ── MasterDetailLayout (two panes; detail arrives in data.detailComponent) ──
export const renderMasterDetailLayout = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: any,
    data: any,
    appState: any,
    appData: any
): TemplateResult => {
    const staticDetail = component.children && component.children.length > 1 ? component.children[1] : null
    const dynamicDetail = data?.detailComponent ?? null
    const hasDetail = !!(data?.hasDetail) || !!staticDetail
    const detailContent = dynamicDetail ?? staticDetail
    return html`
        <div style="display: flex; gap: 0; width: 100%; border: 1px solid var(--sapNeutralBorderColor, #e5e5e5); border-radius: 0.5rem; overflow: hidden; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            <div style="flex: 1; min-width: 0; overflow-y: auto;">
                ${renderComponent(container, component.children![0], baseUrl, state, data, appState, appData)}
            </div>
            <div style="flex: 1; min-width: 0; overflow-y: auto; border-left: 1px solid var(--sapNeutralBorderColor, #e5e5e5); ${hasDetail && detailContent ? '' : 'display: flex; align-items: center; justify-content: center;'}">
                ${hasDetail && detailContent
                    ? renderComponent(container, detailContent, baseUrl, state, data, appState, appData)
                    : html`<span style="color: var(--sapContent_LabelColor, #6a6d70); font-size: 0.875rem; padding: 1rem;">Select an item to view details</span>`}
            </div>
        </div>`
}

// ── MessageList / MessageInput (chat building blocks) ───────────────────────
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
                    <ui5-avatar size="XS" initials="${(m.userName ?? '?').split(/\s+/).map(s => s[0]).slice(0, 2).join('')}"></ui5-avatar>
                    <div>
                        ${m.userName ? html`<div style="font-size: 0.75rem; color: var(--sapContent_LabelColor, #6a6d70);">${m.userName}</div>` : nothing}
                        <div>${m.text}</div>
                    </div>
                </div>
            `)}
        </div>`
}

export const renderMessageInput = (component: ClientSideComponent): TemplateResult => {
    const submit = (e: Event) => {
        const root = (e.target as HTMLElement).parentElement
        const input = root?.querySelector('ui5-input') as any
        const value = input?.value ?? ''
        if (!value) return
        ;(e.target as HTMLElement).dispatchEvent(new CustomEvent('submit', {
            detail: { value },
            bubbles: true,
            composed: true
        }))
        if (input) input.value = ''
    }
    return html`
        <div style="display: flex; gap: 0.5rem; align-items: center; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            <ui5-input placeholder="Message" style="flex: 1;"
                       @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') submit(e) }}"></ui5-input>
            <ui5-button design="Emphasized" @click="${submit}">Send</ui5-button>
        </div>`
}
