import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { icon as dsIcon } from "@infra/ui/renderers/neutralIcon.ts";

/**
 * The severity glyph comes from the renderer's icon set (Vaadin icons on the Vaadin renderer) — the
 * notice used to draw text glyphs (ℹ ✓ !) in a coloured circle, a second icon family next to the
 * design system's (UX review W-V-ICON).
 */
export const NOTICE_ICONS: Record<string, string> = {
    info: 'vaadin:info-circle', success: 'vaadin:check-circle', warning: 'vaadin:warning', danger: 'vaadin:exclamation-circle',
}

/** A declared icon NAME (`vaadin:user`, `lumo:…`) goes through the icon set; anything else is content. */
export const isIconName = (icon: string | undefined): boolean => !!icon && /^[a-z][\w-]*:[\w-]+$/.test(icon)

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
    /** suppresses the severity icon entirely */
    @property({ type: Boolean }) noIcon = false
    @property() actionLabel: string | undefined
    @property() actionId: string | undefined
    /** right-aligned state text rendered where the action button goes */
    @property() status: string | undefined
    /** tight variant: no block margins and reduced padding (like @Text(noMargins=true)) */
    @property({ type: Boolean }) slim = false
    /** spans the full form width (all columns) */
    @property({ type: Boolean }) fullWidth = false
    /** set by the renderer when the notice carries slotted content (arbitrary components) */
    @property({ type: Boolean }) hasContent = false
    /** slotted content renders on the SAME line as the text instead of below it */
    @property({ type: Boolean }) inlineContent = false

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
        .notice.slim .icon { --mateu-notice-icon-size: var(--lumo-icon-size-s, 1rem); }
        /* a custom content icon (text, an emoji) renders at its natural size */
        .icon.custom { font-size: var(--lumo-font-size-m, 1rem); }
        .icon {
            flex: 0 0 auto;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .icon > * { width: var(--mateu-notice-icon-size, var(--lumo-icon-size-s, 1.1rem)); height: var(--mateu-notice-icon-size, var(--lumo-icon-size-s, 1.1rem)); }
        .text { flex: 1; min-width: 0; font-weight: 600; }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .25rem; }
        .content { min-width: 0; }
        /* inline content: text and content share the line (e.g. label + input + action);
           wraps on narrow widths */
        .body.inline { flex-direction: row; align-items: center; gap: .8rem; flex-wrap: wrap; }
        .body.inline .text { flex: 0 0 auto; }
        .body.inline .content { flex: 1 1 12rem; min-width: 0; }
        /* ghost action button: blends with the themed strip via currentColor (DS-neutral) */
        .notice-action {
            flex: 0 0 auto;
            font: inherit; font-weight: 600;
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: .2rem .7rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid currentColor;
            background: transparent; color: inherit; cursor: pointer;
        }
        .notice-action:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.06)); }
        .status { flex: 0 0 auto; font-weight: 600; font-size: var(--lumo-font-size-xs, .75rem); }
        /* the theme's own semantic tints and inks (Lumo tunes the *-text-color tokens for 4.5:1 on
           the matching 10pct tint, in light AND dark) — the notice used to hard-code pastels that
           stayed light on a dark page */
        .info    { background: var(--lumo-primary-color-10pct, #e3f0fb); }
        .info .text, .info .status, .info .icon { color: var(--lumo-primary-text-color, #1a5dad); }
        .success { background: var(--lumo-success-color-10pct, #e2f3e6); }
        .success .text, .success .status, .success .icon { color: var(--lumo-success-text-color, #22703a); }
        .warning { background: var(--lumo-warning-color-10pct, #fdf0dc); }
        .warning .text, .warning .status, .warning .icon { color: var(--lumo-warning-text-color, #925a13); }
        .danger  { background: var(--lumo-error-color-10pct, #f6e0da); }
        .danger .text, .danger .status, .danger .icon { color: var(--lumo-error-text-color, #a5502e); }
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
                ${this.noIcon
                    ? nothing
                    : this.icon && !isIconName(this.icon)
                        ? html`<span class="icon custom" aria-hidden="true">${this.icon}</span>`
                        : html`<span class="icon" aria-hidden="true">${dsIcon(this.icon || NOTICE_ICONS[theme])}</span>`}
                <div class="body ${this.inlineContent ? 'inline' : ''}">
                    ${hasText ? html`<span class="text">${this.text}</span>` : nothing}
                    ${this.hasContent ? html`<div class="content"><slot></slot></div>` : nothing}
                </div>
                ${this.actionLabel && this.actionId
                    ? html`<button class="notice-action" @click="${() => this.runAction()}">${this.actionLabel}</button>`
                    : this.status
                        ? html`<span class="status">${this.status}</span>`
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
