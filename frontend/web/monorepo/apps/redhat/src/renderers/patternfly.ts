import { html, nothing, type TemplateResult, LitElement } from 'lit'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent.ts'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import { handleButtonClick } from '@infra/ui/renderers/buttonRenderer.ts'

const interpolate = (raw: string | undefined, state: any, data: any): string => {
    if (!raw) return ''
    return raw.includes('${')
        ? new Function('state', 'data', 'return `' + raw + '`')(state ?? {}, data ?? {})
        : raw
}

const kids = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any) =>
    (component.children ?? []).map((c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData))

// ── Button ──────────────────────────────────────────────────────────────────
const buttonVariant = (md: any): string => {
    const c = md.color as string
    if (c === 'primary') return 'pf-m-primary'
    if (c === 'error' || c === 'danger') return 'pf-m-danger'
    if (c === 'success') return 'pf-m-primary'
    return 'pf-m-secondary'
}

export const renderButton = (component: ClientSideComponent, state?: any, data?: any): TemplateResult => {
    const md = component.metadata as any
    const label = interpolate(md.label, state, data)
    return html`
        <button id="${component.id}" type="button"
                class="pf-v6-c-button ${buttonVariant(md)}"
                data-action-id="${md.actionId}"
                ?disabled="${md.disabled}"
                slot="${component.slot ?? nothing}"
                @click="${(e: any) => handleButtonClick(e, md)}">
            <span class="pf-v6-c-button__text">${label}</span>
        </button>`
}

// ── Text ──────────────────────────────────────────────────────────────────────
const titleMod = (c: string | undefined): string | null => {
    switch (c) {
        case 'h1': return 'pf-m-2xl'
        case 'h2': return 'pf-m-xl'
        case 'h3': return 'pf-m-lg'
        case 'h4': case 'h5': case 'h6': return 'pf-m-md'
        default: return null
    }
}
export const renderText = (component: ClientSideComponent, state?: any, data?: any): TemplateResult => {
    const md = component.metadata as any
    const text = interpolate(md.text, state, data)
    const mod = titleMod(md.container)
    if (mod) return html`<h2 class="pf-v6-c-title ${mod}" style="${component.style ?? ''}">${text}</h2>`
    return html`<div class="pf-v6-c-content" style="${component.style ?? ''}"><p>${text}</p></div>`
}

// ── FormLayout (flatten FormRow/FormItem → grid) ────────────────────────────────
const flattenFormItems = (comp: any): any[] => {
    const t = comp?.metadata?.type
    if (t === 'FormRow' || t === 'FormItem') return (comp.children ?? []).flatMap(flattenFormItems)
    return [comp]
}
export const renderFormLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const leaves = (component.children ?? []).flatMap(flattenFormItems)
    // maxColumns is a CAP (Vaadin auto-responsive semantics), not a fixed count — a compact form
    // may declare e.g. 24; laying 7 fields on 24 fixed tracks gives ~25px columns and the labels
    // paint over each other. Clamp to the actual number of fields.
    const cols = Math.max(1, Math.min(md.maxColumns ?? 1, leaves.length))
    // Fields honor their colspan (clamped to the grid width); grid-stereotype fields without a
    // real colspan take the FULL row (a data table squeezed into one ~230px cell truncates all
    // its columns) — same rule as the sapui5/redwood/slds form layouts.
    const cellStyle = (c: any): string => {
        const fieldMd = c?.metadata
        if (fieldMd?.type !== 'FormField') return 'min-width:0;'
        const colspan = fieldMd?.colspan ?? 1
        if (fieldMd?.stereotype === 'grid' && colspan <= 1) return 'min-width:0; grid-column: 1 / -1;'
        if (colspan > 1) return `min-width:0; grid-column: span ${Math.min(colspan, cols)};`
        return 'min-width:0;'
    }
    return html`
        <div class="pf-v6-c-form" style="display:grid; width:100%; flex:1 1 auto; grid-template-columns: repeat(${cols}, minmax(0,1fr)); gap: var(--pf-t--global--spacer--md, 1rem) var(--pf-t--global--spacer--xl, 1.5rem); align-items:start;">
            ${leaves.map((c: any) => html`<div style="${cellStyle(c)}">${renderComponent(container, c, baseUrl, state, data, appState, appData)}</div>`)}
        </div>`
}

// ── Form ────────────────────────────────────────────────────────────────────
export const renderForm = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const children = component.children ?? []
    const content = children.filter((c: any) => c.slot !== 'buttons' && c.slot !== 'toolbar')
    const toolbar = children.filter((c: any) => c.slot === 'toolbar')
    const buttons = children.filter((c: any) => c.slot === 'buttons')
    const title = interpolate(md.title, state, data)
    const subtitle = interpolate(md.subtitle, state, data)
    const render = (c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData)
    return html`
        <div>
            ${md.noHeader ? nothing : html`
                <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-bottom: var(--pf-t--global--spacer--md, 1rem);">
                    <div>
                        ${title ? html`<h1 class="pf-v6-c-title pf-m-xl">${title}</h1>` : nothing}
                        ${subtitle ? html`<div class="pf-v6-c-content"><small>${subtitle}</small></div>` : nothing}
                    </div>
                    ${toolbar.length ? html`<div class="pf-v6-c-action-list">${toolbar.map(render)}</div>` : nothing}
                </div>`}
            ${content.map(render)}
            ${buttons.length ? html`
                <div class="pf-v6-c-action-list" style="margin-top: var(--pf-t--global--spacer--md, 1rem);">
                    ${buttons.map(render)}
                </div>` : nothing}
        </div>`
}

// ── FormSection / FormSubSection → card ─────────────────────────────────────────
export const renderFormSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const title = interpolate((component.metadata as any).title, state, data)
    return html`
        <div class="pf-v6-c-card pf-m-bordered" style="margin-bottom: var(--pf-t--global--spacer--md, 1rem);" slot="${component.slot ?? nothing}">
            ${title ? html`<div class="pf-v6-c-card__title"><h2 class="pf-v6-c-card__title-text">${title}</h2></div>` : nothing}
            <div class="pf-v6-c-card__body">${kids(container, component, baseUrl, state, data, appState, appData)}</div>
        </div>`
}
export const renderFormSubSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const title = interpolate((component.metadata as any).title, state, data)
    return html`
        <div style="margin:.5rem 0;" slot="${component.slot ?? nothing}">
            ${title ? html`<h3 class="pf-v6-c-title pf-m-md" style="margin-bottom:.5rem;">${title}</h3>` : nothing}
            ${kids(container, component, baseUrl, state, data, appState, appData)}
        </div>`
}
export const renderCard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const titleText = typeof md.title === 'string' ? md.title : ''
    return html`
        <div class="pf-v6-c-card" slot="${component.slot ?? nothing}">
            ${titleText ? html`<div class="pf-v6-c-card__title"><h2 class="pf-v6-c-card__title-text">${titleText}</h2></div>` : nothing}
            <div class="pf-v6-c-card__body">
                ${typeof md.title === 'object' ? render(md.title) : nothing}
                ${render(md.content)}
                ${kids(container, component, baseUrl, state, data, appState, appData)}
            </div>
            ${md.footer ? html`<div class="pf-v6-c-card__footer">${render(md.footer)}</div>` : nothing}
        </div>`
}

// ── Layouts (flex) ──────────────────────────────────────────────────────────────
export const renderHorizontalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const gap = md?.spacing === false ? '0' : 'var(--pf-t--global--spacer--md, 1rem)'
    return html`<div style="display:flex; flex-direction:row; gap:${gap}; ${md?.wrap ? 'flex-wrap:wrap;' : ''} ${md?.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}" slot="${component.slot ?? nothing}">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`
}
export const renderVerticalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const gap = md?.spacing === false ? '0' : 'var(--pf-t--global--spacer--sm, .75rem)'
    return html`<div style="display:flex; flex-direction:column; gap:${gap}; ${md?.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}" slot="${component.slot ?? nothing}">${kids(container, component, baseUrl, state, data, appState, appData)}</div>`
}
export const renderSplitLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const dir = (component.metadata as any)?.orientation === 'vertical' ? 'column' : 'row'
    return html`<div style="display:flex; flex-direction:${dir}; gap:1rem; width:100%; ${component.style ?? ''}" slot="${component.slot ?? nothing}">
        ${(component.children ?? []).map((c: any) => html`<div style="flex:1; min-width:0;">${renderComponent(container, c, baseUrl, state, data, appState, appData)}</div>`)}
    </div>`
}

// ── Badge / Anchor ──────────────────────────────────────────────────────────────
export const renderBadge = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    const c = md.color as string
    const mod = c === 'success' ? 'pf-m-green' : c === 'error' || c === 'danger' ? 'pf-m-red'
        : c === 'warning' ? 'pf-m-gold' : c === 'info' ? 'pf-m-blue' : ''
    return html`<span class="pf-v6-c-label ${mod}" slot="${component.slot ?? nothing}"><span class="pf-v6-c-label__content">${md.text ?? ''}</span></span>`
}
export const renderAnchor = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    return html`<a class="pf-v6-c-button pf-m-link pf-m-inline" href="${md.url ?? '#'}" slot="${component.slot ?? nothing}"><span class="pf-v6-c-button__text">${md.text ?? md.url ?? ''}</span></a>`
}

// ── Dialog / ConfirmDialog → modal-box ──────────────────────────────────────────
const dispatchAction = (el: EventTarget | null, actionId: string | undefined) => {
    if (!actionId) return
    el?.dispatchEvent(new CustomEvent('action-requested', { detail: { actionId, parameters: {} }, bubbles: true, composed: true }))
}
const modalShell = (title: string, body: unknown, footer: unknown): TemplateResult => html`
    <div class="pf-v6-c-backdrop" style="position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1000;">
        <div class="pf-v6-c-modal-box" role="dialog" aria-modal="true" style="max-width:90vw; max-height:90vh;">
            ${title ? html`<header class="pf-v6-c-modal-box__header"><h1 class="pf-v6-c-modal-box__title">${title}</h1></header>` : nothing}
            <div class="pf-v6-c-modal-box__body">${body}</div>
            ${footer ? html`<footer class="pf-v6-c-modal-box__footer">${footer}</footer>` : nothing}
        </div>
    </div>`
export const renderDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    return modalShell(interpolate(md.headerTitle, state, data), html`${render(md.content)}${kids(container, component, baseUrl, state, data, appState, appData)}`, render(md.footer))
}
export const renderConfirmDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const body = md.content ? renderComponent(container, md.content, baseUrl, state, data, appState, appData) : nothing
    const btn = (label: string, actionId: string, variant: string) => html`<button class="pf-v6-c-button ${variant}" type="button" @click="${(e: Event) => dispatchAction(e.target, actionId)}"><span class="pf-v6-c-button__text">${label}</span></button>`
    return modalShell(interpolate(md.header, state, data), body, html`
        <button class="pf-v6-c-button pf-m-primary" type="button" @click="${(e: Event) => dispatchAction(e.target, md.confirmActionId)}"><span class="pf-v6-c-button__text">${md.confirmText ?? 'OK'}</span></button>
        ${md.canReject ? btn(md.rejectText ?? 'No', md.rejectActionId, 'pf-m-secondary') : nothing}
        ${md.canCancel ? btn(md.cancelText ?? 'Cancel', md.cancelActionId, 'pf-m-link') : nothing}`)
}

// ── CRUD listing ────────────────────────────────────────────────────────────────
// The crud grid layouts (table/list/cards/masterDetail/tree) live in patternflyCrud.ts —
// mateu-table-crud delegates ALL of them there because the renderer declares rendersCrudLayouts().
export const renderFilterBar = (container: any, _component: ClientSideComponent | undefined): TemplateResult => {
    const setState = (id: string, value: any) => { container.state = { ...container.state, [id]: value } }
    const doSearch = () => container.search?.(new CustomEvent('search-requested'))
    return html`
        <div class="pf-v6-c-toolbar" style="margin-bottom:.5rem;">
            <div class="pf-v6-c-toolbar__content" style="display:flex; gap:.5rem; align-items:center;">
                <span class="pf-v6-c-form-control" style="flex:1; max-width:24rem;">
                    <input type="search" placeholder="Search…" .value="${container.state?.searchText ?? ''}"
                           @input="${(e: Event) => setState('searchText', (e.target as HTMLInputElement).value)}"
                           @keydown="${(e: KeyboardEvent) => { if (e.key === 'Enter') doSearch() }}" />
                </span>
                <button class="pf-v6-c-button pf-m-primary" type="button" @click="${doSearch}"><span class="pf-v6-c-button__text">Search</span></button>
            </div>
        </div>`
}
export const renderPagination = (container: any, component: ClientSideComponent | undefined): TemplateResult => {
    const page = container?.data?.[component?.id ?? '']?.page ?? {}
    const total = page.totalElements ?? 0
    const pageSize = page.pageSize ?? 10
    const pageNumber = page.pageNumber ?? 0
    const totalPages = Math.max(1, Math.ceil(total / (pageSize || 1)))
    const go = (n: number) => container.pageChanged?.({ detail: { page: n } })
    if (total === 0) return html``
    return html`
        <div class="pf-v6-c-pagination pf-m-bottom" style="display:flex; justify-content:flex-end; align-items:center; gap:.5rem; padding:.5rem 0;">
            <!-- plain span: PF's __total-items class is display:none below its md breakpoint -->
            <span style="color: var(--pf-t--global--text--color--subtle, #4d4d4d); font-size: .875rem;">${total} item${total === 1 ? '' : 's'} · page ${pageNumber + 1} of ${totalPages}</span>
            <button class="pf-v6-c-button pf-m-plain" type="button" ?disabled="${pageNumber <= 0}" @click="${() => go(pageNumber - 1)}">‹</button>
            <button class="pf-v6-c-button pf-m-plain" type="button" ?disabled="${pageNumber >= totalPages - 1}" @click="${() => go(pageNumber + 1)}">›</button>
        </div>`
}
