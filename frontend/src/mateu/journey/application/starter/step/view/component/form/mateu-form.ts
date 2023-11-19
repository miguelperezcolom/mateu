import {css, html, LitElement, PropertyValues} from 'lit'
import {customElement, property, state} from 'lit/decorators.js'
import Form from "../../../../../../../shared/apiClients/dtos/Form";
import './section/mateu-section'
import '@vaadin/horizontal-layout'
import '@vaadin/vaadin-notification'
import '@vaadin/button'
import '@vaadin/dialog'
import '@vaadin/tabs'
import {dialogRenderer, notificationRenderer} from 'lit-vaadin-helpers';
import Rule from "../../../../../../../shared/apiClients/dtos/Rule";
import FieldsMap from "./FieldsMap";
import FieldWrapper from "./FieldWrapper";
import Field from "../../../../../../../shared/apiClients/dtos/Field";
import {badge} from "@vaadin/vaadin-lumo-styles";
import {BadgeType} from "../../../../../../../shared/apiClients/dtos/BadgeType";
import {ActionType} from "../../../../../../../shared/apiClients/dtos/ActionType";
import ConfirmationTexts from "../../../../../../../shared/apiClients/dtos/ConfirmationTexts";
import {dialogFooterRenderer} from "@vaadin/dialog/lit";
import ActionsMap from "./ActionsMap";
import {Button} from "@vaadin/button";
import {service} from "../../../../../../domain/service";
import {TabsSelectedChangedEvent} from "@vaadin/tabs";

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

  valueChanged(key: string, value: object): void {
    const obj = {};
    // @ts-ignore
    obj[key] = value;
    this.valueChangedKey = key
    this.data = { ...this.data, ...obj}
    try {
      this.runRules()
    } catch (e) {
      console.log(e);
    }
    this.valueChangedKey = undefined
  }

  getValue(key: string): object | undefined {
    // @ts-ignore
    //console.log('getValue', key, this.data[key], this.data)
    // @ts-ignore
    return this.data[key];
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
          this.doRunAction(actionId)
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

    setTimeout(() => this.runRules());
  }

  editFieldListener = async (event: Event) => {
    const customEvent = event as CustomEvent
    const fieldId = customEvent.detail.fieldId;
    await service.runAction('__editfield__' + fieldId, this.data)
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
      await this.doRunAction(actionId);
    })
  }

  async doRunAction(actionId: string) {
    const action = this.findAction(actionId!)
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
        this.askForActionRun(actionId)
      }
      this.confirmationTexts = action.confirmationTexts
      this.confirmationOpened = true;
    } else {
      this.askForActionRun(actionId)
    }
  }

  private askForActionRun(actionId: string) {
    this.dispatchEvent(new CustomEvent('runaction', {
      detail: {
        actionId: actionId,
        data: {...this.data, __activeTabId: this.activeTab}
      },
      bubbles: true,
      composed: true
    }))
  }

  private findAction(actionId: string) {
    let action = this.metadata.actions.find(a => a.id == actionId);
    if (!action) action = this.metadata.mainActions.find(a => a.id == actionId);
    return action
  }

  tabChanged = (e: TabsSelectedChangedEvent) => {
    this.activeTab = this.metadata.tabs[e.detail.value].id
  }

  getSelectedTabIndex = () => {
    const i = this.metadata.tabs.findIndex(t => t.active)
    console.log('selected tab index', i)
    return i
  }

  render() {
    return html`
      <div>
        
        <vaadin-horizontal-layout class="header">
          <div>
            <h3>${this.metadata.title}</h3>
            <p>${this.metadata.subtitle}</p>
          </div>
          <vaadin-horizontal-layout style="justify-content: end; flex-grow: 1; align-items: center;" theme="spacing">
            ${this.metadata.actions.filter(a => a.visible).map(a => html`
            <vaadin-button theme="secondary" @click=${this.runAction} actionId=${a.id} data-testid="action-${a.id}">${a.caption}</vaadin-button>
          `)}
          </vaadin-horizontal-layout>
        </vaadin-horizontal-layout>
          
        ${this.metadata.status || this.metadata.badges?html`
            <div class="badges">
              ${this.metadata.status?html`<span theme="badge ${this.getThemeForBadgetType(this.metadata.status.type)}">${this.metadata.status.message}</span>`:''}
              ${this.metadata.badges.map(b => html`<span theme="badge ${this.getThemeForBadgetType(b.type)}">${b.message}</span>`)}
            </div>        
        `:''}

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
            .map(s => html`<mateu-section .section="${s}" .form="${this.metadata}"
                                                              baseUrl="${this.baseUrl}"
                                                              .formElement=${this}
                                          style="display: ${!this.activeTab || this.activeTab == s.tabId?'unset':'none'};"
            ></mateu-section>`)}

        <vaadin-horizontal-layout style="justify-content: end;" theme="spacing">
          <slot></slot>
          ${this.metadata.mainActions.map(a => html`
            <vaadin-button theme="${ActionType.Primary == a.type?'primary':'secondary'}"
                           data-testid="action-${a.id}"
                           @click=${this.runAction} actionId=${a.id}>${a.caption}</vaadin-button>
          `)}
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

  private getThemeForBadgetType(type: BadgeType): string {
    switch (type) {
      case BadgeType.SUCCESS: return 'success';
      case BadgeType.WARNING: return 'warning';
      case BadgeType.DANGER: return 'error';
      case BadgeType.NONE: return 'contrast';
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
    .badges {
      margin-bottom: 10px;
    }
    
    vaadin-tabs {
      margin-bottom: 10px;
    }
    
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-form': MateuForm
  }
}
