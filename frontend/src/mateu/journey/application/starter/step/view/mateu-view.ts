import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import './component/mateu-component';
import './component/crud/mateu-crud';
import View from "../../../../../shared/apiClients/dtos/View";
import Step from "../../../../../shared/apiClients/dtos/Step";
import {ViewType} from "../../../../../shared/apiClients/dtos/ViewType";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-view')
export class MateuView extends LitElement {
  /**
   * Copy for the read the docs hint.
   */

  @property()
  baseUrl = ''

  @property()
  view!: View

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  step!: Step;

  @property()
  previousStepId!: string

  @property()
  crud: undefined | boolean = undefined

  connectedCallback() {
    super.connectedCallback();
  }

    async goBack() {
        this.dispatchEvent(new CustomEvent('back-requested', {
            bubbles: true,
            composed: true}))
    }

    async goNext() {
        this.dispatchEvent(new CustomEvent('next-requested', {
            bubbles: true,
            composed: true,
            detail: {
                journeyTypeId: this.journeyTypeId,
                journeyId: this.journeyId,
                stepId: this.stepId,
                __listId: '__list__main__edit',
                __index: this.step.data.__index! + 1,
                __count: this.step.data.__count,
                previousStepId: this.previousStepId
            }}))
    }

    async goPrevious() {
        this.dispatchEvent(new CustomEvent('previous-requested', {
            bubbles: true,
            composed: true,
            detail: {
                journeyTypeId: this.journeyTypeId,
                journeyId: this.journeyId,
                stepId: this.stepId,
                __listId: '__list__main__edit',
                __index: this.step.data.__index! - 1,
                __count: this.step.data.__count,
                previousStepId: this.previousStepId
            }}))
    }


    async updated(changedProperties: PropertyValues) {
      if (!changedProperties.has('crud')) {
          setTimeout(() => {
              this.crud = this.view?.main?.components?.length == 1
                  && this.view?.main?.components?.filter(c => c.metadata.type == ViewType.Crud).length > 0
                  // @ts-ignore
                  && this.view?.main?.components?.filter(c => c.metadata.type == ViewType.Crud)[0].metadata.columns.length > 2
              ;
              if (this.crud) {
                  this.setAttribute('crud', '')
              } else {
                  this.removeAttribute('crud')
              }
          })
      }
    }

    render() {
    // @ts-ignore
        return html`
        <header>
                ${this.view?.header?.components.map(c => html`<mateu-component
                        .component=${c}
                        journeyTypeId="${this.journeyTypeId}"
                        journeyId="${this.journeyId}"
                        stepId="${this.stepId}"
                        .step=${this.step}
                        baseUrl="${this.baseUrl}"
                        previousStepId="${this.previousStepId}"
                >
                    <slot></slot></mateu-component>
                `)}
        </header>
      <aside class="left">
        ${this.view?.left?.components.map(c => html`<mateu-component
            .component=${c}
            journeyTypeId="${this.journeyTypeId}"
            journeyId="${this.journeyId}"
            stepId="${this.stepId}"
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
      </aside>
      <main>

          ${this.step?.previousStepId || this.step?.data?.__index || this.step?.data?.__count?html`
                <vaadin-horizontal-layout>
                      ${this.step?.previousStepId?html`
                          <vaadin-button theme="tertiary" @click=${this.goBack}><vaadin-icon icon="vaadin:arrow-left"></vaadin-icon></vaadin-button>
                      `:''}
                      ${this.step?.data?.__index != undefined && this.step?.data?.__count && this.step?.data?.__count > 0?html`

                          <vaadin-button theme="tertiary" @click=${this.goPrevious} ?disabled=${this.step?.data?.__index == 0}><vaadin-icon icon="vaadin:arrow-up"></vaadin-icon></vaadin-button>
                          <vaadin-button theme="tertiary" @click=${this.goNext} ?disabled=${this.step?.data?.__index >= this.step?.data?.__count - 1}><vaadin-icon icon="vaadin:arrow-down"></vaadin-icon></vaadin-button>

                      `:''}                    
                </vaadin-horizontal-layout>
`:''}
        
        ${this.view?.title?html`
          <h1>${this.view?.title}</h1>
        `:''}
        ${this.view?.subtitle?html`
          <p>${this.view?.subtitle}</p>
        `:''}

          ${this.view.messages.map(m => html`
              <div class="message ${m.type}">
                  <div class="title">${m.title}</div>
                  <div class="text">${m.text}</div>
              </div>
          `)}
          
          <vaadin-vertical-layout style="width: 100%" theme="spacing-xl">
        ${this.view?.main?.components.map(c => html`<mateu-component 
            .component=${c} 
            journeyTypeId="${this.journeyTypeId}" 
            journeyId="${this.journeyId}" 
            stepId="${this.stepId}"
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
          </vaadin-vertical-layout>
      </main><aside class="right">
        ${this.view?.right?.components.map(c => html`<mateu-component 
            .component=${c} 
            journeyTypeId="${this.journeyTypeId}" 
            journeyId="${this.journeyId}" 
            stepId="${this.stepId}"
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
      </aside>
        <footer>
            ${this.view?.footer?.components.map(c => html`<mateu-component
            .component=${c}
            journeyTypeId="${this.journeyTypeId}"
            journeyId="${this.journeyId}"
            stepId="${this.stepId}"
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
        </footer>
    `
  }

  static styles = css`
  
    :host {
      display: flex;
      flex-wrap: wrap;
    }
    
    aside {
      flex: 1 1 0;
      max-width: 250px;
      padding: 2rem 1rem;
    }
  
    main {
      flex: 1 1 0;
      padding: 2rem;
      width: clamp(45ch, 90%, 75ch);
    }
    
    header {
        flex-basis: 100%;
    }
    
    :host([crud]) aside {
      display: none;
      transition: 0.2s linear;
    }
    
    .message {
      border-radius: 6px;
      border: 1px solid;
      padding: 20px;
      margin-bottom: 10px;
    }

    .message.Success {
      border-color: green;
      background-color: lightgreen;
    }

    .message.Info {
      border-color: blue;
      background-color: lightblue;
    }

    .message.Warning {
      border-color: orange;
      background-color: yellow;
    }

    .message.Error {
      border-color: red;
      background-color: indianred;
    }
    
    .message .title {
      font-weight: 600;
    }

    @media (max-width: 1200px) {
      aside {
          display: none;
          transition: 0.2s linear;
      }  
    }
  
    `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-view': MateuView
  }
}
