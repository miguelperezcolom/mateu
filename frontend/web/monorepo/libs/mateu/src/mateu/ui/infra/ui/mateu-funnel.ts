import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import FunnelStage from "@mateu/shared/apiClients/dtos/componentmetadata/FunnelStage";

/**
 * Dependency-free conversion funnel: one centered bar per stage, its width proportional to the
 * stage value relative to the first (largest) stage, with the value and the conversion % vs the
 * previous stage. DS-neutral, dark-mode aware.
 */
@customElement('mateu-funnel')
export class MateuFunnel extends LitElement {

    @property({ type: Array })
    stages: FunnelStage[] = []

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .funnel { display: flex; flex-direction: column; gap: .35rem; }
        .stage { display: flex; flex-direction: column; align-items: center; gap: .1rem; }
        .bar {
            height: 2.4rem;
            border-radius: 6px;
            background: var(--bar, var(--lumo-primary-color, #1a73e8));
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 700;
            min-width: 3rem;
            transition: width .2s;
        }
        .meta { display: flex; gap: .5rem; align-items: baseline; }
        .label { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .conv { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); }
    `

    render() {
        const stages = this.stages
        if (!stages.length) {
            return html``
        }
        const first = stages[0].value ?? 0
        const max = Math.max(...stages.map(s => s.value ?? 0), 1)
        return html`
            <div class="funnel">
                ${stages.map((stage, i) => {
                    const value = stage.value ?? 0
                    const width = max > 0 ? Math.max(6, (value / max) * 100) : 6
                    const prev = i > 0 ? (stages[i - 1].value ?? 0) : first
                    const conv = i === 0
                        ? (first > 0 ? '100%' : '')
                        : prev > 0 ? `${Math.round((value / prev) * 100)}%` : '0%'
                    return html`
                        <div class="stage">
                            <div class="meta">
                                <span class="label">${stage.label}</span>
                                ${i > 0 ? html`<span class="conv">${conv} of previous</span>` : nothing}
                            </div>
                            <div class="bar" style="width: ${width}%; ${stage.color ? `--bar: ${stage.color};` : ''}">
                                ${value.toLocaleString()}
                            </div>
                        </div>
                    `
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-funnel": MateuFunnel
    }
}
