import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { html, TemplateResult } from "lit";
import { changed } from "@/RedwoodComponentRenderer.ts";

export const renderField = (component: ClientSideComponent, _baseUrl: string | undefined, state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as FormField
    const fieldId = metadata?.fieldId??''
    const value = state && fieldId in state?state[ fieldId]:metadata?.initialValue
    if (metadata.dataType == 'string') {
        return html`<oj-c-input-text
                    id="${component.id}"
                    label-hint="${metadata.label}"
                    label-edge='top'
                    value="${value}"
                    @change="${(e: any) => changed(e, component.id!)}"
            >
                </oj-c-input-text>`
    }
    if (metadata.dataType == 'integer') {
        return html`<oj-c-input-number
                    id="${component.id}"
                    label-hint="${metadata.label}"
                    label-edge='top'
                    value="${value}"
                    @change="${(e:any) => changed(e, component.id!)}"
            >
                </oj-c-input-number>`
    }
    return html``
}