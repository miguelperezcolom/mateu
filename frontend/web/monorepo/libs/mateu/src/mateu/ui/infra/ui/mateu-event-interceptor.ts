import { customElement, property } from "lit/decorators.js";
import { css, html, LitElement } from "lit";


@customElement('mateu-event-interceptor')
export class MateuEventInterceptor extends LitElement {

    @property()
    target: LitElement | undefined

    redispatchEvent: EventListenerOrEventListenerObject = (e: Event) => {
        console.log('xxxx', e, this.target)
        if (e instanceof CustomEvent) {
            e.stopPropagation()
            e.preventDefault()
            this.target?.dispatchEvent(new CustomEvent(e.type, {
                detail: e.detail,
                bubbles: true,
                composed: true
            }))
        }
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('value-changed', this.redispatchEvent)
        this.addEventListener('action-requested', this.redispatchEvent)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('value-changed', this.redispatchEvent)
        this.removeEventListener('action-requested', this.redispatchEvent)
    }

    render() {
        return html`<slot></slot>`
    }

    static styles = css`
        :host {
            /* width: 100%; */
            display: inline-block;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-event-interceptor': MateuEventInterceptor
    }
}


