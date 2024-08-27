import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import './component/mateu-component';
import './component/crud/mateu-crud';
import View from "../../../../shared/apiClients/dtos/View";
import {Service} from "../../../domain/service";
import {ComponentMetadataType} from "../../../../shared/apiClients/dtos/ComponentMetadataType";
import Component from "../../../../shared/apiClients/dtos/Component";

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
    components!: Record<string, Component>

    @property()
    uiId!: string

    @property()
    journeyTypeId!: string

    @property()
    journeyId!: string

    @property()
    stepId!: string

    @property()
    service: Service | undefined

    @property()
    crud: undefined | boolean = undefined

    @property()
    instant = ''

    async updated(changedProperties: PropertyValues) {
      if (!changedProperties.has('crud')) {
          setTimeout(() => {
              this.crud = this.view?.main?.componentIds?.length == 1
                  && this.view?.main?.componentIds?.filter(c => this.components[c].metadata.type == ComponentMetadataType.Crud).length > 0
                  // @ts-ignore
                  && this.view?.main?.componentIds?.filter(c => this.step.components[c].metadata.type == ComponentMetadataType.Crud).map(c => this.step.components[c])[0].metadata.columns.length > 2
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
            ${this.view?.header?.componentIds?.length > 0?html`
        <header>
            <vaadin-vertical-layout>
                ${this.view?.header?.componentIds
                        .map(componentId => this.components[componentId])
                        .map(c => html`<mateu-component
                        .component=${c}
                        .components=${this.components}
                        uiId="${this.uiId}"
                        journeyTypeId="${this.journeyTypeId}"
                        journeyId="${this.journeyId}"
                        stepId="${this.stepId}"
                        baseUrl="${this.baseUrl}"
                        componentId="${c.id}"
                >
                    <slot></slot></mateu-component>
                `)}
            </vaadin-vertical-layout>
        </header>
        `:''}${this.view?.left?.componentIds?.length > 0?html`
      <aside class="left">
          <vaadin-vertical-layout>
        ${this.view?.left?.componentIds
                .map(componentId => this.components[componentId])
                .map(c => html`<mateu-component
            .component=${c}
            uiId="${this.uiId}"
            journeyTypeId="${this.journeyTypeId}"
            journeyId="${this.journeyId}"
            stepId="${this.stepId}"
            .service=${this.service}
            baseUrl="${this.baseUrl}"
            componentId="${c.id}"
        >
          <slot></slot></mateu-component>
        `)}
          </vaadin-vertical-layout>
      </aside>
      `:''}${this.view?.main?.componentIds?.length > 0?html`
      <main>
          <vaadin-vertical-layout style="width: 100%" theme="spacing-xl">
        ${this.view?.main?.componentIds
                .map(componentId => this.components[componentId])
                .map(c => {
                    return c
                })
                .map(c => html`<mateu-component 
            .component=${c}
            uiId="${this.uiId}"
            journeyTypeId="${this.journeyTypeId}" 
            journeyId="${this.journeyId}" 
            stepId="${this.stepId}"
            baseUrl="${this.baseUrl}"
            componentId="${c.id}"
        >
            <slot></slot></mateu-component>
        `)}
          </vaadin-vertical-layout>
          
      </main>`:''}${this.view?.right?.componentIds?.length > 0?html`<aside class="right">
                <vaadin-vertical-layout>
        ${this.view?.right?.componentIds
                .map(componentId => this.components[componentId])
                .map(c => html`<mateu-component 
            .component=${c}
            uiId="${this.uiId}"
            journeyTypeId="${this.journeyTypeId}" 
            journeyId="${this.journeyId}" 
            stepId="${this.stepId}"
            baseUrl="${this.baseUrl}"
            componentId="${c.id}"
        >
          <slot></slot></mateu-component>
        `)}
                </vaadin-vertical-layout>
      </aside>`:''}${this.view?.footer?.componentIds?.length > 0?html`
            <footer>
                <vaadin-vertical-layout>
                ${this.view?.footer?.componentIds
                        .map(componentId => this.components[componentId])
                        .map(c => html`<mateu-component
            .component=${c}
            uiId="${this.uiId}"
            journeyTypeId="${this.journeyTypeId}"
            journeyId="${this.journeyId}"
            stepId="${this.stepId}"
            baseUrl="${this.baseUrl}"
            componentId="${c.id}"
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
      padding: 2rem 1rem;
    }
  
    main {
      flex: 1 1 0;
      padding-left: 2rem;
      padding-right: 2rem;
      width: clamp(45ch, 90%, 75ch);
        max-width: 800px;
        margin: auto;
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
