import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import Step from "@mateu/shared/apiClients/dtos/componentmetadata/Step";

/**
 * Dependency-free horizontal progress stepper: numbered dots joined by a connector line, each with a
 * status (done / current / upcoming) that drives its color and check mark, plus a title and optional
 * description below. Read-only — it visualizes progress, it does not navigate. DS-neutral, dark-mode
 * aware.
 */
@customElement('mateu-progress-steps')
export class MateuProgressSteps extends LitElement {

    @property({ type: Array })
    steps: Step[] = []

    @property({ type: Boolean, reflect: true })
    vertical = false

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .steps {
            display: flex;
            align-items: flex-start;
        }
        .step {
            flex: 1 1 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            position: relative;
            min-width: 0;
        }
        .connector {
            position: absolute;
            top: calc(.75rem - 1px);
            left: -50%;
            width: 100%;
            height: 2px;
            background: var(--lumo-contrast-20pct, #cbd5e1);
            z-index: 0;
        }
        .step:first-child .connector { display: none; }
        .step.done .connector, .step.current .connector {
            background: var(--lumo-primary-color, #1a73e8);
        }
        .dot {
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: .7rem;
            /* the contrast tint layered over the OPAQUE base color: lumo contrast vars are
               translucent and would let the connector line show through the dot */
            background: linear-gradient(var(--lumo-contrast-10pct, #e5e7eb), var(--lumo-contrast-10pct, #e5e7eb)) var(--lumo-base-color, #fff);
            color: var(--lumo-secondary-text-color, #666);
            z-index: 1;
            border: 2px solid transparent;
        }
        .step.done .dot {
            background: var(--lumo-primary-color, #1a73e8);
            color: #fff;
        }
        .step.current .dot {
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-primary-color, #1a73e8);
            border-color: var(--lumo-primary-color, #1a73e8);
        }
        .label {
            margin-top: .35rem;
            font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            padding: 0 .25rem;
        }
        .step.upcoming .label {
            color: var(--lumo-secondary-text-color, #888);
            font-weight: 500;
        }
        .desc {
            margin-top: .1rem;
            color: var(--lumo-secondary-text-color, #888);
            font-size: var(--lumo-font-size-xs, .75rem);
            padding: 0 .25rem;
        }

        /* vertical (rail) variant: dots stacked in a column, labels beside them, the connector
           running down between consecutive dots */
        :host([vertical]) .steps {
            flex-direction: column;
            align-items: stretch;
            gap: 1.1rem;
        }
        :host([vertical]) .step {
            flex: none;
            flex-direction: row;
            align-items: center;
            text-align: left;
            gap: .6rem;
        }
        :host([vertical]) .connector {
            top: auto;
            bottom: calc(100% - 2px);
            left: calc(.75rem - 1px);
            width: 2px;
            height: 1.1rem;
        }
        :host([vertical]) .label {
            margin-top: 0;
            padding: 0;
        }
        :host([vertical]) .desc {
            margin-top: 0;
            padding: 0;
        }
    `

    updated() {
        // Publish the step position so an enclosing surface (e.g. a Guided Process Drawer header)
        // can show a "current | total" pager that stays live as the embedded wizard advances — the
        // embedded component re-renders independently of the drawer, so a static read wouldn't track.
        const total = this.steps.length
        if (total === 0) return
        const currentIdx = this.steps.findIndex((s) => s.status === 'current')
        const allDone = this.steps.every((s) => s.status === 'done')
        const current = currentIdx >= 0 ? currentIdx + 1 : allDone ? total : 0
        this.dispatchEvent(
            new CustomEvent('mateu-guided-progress', {
                detail: {
                    current,
                    total,
                    // carry the step list so an enclosing pager can offer a jump-to-step menu
                    steps: this.steps.map((s) => ({ id: s.id, title: s.title, status: s.status ?? 'upcoming' })),
                },
                bubbles: true,
                composed: true,
            }),
        )
    }

    render() {
        return html`
            <div class="steps">
                ${this.steps.map((step, i) => {
                    const status = step.status ?? 'upcoming'
                    return html`
                        <div class="step ${status}">
                            <div class="connector"></div>
                            <div class="dot">${status === 'done' ? '✓' : i + 1}</div>
                            <div class="label">${step.title}</div>
                            ${step.description ? html`<div class="desc">${step.description}</div>` : nothing}
                        </div>
                    `
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-progress-steps": MateuProgressSteps
    }
}
