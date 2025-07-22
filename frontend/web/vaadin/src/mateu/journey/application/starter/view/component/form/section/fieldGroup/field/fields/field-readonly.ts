import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/text-area'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../shared/apiClients/dtos/Value";
import { unsafeHTML } from "lit-html/directives/unsafe-html.js";


@customElement('field-readonly')
export class FieldReadonly extends LitElement implements Component {

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

    setPlaceholder(): void {
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
        this.value = value;
        if (this.field?.type == 'ExternalReference') {
            // @ts-ignore
            this.rawValue = this.value.key;
            return
        }
        if (this.field?.type == 'ExternalReference[]') {
            const values = value as Value[]
            this.rawValue = values.map(v => v.key).join(', ');
            return
        }
        this.rawValue = value as string;
    }

    setBaseUrl(value: string): void {
        this.baseUrl = value
    }

    @property()
    baseUrl = '';


    @property()
    label = '';

    @property()
    name = '';

    @property()
    rawValue = '';

    @property()
    onChange = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.onValueChanged({
            fieldId: this.field!.id,
            value: input.value})
    }

    @property()
    value: unknown | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    firstUpdated() {
        const textArea = this.shadowRoot!.querySelector('textarea');
        textArea?.parentElement?.removeChild(textArea);
    }


    render() {
        return html`
            <vaadin-text-area
                label="${this.label}"
                @change=${this.onChange} 
                           name="${this.name}" 
                           id="${this.name}"
                data-testid="${this.name}"
                           value=${this.value}
                   ?disabled=${!this.enabled}
                readonly
            ><div class="content" slot="textarea">${unsafeHTML(this.rawValue)}</div></vaadin-text-area>
            `
    }


    static styles = css`
        .content {
            width: 95%;
            min-height: unset;
        }
        vaadin-text-area {
            width: 100%;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-readonly': FieldReadonly
    }
}

