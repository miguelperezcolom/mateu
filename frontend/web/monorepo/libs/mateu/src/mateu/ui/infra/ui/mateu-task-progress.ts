import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';

/**
 * Subtask completion banner (e.g. "pax 1/4 registered"): icon + label, one pill per subtask
 * (filled while done), and a right-aligned CTA dispatching the standard action-requested event.
 * The banner is warning-tinted while incomplete and success-tinted (CTA hidden) when done == total.
 * DS-neutral, dark-mode aware.
 */
@customElement('mateu-task-progress')
export class MateuTaskProgress extends LitElement {

    @property() label: string | undefined
    @property({ type: Number }) total = 0
    @property({ type: Number }) done = 0
    @property() actionLabel: string | undefined
    @property() actionId: string | undefined

    static styles = css`
        :host { display: block; width: 100%; }
        .banner {
            display: flex; align-items: center; gap: .8rem; flex-wrap: wrap;
            padding: .65rem var(--lumo-space-m, 1rem);
            border-radius: var(--lumo-border-radius-l, 12px);
            border: 1px solid var(--lumo-warning-color-10pct, rgba(245,158,11,.25));
            background: var(--lumo-warning-color-10pct, rgba(245,158,11,.12));
        }
        .banner.complete {
            border-color: var(--lumo-success-color-10pct, rgba(18,183,106,.25));
            background: var(--lumo-success-color-10pct, rgba(18,183,106,.12));
        }
        .icon { font-size: 1.1rem; flex: 0 0 auto; }
        .label {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 500;
            color: var(--lumo-body-text-color, #222);
            min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .pills { display: flex; gap: .3rem; flex: 0 0 auto; }
        .pill {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600;
            font-variant-numeric: tabular-nums;
            padding: .1rem .45rem; border-radius: 999px;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.15));
            color: var(--lumo-secondary-text-color, #888);
            background: transparent;
        }
        .pill.filled {
            border-color: var(--lumo-success-color, #12b76a);
            background: var(--lumo-success-color, #12b76a);
            color: var(--lumo-success-contrast-color, #fff);
        }
        .spacer { flex: 1; }
        button {
            font: inherit; font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            padding: .35rem .8rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: none; cursor: pointer;
            background: var(--lumo-primary-color, #1a73e8);
            color: var(--lumo-primary-contrast-color, #fff);
            white-space: nowrap;
        }
        button:hover { filter: brightness(1.08); }
    `

    private runAction() {
        if (!this.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId, parameters: {} },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const complete = this.total > 0 && this.done >= this.total
        const showButton = !complete && !!this.actionLabel && !!this.actionId
        return html`
            <div class="banner ${complete ? 'complete' : ''}">
                <span class="icon">👥</span>
                ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
                <div class="pills">
                    ${Array.from({ length: this.total }, (_, index) => html`
                        <span class="pill ${index + 1 <= this.done ? 'filled' : ''}">${index + 1}/${this.total}</span>
                    `)}
                </div>
                <span class="spacer"></span>
                ${showButton ? html`<button @click="${() => this.runAction()}">${this.actionLabel} →</button>` : nothing}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-task-progress": MateuTaskProgress
    }
}
