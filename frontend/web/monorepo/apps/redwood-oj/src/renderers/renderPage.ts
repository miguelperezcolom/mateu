import { html, LitElement, nothing, TemplateResult } from "lit"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent"
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button"
import { renderComponent } from "@infra/ui/renderers/renderComponent"
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType"
import { possiblyHtml } from "@infra/ui/mateu-form.ts"
import { Breadcrumb } from "@mateu/shared/apiClients/dtos/componentmetadata/Breadcrumbs"

// Hand-styled page button (RDS metrics, themed through the --oj-* vars) — a real oj-c-button
// renders unstyled inside the shadow roots this page can nest in (e.g. mateu-drawer), so its
// `chroming` never lands; a plain <button> honours the RDS primary/danger/outlined skins there.
// (Same idiom as RedwoodOjComponentRenderer.renderToolbarButton.)
const renderPageButton = (button: Button): TemplateResult => {
    const kind =
        (button as any).color === 'error' || (button as any).variant === 'danger' ? 'danger'
        : (button as any).buttonStyle === 'primary' ? 'callToAction'
        : 'outlined'
    const skin = kind === 'danger'
        ? 'background: var(--mateu-redwood-danger-bg, rgb(179, 49, 31)); color: #fff; border: 1px solid transparent;'
        : kind === 'callToAction'
        ? 'background: var(--mateu-redwood-cta-bg, rgb(49, 45, 42)); color: #fff; border: 1px solid transparent;'
        : 'background: transparent; color: var(--mateu-redwood-text, rgb(22, 21, 19)); border: 1px solid rgba(22, 21, 19, 0.5);'
    const onClick = (e: Event) =>
        (e.currentTarget as HTMLElement).dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: button.actionId },
            bubbles: true,
            composed: true,
        }))
    return html`
        <button
            data-action-id="${button.actionId}"
            style="${skin} border-radius: var(--oj-button-border-radius, .25rem); height: var(--oj-button-height, 2.75rem); padding: 0 1rem; font-family: 'Oracle Sans', -apple-system, system-ui, sans-serif; font-size: var(--oj-button-font-size, 0.859rem); font-weight: 600; cursor: pointer; ${button.disabled ? 'opacity: .4; pointer-events: none;' : ''}"
            ?disabled="${button.disabled}"
            @click="${onClick}"
        >${button.label}</button>`
}

export const renderPage = (
    container: LitElement,
    component: ClientSideComponent,
    baseUrl: string | undefined,
    state: any,
    data: any,
    appState: any,
    appData: any
): TemplateResult => {
    const metadata = component.metadata as PageComponent

    const hasHeader = metadata.title || metadata.subtitle || metadata.toolbar?.length || metadata.header?.length || metadata.avatar

    return html`
        <div style="display: flex; flex-direction: column; width: 100%; ${component.style ?? ''}" slot="${component.slot ?? nothing}" class="${component.cssClasses}">
            ${metadata.breadcrumbs?.length > 0 ? html`
                <div style="display: flex; align-items: center; gap: 0.25rem; padding: 0.5rem 0; flex-wrap: wrap;">
                    ${metadata.breadcrumbs.map((b: Breadcrumb, i: number) => html`
                        ${i > 0 ? html`<span>/</span>` : nothing}
                        ${b.link ? html`
                            <oj-c-button
                                data-oj-binding-provider="preact"
                                label="${b.text}"
                                chroming="borderless"
                                @ojAction="${() => { window.location.href = b.link! }}"
                            ></oj-c-button>
                        ` : html`<span>${b.text}</span>`}
                    `)}
                </div>
            ` : nothing}
            ${hasHeader ? html`
                <div style="display: flex; align-items: center; width: 100%; gap: 1rem; padding: 0.5rem 0;">
                    <div style="flex: 1;">
                        <h2 style="margin-block-end: 0px;">${unsafeHTML(possiblyHtml(metadata.title, state, data))}</h2>
                        <span style="display: inline-block;">${unsafeHTML(possiblyHtml(metadata.subtitle, state, data))}</span>
                    </div>
                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        ${metadata.header?.map(comp => renderComponent(container, comp as ClientSideComponent, baseUrl, state, data, appState, appData))}
                        ${metadata.toolbar?.map((button: Button) => renderComponent(container, {
                            metadata: button,
                            type: ComponentType.ClientSide,
                            slot: ''
                        } as unknown as ClientSideComponent, undefined, {}, {}, appState, appData))}
                    </div>
                </div>
            ` : nothing}
            <div style="width: 100%;">
                ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}
                ${metadata.buttons?.length ? html`
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: flex-end; padding: 0.75rem 0 0.25rem;">
                    ${metadata.buttons.map((button: Button) => renderPageButton(button))}
                </div>` : nothing}
            </div>
            ${metadata.footer?.length ? html`
                <div>
                    ${metadata.footer.map(comp => renderComponent(container, comp as ClientSideComponent, baseUrl, state, data, appState, appData))}
                </div>
            ` : nothing}
        </div>
    `
}
