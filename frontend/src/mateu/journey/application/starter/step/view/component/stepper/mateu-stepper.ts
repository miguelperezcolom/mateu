import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import '@vaadin/horizontal-layout'
import '@vaadin/vaadin-notification'
import '@vaadin/button'
import '@vaadin/dialog'
import Field from "../../../../../../../shared/apiClients/dtos/Field";
import FieldWrapper from "../form/FieldWrapper";
import Card from "../../../../../../../shared/apiClients/dtos/Card";
import Value from "../../../../../../../shared/apiClients/dtos/Value";
import Stepper from "../../../../../../../shared/apiClients/dtos/Stepper";

export interface FormElement {

  valueChanged(key: string, value: object): void;

  getValue(key: string): object | undefined;

  getFieldWrapper(field: Field): FieldWrapper | undefined;

}

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-stepper')
export class MateuStepper extends LitElement {

  /**
   * Copy for the read the docs hint.
   */
  @property()
  baseUrl = ''

  @property()
  metadata!: Card

  @property()
  data!: object

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  value: Stepper | undefined

  async updated(changedProperties: PropertyValues) {
    if (changedProperties.has("metadata")) {
      this.setUp()
    }
    // No need to call any other method here.
  }

  setUp() {
    if (this.data) {
      // @ts-ignore
      this.value = this.data[this.metadata.dataPrefix]
    } else {
      this.value = undefined
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.setUp()
  }

  getPaintableValue(field: Field, value: unknown) {
    if (field.type == 'ExternalReference[]') {
      const values = value as Value[]
      return values.map(v => v.key).join(', ');
    }
    // @ts-ignore
    return (value && value.key)?value.key:value;
  }

  getValue(key: string): object | undefined {
    // @ts-ignore
    return this.data[this.metadata.dataPrefix][key];
  }

  render() {
    return html`
      <div class="stepper">

        <div style="color: var(--lumo-secondary-text-color);">
          <div>${this.value?.text}</div>
          <vaadin-progress-bar value="${this.value?.value}"></vaadin-progress-bar>
        </div>
        
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
    'mateu-stepper': MateuStepper
  }
}
