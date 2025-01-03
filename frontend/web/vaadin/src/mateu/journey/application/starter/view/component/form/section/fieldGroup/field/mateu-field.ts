import {css, html, LitElement} from 'lit'
import {customElement, property} from 'lit/decorators.js'
import Field from "../../../../../../../../../shared/apiClients/dtos/Field";
import Component from "./fields/interfaces/Component";
import {mapInputTypeToFieldType} from "./fields/FieldTypeMapper";
import './fields/field-text'
import './fields/field-number'
import './fields/field-double'
import './fields/field-radio-buttons'
import './fields/field-boolean'
import './fields/field-date'
import './fields/field-datetime'
import './fields/field-time'
import './fields/field-readonly'
import './fields/field-textarea'
import './fields/field-combobox'
import './fields/field-externalref'
import './fields/field-toggle'
import './fields/field-file'
import './fields/field-boolean-array'
import './fields/field-int-array'
import './fields/field-double-array'
import './fields/field-string-array'
import './fields/field-enum-array'
import './fields/field-externalref-array'
import './fields/field-closedlist'
import './fields/field-rawcontent'
import './fields/field-url'
import './fields/field-object'
import './fields/field-externalref-checkboxes'
import './fields/field-boolean-radio-buttons'
import './fields/field-stepper'
import './fields/field-telephone'
import './fields/field-complexkeychoice'
import './fields/field-crud'
import './fields/field-multi-select-combobox'
import './fields/field-rich-text-vaadin'
import './fields/field-json'
import './fields/field-externalrefclosedlist'
import './fields/field-button'
import './fields/field-password'
import './fields/field-email'
import './fields/field-icon'
import './fields/field-image'
import FieldWrapper from "../../../FieldWrapper";
import Listener from "../../../../../../../../../shared/apiClients/dtos/Listener";

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mateu-field')
export class MateuField extends LitElement {
  /**
   * Copy for the read the docs hint.
   */

  @property()
  baseUrl!: string

  @property()
  field!: Field


  @property()
  value!: object

  @property()
  visible!: boolean

  @property()
  enabled!: boolean

  @property()
  sidePositionedLabel!: string

  component: Component | undefined;

  element: HTMLElement | undefined;

  fieldWrapper?: FieldWrapper

  updated(changedProperties: Map<string, unknown>) {
    if (this.field) {
      this.setupComponent();
      if (changedProperties.has("field")) {
        this.paint();
      }
    }
  }

  setupComponent() {
    if (this.component) {
      try {
        this.component.setLabel(this.sidePositionedLabel == 'true'?'':this.field.caption);
        this.component.setPlaceholder(this.field.placeholder)
        this.component.setField(this.field);
        this.component.setValue(this.value)
        this.component.setBaseUrl(this.baseUrl)
        this.component.setRequired(this.field.validations
            .filter(v => 'NotEmpty' == v.type).length > 0)
        this.field.validations.filter(v => 'Pattern' == v.type)
            .forEach(v => this.component?.setPattern(v.data as string))
      } catch (e: any) {
        console.log('exception when calling setupComponent()', this.component, e)
      }
    }
  }

  setupElement() {
    if (this.element) {
      const contentValue = this.field.attributes.find(p => p.key == 'contentField');
      for (const a in this.value) {
        if (contentValue && a == contentValue.value) {
          // @ts-ignore
          this.element.innerHTML = this.value[a]
        } else {
          // @ts-ignore
          this.element.setAttribute(a, this.value[a])
        }
      }
      for (const p of this.field.attributes.filter(p => p.key == 'listener')) {
        const def = p.value as Listener
        this.element.addEventListener(def.eventName, e => {
          if (def.js) {
            eval(def.js)
          } else if (def.actionName) {
            this.dispatchEvent(new CustomEvent('run-action', {
              detail: {
                actionId: def.actionName,
                eventName: def.eventName,
                event: JSON.parse(this.stringify_object(e))
              },
              bubbles: true,
              composed: true
            }))
          }
        });
      }
    }
  }

  stringify_object(object: any): string {
    const obj = {};
    for (let key in object) {
      let value = object[key];
      if (value instanceof Node)
          // specify which properties you want to see from the node
        { // @ts-ignore
          value = {id: value.id};
        }
      else if (value instanceof Window)
        value = 'Window';
      else if (value instanceof Object)
        value = 'Object';
      // @ts-ignore
      obj[key] = value;
    }
    return JSON.stringify(obj);
  }

  firstUpdated() {
    this.paint();
  }

  paint() {
    const element = document.createElement(mapInputTypeToFieldType(this.field.type, this.field.stereotype));
    element.setAttribute('id', this.field.id)
    element.setAttribute('name', this.field.id)
    element.setAttribute('data-testid', 'field-' + this.field.id)
    let container = this.shadowRoot!.getElementById('container')!;
    if (this.field.stereotype.startsWith('element:')) {
      this.element = element;
      this.setupElement();
    } else {
      this.component = element as unknown as Component;
      this.component.onValueChanged = (e) => {
        let change = new CustomEvent('change', {detail: {
            key: this.field.id,
            value: e.value
          }});
        this.dispatchEvent(change);
      }
      this.setupComponent();
    }
    container.replaceChildren(element);
    const wrapper = this.shadowRoot!.getElementById('wrapper') as unknown;
    if (this.fieldWrapper) {
      this.fieldWrapper.container = wrapper as HTMLElement;
      this.fieldWrapper.mateuField = this
      this.fieldWrapper.component = this.component;
    } else {
      console.log('missing wrapper for ', this.field.id)
    }

  }

  render() {
    return html`
      <div id="wrapper">
        <div id="container"></div>
        <slot></slot>
      </div>
    `
  }

  static styles = css`
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-field': MateuField
  }
}
