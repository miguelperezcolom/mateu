import {css, html, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import "@vaadin/horizontal-layout";
import "@vaadin/button";
import "@vaadin/icons";
import "@vaadin/icon";
import Result from "../../../../../../shared/apiClients/dtos/Result";
import {ResultType} from "../../../../../../shared/apiClients/dtos/ResultType";
import Component from "../../../../../../shared/apiClients/dtos/Component";
import Destination from "../../../../../../shared/apiClients/dtos/Destination";
import {DestinationType} from "../../../../../../shared/apiClients/dtos/DestinationType";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-result')
export class MateuResult extends LitElement {
  /**
   * Copy for the read the docs hint.
   */

  @property()
  baseUrl = ''

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  previousStepId!: string

  @property()
  metadata!: Result

  @property()
  data: object | undefined;

  @property()
  componentId!: string

  @property()
  component!: Component

  connectedCallback() {
    super.connectedCallback();
  }

  async runAction(event: Event) {
    const boton = (event.target as HTMLElement)
    // @ts-ignore
    const destination: Destination = boton.destination;

    console.log('destination', destination)
    if (DestinationType.Url == destination.type) {
      let url = destination.value
      window.location.href = url
    } else {
      const actionId = destination.id
      if (!destination.id) {
        console.log('Attribute actionId is missing for ' + event.target)
        return
      }
      setTimeout(async () => {
        await this.doRunActionId(actionId, undefined, undefined);
      })
    }
  }

  async doRunActionId(actionId: string, eventName: string | undefined, event: unknown | undefined) {
    let effectiveData: any = {...this.data}
    if (event) {
      effectiveData = {...effectiveData, __eventName: eventName, __event: JSON.parse(JSON.stringify(event))}
    }
    effectiveData = {...effectiveData, __actionHandler: this.metadata.actionHandler}
    this.dispatchEvent(new CustomEvent('runaction', {
      detail: {
        componentId: this.componentId,
        componentType: this.component?.className,
        actionId: actionId,
        action: undefined,
        data: effectiveData
      },
      bubbles: true,
      composed: true
    }))
  }

  getIcon(resultType: ResultType): string {
    switch (resultType) {
      case ResultType.Success: return 'vaadin:check-circle';
      case ResultType.Info: return 'vaadin:info-circle';
      case ResultType.Warning: return 'vaadin:warning';
      case ResultType.Error: return 'lumo:error';
    }
    return 'vaadin:question';
  }

  getClass(resultType: ResultType): string {
    switch (resultType) {
      case ResultType.Success: return 'success';
      case ResultType.Info: return 'info';
      case ResultType.Warning: return 'warning';
      case ResultType.Error: return 'error';
    }
    return '';
  }

  render() {
    return html`

      <vaadin-horizontal-layout class="header">
        <div>
          <h2>${this.metadata.title}</h2>
        </div>
      </vaadin-horizontal-layout>

      <div class="mateu-section">
      
      <vaadin-vertical-layout style="align-items: center;">
        <vaadin-icon icon="${this.getIcon(this.metadata.resultType)}" class="${this.getClass(this.metadata.resultType)}"></vaadin-icon>
        <div><h3 data-testid="message">${this.metadata.message}</h3></div>
        
        ${this.metadata.interestingLinks?.length > 0?html`

          <div class="youmayalso">
            <h5>You may also be interested in:</h5>

            <vaadin-vertical-layout style="align-items: center;">
            
            ${this.metadata.interestingLinks.map(l => html`

    <div class="link"><vaadin-button theme="tertiary small" @click=${this.runAction}
                                               data-testid="link-${l.id}"
                                     id="${l.id}"
                                     .destination=${l}>${l.description}</vaadin-button></div>                   

`)}
            </vaadin-vertical-layout>
          </div>
          
        `:''}
        
      </vaadin-vertical-layout>
      
      </div>
      
      <vaadin-horizontal-layout style="justify-content: center;" theme="spacing">
        <slot></slot>
        ${this.metadata.nowTo?html`
          <vaadin-button theme="primary" @click=${this.runAction} 
                         data-testid="action-nowto"
                         actionId=${this.metadata.nowTo.id}
                         .destination=${this.metadata.nowTo}
          >${this.metadata.nowTo.description}</vaadin-button>
        `:''}
      </vaadin-horizontal-layout>
    `
  }

  static styles = css`
    :host {

    }
    
    .mateu-section {
      text-align: left;
      /*
      background-color: var(--lumo-shade-5pct);
      border-radius: 8px;      
       */
      padding: 2rem;  
      margin-bottom: 16px;       
      padding-top: 47px;
    }
    
    .mateu-section:has(h1) {
      padding-top: 0px;
    }

    vaadin-icon {
      width: var(--lumo-size-xl);
      height: var(--lumo-size-xl);
    }
    
    .youmayalso h5 {
      margin-block-end: 5px;
    }

    .link vaadin-button {
      padding: 0px;
      margin: 0px;
    }
    
    .success {
      color: green;
    }

    .info {
      color: cyan;
    }

    .warning {
      color: orange;
    }

    .error {
      color: red;
    }

  `

}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-result': MateuResult
  }
}
