import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import Section from "../../../../../../../../shared/apiClients/dtos/Section";
import './fieldGroup/mateu-fieldgroup'
import {FormElement} from "../mateu-form";
import Field from "../../../../../../../../shared/apiClients/dtos/Field";
import Value from "../../../../../../../../shared/apiClients/dtos/Value";
import Form from "../../../../../../../../shared/apiClients/dtos/Form";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-section')
export class MateuSection extends LitElement {
  /**
   * Copy for the read the docs hint.
   */
  @property()
  baseUrl!: string

  @property()
  section!: Section

  @property()
  form!: Form

  @property()
  formElement!: FormElement;

  getPaintableValue(field: Field, value: unknown) {
      if (field.type == 'url[]') {
          const values = value as string[]
          return unsafeHTML(`${values.map(l => `<a href="${l}">${l}</a>`).join(', ')}`)
      }
      if (field.type == 'ExternalReference[]') {
          const values = value as Value[]
          return values.map(v => v.key).join(', ');
      }
      // @ts-ignore
      return (value && value.key)?value.key:value;
  }

  getColumnStyle(field: Field) {
      if (field.stereotype == 'rawcontent') {
          return 'fullWidth'
      }
      if (field.type == 'url[]') {
          return 'fullWidth'
      }
      if (field.type == 'ExternalReference[]') {
          return 'fullWidth'
      }
      if (field.stereotype == 'file') {
          return 'hidden'
      }
      return '';
  }

    onValueChange(e: CustomEvent) {
      console.log('onValueChange', e);
        this.formElement.valueChanged(e.detail.key, e.detail.value)
    }

    getStyle(f: Field) {
        let width = f.attributes.find(a => a.key == 'width')?.value;

        if (width) {
            return 'width: ' + width + ';'
        }
        return 'flex-grow: 1;'
    }

    getFieldHtml(f: Field) {
          if (f.stereotype == 'rawcontent') {
              return unsafeHTML(`<div class="fullWidth">${this.formElement.getValue(f.id)}</div>`)
          }
        return f.observed?html`
                  <mateu-field .field="${f}"  class="fullWidth"
                                                  @change=${this.onValueChange}
                                                    baseUrl=${this.baseUrl}
                                                    name="${f.id}"
                                                    id="${f.id}"
                                                    .formElement=${this.formElement} 
                                                    .value=${this.formElement.getValue(f.id)} 
                                                    .fieldWrapper=${this.formElement.getFieldWrapper(f)}
            style="${this.getStyle(f)}">
            </mateu-field>
                      `:html`
                  <div class="field ${this.getColumnStyle(f)}"><div class="cell caption">${f.caption}</div>
                  <div class="cell value">${this.getPaintableValue(f, this.formElement.getValue(f.id))}</div></div>
              `
    }


    render() {
    return html`
      <div class="mateu-section ${this.section.type}">

        ${this.section.caption?html`<h2>${this.section.caption}</h2>`:''}
          ${this.section.description?html`<p>${this.section.description}</p>`:''}
        
        ${this.form.readOnly || this.section.readOnly?html`
          ${this.section.fieldGroups.map(g => html`
              ${g.caption?html`<h3>${g.caption}</h3>`:''}
              <div class="table">
              ${g.lines.flatMap(l => l.fields).map(f => this.getFieldHtml(f))}
              </div>
          </div>`)}
        `:html`
          ${this.section.fieldGroups.map(s => html`<mateu-fieldgroup 
                  .fieldGroup="${s}" 
                  .formElement=${this.formElement}
                  baseUrl="${this.baseUrl}"
          ></mateu-fieldgroup>`)}
        `}
        
        <slot></slot>
      </div>
    `
  }

  static styles = css`
    .mateu-section {
      text-align: left;
      border: 1px solid lightgrey;
      border-radius: 8px;
      padding: 2rem;  
      margin-bottom: 16px;       
      padding-top: 14px;   
    }
    
    h2 {
      margin-bottom: 0px;
    }
    
    h3 {
      margin-bottom: 0px;
    }
    
    .mateu-section.Transparent {
      border: unset;
      padding-left: 0px;
      padding-right: 0px; 
    }
    
    .mateu-section:has(h1) {
      padding-top: 0px;
    }
    
    
    mateu-fieldgroup {
        margin-top: 3rem;
    }
    
    mateu-fieldgroup:nth-of-type(1) {
        margin-top: unset;
    }
    
    
    .mateu-fieldgroup.readonly {
        margin-top: 3rem;
    }
    
    .mateu-fieldgroup.readonly:nth-of-type(1) {
        margin-top: unset;
    }
    
    .table {
        display: grid;
        grid-template-columns: repeat(auto-fill, calc(50% - 20px));
        grid-column-gap: 20px;
    }
    
    .field {
        border-bottom: 1px dashed lightgrey;
        display: flex;
    }

    .field:nth-child(n+3)  {
    /*
        border-top: 1px solid lightgrey;
        */
    }
    
    .cell {
        min-height: 2rem;
        padding-top: 5px;
    }
    
    .fullWidth {
        grid-column: 1 / span 2;
    }
    
    .hidden {
        display: none;
    }
    
    .caption {
        font-weight: 800;
        font-size: var(--lumo-font-size-s);
        color: var(--lumo-secondary-text-color);
    }
    
    .value {
        text-align: right;
        flex: auto;
    }


  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-section': MateuSection
  }
}
