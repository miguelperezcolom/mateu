import {customElement, property} from "lit/decorators.js";
import {html, css, LitElement, PropertyValues} from "lit";
import '@vaadin/custom-field'
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import Field from "../../../../../../../../../../shared/apiClients/dtos/Field";
import {ifDefined} from "lit/directives/if-defined.js";


@customElement('field-image')
export class FieldImage extends LitElement implements Component {

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
    styles: string | undefined;

    @property()
    cssClasses: string | undefined;

    @property()
    action: string | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    runAction() {
        const action = this.action
        this.dispatchEvent(new CustomEvent('run-action', {
            bubbles: true,
            composed: true,
            detail: {
                actionId: action
            }
        }))
    }


    protected update(changedProperties: PropertyValues) {
        super.update(changedProperties);

        this.styles = this.field?.attributes?.find(a => a.key == 'style')?.value as string
        this.cssClasses = this.field?.attributes?.find(a => a?.key == 'cssClasses')?.value as string
        this.action = this.field?.attributes?.find(a => a?.key == 'action')?.value as string
    }


    render() {
        return html`
            <vaadin-custom-field label="${this.label}"
                                 helper-text="${this.field?.description}">
            <image src="${this.value}" data-testid="${this.name}" style="${this.styles}" class="${this.cssClasses} ${this.action?'clickable':''}"
                   @click="${ifDefined(this.action?this.runAction:undefined)}"
            ></image>
            </vaadin-custom-field>
            `
    }

    static styles = css`
        
        .clickable {
            cursor: pointer;
            border: 1px transparent solid;
        }

        .clickable:hover {
            border: 1px lightgrey dashed;
        }
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-image': FieldImage
    }
}

