import {customElement, property} from "lit/decorators.js";
import {html, css, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-text-field'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import Stepper from "../../../../../../../../../../shared/apiClients/dtos/Stepper";


@customElement('field-stepper')
export class FieldStepper extends LitElement implements Component {

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
        this.value = value as Stepper;
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
    value: Stepper | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;


    render() {
        return html`
            <div style="color: var(--lumo-secondary-text-color);" data-testid="${this.name}">
                <div>${this.value?.text}</div>
                <vaadin-progress-bar value="${this.value?.value}" part="progressbar"></vaadin-progress-bar>
            </div>
            `
    }

    static styles = css`
        vaadin-progress-bar {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-stepper': FieldStepper
    }
}

