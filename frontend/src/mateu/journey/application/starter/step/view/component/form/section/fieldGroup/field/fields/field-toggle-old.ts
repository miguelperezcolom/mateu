import {customElement, property} from "lit/decorators.js";
import {html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@polymer/paper-toggle-button'
import '@vaadin/input-container'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";


@customElement('field-toggle-old')
export class FieldToggleOld extends LitElement implements Component {

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

    onValueChanged(event: ValueChangedEvent): void {
        console.log(event)
    }
    setValue(value: unknown): void {
        this.value = value as number;
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
            value: input.checked})
    }

    @property()
    value: number | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    render() {
        return html`
            <div class="vaadin-field-container">
                <div part="label">
                    <slot name="label">${this.label}</slot>
                    <span part="required-indicator" aria-hidden="true" on-click="focus"></span>
                </div>

                <vaadin-input-container
                        part="input-field"
                        disabled="${!this.enabled}"
                        invalid="false"
                        theme$="[[_theme]]"
                >
                    <slot name="prefix" slot="prefix"></slot>
                    <slot name="input"><paper-toggle-button id="mitoggle" checked @change=${this.onChange}></paper-toggle-button></slot>
                    <slot name="suffix" slot="suffix"></slot>
                </vaadin-input-container>
                
                <div part="helper-text">
                    <slot name="helper">Texto de ayuda</slot>
                </div>

                <div part="error-message">
                    <slot name="error-message">Mensaje de error</slot>
                </div>
            </div>
            <slot name="tooltip"></slot>
            `
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'field-toggle-old': FieldToggleOld
    }
}

