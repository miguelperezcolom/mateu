import { css, html, LitElement } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import { chromeText } from '@infra/ui/chromeTexts.ts'

/**
 * The editor of an EDITABLE markdown / html field: the source in a textarea, and a Preview toggle
 * that shows it rendered (the caller slots the rendered content in as `slot="preview"`, so each
 * renderer keeps its own markdown/html rendering and sanitising). It used to depend on the
 * renderer: Vaadin showed the rendered content and could not be edited, Redwood the raw source
 * with no way to see the result (owner, 2026-10-12: an editor with preview on both).
 *
 * Fires the standard `value-changed` ({ detail: { value } }) on every edit.
 */
@customElement('mateu-markup-editor')
export class MateuMarkupEditor extends LitElement {

    @property() value: string = ''
    @property() label: string | undefined = undefined
    @property({ type: Boolean }) required = false

    /** Whether the preview is showing (the source is hidden). */
    @state() previewing = false

    static styles = css`
        :host { display: block; width: 100%; }
        .bar { display: flex; justify-content: flex-end; gap: var(--lumo-space-xs, .25rem); margin-bottom: var(--lumo-space-xs, .25rem); }
        button {
            background: none; border: 1px solid var(--lumo-contrast-30pct, currentColor);
            border-radius: var(--lumo-border-radius-s, 4px); color: var(--lumo-body-text-color, inherit);
            cursor: pointer; font: inherit; font-size: var(--lumo-font-size-s, .875rem);
            padding: var(--lumo-space-xs, .25rem) var(--lumo-space-s, .5rem);
        }
        button:focus-visible { outline: 2px solid var(--lumo-primary-color, Highlight); outline-offset: 2px; }
        textarea {
            box-sizing: border-box; width: 100%; min-height: 8rem; resize: vertical;
            font-family: var(--lumo-font-family-monospace, monospace); font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-body-text-color, inherit); background: var(--lumo-contrast-5pct, transparent);
            border: 1px solid var(--lumo-contrast-20pct, currentColor); border-radius: var(--lumo-border-radius-m, 4px);
            padding: var(--lumo-space-s, .5rem);
        }
        .preview {
            min-height: 8rem; padding: var(--lumo-space-s, .5rem);
            border: 1px dashed var(--lumo-contrast-20pct, currentColor); border-radius: var(--lumo-border-radius-m, 4px);
        }
    `

    private onInput(e: Event) {
        this.value = (e.target as HTMLTextAreaElement).value
        this.dispatchEvent(new CustomEvent('value-changed', { detail: { value: this.value }, bubbles: true, composed: true }))
    }

    render() {
        return html`
            <div class="bar">
                <button type="button" aria-pressed="${this.previewing ? 'true' : 'false'}"
                        @click="${() => { this.previewing = !this.previewing }}"
                >${this.previewing ? chromeText('edit') : chromeText('preview')}</button>
            </div>
            ${this.previewing
                ? html`<div class="preview"><slot name="preview"></slot></div>`
                : html`<textarea aria-label="${this.label ?? ''}" ?required="${this.required}"
                                 .value="${this.value ?? ''}" @input="${this.onInput}"></textarea>`}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-markup-editor": MateuMarkupEditor
    }
}
