import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';

const THEME_ICONS: Record<string, string> = { info: 'ℹ', success: '✓', warning: '!', danger: '!' }

/**
 * A compact inline banner: a rounded, theme-tinted strip with a small circular severity icon and
 * one line of text (e.g. "2 quejas pendientes"), plus an optional right-aligned action. Smaller
 * than a callout card; embeddable anywhere (cards, columns, forms). DS-neutral, dark-mode aware
 * (pastel backgrounds with dark ink, like the page banners).
 */
@customElement('mateu-notice')
export class MateuNotice extends LitElement {

    @property() text = ''
    @property() theme = 'info'
    @property() icon: string | undefined
    @property() actionLabel: string | undefined
    @property() actionId: string | undefined
    /** tight variant: no block margins and reduced padding (like @Text(noMargins=true)) */
    @property({ type: Boolean }) slim = false
    /** spans the full form width (all columns) */
    @property({ type: Boolean }) fullWidth = false
    /** set by the renderer when the notice carries slotted content (arbitrary components) */
    @property({ type: Boolean }) hasContent = false

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .notice {
            display: flex;
            align-items: center;
            gap: .6rem;
            padding: .5rem .75rem;
            border-radius: var(--lumo-border-radius-m, 8px);
        }
        .notice.slim {
            margin-block-start: 0;
            margin-block-end: 0;
            padding: .2rem .5rem;
            gap: .45rem;
            line-height: normal;
        }
        .notice.slim .icon { width: .95rem; height: .95rem; font-size: .6rem; }
        /* a custom icon (e.g. an emoji like 👥) renders at its natural size, no severity circle */
        .icon.custom, .notice .icon.custom {
            background: transparent; width: auto; height: auto;
            font-size: 1rem; color: inherit;
        }
        .icon {
            flex: 0 0 auto;
            width: 1.1rem;
            height: 1.1rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .7rem;
            font-weight: 700;
            color: #fff;
        }
        .text { flex: 1; min-width: 0; font-weight: 600; }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .25rem; }
        .content { min-width: 0; }
        button {
            font: inherit; font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            padding: .2rem .6rem; border-radius: 999px; border: none;
            cursor: pointer; white-space: nowrap; flex: 0 0 auto; color: #fff;
        }
        /* pastel background + dark ink per theme (always-light pastels, like the page banners) */
        .info    { background: #e3f0fb; } .info .text    { color: #1a5dad; }
        .info    .icon, .info button    { background: #4285d3; }
        .success { background: #e2f3e6; } .success .text { color: #22703a; }
        .success .icon, .success button { background: #3e8635; }
        .warning { background: #fdf0dc; } .warning .text { color: #925a13; }
        .warning .icon, .warning button { background: #c98a1e; }
        .danger  { background: #f6e0da; } .danger .text  { color: #a5502e; }
        .danger  .icon, .danger button  { background: #b25b3d; }
    `

    private runAction() {
        if (!this.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        // a blank text hides the notice entirely (the @Notice field's value doubles as its
        // visibility switch) — unless it carries slotted content
        const hasText = !!this.text && !!this.text.trim()
        if (!hasText && !this.hasContent) return html``
        const theme = ['info', 'success', 'warning', 'danger'].includes(this.theme) ? this.theme : 'info'
        return html`
            <div class="notice ${theme} ${this.slim ? 'slim' : ''}">
                <span class="icon ${this.icon ? 'custom' : ''}">${this.icon || THEME_ICONS[theme]}</span>
                <div class="body">
                    ${hasText ? html`<span class="text">${this.text}</span>` : nothing}
                    ${this.hasContent ? html`<div class="content"><slot></slot></div>` : nothing}
                </div>
                ${this.actionLabel && this.actionId
                    ? html`<button @click="${() => this.runAction()}">${this.actionLabel}</button>`
                    : nothing}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-notice": MateuNotice
    }
}
