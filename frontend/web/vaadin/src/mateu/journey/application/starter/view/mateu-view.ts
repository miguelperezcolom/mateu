import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import './component/mateu-component';
import './component/crud/mateu-crud';
import View from "../../../../shared/apiClients/dtos/View";
import {Service} from "../../../domain/service";
import Component from "../../../../shared/apiClients/dtos/Component";
import Crud from "../../../../shared/apiClients/dtos/Crud";
import {ComponentMetadataType} from "../../../../shared/apiClients/dtos/ComponentMetadataType";
import Form from "../../../../shared/apiClients/dtos/Form";
import {MateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

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
    instant = ''

    @property()
    mateuApiClient!: MateuApiClient

    @state()
    maincssclasses = ''

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.components) {
            let x = '';
            for (let k in  this.view.main.componentIds) {
                const c = this.components[this.view.main.componentIds[k]];
                if (c.metadata.type == ComponentMetadataType.Crud) {
                    if ((c.metadata as Crud).columns.length > 4) {
                        x = 'fullwidth'
                        break
                    }
                }
                if (c.metadata.type == ComponentMetadataType.Form) {
                    for (let s of (c.metadata as Form).sections) {
                        if (s.columns > 2) {
                            x = 'fullwidth'
                            break
                        }
                    }
                }
            }
            this.maincssclasses = x;
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
                        .mateuApiClient="${this.mateuApiClient}"
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
            .components=${this.components}
            .mateuApiClient="${this.mateuApiClient}"
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
      <main class="${this.maincssclasses}">
          <vaadin-vertical-layout style="width: 100%" theme="spacing-xs">
        ${this.view?.main?.componentIds
                .map(componentId => this.components[componentId])
                .map(c => {
                    return c
                })
                .map(c => html`<mateu-component 
            .component=${c}
            .components=${this.components}
            .mateuApiClient="${this.mateuApiClient}"
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
            .components=${this.components}
            .mateuApiClient="${this.mateuApiClient}"
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
            .components=${this.components}
            .mateuApiClient="${this.mateuApiClient}"
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
      
      main.fullwidth {
          max-width: unset;
      }
    
    header, footer {
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

      @media(max-width: 600px) {
          main {
              max-width: 90%;
              padding-left: 1rem;
              padding-right: 1rem;
          }
      }
  
    `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-view': MateuView
  }
}
