import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import './component/mateu-component';
import './component/crud/mateu-crud';
import View from "../../../../../shared/apiClients/dtos/View";
import Step from "../../../../../shared/apiClients/dtos/Step";
import {ComponentType} from "../../../../../shared/apiClients/dtos/ComponentType";
import {Notification} from "@vaadin/vaadin-notification";
import {Service} from "../../../../domain/service";

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
    uiId!: string

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

    @property()
    initialStepId: string | undefined

  @property()
  step!: Step;

    @property()
    service: Service | undefined

    @property()
  previousStepId!: string

  @property()
  crud: undefined | boolean = undefined

  connectedCallback() {
    super.connectedCallback();
  }


    async updated(changedProperties: PropertyValues) {
      if (!changedProperties.has('crud')) {
          setTimeout(() => {
              this.crud = this.view?.main?.components?.length == 1
                  && this.view?.main?.components?.filter(c => c.metadata.type == ComponentType.Crud).length > 0
                  // @ts-ignore
                  && this.view?.main?.components?.filter(c => c.metadata.type == ComponentType.Crud)[0].metadata.columns.length > 2
              ;
              if (this.crud) {
                  this.setAttribute('crud', '')
              } else {
                  this.removeAttribute('crud')
              }
          })
      }
        if (changedProperties.has('view')) {
            this.view.messages.map(m => {
                Notification.show(m.text, {
                    position: 'middle',
                    duration: 5000,
                    theme: this.getThemeForMessageType(m.type),
                })
            })
        }
    }

    private getThemeForMessageType(type: string): string {
        switch (type) {
            case 'Success': return 'success';
            case 'Warning': return 'contrast';
            case 'Error': return 'error';
            case 'Info': return 'primary';
        }
        return '';
    }

    render() {
    // @ts-ignore
        return html`
            ${this.view?.header?.components?.length > 0?html`
        <header>
            <vaadin-vertical-layout>
                ${this.view?.header?.components.map(c => html`<mateu-component
                        .component=${c}
                        uiId="${this.uiId}"
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
        </header>
        `:''}${this.view?.left?.components?.length > 0?html`
      <aside class="left">
          <vaadin-vertical-layout>
        ${this.view?.left?.components.map(c => html`<mateu-component
            .component=${c}
            uiId="${this.uiId}"
            journeyTypeId="${this.journeyTypeId}"
            journeyId="${this.journeyId}"
            stepId="${this.stepId}"
            .service=${this.service}
            .step=${this.step}
            baseUrl="${this.baseUrl}"
            previousStepId="${this.previousStepId}"
        >
          <slot></slot></mateu-component>
        `)}
          </vaadin-vertical-layout>
      </aside>
      `:''}${this.view?.right?.components?.length > 0?html`
      <main>

        ${this.view?.title?html`
          <h1>${this.view?.title}</h1>
        `:''}
        ${this.view?.subtitle?html`
          <p>${this.view?.subtitle}</p>
        `:''}
          <vaadin-vertical-layout style="width: 100%" theme="spacing-xl">
        ${this.view?.main?.components.map(c => html`<mateu-component 
            .component=${c}
            uiId="${this.uiId}"
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
          
      </main>`:''}${this.view?.right?.components?.length > 0?html`<aside class="right">
                <vaadin-vertical-layout>
        ${this.view?.right?.components.map(c => html`<mateu-component 
            .component=${c}
            uiId="${this.uiId}"
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
      </aside>`:''}${this.view?.footer?.components?.length > 0?html`
            <footer>
                <vaadin-vertical-layout>
                ${this.view?.footer?.components.map(c => html`<mateu-component
            .component=${c}
            uiId="${this.uiId}"
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
            </footer>

        `:''}
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
      padding-left: 2rem;
      padding-right: 2rem;
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
