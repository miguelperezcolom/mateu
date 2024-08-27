import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import '@vaadin/horizontal-layout'
import '@vaadin/vaadin-notification'
import '@vaadin/button'
import '@vaadin/dialog'
import Card from "../../../../../../shared/apiClients/dtos/Card";


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
  value: {
    text: string
    value: number
  } | undefined = undefined

  async updated(changedProperties: PropertyValues) {
    if (changedProperties.has("metadata")) {
      this.setUp()
    }
    // No need to call any other method here.
  }

  setUp() {
    if (this.data) {
      this.value = {
        // @ts-ignore
        text: this.data.text,
        // @ts-ignore
        value: this.data.value
      }
    } else {
      this.value = undefined
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.setUp()
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
