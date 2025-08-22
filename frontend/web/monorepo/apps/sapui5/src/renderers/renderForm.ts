import { html, LitElement, nothing, TemplateResult } from "lit";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentType } from "@mateu/shared/apiClients/dtos/ComponentType.ts";

export const renderForm = (container: LitElement, component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any): TemplateResult => {
    const metadata = component.metadata as Form

    return html`
        
        <mateu-sapui5-form 
                id="${component.id}" 
            baseUrl="${baseUrl}"
                .component="${component}"
                .values="${state}"
                style="${component.style}" 
                class="${component.cssClasses}"
                slot="${component.slot??nothing}"
                >
                    ${component.children?.map(child => renderComponent(container, child, baseUrl, state, data))}
                ${metadata?.buttons?.map(button => html`
                   ${renderComponent(container, {
        metadata: button,
        type: ComponentType.ClientSide,
        slot: 'buttons'
    } as unknown as ClientSideComponent, undefined, undefined, undefined)}
`)}

                </mateu-sapui5-form>
        
    
    `

}