import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/custom-field'
import "@vaadin/horizontal-layout";
import "@vaadin/button";
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";


interface Key {

    title: string

    text: string

    note: string

    summary: string

}

interface Option {

    key: Key

    value: unknown

}

interface Choice {

    value: unknown

    options: Option[]

}

@customElement('field-complexkeychoice')
export class FieldComplexKeyChoice extends LitElement implements Component {

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

    onValueChanged(event: ValueChangedEvent): void {
        console.log(event)
    }
    setValue(value: unknown): void {
        this.value = value as Choice;
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
        console.log(e)
    }

    @property()
    value: Choice | undefined;

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    async edit(event: Event) {
        const actionId = (event.target as HTMLElement).getAttribute('fieldId');
        if (!actionId) {
            console.log('Attribute fieldId is missing for ' + event.target)
            return
        }
        let askForEdit = new CustomEvent('edit-field', {
            bubbles: true,
            composed: true,
            detail: {
                fieldId: this.field!.id,
            }});
        this.dispatchEvent(askForEdit);
    }

    async select(event: Event) {
        const value = (event.target as HTMLElement).getAttribute('value');
        this.value!.value = value;
        console.log('selected value', this.value!.value);
    }

    render() {
        return html`
            
            ${this.value?.options.map(c => html`

                <div class="option">
                    <div class="header"><h5>${c.key.title}</h5>
                        <input type="radio" name="option"
                               @click="${this.select}" 
                               value="${c.value}"
                               data-testid="${this.name}-${c.value}"
                               ?checked=${c.value === this.value?.value}></div>
                    <p>${c.key.text}</p>
                    <div class="footer">
                    <div class="note">${c.key.note}</div>
                    <div class="summary">${unsafeHTML(c.key.summary)}</div>
                    </div>
                </div>
            
            `)}
        `
    }

    static styles = css`
        .option {
          text-align: left;
          border: 1px solid lightgrey;
          border-radius: 8px;
          padding: 2rem;  
          margin-bottom: 16px;       
          padding-top: 14px;   
        }
        
        .header {
  display: flex;
          }

        .header h5{
            flex-grow: 1;
        }
        
        .footer {
            display: flex;
        }

        .footer .note{
            flex-grow: 1;
        }
        
    `

}

declare global {
    interface HTMLElementTagNameMap {
        'field-complexkeychoice': FieldComplexKeyChoice
    }
}

