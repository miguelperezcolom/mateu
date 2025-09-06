import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, TemplateResult } from "lit";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { changed } from "@/SapUi5ComponentRenderer.ts";

export const renderField = (component: ClientSideComponent, _baseUrl: string | undefined, state: any, _data: any): TemplateResult => {

    const metadata = component.metadata as FormField
    const fieldId = metadata?.fieldId??''
    const value = state && fieldId in state?state[ fieldId]:metadata?.initialValue
    if (metadata.stereotype == 'html') {
        return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <div id="${component.id}" style="margin-bottom: 1rem;">${value}</div></div>`
    }
    if (metadata.stereotype == 'textarea') {
        return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-textarea
                id="${component.id}"
                @change="${changed}"
                value="${value}"
        >
        </ui5-textarea></div>`
    }
    if (metadata.dataType == 'string') {
        return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-input
                    id="${component.id}"
                    @change="${changed}"
                    value="${value}"
            >
            </ui5-input></div>`
    }
    if (metadata.dataType == 'integer') {
        return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-input
                    id="${component.id}"
                    value="${value}"
                    @change="${changed}"
            >
                </ui5-input></div>`
    }
    if (metadata.dataType == 'reference') {
        if (metadata.stereotype == 'combobox') {
            return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
            <ui5-combobox
                    id="${component.id}"
                    value="${value}"
                    @change="${changed}"
            >
                <ui5-cb-item text="Austria"></ui5-cb-item>
                <ui5-cb-item text="Bulgaria"></ui5-cb-item>
                <ui5-cb-item text="Germany"></ui5-cb-item>
                <ui5-cb-item text="Italy"></ui5-cb-item>
                <ui5-cb-item text="Spain"></ui5-cb-item>
            </ui5-combobox>
            </div>
`
        }
    }

    return html`${metadata.dataType}-${metadata.stereotype}`

}