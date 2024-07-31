import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/text-area'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import '@web-comp/core';
import '@web-comp/json-viewer';


@customElement('field-json')
export class FieldJson extends LitElement implements Component {

    isInvalid(): boolean | undefined {
        return undefined
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

    setPattern(): void {
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    // @ts-ignore
    onValueChanged(event: ValueChangedEvent): void {
    }

    setValue(value: unknown): void {
        this.value = value as string;
        this.config = {
            data: JSON.parse(this.value)
        }
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
    name = '';

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

    @state()
    config: unknown;


    render() {
        return html`
            <vaadin-custom-field
                    data-testid="${this.name}"
                    label="${this.label}"
                    ?required=${this.required}
                    helper-text="${this.field?.description}"
            >
                <wc-json-viewer id="myjson" .config="${this.config}"></wc-json-viewer>
            </vaadin-custom-field>
            <!--
            <vaadin-text-area
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                data-testid="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
            ></vaadin-text-area>
            -->
            `
    }


    static styles = css`
        .content {
            width: 100%;
        }
        vaadin-text-area {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-json': FieldJson
    }
}

