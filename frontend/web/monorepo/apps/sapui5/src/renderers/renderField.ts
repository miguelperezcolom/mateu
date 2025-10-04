import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, TemplateResult } from "lit";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { changed, checkboxChanged } from "@/SapUi5ComponentRenderer.ts";

const renderStars = (component: ClientSideComponent, metadata = component.metadata as FormField, value: any, fieldId: string) => {
    console.log('xxxxx value', value)
    let renderValue = value;
    if (isNaN(renderValue)) {
        renderValue = 0
    }
    console.log('yyyy value', value, renderValue)
    const values = [1, 2, 3, 4, 5]
    return html`${values.map(index => html`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${index <= renderValue?'--lumo-warning-color':'--lumo-shade-30pct'});"
                            @click="${(e: Event) => e.target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: index,
            fieldId
        },
        bubbles: true,
        composed: true
    }))}"
                    
                    ></vaadin-icon>
                `)}`
}

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
        // Type	"Text" | "Email" | "Number" | "Password" | "Tel" | "URL" | "Search"
        if (metadata.stereotype == 'stars') {
            return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
                ${renderStars(component, metadata, value, fieldId)}
                </ui5-slider></div>`
        }
        if (metadata.stereotype == 'slider') {
            return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-slider
                    id="${component.id}"
                    type="Number"
                    value="${value}"
                    @change="${changed}"
            >
                </ui5-slider></div>`
        }
        return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-input
                    id="${component.id}"
                    type="Number"
                    value="${value}"
                    @change="${changed}"
            >
                </ui5-input></div>`
    }
    if (metadata.dataType == 'bool') {
        if (metadata.stereotype == 'toggle') {
            return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-switch
                    id="${component.id}"
                    ?checked="${value}"
                    @change="${checkboxChanged}"
            >
                </ui5-switch></div>`
        }
        return html`<div><ui5-label for="${component.id}" show-colon>${metadata.label}</ui5-label>
        <ui5-checkbox
                    id="${component.id}"
                    ?checked="${value}"
                    @change="${checkboxChanged}"
            >
                </ui5-checkbox></div>`
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