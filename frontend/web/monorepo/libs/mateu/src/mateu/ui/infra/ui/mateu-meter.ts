import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import { formatWithUnit } from "@infra/ui/uxShared.ts";

/**
 * Consumption-vs-limit meter (e.g. balance vs preauthorization): small-caps label, big formatted
 * value with the unit appended after a space, a progress track filled value/max, and a muted
 * caption (or the computed fill percent). Fill turns warning/error past the optional thresholds.
 * Read-only. DS-neutral, dark-mode aware.
 */
@customElement('mateu-meter')
export class MateuMeter extends LitElement {

    @property() label: string | undefined
    @property({ type: Number }) value = 0
    @property({ type: Number }) max = 0
    @property() unit: string | undefined
    @property() caption: string | undefined
    @property({ type: Number }) warnAt: number | undefined
    @property({ type: Number }) dangerAt: number | undefined

    static styles = css`
        :host { display: block; width: 100%; }
        .meter { display: flex; flex-direction: column; gap: .35rem; }
        .label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .value {
            font-size: 1.6rem; font-weight: 700; line-height: 1.1;
            color: var(--lumo-body-text-color, #111);
            font-variant-numeric: tabular-nums;
        }
        .track {
            height: .45rem; border-radius: 999px; overflow: hidden;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .fill { height: 100%; border-radius: 999px; transition: width .3s ease; }
        .fill.primary { background: var(--lumo-primary-color, #1a73e8); }
        .fill.success { background: var(--lumo-success-color, #12b76a); }
        .fill.warning { background: var(--lumo-warning-color, #f59e0b); }
        .fill.error { background: var(--lumo-error-color, #e11d48); }
        .caption { font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888); }
    `

    private fillColor(): string {
        if (this.dangerAt != undefined && this.value >= this.dangerAt) return 'error'
        if (this.warnAt != undefined && this.value >= this.warnAt) return 'warning'
        if (this.warnAt != undefined || this.dangerAt != undefined) return 'success'
        return 'primary'
    }

    render() {
        const ratio = this.max > 0 ? Math.min(Math.max(this.value / this.max, 0), 1) : 0
        const percent = Math.round(ratio * 100)
        return html`
            <div class="meter">
                ${this.label ? html`<span class="label">${this.label}</span>` : nothing}
                <span class="value">${formatWithUnit(this.value, this.unit)}</span>
                <div class="track">
                    <div class="fill ${this.fillColor()}" style="width: ${percent}%"></div>
                </div>
                <span class="caption">${this.caption ? this.caption : `${percent}%`}</span>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-meter": MateuMeter
    }
}
