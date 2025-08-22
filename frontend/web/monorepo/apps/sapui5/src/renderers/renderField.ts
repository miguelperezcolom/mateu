import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, TemplateResult } from "lit";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { changed } from "@/SapUi5ComponentRenderer.ts";

export const renderField = (component: ClientSideComponent, baseUrl: string | undefined, state: any, data: any): TemplateResult => {

    console.log('render', component?.metadata?.type)
    const metadata = component.metadata as FormField
    const fieldId = metadata?.fieldId??''
    const value = state && fieldId in state?state[ fieldId]:metadata?.initialValue
    if (metadata.dataType == 'string') {
        return html`<ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-input
                    id="${component.id}"
                    @change="${changed}"
                    value="${value}"
            >
            </ui5-input>`
    }
    if (metadata.dataType == 'integer') {
        return html`<ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-input
                    id="${component.id}"
                    value="${value}"
                    @change="${changed}"
            >
                </ui5-input>`
    }

    return html``

}