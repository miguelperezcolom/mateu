import { html, nothing, type TemplateResult } from 'lit'
import { LitElement } from 'lit'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent.ts'
import Button from '@mateu/shared/apiClients/dtos/componentmetadata/Button.ts'
import Text from '@mateu/shared/apiClients/dtos/componentmetadata/Text.ts'
import FormLayout from '@mateu/shared/apiClients/dtos/componentmetadata/FormLayout.ts'
import Form from '@mateu/shared/apiClients/dtos/componentmetadata/Form.ts'
import FormSection from '@mateu/shared/apiClients/dtos/componentmetadata/FormSection.ts'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import { handleButtonClick } from '@infra/ui/renderers/buttonRenderer.ts'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types.ts'

const interpolate = (raw: string | undefined, state: any, data: any): string => {
    if (!raw) return ''
    return raw.includes('${')
        ? new Function('state', 'data', 'return `' + raw + '`')(state ?? {}, data ?? {})
        : raw
}

// ── Button ────────────────────────────────────────────────────────────────────

const buttonVariant = (metadata: Button): string => {
    const color = metadata.color as unknown as string
    if (color === 'primary') return 'slds-button_brand'
    if (color === 'success') return 'slds-button_success'
    if (color === 'error' || color === 'danger') return 'slds-button_destructive'
    return 'slds-button_neutral'
}

export const renderSldsButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData): TemplateResult => {
    const metadata = component.metadata as Button
    const label = interpolate(metadata.label, state, data)
    return html`
        <button id="${component.id}"
                class="slds-button ${buttonVariant(metadata)}"
                data-action-id="${metadata.actionId}"
                ?disabled="${metadata.disabled}"
                slot="${component.slot ?? nothing}"
                @click="${(e: any) => handleButtonClick(e, metadata)}">
            ${metadata.iconOnLeft ? html`<span class="slds-icon_container slds-m-right_x-small"></span>` : nothing}
            ${label}
        </button>`
}

// ── Text ────────────────────────────────────────────────────────────────────

const textClass = (container: string | undefined): string => {
    switch (container) {
        case 'h1': return 'slds-text-heading_large'
        case 'h2': return 'slds-text-heading_medium'
        case 'h3': return 'slds-text-heading_small'
        case 'h4':
        case 'h5':
        case 'h6': return 'slds-text-title_caps'
        default: return 'slds-text-body_regular'
    }
}

export const renderSldsText = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData): TemplateResult => {
    const metadata = component.metadata as Text
    const cls = textClass(metadata.container as unknown as string)
    const text = interpolate(metadata.text, state, data)
    const tag = (metadata.container as unknown as string) || 'div'
    // possiblyHtml content is allowed in Mateu text; keep it simple and render as text.
    return html`<div class="${cls}" data-tag="${tag}" style="${component.style}">${text}</div>`
}

// ── FormLayout ────────────────────────────────────────────────────────────────

// FormLayout nests FormRow > FormItem > field; those wrappers are an artifact of the Vaadin
// form-layout and carry no SLDS meaning, so flatten them to the real leaf components.
const flattenFormItems = (comp: any): any[] => {
    const t = comp?.metadata?.type
    if (t === 'FormRow' || t === 'FormItem') {
        return (comp.children ?? []).flatMap(flattenFormItems)
    }
    return [comp]
}

export const renderSldsFormLayout = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
): TemplateResult => {
    const metadata = component.metadata as FormLayout
    const columns = Math.max(1, metadata.maxColumns ?? 1)
    const leaves = (component.children ?? []).flatMap(flattenFormItems)
    return html`
        <div class="slds-form" role="list"
             style="display:grid; grid-template-columns: repeat(${columns}, minmax(0, 1fr)); gap: .75rem 1.5rem; align-items:start;">
            ${leaves.map(child =>
                html`<div>${renderComponent(container, child, baseUrl, state, data, appState, appData)}</div>`)}
        </div>`
}

// ── Form ────────────────────────────────────────────────────────────────────

export const renderSldsForm = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
): TemplateResult => {
    const metadata = component.metadata as Form
    const children = component.children ?? []
    const bySlot = (slot: string) => children.filter((c: any) => c.slot === slot)
    const content = children.filter((c: any) => c.slot !== 'buttons' && c.slot !== 'toolbar')
    const toolbar = bySlot('toolbar')
    const buttons = bySlot('buttons')
    const title = interpolate(metadata.title, state, data)
    const subtitle = interpolate(metadata.subtitle, state, data)
    const render = (c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData)

    return html`
        <div class="slds-form-wrapper">
            ${metadata.noHeader ? nothing : html`
                <header class="slds-grid slds-grid_align-spread slds-m-bottom_small" style="align-items:flex-end;">
                    <div>
                        ${title ? html`<h1 class="slds-text-heading_medium">${title}</h1>` : nothing}
                        ${subtitle ? html`<p class="slds-text-body_small slds-text-color_weak">${subtitle}</p>` : nothing}
                    </div>
                    ${toolbar.length ? html`<div class="slds-button-group" role="group">${toolbar.map(render)}</div>` : nothing}
                </header>`}
            ${content.map(render)}
            ${buttons.length ? html`
                <div class="slds-grid slds-grid_align-end slds-m-top_medium" style="gap:.5rem;">
                    ${buttons.map(render)}
                </div>` : nothing}
        </div>`
}

// ── FormSection ───────────────────────────────────────────────────────────────

export const renderSldsFormSection = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
): TemplateResult => {
    const metadata = component.metadata as FormSection
    const title = interpolate(metadata.title, state, data)
    return html`
        <article class="slds-card slds-m-bottom_medium" slot="${component.slot ?? nothing}">
            ${title ? html`
                <div class="slds-card__header slds-grid">
                    <h2 class="slds-card__header-title slds-text-heading_small">${title}</h2>
                </div>` : nothing}
            <div class="slds-card__body slds-card__body_inner slds-p-horizontal_medium slds-p-bottom_medium">
                ${(component.children ?? []).map((c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData))}
            </div>
        </article>`
}

// ── Table (CRUD grid, read path) ────────────────────────────────────────────

const fmtCell = (v: any): string => {
    if (v === null || v === undefined) return ''
    if (typeof v === 'object') return v.text ?? v.label ?? v.name ?? JSON.stringify(v)
    return String(v)
}

export const renderSldsTable = (container: any, component: ClientSideComponent): TemplateResult => {
    const metadata = component.metadata as any
    const cols: any[] = (metadata.columns ?? []).map((c: any) => c.metadata)
    const rows: any[] = container?.data?.[container.id]?.page?.content ?? []
    const align = (a: string | undefined) => (a === 'end' || a === 'right' ? 'slds-text-align_right' : a === 'center' ? 'slds-text-align_center' : '')
    return html`
        <table class="slds-table slds-table_bordered slds-table_cell-buffer slds-table_striped slds-table_fixed-layout">
            <thead>
                <tr class="slds-line-height_reset">
                    ${cols.map(col => html`
                        <th scope="col" class="${align(col.align)}">
                            <div class="slds-truncate" title="${col.label ?? ''}">${col.label ?? ''}</div>
                        </th>`)}
                </tr>
            </thead>
            <tbody>
                ${rows.length === 0 ? html`
                    <tr><td colspan="${cols.length}">
                        <div class="slds-text-align_center slds-text-color_weak slds-p-vertical_small">
                            ${metadata.emptyStateMessage ?? 'No items.'}
                        </div>
                    </td></tr>` : nothing}
                ${rows.map(row => html`
                    <tr class="slds-hint-parent">
                        ${cols.map(col => html`
                            <td class="${align(col.align)}">
                                <div class="slds-truncate" title="${fmtCell(row[col.id])}">${fmtCell(row[col.id])}</div>
                            </td>`)}
                    </tr>`)}
            </tbody>
        </table>`
}

// ── Layouts (flex) ─────────────────────────────────────────────────────────────

const renderChildren = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData) =>
    (component.children ?? []).map((c: any) => renderComponent(container, c, baseUrl, state, data, appState, appData))

export const renderSldsHorizontalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const gap = md.spacing === false ? '0' : '1rem'
    return html`<div style="display:flex; flex-direction:row; gap:${gap}; ${md.wrap ? 'flex-wrap:wrap;' : ''} ${md.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">
        ${renderChildren(container, component, baseUrl, state, data, appState, appData)}
    </div>`
}

export const renderSldsVerticalLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const gap = md.spacing === false ? '0' : '.75rem'
    return html`<div style="display:flex; flex-direction:column; gap:${gap}; ${md.fullWidth ? 'width:100%;' : ''} ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">
        ${renderChildren(container, component, baseUrl, state, data, appState, appData)}
    </div>`
}

export const renderSldsSplitLayout = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const dir = md.orientation === 'vertical' ? 'column' : 'row'
    const children = component.children ?? []
    return html`<div style="display:flex; flex-direction:${dir}; gap:1rem; width:100%; ${component.style ?? ''}"
                     slot="${component.slot ?? nothing}">
        ${children.map((c: any) => html`<div style="flex:1; min-width:0;">${renderComponent(container, c, baseUrl, state, data, appState, appData)}</div>`)}
    </div>`
}

// ── Card ──────────────────────────────────────────────────────────────────────

export const renderSldsCard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const hasHeader = md.title || md.header || md.headerPrefix || md.headerSuffix
    return html`
        <article class="slds-card" slot="${component.slot ?? nothing}">
            ${hasHeader ? html`
                <div class="slds-card__header slds-grid">
                    <header class="slds-media slds-media_center slds-has-flexi-truncate">
                        <div class="slds-media__body">
                            <h2 class="slds-card__header-title slds-text-heading_small">${render(md.title)}</h2>
                            ${md.subtitle ? html`<div class="slds-text-body_small slds-text-color_weak">${render(md.subtitle)}</div>` : nothing}
                        </div>
                    </header>
                </div>` : nothing}
            <div class="slds-card__body slds-card__body_inner">
                ${render(md.content)}
                ${renderChildren(container, component, baseUrl, state, data, appState, appData)}
            </div>
            ${md.footer ? html`<footer class="slds-card__footer">${render(md.footer)}</footer>` : nothing}
        </article>`
}

// ── Badge ──────────────────────────────────────────────────────────────────────

export const renderSldsBadge = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    const color = md.color as string
    const variant = color === 'success' ? 'slds-badge_inverse slds-theme_success'
        : color === 'error' || color === 'danger' ? 'slds-theme_error'
        : color === 'warning' ? 'slds-theme_warning'
        : ''
    return html`<span class="slds-badge ${variant}" slot="${component.slot ?? nothing}">${md.text ?? ''}</span>`
}

// ── ProgressBar ─────────────────────────────────────────────────────────────────

export const renderSldsProgressBar = (component: ClientSideComponent, state?: ComponentState): TemplateResult => {
    const md = component.metadata as any
    const min = md.min ?? 0
    const max = md.max ?? 1
    const raw = md.valueKey && state ? state[md.valueKey] : md.value
    const pct = Math.max(0, Math.min(100, Math.round(((Number(raw ?? 0) - min) / (max - min || 1)) * 100)))
    return html`
        <div class="slds-progress-bar" aria-valuemin="${min}" aria-valuemax="${max}" aria-valuenow="${raw ?? 0}" role="progressbar" slot="${component.slot ?? nothing}">
            <span class="slds-progress-bar__value" style="width:${pct}%;"><span class="slds-assistive-text">${pct}%</span></span>
        </div>`
}

// ── Anchor ──────────────────────────────────────────────────────────────────────

export const renderSldsAnchor = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    return html`<a href="${md.url ?? '#'}" slot="${component.slot ?? nothing}">${md.text ?? md.url ?? ''}</a>`
}

// ── Dialog / ConfirmDialog (slds-modal) ─────────────────────────────────────────

const dispatchAction = (el: EventTarget | null, actionId: string | undefined) => {
    if (!actionId) return
    el?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters: {} },
        bubbles: true,
        composed: true,
    }))
}

const modalShell = (title: string, body: TemplateResult | unknown, footer: TemplateResult | unknown): TemplateResult => html`
    <section role="dialog" tabindex="-1" aria-modal="true" class="slds-modal slds-fade-in-open">
        <div class="slds-modal__container">
            <header class="slds-modal__header">
                <h2 class="slds-modal__title slds-hyphenate">${title}</h2>
            </header>
            <div class="slds-modal__content slds-p-around_medium">${body}</div>
            ${footer ? html`<footer class="slds-modal__footer">${footer}</footer>` : nothing}
        </div>
    </section>
    <div class="slds-backdrop slds-backdrop_open"></div>`

export const renderSldsDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const title = interpolate(md.headerTitle, state, data)
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const body = html`${render(md.content)}${renderChildren(container, component, baseUrl, state, data, appState, appData)}`
    return modalShell(title, body, render(md.footer))
}

export const renderSldsConfirmDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult => {
    const md = component.metadata as any
    const title = interpolate(md.header, state, data)
    const body = md.content ? renderComponent(container, md.content, baseUrl, state, data, appState, appData) : nothing
    const footer = html`
        ${md.canCancel ? html`<button class="slds-button slds-button_neutral"
                @click="${(e: Event) => dispatchAction(e.target, md.cancelActionId)}">${md.cancelText ?? 'Cancel'}</button>` : nothing}
        ${md.canReject ? html`<button class="slds-button slds-button_neutral"
                @click="${(e: Event) => dispatchAction(e.target, md.rejectActionId)}">${md.rejectText ?? 'No'}</button>` : nothing}
        <button class="slds-button slds-button_brand"
                @click="${(e: Event) => dispatchAction(e.target, md.confirmActionId)}">${md.confirmText ?? 'OK'}</button>`
    return modalShell(title, body, footer)
}
