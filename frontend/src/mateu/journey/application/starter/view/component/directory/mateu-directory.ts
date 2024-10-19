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
import {ActionPosition} from "../../../../../../shared/apiClients/dtos/ActionPosition";
import {ActionType} from "../../../../../../shared/apiClients/dtos/ActionType";
import Component from "../../../../../../shared/apiClients/dtos/Component";
import Directory from "../../../../../../shared/apiClients/dtos/Directory";

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
@customElement('mateu-directory')
export class MateuDirectory extends LitElement {

  getFieldWrapper(field: Field): FieldWrapper | undefined {
      return this.fieldsMap.map.get(field);
  }

  @property()
  componentId!: string

  @property()
  component: Component | undefined

  /**
   * Copy for the read the docs hint.
   */
  @property()
  baseUrl = ''

  @property()
  metadata!: Directory

  @property()
  data!: Directory

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  async runAction(event: Event) {
    const boton = (event.target as HTMLElement)
    const actionId = boton.getAttribute('actionId');
    if (!actionId) {
      console.log('Attribute actionId is missing for ' + event.target)
      return
    }
    setTimeout(async () => {
      await this.doRunActionId(actionId, undefined, undefined);
    })
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

  render() {
    return html`
      <div class="card"><vaadin-vertical-layout class="${this.metadata.layout}">
          ${this.data.media?html`
            <vaadin-vertical-layout
                    theme="spacing"
                    style="justify-content: end; height: 180px; width: 100%; border-top-left-radius: 8px;border-top-right-radius: 8px; margin-top-20px; background-image: url(${this.data.media});">
                <div style="flex-grow:1;">
                    ${this.metadata.thumbnail?html`<h2 style="padding-left: 20px;">${this.metadata.thumbnail}</h2>`:''}
                </div>
              ${this.metadata.icons?html`
                <vaadin-horizontal-layout style="justify-content: end; width: 100%; padding-left: 20px; padding-right: 20px; padding-bottom: 10px; padding-top: 10px;" theme="spacing">
                  <vaadin-horizontal-layout style="justify-content: end;" theme="spacing">
                    ${this.metadata.icons.map(a => html`
            <vaadin-button theme="tertiary"
                           data-testid="action-${a.id}"
                           @click=${this.runAction} actionId=${a.id}><vaadin-icon icon="${a.icon}" style="color: black;" actionId=${a.id}></vaadin-icon></vaadin-button>
          `)}
                  </vaadin-horizontal-layout>
              `:''}
            </div>
        `:''}
          <div class="content">
              <div><h3 style="margin-block-end: 5px;">${this.data.headerText}</h3></div>
              <div><h5 style="margin-block-start: 5px; margin-block-end: 5px;">${this.data.subhead}</h5></div>
              <div>${this.data.supportingText}</div>
          </div>
          ${this.metadata.buttons?.length > 0?html`
              <vaadin-horizontal-layout style="justify-content: end; width: 100%; padding-left: 20px; padding-right: 20px; padding-bottom: 10px; padding-top: 10px; background-color: var(--lumo-shade-5pct);" theme="spacing">
                  <vaadin-horizontal-layout  style="flex-grow: 1; justify-content: start;" theme="spacing">
                      ${this.metadata.buttons.filter(a => a.position == ActionPosition.Left).map(a => html`
              <vaadin-button theme="${this.getThemeForAction(a.type)}"
                             data-testid="action-${a.id}"
                             @click=${this.runAction} actionId=${a.id}>${a.caption}</vaadin-button>
            `)}
                  </vaadin-horizontal-layout>
                  <vaadin-horizontal-layout style="justify-content: end;" theme="spacing">
                      ${this.metadata.buttons.filter(a => a.position == ActionPosition.Right).map(a => html`
            <vaadin-button theme="${this.getThemeForAction(a.type)}"
                           data-testid="action-${a.id}"
                           @click=${this.runAction} actionId=${a.id}>${a.caption}</vaadin-button>
          `)}
                  </vaadin-horizontal-layout>
              </vaadin-horizontal-layout>
          `:''}
        </vaadin-vertical-layout></div>
    `
  }

  static styles = css`    
    
    .card {
      min-width: 15.25rem;
      max-width: 25.4375rem;
    }
    
    .Layout1 {
      border-radius: 8px;
      border: 2px solid var(--lumo-shade-5pct);
    }
    
    .content {
      padding-left: 20px;
      padding-right: 20px;
      padding-bottom: 20px;
    }
    
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-directory': MateuDirectory
  }
}
