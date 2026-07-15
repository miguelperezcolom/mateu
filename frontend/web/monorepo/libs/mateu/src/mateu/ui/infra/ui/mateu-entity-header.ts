import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import Chip from "@mateu/shared/apiClients/dtos/componentmetadata/Chip";
import Fact from "@mateu/shared/apiClients/dtos/componentmetadata/Fact";
import { chipStyles } from "@infra/ui/uxShared.ts";

/**
 * Persistent context banner for an entity a flow operates on: title + badges, subtitle, key facts
 * under a divider, and one highlighted metric on the right. Read-only. DS-neutral, dark-mode aware.
 */
@customElement('mateu-entity-header')
export class MateuEntityHeader extends LitElement {

    @property() title = ''
    @property({ type: Array }) badges: Chip[] = []
    @property() subtitle: string | undefined
    @property({ type: Array }) facts: Fact[] = []
    @property() metricLabel: string | undefined
    @property() metricValue: string | undefined
    @property() metricCaption: string | undefined

    static styles = [chipStyles, css`
        :host { display: block; width: 100%; }
        .card {
            display: flex;
            align-items: stretch;
            gap: var(--lumo-space-l, 1.5rem);
            padding: var(--lumo-space-m, 1rem) var(--lumo-space-l, 1.5rem);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.02));
        }
        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .3rem; }
        .title-row { display: flex; align-items: center; gap: .6rem; flex-wrap: wrap; }
        .title {
            font-size: var(--lumo-font-size-xl, 1.375rem);
            font-weight: 700;
            color: var(--lumo-header-text-color, var(--lumo-body-text-color, #111));
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            line-height: normal;
        }
        .facts {
            display: flex; gap: var(--lumo-space-l, 1.5rem); flex-wrap: wrap;
            margin-top: .55rem; padding-top: .55rem;
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .fact { display: flex; flex-direction: column; gap: .1rem; min-width: 0; }
        .fact .label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .fact .value {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 500;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
            line-height: normal;
        }
        .metric {
            flex: 0 0 auto; display: flex; flex-direction: column; justify-content: center;
            align-items: flex-end; text-align: right; gap: .15rem;
            padding-left: var(--lumo-space-l, 1.5rem);
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .metric .label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .metric .value {
            font-size: 1.7rem; font-weight: 700; line-height: 1.1;
            color: var(--lumo-primary-text-color, #1a73e8);
        }
        .metric .caption { font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888); }
    `]

    render() {
        const hasMetric = !!(this.metricLabel || this.metricValue || this.metricCaption)
        return html`
            <div class="card">
                <div class="main">
                    <div class="title-row">
                        <span class="title">${this.title}</span>
                        ${this.badges.map(badge => html`<span class="chip ${badge.color ?? ''}">${badge.label}</span>`)}
                    </div>
                    ${this.subtitle ? html`<span class="subtitle">${this.subtitle}</span>` : nothing}
                    ${this.facts.length ? html`
                        <div class="facts">
                            ${this.facts.map(fact => html`
                                <div class="fact">
                                    <span class="label">${fact.label}</span>
                                    <span class="value">${fact.value}</span>
                                </div>
                            `)}
                        </div>
                    ` : nothing}
                </div>
                ${hasMetric ? html`
                    <div class="metric">
                        ${this.metricLabel ? html`<span class="label">${this.metricLabel}</span>` : nothing}
                        ${this.metricValue ? html`<span class="value">${this.metricValue}</span>` : nothing}
                        ${this.metricCaption ? html`<span class="caption">${this.metricCaption}</span>` : nothing}
                    </div>
                ` : nothing}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-entity-header": MateuEntityHeader
    }
}
