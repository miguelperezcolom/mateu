import {css, html, LitElement} from 'lit'
import {customElement, state} from 'lit/decorators.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-button')
export class MyButton extends LitElement {

  @state()
  label = 'Hola!'

  createRenderRoot() {
    return this;
  }

  nameChanged(e) {
    console.log('name changed', e)
    this.label = e.detail.value
  }

  clicked(e) {
    console.log('clicked', e)
  }

  render() {
    return html`

      <oj-c-input-text value="value text" label-hint="Input Text" @valueChanged="${this.nameChanged}"></oj-c-input-text>
      
      <oj-c-button id="button1" label="${this.label}" @ojAction="${this.clicked}"></oj-c-button>
      
    `
  }

  static styles = css`
 
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-button': MyButton
  }
}
