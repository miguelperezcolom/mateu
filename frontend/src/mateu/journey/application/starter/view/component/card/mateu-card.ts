import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import '@vaadin/horizontal-layout'
import '@vaadin/vaadin-notification'
import '@vaadin/button'
import '@vaadin/dialog'
import Field from "../../../../../../shared/apiClients/dtos/Field";
import FieldWrapper from "../form/FieldWrapper";
import FieldsMap from "../form/FieldsMap";
import Card from "../../../../../../../shared/apiClients/dtos/Card";
import Value from "../../../../../../../shared/apiClients/dtos/Value";

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
@customElement('mateu-card')
export class MateuCard extends LitElement {

  getFieldWrapper(field: Field): FieldWrapper | undefined {
      return this.fieldsMap.map.get(field);
  }

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
  fieldsMap: FieldsMap = new FieldsMap();

  async updated(changedProperties: PropertyValues) {
    if (changedProperties.has("metadata")) {
      this.setUp()
    }
    // No need to call any other method here.
  }

  setUp() {
    this.metadata.fieldGroups
        .flatMap(g => g.lines)
        .flatMap(l => l.fields)
        .forEach(f => this.fieldsMap.map.set(f, new FieldWrapper(f)))
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
      <div class="card">
        
        <vaadin-horizontal-layout class="header">
          ${this.metadata.icon?html`<vaadin-icon icon="vaadin:${this.metadata.icon}"></vaadin-icon>`:''}
          <div>
            <h4>${this.metadata.title}</h4>
            <h6>${this.metadata.subtitle}</h6>
          </div>
          <div>${this.metadata.info}</div>
        </vaadin-horizontal-layout>

        ${this.metadata.fieldGroups.map(g => html`
              ${g.caption?html`<h3>${g.caption}</h3>`:''}
              <div class="table">
              ${g.lines.flatMap(l => l.fields).map(f => html`<div class="field"><div class="cell caption">${f.caption}</div>
                  <div class="cell value">${this.getPaintableValue(f, this.getValue(f.id))}</div></div>`)}

                ${this.metadata.total?html`
                  <div class="field total"><div class="cell caption">Total</div>
                    <div class="cell value">${this.metadata.total}</div></div>
        `:''}

              </div>
          </div>`)}
      </div>
    `
  }

  static styles = css`    
  
  .header {
  width: 100%;
  }
  
  .card {
      text-align: left;
      border: 1px solid lightgrey;
      border-radius: 8px;
      padding: 2rem;  
      margin-bottom: 16px;       
      padding-top: 14px;   
    }
    
    .field {
        border-bottom: 1px dashed lightgrey;
        display: flex;
    }
    
    .field.total {
      border-bottom: inherit;
    }

    .field.total .cell {
        font-weight: bold;
        font-size: 1.25rem;
    }

    
    .cell {
        min-height: 1rem;
        font-size: var(--lumo-font-size-xs);
        color: var(--lumo-secondary-text-color);
        /* padding-top: 5px; */
    }
    
    .caption {
    }
    
    .value {
        font-weight: 800;
        text-align: right;
        flex: auto;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-card': MateuCard
  }
}
