import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/text-area'
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../../../shared/apiClients/dtos/Value";
import Action from "../../../../../../../../../../shared/apiClients/dtos/Action";
import {ActionType} from "../../../../../../../../../../shared/apiClients/dtos/ActionType";


@customElement('field-button')
export class FieldButton extends LitElement implements Component {

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

    @state()
    buttonMetadata: Action | undefined

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

    runAction() {
        this.dispatchEvent(new CustomEvent('run-action', {
            bubbles: true,
            composed: true,
            detail: {
                action: this.buttonMetadata
            }
        }))

    }

    firstUpdated() {
        this.buttonMetadata = this.field?.attributes.find(a => a.key == 'buttonMetadata')?.value as Action
    }

    getStyle() {
        let s = '';
        this.field?.attributes.forEach(p => {
            if (p.key == 'width') {
                s+= 'width: ' + p.value + ';'
            }
        })
        return s;
    }

    render() {
        return html`
            <vaadin-button
                   ?disabled=${!this.enabled}
                   @click=${this.runAction}
                   theme="${ActionType.Primary == this.buttonMetadata?.type?'primary':'secondary'}"
                   data-testid="action-${this.buttonMetadata?.id}"
                   style="${this.getStyle()}"
            >${this.buttonMetadata?.caption}</vaadin-button>
            `
    }


    static styles = css`
        
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-button': FieldButton
    }
}

