import {customElement, property, query} from "lit/decorators.js";
import {css, html, LitElement, PropertyValues} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/rich-text-editor'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import {RichTextEditor, RichTextEditorHtmlValueChangedEvent} from "@vaadin/rich-text-editor";
import {CustomField} from "@vaadin/custom-field";


@customElement('field-rich-text-vaadin')
export class RichTextVaadin extends LitElement implements Component {

    @query('vaadin-custom-field')
    customField : CustomField | undefined

    isInvalid(): boolean | undefined {
        this.customField?.validate()
        return this.customField?.invalid
    }

    @property()
    required: boolean = false;

    setRequired(required: boolean): void {
        this.required = required;
    }

    setField(field: Field): void {
        this.field = field;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder
    }

    setPattern(pattern: string): void {
        this.pattern = pattern
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    // @ts-ignore
    onValueChanged(event: ValueChangedEvent): void {
    }

    setValue(value: unknown): void {
        this.value = value as string;
        this.json = JSON.stringify([
            {"insert": this.value}
        ])
        const thevalue = this.value
        setTimeout(() => {
            const editor = this.renderRoot?.querySelector( 'vaadin-rich-text-editor' ) as RichTextEditor
            // @ts-ignore
            if (editor && editor._editor) {
                editor.dangerouslySetHtmlValue(thevalue);
            }
        })
    }

    setBaseUrl(value: string): void {
        this.baseUrl = value
    }

    @property()
    baseUrl = '';


    @property()
    label = '';

    @property()
    placeholder = '';

    @property()
    pattern = '';

    @property()
    name = '';

    @property()
    json = '[]';

    @property()
    onChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: input.value})
    }

    @property()
    value: string | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    render() {

        return html`
            <vaadin-custom-field
                    label="${this.label}"
                    ?disabled=${!this.enabled}
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
                    
            >
                <vaadin-rich-text-editor
                                         @html-value-changed="${(event: RichTextEditorHtmlValueChangedEvent) => {
                                             this.onValueChanged({
                                                 fieldId: this.field?.id!,
                                                 value: event.detail.value
                                             })
                                         }}"
                ></vaadin-rich-text-editor>
            </vaadin-custom-field>
            `
    }

    static styles = css`
        vaadin-text-field {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-rich-text-vaadin': RichTextVaadin
    }
}

