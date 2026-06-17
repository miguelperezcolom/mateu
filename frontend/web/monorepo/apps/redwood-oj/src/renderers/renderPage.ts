import { html, LitElement, nothing, TemplateResult } from "lit"
import { unsafeHTML } from "lit/directives/unsafe-html.js"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent"
import Button from "@mateu/shared/apiClients/dtos/componentmetadata/Button"
import { renderComponent } from "@infra/ui/renderers/renderComponent"
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType"
import { possiblyHtml } from "@infra/ui/mateu-form.ts"
import { Breadcrumb } from "@mateu/shared/apiClients/dtos/componentmetadata/Breadcrumbs"

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
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; padding: 0.5rem 0;">
                    ${metadata.buttons?.map((button: Button) => renderComponent(container, {
                        metadata: button,
                        type: ComponentType.ClientSide,
                        slot: ''
                    } as unknown as ClientSideComponent, undefined, {}, {}, appState, appData))}
                </div>
            </div>
            ${metadata.footer?.length ? html`
                <div>
                    ${metadata.footer.map(comp => renderComponent(container, comp as ClientSideComponent, baseUrl, state, data, appState, appData))}
                </div>
            ` : nothing}
        </div>
    `
}
