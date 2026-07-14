import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import PricingPlan from "@mateu/shared/apiClients/dtos/componentmetadata/PricingPlan";

/**
 * Dependency-free pricing / plan-comparison table: plan cards side by side, the featured one lifted
 * and ringed, features as a check list, and a CTA button per plan that dispatches the standard
 * action-requested event. DS-neutral, dark-mode aware; wraps on narrow viewports.
 */
@customElement('mateu-pricing-table')
export class MateuPricingTable extends LitElement {

    @property({ type: Array })
    plans: PricingPlan[] = []

    static styles = css`
        :host {
            display: block;
            width: 100%;
        }
        .plans {
            display: flex;
            gap: 1rem;
            align-items: stretch;
            flex-wrap: wrap;
        }
        .plan {
            flex: 1 1 14rem;
            min-width: 12rem;
            display: flex;
            flex-direction: column;
            gap: .6rem;
            padding: 1.25rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 14px);
            background: var(--lumo-base-color, #fff);
        }
        .plan.featured {
            border-color: var(--lumo-primary-color, #1a73e8);
            box-shadow: 0 6px 24px rgba(26,115,232,.14);
        }
        .badge {
            align-self: flex-start;
            font-size: var(--lumo-font-size-xs, .68rem);
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: .04em;
            color: #fff;
            background: var(--lumo-primary-color, #1a73e8);
            border-radius: 999px;
            padding: .1rem .55rem;
        }
        .name {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
        }
        .price {
            font-size: 2rem;
            font-weight: 800;
            color: var(--lumo-body-text-color, #111);
            line-height: 1;
        }
        .period {
            font-size: .9rem;
            font-weight: 500;
            color: var(--lumo-secondary-text-color, #888);
        }
        ul {
            list-style: none;
            margin: .25rem 0 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            gap: .4rem;
            flex: 1;
        }
        li {
            display: flex;
            align-items: flex-start;
            gap: .5rem;
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-body-text-color, #333);
        }
        li::before {
            content: '✓';
            color: var(--lumo-success-color, #12b76a);
            font-weight: 700;
            flex: 0 0 auto;
        }
        .cta {
            margin-top: .25rem;
            border: none;
            border-radius: var(--lumo-border-radius-m, 8px);
            padding: .6rem 1rem;
            font-size: .9rem;
            font-weight: 600;
            cursor: pointer;
            background: var(--lumo-contrast-10pct, #eef0f2);
            color: var(--lumo-body-text-color, #222);
        }
        .plan.featured .cta {
            background: var(--lumo-primary-color, #1a73e8);
            color: #fff;
        }
        .cta:hover { filter: brightness(.96); }
        @media (prefers-color-scheme: dark) {
            .plan { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    `

    private cta(plan: PricingPlan) {
        if (!plan.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: plan.actionId },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="plans">
                ${this.plans.map(plan => html`
                    <div class="plan ${plan.featured ? 'featured' : ''}">
                        ${plan.featured ? html`<span class="badge">Recommended</span>` : nothing}
                        <span class="name">${plan.name}</span>
                        <div>
                            <span class="price">${plan.price}</span>
                            ${plan.period ? html`<span class="period">${plan.period}</span>` : nothing}
                        </div>
                        <ul>
                            ${(plan.features ?? []).map(f => html`<li>${f}</li>`)}
                        </ul>
                        ${plan.ctaLabel ? html`
                            <button class="cta" @click="${() => this.cta(plan)}">${plan.ctaLabel}</button>
                        ` : nothing}
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-pricing-table": MateuPricingTable
    }
}
