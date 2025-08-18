import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import {valor} from 'mateu/src'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {

  render() {
    return html`
      ${valor}
    `
  }

  static styles = css`
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
