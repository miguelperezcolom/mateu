import { css, html, LitElement } from "lit";
import { customElement, property } from 'lit/decorators.js';

/**
 * A plain bulleted list: a simple <ul> of text items. The lightweight counterpart of
 * mateu-status-list for read-only enumerations (preferences, highlights, notes).
 * DS-neutral, dark-mode aware.
 */
@customElement('mateu-bulleted-list')
export class MateuBulletedList extends LitElement {

    @property({ type: Array }) items: string[] = []

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        ul {
            margin: 0; padding-inline-start: 1.2rem;
            color: var(--lumo-body-text-color, #222);
        }
        li { 
            padding: .15rem 0;
            line-height: normal;
        }
        li::marker { color: var(--lumo-secondary-text-color, #888); }
    `

    render() {
        return html`
            <ul>
                ${this.items.map(item => html`<li>${item}</li>`)}
            </ul>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-bulleted-list": MateuBulletedList
    }
}
