import { html, LitElement, nothing, TemplateResult } from "lit"
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts"
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts"
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts"
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts"

export const renderForm = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult => {
    const metadata = component.metadata as Form

    return html`
        <div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem; ${component.style ?? ''}"
             class="${component.cssClasses ?? nothing}"
             slot="${component.slot ?? nothing}">

            ${metadata?.title && !metadata.noHeader ? html`
                <ui5-title>${metadata.title}</ui5-title>
                ${metadata?.subtitle ? html`<p style="color: var(--sapContent_LabelColor); margin: 0;">${metadata.subtitle}</p>` : nothing}
            ` : nothing}

            ${metadata?.toolbar?.length > 0 ? html`
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    ${metadata.toolbar.map(button => renderComponent(container, {
                        metadata: button,
                        type: ComponentType.ClientSide
                    } as unknown as ClientSideComponent, baseUrl, state, data, appState, appData))}
                </div>
            ` : nothing}

            ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data, appState, appData))}

            ${metadata?.buttons?.length > 0 ? html`
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; padding-top: 0.5rem; border-top: 1px solid var(--sapGroup_ContentBorderColor);">
                    ${metadata.buttons.map(button => renderComponent(container, {
                        metadata: button,
                        type: ComponentType.ClientSide
                    } as unknown as ClientSideComponent, baseUrl, state, data, appState, appData))}
                </div>
            ` : nothing}
        </div>`
}
