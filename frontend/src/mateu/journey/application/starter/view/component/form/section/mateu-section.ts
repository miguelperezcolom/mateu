import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import Section from "../../../../../../../shared/apiClients/dtos/Section";
import './fieldGroup/mateu-fieldgroup'
import '@vaadin/form-layout'
import '@vaadin/horizontal-layout'
import {FormElement} from "../mateu-form";
import Field from "../../../../../../../shared/apiClients/dtos/Field";
import Form from "../../../../../../../shared/apiClients/dtos/Form";
import {unsafeHTML} from "lit-html/directives/unsafe-html.js";
import {FormLayoutResponsiveStep} from "@vaadin/form-layout";
import FieldGroupLine from "../../../../../../../shared/apiClients/dtos/FieldGroupLine";

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

    getFieldHtml(f: Field) {
        const colspan = f.colspan?f.colspan:1
          if (f.stereotype == 'rawcontent') {
              return unsafeHTML(`<div class="fullWidth" colspan="${colspan}">${this.formElement.getValue(f.id)}</div>`)
          }
        return html`
                  <mateu-field .field="${f}"
                                                  @change=${this.onValueChange}
                                                    baseUrl=${this.baseUrl}
                                                    name="${f.id}"
                                                    id="${f.id}"
                               colspan="${colspan}"
                                                    .formElement=${this.formElement} 
                                                    .value=${this.formElement.getValue(f.id)} 
                                                    .fieldWrapper=${this.formElement.getFieldWrapper(f)}
            style="align-self: end;${this.getStyle(f)}">
            </mateu-field>
                  
              `
    }


    getLineHtml(l: FieldGroupLine) {
        if (l.fields.length == 1) {
            return this.getFieldHtml(l.fields[0])
        }
        return html`
            <vaadin-horizontal-layout class="line" theme="spacing">
                      ${l.fields.map(f => this.getFieldHtml(f))}
                  </vaadin-horizontal-layout>                  
              `
    }

    responsiveSteps = (maxColumns: number): FormLayoutResponsiveStep[] => {
      const steps: FormLayoutResponsiveStep[] = [// Use one column by default
          { minWidth: 0, columns: 1 }]
        if (maxColumns > 1) {
            // Use two columns, if layout's width exceeds 500px
            steps.push({ minWidth: '500px', columns: 2 })
        }
        if (maxColumns > 2) {
            // Use two columns, if layout's width exceeds 500px
            steps.push({ minWidth: '800px', columns: 3 })
        }
        if (maxColumns > 3) {
            // Use two columns, if layout's width exceeds 500px
            steps.push({ minWidth: '1000px', columns: maxColumns })
        }
        return steps
    }

    renderContent() {
        return html`
           ${this.section.caption?html`<h3>${this.section.caption}</h3>`:''}
          ${this.section.description?html`<p>${this.section.description}</p>`:''}
           
               ${this.section.fieldGroups.map(g => html`
                   
                   ${g.caption?html`<h4>${g.caption}</h4>`:''}

                   <vaadin-form-layout .responsiveSteps="${this.responsiveSteps(
                           g.columns?g.columns:this.section.columns
                   )}">

              ${g.lines.map(f => this.getLineHtml(f))}

                   </vaadin-form-layout>
               `)}
        
    `
    }


    renderSkeleton() {
        if (this.section.leftSideImageUrl) {
            return html`
                <vaadin-horizontal-layout>
                    <div style="flex: 1; border-top-left-radius: 8px;border-bottom-left-radius: 8px; margin-top-20px; background-image: url(${this.section.leftSideImageUrl})"></div>
                    <div style="flex: 1; padding: 2rem;">${this.renderContent()}</div>
                </vaadin-horizontal-layout>
`
        } else if (this.section.topImageUrl) {
            return html`
                <vaadin-vertical-layout>
                    <div style="height: 80px; width: 100%; border-top-left-radius: 8px;border-top-right-radius: 8px; margin-top-20px; background-image: url(${this.section.topImageUrl})"></div>
                    <div style="flex: 1; padding: 2rem;">${this.renderContent()}</div>
                </vaadin-vertical-layout>
`
        } else {
            return this.renderContent()
        }
    }

    bgClass() {
      if (this.section.leftSideImageUrl || this.section.topImageUrl) {
          return 'withbgonleft'
      }
      return ''
    }

    render() {
    return html`
      <div class="mateu-section ${this.section.type} ${this.bgClass()}">
          
          ${this.renderSkeleton()}
        
        <slot></slot>
      </div>
    `
  }

  static styles = css`
    .mateu-section {
      text-align: left;
      background-color: var(--lumo-shade-5pct);
      border-radius: 8px;
      padding: 2rem;  
      margin-bottom: 16px;       
      padding-top: 14px;   
    }
    
    .withbgonleft {
      padding-left: 0px;
      padding-right: 0px;
      padding-bottom: 0px;
      padding-top: 0px;
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

      .field:nth-child(1), .field:nth-child(2) {
          border-top: 1px dashed lightgrey;
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

      @media(max-width: 600px) {
          .line {
              display: unset;
          }
      }
      
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-section': MateuSection
  }
}
