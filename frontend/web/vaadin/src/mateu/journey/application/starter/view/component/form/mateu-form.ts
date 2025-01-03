import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import Form from "../../../../../../shared/apiClients/dtos/Form";
import './section/mateu-section'
import '@vaadin/horizontal-layout'
import '@vaadin/notification'
import '@vaadin/button'
import '@vaadin/dialog'
import '@vaadin/tabs'
import {dialogRenderer, notificationRenderer} from 'lit-vaadin-helpers';
import Rule from "../../../../../../shared/apiClients/dtos/Rule";
import FieldsMap from "./FieldsMap";
import FieldWrapper from "./FieldWrapper";
import Field from "../../../../../../shared/apiClients/dtos/Field";
import {badge} from "@vaadin/vaadin-lumo-styles";
import {BadgeTheme} from "../../../../../../shared/apiClients/dtos/BadgeTheme";
import {ActionType} from "../../../../../../shared/apiClients/dtos/ActionType";
import ConfirmationTexts from "../../../../../../shared/apiClients/dtos/ConfirmationTexts";
import {dialogFooterRenderer} from "@vaadin/dialog/lit";
import ActionsMap from "./ActionsMap";
import {Button} from "@vaadin/button";
import {TabsSelectedChangedEvent} from "@vaadin/tabs";
import Action from "../../../../../../shared/apiClients/dtos/Action";
import {MenuBarItemSelectedEvent} from "@vaadin/menu-bar";
import {Service} from '../../../../../domain/service';
import {StatusType} from "../../../../../../shared/apiClients/dtos/StatusType";
import Component from "../../../../../../shared/apiClients/dtos/Component";
import {ActionPosition} from "../../../../../../shared/apiClients/dtos/ActionPosition";

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
@customElement('mateu-form')
export class MateuForm extends LitElement implements FormElement {

  getFieldWrapper(field: Field): FieldWrapper | undefined {
      return this.fieldsMap.map.get(field);
  }

  @state()
  valueChangedKey: string | undefined

  @property()
  service: Service | undefined

  @property()
  component: Component | undefined

  valueChanged(key: string, value: object): void {
    const obj = this.fill(key, value, this.data)
    this.valueChangedKey = key
    this.data = { ...this.data, ...obj}
    try {
      this.runRules()
    } catch (e) {
      console.log(e);
    }
    this.valueChangedKey = undefined
    this.dispatchEvent(new CustomEvent('data-changed', {
      bubbles: true,
      composed: true,
      detail: {
        data: this.data
      }
    }))
  }

  fill(key: string, value: object, data: any): object {
    const obj = {...data}
    if (key.indexOf('.') > 0) {
      const prefix = key.substring(0, key.indexOf('.'))
      const sufix = key.substring(key.indexOf('.') + 1)
      const partialData = data[prefix]
      // @ts-ignore
      obj[prefix] = this.fill(sufix, value, partialData)
    } else {
      // @ts-ignore
      obj[key] = value
    }
    return obj
  }

  getValue(key: string): object | undefined {
    // @ts-ignore
    if (key.indexOf('.') > 0) {
      // @ts-ignore
      return this.getValueInside(this.data[key.substring(0, key.indexOf('.'))], key.substring(key.indexOf('.') + 1))
    }
    // @ts-ignore
    return this.data[key];
  }

  getValueInside(data: any, key: string): object | undefined {
    if (!data) {
      return undefined
    }
    if (key.indexOf('.') > 0) {
      // @ts-ignore
      return this.getValueInside(data[key.substring(0, key.indexOf('.'))], key.substring(key.indexOf('.') + 1))
    }
    return data[key];
  }

  runRules() {
    this.metadata.actions.map(a => a.id).map(id => this.actionsMap.map.get(id)).forEach(b => {
      if (b) {
        b.style.display = ''
        b.disabled = false
      }
    });
    this.metadata.mainActions.map(a => a.id).map(id => this.actionsMap.map.get(id)).forEach(b => {
      if (b) {
        b.style.display = ''
        b.disabled = false
      }
    });
    this.metadata.sections
        .flatMap(s => s.fieldGroups)
        .flatMap(g => g.lines)
        .flatMap(l => l.fields)
        .map(f => this.fieldsMap.map.get(f))
        .filter(f => f)
        .forEach(f => {
          f!.setVisible(true)
          f!.setEnabled(true)
        });

    for (const r of this.rules) {
      const applied = this.applyRule(r);
      if (applied) {
        if ('Stop' == r.result) {
          break;
        }
      }
    }
  }

  hasChanged(fieldName: string): boolean {
    return fieldName == this.valueChangedKey
  }

  applyRule(r: Rule): boolean {
    try {
      const applies = eval(this.buildJs(r.filter));
      if (applies) {
        if ("Hide" == r.action) {
          const fieldIds = r.data as string[];
          this.metadata.sections
              .flatMap(s => s.fieldGroups)
              .flatMap(g => g.lines)
              .flatMap(l => l.fields)
              .filter(f => fieldIds?.includes(f.id))
              .map(f => this.fieldsMap.map.get(f))
              .forEach(f => {
                f!.setVisible(false)
              });
        }
        if ("Disable" == r.action) {
          const fieldIds = r.data as string[];
          this.metadata.sections
              .flatMap(s => s.fieldGroups)
              .flatMap(g => g.lines)
              .flatMap(l => l.fields)
              .filter(f => fieldIds?.includes(f.id))
              .map(f => this.fieldsMap.map.get(f))
              .forEach(f => {
                f!.setEnabled(false)
              });
        }
        if ("RunAction" == r.action) {
          const actionId = r.data as string;
          this.doRunActionId(actionId, undefined, undefined)
        }
        if ("HideAction" == r.action) {
          const actionIds = r.data as string[];
          this.metadata.actions
              .filter(f => actionIds?.includes(f.id))
              .map(f => this.actionsMap.map.get(f.id))
              .forEach(f => {
                f!.style.display = 'none'
              });
        }
        if ("DisableAction" == r.action) {
          const actionIds = r.data as string[];
          this.metadata.actions
              .filter(f => actionIds?.includes(f.id))
              .map(f => this.actionsMap.map.get(f.id))
              .forEach(f => {
                f!.disabled = true
              });
        }
        return true;
      }
    } catch (e) {

    }
    return false;
  }

  buildJs(filter: string): string {
    let js = '';
    for (let key in this.data) {
      js += 'const ' + key + ' = this.getValue("' + key + '");';
    }
    js += '' + filter;
    js = js.replace('hasChanged(', 'this.hasChanged(')
    return js
  }

  /**
   * Copy for the read the docs hint.
   */
  @property()
  baseUrl = ''

  @property()
  metadata!: Form

  @property()
  data!: object

  @property()
  journeyTypeId!: string

  @property()
  journeyId!: string

  @property()
  stepId!: string

  @property()
  componentId!: string

  @property()
  previousStepId!: string

  @property()
  rules!: Rule[]

  @property()
  notificationOpened: boolean = false;

  @property()
  notificationMessage: string = '';

  @property()
  fieldsMap: FieldsMap = new FieldsMap();

  @property()
  actionsMap: ActionsMap = new ActionsMap();

  @property()
  confirmationOpened = false;

  @state()
  activeTab = ''

  @property()
  closeConfirmation = () => {
    this.confirmationOpened = false
  };

  @property()
  confirmationAction = () => {};

  @property()
  runConfirmedAction = () => {
    this.confirmationAction()
    this.confirmationOpened = false
  };

  @property()
  confirmationTexts: ConfirmationTexts | undefined;



  renderNotification = () => html`${this.notificationMessage}`;

  async updated(changedProperties: PropertyValues) {
    if (changedProperties.has("metadata")) {
      this.setUp()
    }
    // No need to call any other method here.
  }

  setUp() {
    this.activeTab = this.metadata.tabs.length > 0?this.metadata.tabs.filter(t => t.active).map(t => t.id)[0]:''
    this.metadata.sections
        .flatMap(s => s.fieldGroups)
        .flatMap(g => g.lines)
        .flatMap(l => l.fields)
        .forEach(f => this.fieldsMap.map.set(f, new FieldWrapper(f)))
    this.metadata.actions.map(a => a.id).forEach(id => {
      const b = this.renderRoot.querySelector('vaadin-button[actionid="' + id + '"]') as Button
      this.actionsMap.map.set(id, b)
    })
    this.metadata.mainActions.map(a => a.id).forEach(id => {
      const b = this.renderRoot.querySelector('vaadin-button[actionid="' + id + '"]') as Button
      this.actionsMap.map.set(id, b)
    })
    this.metadata.actions.filter(a => a.timeoutMillis).forEach(a => {
      setTimeout(() => {
        this.askForActionRun(a)
      }, a.timeoutMillis)
    })
    this.metadata.mainActions.filter(a => a.timeoutMillis).forEach(a => {
      setTimeout(() => {
        this.askForActionRun(a)
      }, a.timeoutMillis)
    })

      setTimeout(() => this.runRules());
  }

  editFieldListener = async (event: Event) => {
    const customEvent = event as CustomEvent
    const fieldId = customEvent.detail.fieldId;
    await this.doRunActionId('__editfield__' + fieldId, undefined, undefined)
  }

  connectedCallback() {
    super.connectedCallback();
    this.setUp()
    this.addEventListener('edit-field', this.editFieldListener)
  }

  disconnectedCallback() {
    this.removeEventListener('edit-field', this.editFieldListener)
    super.disconnectedCallback();
  }

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

  async captureRunActionEvent(event: CustomEvent) {
    if (event.detail.actionId) {
      await this.doRunActionId(event.detail.actionId, event.detail.eventName, event.detail.event);
    } else {
      await this.doRunAction(event.detail.action)
    }
  }

  async doRunActionId(actionId: string, eventName: string | undefined, event: unknown | undefined) {
    const action = this.findAction(actionId!)
    if (action) {
      await this.doRunAction(action)
    } else {
      let effectiveData: any = {...this.data, __activeTabId: this.activeTab}
      if (event) {
        effectiveData = {...effectiveData, __eventName: eventName, __event: JSON.parse(JSON.stringify(event))}
      }
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
}

    async doRunAction(action: Action | undefined) {
    if (action?.validationRequired) {
      const fields = this.metadata.sections
          .flatMap(s => s.fieldGroups
              .flatMap(g => g.lines)
              .flatMap(g => g.fields));
      const fieldsWithErrors = fields.map(f => this.getFieldWrapper(f))
          .filter(w => w?.component?.isInvalid())
          .map(w => w?.field)
      if (fieldsWithErrors.length) {
        const fnames = fieldsWithErrors.map(f => f?.caption);
        this.notificationMessage = 'Several fields have errors (' + fnames + '). Please fix.';
        this.notificationOpened = true;
        setTimeout(() => this.notificationOpened = false, 3000)
        return
      }
    }
    if (action?.confirmationRequired) {
      this.confirmationAction = async () => {
        this.askForActionRun(action)
      }
      this.confirmationTexts = action.confirmationTexts
      this.confirmationOpened = true;
    } else {
      this.askForActionRun(action!)
    }
  }

  private askForActionRun(action: Action) {
    this.dispatchEvent(new CustomEvent('runaction', {
      detail: {
        componentId: this.componentId,
        componentType: this.component?.className,
        actionId: action.id,
        action: action,
        data: {...this.data, __activeTabId: this.activeTab}
      },
      bubbles: true,
      composed: true
    }))
  }

  private findAction(actionId: string) {
    let action = this.metadata.actions.find(a => a.id.endsWith('__' + actionId) || a.id == actionId);
    if (!action) action = this.metadata.mainActions.find(a => a.id.endsWith('__' + actionId) || a.id == actionId);
    return action
  }

  tabChanged = (e: TabsSelectedChangedEvent) => {
    this.activeTab = this.metadata.tabs[e.detail.value].id
    console.log('tab changed to', this.activeTab)
  }

  getSelectedTabIndex = () => {
    const i = this.metadata.tabs.findIndex(t => t.active)
    return i
  }

  buildItemsForActions(actions: Action[]) {
    const items = actions.map(a => ({text: a.caption, action: a}))
    return [
        {component: this.createRootActionsComponent(),
        children: items
      }]
  }

  actionItemSelected(event: MenuBarItemSelectedEvent) {
    setTimeout(async () => {
      // @ts-ignore
      await this.doRunActionId(event.detail.value.action.id);
    })
  }

  private createRootActionsComponent():HTMLElement {
    const item = document.createElement('vaadin-menu-bar-item');
    const icon = document.createElement('vaadin-icon');
    item.setAttribute('aria-label', 'Other save options');
    icon.setAttribute('icon', `vaadin:ellipsis-dots-v`);
    item.appendChild(icon);
    return item;
  }

  getStyle() {
    let s = '';
    if (this.metadata.attributes['min-width']) {
      s += 'min-width:' + this.metadata.attributes['min-width'] + ';'
    }
    if (this.metadata.attributes.width) {
      s += 'width:' + this.metadata.attributes.width + ';'
    }
    if (this.metadata.attributes['max-width']) {
      s += 'max-width:' + this.metadata.attributes['max-width'] + ';'
    }
    return s;
  }

  render() {
    return html`
      <div style="${this.getStyle()}">
        
        ${this.metadata.title || this.metadata.subtitle || this.metadata.actions.filter(a => a.visible).length > 0?html`

          <vaadin-horizontal-layout class="header xx" style="align-items: baseline;">
            <div style="flex-grow: 1; ">
              <h2 style="margin-block-end: 0px;">${this.metadata.title}</h2>
              ${this.metadata.subtitle?html`
            <p style="margin-top: -6px;">${this.metadata.subtitle}</p>
          `:''}
            </div>
            <vaadin-horizontal-layout style="justify-content: end; align-items: center;">
              ${this.metadata.actions.filter(a => a.visible).slice(0, (this.metadata.actions.filter(a => a.visible).length > 3)?2:3).map(a => html`
            <vaadin-button theme="secondary ${this.getActionVariants(a)}" @click=${this.runAction} actionId=${a.id} data-testid="action-${a.id}">${a.icon?html`
                <vaadin-icon icon="${a.icon}" actionId=${a.id}></vaadin-icon>
            `:''}${a.caption}</vaadin-button>
          `)}
              ${this.metadata.actions.filter(a => a.visible).length > 3?html`
              <vaadin-menu-bar theme="icon tertiary small" xopen-on-hover
                               @item-selected="${this.actionItemSelected}"
                               .items="${this.buildItemsForActions(this.metadata.actions
                  .filter(a => a.visible).slice(2))}"></vaadin-menu-bar>
            `:''}
            </vaadin-horizontal-layout>
          </vaadin-horizontal-layout>
        
        `:``}
          
        ${this.metadata.status || this.metadata.badges.length > 0?html`
            <vaadin-horizontal-layout class="badges" theme="spacing-s">
              ${this.metadata.status?html`<span 
                  theme="badge ${this.getThemeForStatusType(this.metadata.status.type)}"
              >${this.metadata.status.message}</span>`:''}
              ${this.metadata.badges.map(b => html`<span 
                  theme="badge ${this.getThemeForBadgetType(b.theme)}"
              >${b.message}</span>`)}
            </vaadin-horizontal-layout>        
        `:''}

        ${this.metadata.sections
            .filter(s => !s.tabId)
            .map(s => html`<mateu-section .section="${s}" .form="${this.metadata}"
                                                              baseUrl="${this.baseUrl}"
                                                              .formElement=${this}
                                          @run-action="${this.captureRunActionEvent}"
                                          style="display: ${!s.tabId || !this.activeTab || this.activeTab == s.tabId?'unset':'none'};"
            ></mateu-section>`)}

        ${this.metadata.tabs.length > 0?html`

          <vaadin-tabs 
              @selected-changed="${this.tabChanged}"
              selected="${this.getSelectedTabIndex()}"
          >
        ${this.metadata.tabs.map(t => html`
          <vaadin-tab id="${t.id}">${t.caption}</vaadin-tab>
        `)}
          </vaadin-tabs>
          
        `:''}
        
        
        
        ${this.metadata.sections
            .filter(s => s.tabId)
            .map(s => html`<mateu-section .section="${s}" .form="${this.metadata}"
                                                              baseUrl="${this.baseUrl}"
                                                              .formElement=${this}
                                          @run-action="${this.captureRunActionEvent}"
                                          runactioninform
                                          style="display: ${!this.activeTab || this.activeTab == s.tabId?'unset':'none'};"
            ></mateu-section>`)}

        <vaadin-horizontal-layout style="justify-content: end;" theme="spacing">
          <vaadin-horizontal-layout  style="flex-grow: 1; justify-content: start;">
            ${this.metadata.mainActions.filter(a => a.position == ActionPosition.Left).map(a => html`
              <vaadin-button theme="${this.getThemeForAction(a.type)} ${this.getActionVariants(a)}"
                             data-testid="action-${a.id}"
                             @click=${this.runAction} actionId=${a.id}>${a.caption}</vaadin-button>
            `)}
          </vaadin-horizontal-layout>
          <vaadin-horizontal-layout style="justify-content: end;">
          ${this.metadata.mainActions.filter(a => a.position == ActionPosition.Right).map(a => html`
            <vaadin-button theme="${this.getThemeForAction(a.type)} ${this.getActionVariants(a)}"
                           data-testid="action-${a.id}"
                           @click=${this.runAction} actionId=${a.id}>${a.caption}</vaadin-button>
          `)}
          </vaadin-horizontal-layout>
        </vaadin-horizontal-layout>

        <vaadin-notification
            .opened=${this.notificationOpened}
            position="bottom-end"
            duration="10000"
            theme="error"
            ${notificationRenderer(this.renderNotification)}
        >${this.notificationMessage}</vaadin-notification>
        
        
        <vaadin-dialog
  header-title="${this.confirmationTexts?.title}"
  .opened="${this.confirmationOpened}"
  ${dialogRenderer(() => html`${this.confirmationTexts?.message}`, [])}
  ${dialogFooterRenderer(
        () => html`
      <vaadin-button theme="primary error" @click="${this.runConfirmedAction}"
                     data-testid="dialog-confirm" style="margin-right: auto;">
        ${this.confirmationTexts?.action}
      </vaadin-button>
      <vaadin-button theme="tertiary" @click="${this.closeConfirmation}"
            data-testid="dialog-cancel">Cancel</vaadin-button>
    `,
        []
    )}
></vaadin-dialog>
        
      </div>
    `
  }

  private getActionVariants(action: Action) {
    if (action.variants) {
      return action.variants.join(' ').toLowerCase()
    }
    return '';
  }

  private getThemeForAction(type: ActionType) {
    if (ActionType.Tertiary == type) {
      return 'tertiary'
    }
    return ActionType.Primary == type?'primary':'secondary';
  }

  private getThemeForStatusType(type: StatusType): string {
    switch (type) {
      case StatusType.SUCCESS: return 'success';
      case StatusType.WARNING: return 'warning';
      case StatusType.DANGER: return 'error';
      case StatusType.NONE: return 'contrast';
    }
    return '';
  }

  private getThemeForBadgetType(type: BadgeTheme): string {
    switch (type) {
      case BadgeTheme.SUCCESS: return 'success';
      case BadgeTheme.WARNING: return 'warning';
      case BadgeTheme.DANGER: return 'error';
      case BadgeTheme.NONE: return 'contrast';
    }
    return '';
  }

  static styles = css`
    ${badge}
    
  [theme~='badge'][theme~='warning'] {
    color: #6f6800;
    background-color: #FFFCC0;
  }
  [theme~='badge'][theme~='warning'][theme~='primary'] {
    color: #ffffff;
    background-color: #6f6800;
  }
  
  .header {
  width: 100%;
  }
  
    vaadin-button {
        margin-left: 10px;
    }    
    
    vaadin-tabs {
      margin-bottom: 10px;
    }
    
    @media(max-width: 600px) {
      .xx {
        display: unset;
      }
    }
    
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-form': MateuForm
  }
}
