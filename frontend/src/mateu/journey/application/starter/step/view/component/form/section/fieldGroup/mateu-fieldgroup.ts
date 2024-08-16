import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import FieldGroup from "../../../../../../../../../shared/apiClients/dtos/FieldGroup";
import './field/mateu-field'
import {FormElement} from "../../mateu-form";
import Field from "../../../../../../../../../shared/apiClients/dtos/Field";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-fieldgroup')
export class MateuFieldGroup extends LitElement {
  /**
   * Copy for the read the docs hint.
   */
  @property()
  baseUrl!: string

  @property()
  fieldGroup!: FieldGroup

  @property()
  formElement!: FormElement;

  connectedCallback() {
    super.connectedCallback();
  }

  onValueChange(e: CustomEvent) {
    this.formElement.valueChanged(e.detail.key, e.detail.value)
  }

  getStyle(f: Field) {
    const width = f.attributes.find(a => a.key == 'width')?.value;
    if (width) {
      return 'width: ' + width + ';'
    }
    const flexGrow = f.attributes.find(a => a.key == 'flex-grow')?.value;
    if (flexGrow) {
      return 'flex-grow: ' + flexGrow + ';'
    }
    return 'flex-grow: 1;'
  }


  render() {
    return html`
      <div>

        ${this.fieldGroup.caption?html`<h3>${this.fieldGroup.caption}</h3>`:''}

        ${this.fieldGroup.lines.map(l => html`

          <vaadin-horizontal-layout class="line" theme="spacing">
            
            ${l.fields.map(s => html`<mateu-field .field="${s}" 
                                                  @change=${this.onValueChange}
                                                    baseUrl=${this.baseUrl}
                                                    id="${s.id}"
                                                  name="${s.id}"
                                                    .formElement=${this.formElement} 
                                                    .value=${this.formElement.getValue(s.id)} 
                                                    .fieldWrapper=${this.formElement.getFieldWrapper(s)}
            style="${this.getStyle(s)};align-self: end;">
            </mateu-field>
        `)}

          </vaadin-horizontal-layout>
        
          `)}
        
        <slot></slot>
      </div>
    `
  }

  static styles = css`
  /*
    :host {
      max-width: 1280px;
      margin: 0 auto;
      padding: 2rem;
      text-align: center;
    }
    */
    .line {
    }
    
    h3 {
      margin-bottom: 0px;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-fieldgroup': MateuFieldGroup
  }
}
