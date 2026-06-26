import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"

const evalLabel = (raw: string | undefined, container: LitElement): string => {
    if (!raw) return ''
    return raw.includes('${') && (container as any)._evalTemplate ? (container as any)._evalTemplate(raw) : raw
}

// ── FormSection → ui5-panel (fixed, non-collapsible card-like section) ─────────────

export const renderFormSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const title = evalLabel(md.title, container)
    return html`
        <ui5-panel header-text="${title || nothing}" fixed
                   style="margin-bottom: 1rem; ${component.style ?? ''}"
                   class="${component.cssClasses ?? nothing}"
                   slot="${component.slot ?? nothing}">
            <div style="display:flex; flex-direction:column; gap:.5rem; padding:.25rem 0;">
                ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            </div>
        </ui5-panel>`
}

// ── FormSubSection → titled block ─────────────────────────────────────────────────

export const renderFormSubSection = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const title = evalLabel(md.title, container)
    return html`
        <div style="margin: .5rem 0; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${title ? html`<ui5-title level="H5" style="margin-bottom:.25rem;">${title}</ui5-title>` : nothing}
            <div style="display:flex; flex-direction:column; gap:.5rem;">
                ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            </div>
        </div>`
}

// ── Card → ui5-card + ui5-card-header ─────────────────────────────────────────────

export const renderCard = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    const titleText = typeof md.title === 'string' ? md.title : ''
    const hasHeaderComp = md.title && typeof md.title === 'object'
    return html`
        <ui5-card style="${component.style ?? ''}" class="${component.cssClasses ?? nothing}" slot="${component.slot ?? nothing}">
            ${titleText || md.subtitle ? html`
                <ui5-card-header slot="header"
                                 title-text="${titleText || nothing}"
                                 subtitle-text="${(typeof md.subtitle === 'string' ? md.subtitle : '') || nothing}">
                </ui5-card-header>` : nothing}
            <div style="padding: 1rem;">
                ${hasHeaderComp ? render(md.title) : nothing}
                ${render(md.content)}
                ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
                ${render(md.footer)}
            </div>
        </ui5-card>`
}

// ── Anchor → ui5-link ─────────────────────────────────────────────────────────────

export const renderAnchor = (component: ClientSideComponent): TemplateResult => {
    const md = component.metadata as any
    return html`<ui5-link href="${md.url ?? '#'}" slot="${component.slot ?? nothing}">${md.text ?? md.url ?? ''}</ui5-link>`
}

// ── Dialog / ConfirmDialog → ui5-dialog ────────────────────────────────────────────

const dispatchAction = (el: EventTarget | null, actionId: string | undefined) => {
    if (!actionId) return
    el?.dispatchEvent(new CustomEvent('action-requested', {
        detail: { actionId, parameters: {} }, bubbles: true, composed: true,
    }))
}

export const renderDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const title = evalLabel(md.headerTitle, container)
    const render = (c: any) => c ? renderComponent(container, c, baseUrl, state, data, appState, appData) : nothing
    return html`
        <ui5-dialog open header-text="${title || nothing}">
            ${render(md.content)}
            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
            ${md.footer ? html`<div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">${render(md.footer)}</div>` : nothing}
        </ui5-dialog>`
}

export const renderConfirmDialog = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const md = component.metadata as any
    const title = evalLabel(md.header, container)
    const body = md.content ? renderComponent(container, md.content, baseUrl, state, data, appState, appData) : nothing
    return html`
        <ui5-dialog open header-text="${title || nothing}">
            ${body}
            <div slot="footer" style="display:flex; gap:.5rem; padding:.5rem; justify-content:flex-end;">
                ${md.canCancel ? html`<ui5-button @click="${(e: Event) => dispatchAction(e.target, md.cancelActionId)}">${md.cancelText ?? 'Cancel'}</ui5-button>` : nothing}
                ${md.canReject ? html`<ui5-button @click="${(e: Event) => dispatchAction(e.target, md.rejectActionId)}">${md.rejectText ?? 'No'}</ui5-button>` : nothing}
                <ui5-button design="Emphasized" @click="${(e: Event) => dispatchAction(e.target, md.confirmActionId)}">${md.confirmText ?? 'OK'}</ui5-button>
            </div>
        </ui5-dialog>`
}
