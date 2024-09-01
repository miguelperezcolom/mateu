import {css, html, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import '@vaadin/horizontal-layout'
import '@vaadin/vaadin-notification'
import '@vaadin/button'
import '@vaadin/dialog'
import Field from "../../../../../../shared/apiClients/dtos/Field";
import FieldWrapper from "../form/FieldWrapper";
import FieldsMap from "../form/FieldsMap";
import Card from "../../../../../../shared/apiClients/dtos/Card";
import Value from "../../../../../../shared/apiClients/dtos/Value";

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
        
        This is a card
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
