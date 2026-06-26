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
