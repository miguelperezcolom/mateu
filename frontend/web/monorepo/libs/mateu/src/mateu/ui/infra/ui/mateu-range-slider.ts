import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * A two-thumb range slider (from–to) built from two native `<input type="range">` laid on top of
 * each other. It replaces UI5's RangeSlider, which pulled the whole @ui5/webcomponents library
 * (≈640 KB, eagerly preloaded) into every page for one optional field stereotype.
 *
 * Native inputs bring keyboard support (arrows, Home/End, PageUp/PageDown) and the slider role for
 * free; each thumb gets its own accessible name. Emits `change` with `detail {from, to}` and keeps
 * the `startValue`/`endValue` properties UI5 had, so callers reading `e.target` keep working.
 */

export interface RangeValue {
    from: number
    to: number
}

const num = (v: unknown, fallback: number): number => {
    const n = typeof v === 'number' ? v : Number(v)
    return Number.isFinite(n) ? n : fallback
}

/** Clamps a range to [min, max] and keeps from ≤ to — moving one thumb past the other pushes it. */
export const normalizeRange = (from: unknown, to: unknown, min: unknown, max: unknown, moved: 'from' | 'to' = 'from'): RangeValue => {
    let lo = num(min, 0)
    let hi = num(max, 10)
    if (hi < lo) [lo, hi] = [hi, lo]
    const clamp = (v: number) => Math.min(hi, Math.max(lo, v))
    let f = clamp(num(from, lo))
    let t = clamp(num(to, hi))
    if (f > t) {
        if (moved === 'from') t = f
        else f = t
    }
    return { from: f, to: t }
}

@customElement('mateu-range-slider')
export class MateuRangeSlider extends LitElement {

    @property({ type: Number }) min = 0
    @property({ type: Number }) max = 10
    @property({ type: Number }) step: number | undefined
    @property({ type: Number, attribute: 'start-value' }) startValue = 0
    @property({ type: Number, attribute: 'end-value' }) endValue = 10
    @property({ attribute: 'from-label' }) fromLabel = 'From'
    @property({ attribute: 'to-label' }) toLabel = 'To'
    @property({ type: Boolean }) disabled = false

    private update_(which: 'from' | 'to', raw: string, commit: boolean) {
        const next = normalizeRange(
            which === 'from' ? raw : this.startValue,
            which === 'to' ? raw : this.endValue,
            this.min, this.max, which)
        this.startValue = next.from
        this.endValue = next.to
        if (commit) {
            this.dispatchEvent(new CustomEvent<RangeValue>('change', {
                detail: next, bubbles: true, composed: true,
            }))
        }
    }

    render() {
        const { from, to } = normalizeRange(this.startValue, this.endValue, this.min, this.max)
        const span = (this.max - this.min) || 1
        const left = ((from - this.min) / span) * 100
        const right = ((to - this.min) / span) * 100
        return html`
            <div class="track"><div class="fill" style="left:${left}%;width:${right - left}%"></div></div>
            <input type="range" class="from" aria-label="${this.fromLabel}"
                   min="${this.min}" max="${this.max}" step="${this.step ?? 1}" .value="${String(from)}"
                   ?disabled="${this.disabled}"
                   @input="${(e: Event) => this.update_('from', (e.target as HTMLInputElement).value, false)}"
                   @change="${(e: Event) => this.update_('from', (e.target as HTMLInputElement).value, true)}">
            <input type="range" class="to" aria-label="${this.toLabel}"
                   min="${this.min}" max="${this.max}" step="${this.step ?? 1}" .value="${String(to)}"
                   ?disabled="${this.disabled}"
                   @input="${(e: Event) => this.update_('to', (e.target as HTMLInputElement).value, false)}"
                   @change="${(e: Event) => this.update_('to', (e.target as HTMLInputElement).value, true)}">
            <div class="values" aria-hidden="true"><span>${from}</span><span>${to}</span></div>
        `
    }

    static styles = css`
        :host { display: block; position: relative; min-width: 10rem; padding-top: 0.5rem; }
        .track { position: absolute; left: 0; right: 0; top: 1.1rem; height: 4px; border-radius: 2px;
                 background: var(--lumo-contrast-20pct, #ccc); }
        .fill { position: absolute; top: 0; bottom: 0; background: var(--lumo-primary-color, #1676f3); border-radius: 2px; }
        input[type=range] { position: absolute; left: 0; right: 0; top: 0.6rem; width: 100%; margin: 0;
                            background: none; pointer-events: none; -webkit-appearance: none; appearance: none; }
        input[type=range]::-webkit-slider-thumb { pointer-events: auto; -webkit-appearance: none; appearance: none;
            width: 1rem; height: 1rem; border-radius: 50%; background: var(--lumo-primary-color, #1676f3); cursor: pointer;
            border: 2px solid var(--lumo-base-color, #fff); }
        input[type=range]::-moz-range-thumb { pointer-events: auto; width: 1rem; height: 1rem; border-radius: 50%;
            background: var(--lumo-primary-color, #1676f3); cursor: pointer; border: 2px solid var(--lumo-base-color, #fff); }
        input[type=range]:focus-visible { outline: 2px solid var(--lumo-primary-color-50pct, #1676f380); outline-offset: 2px; }
        .values { display: flex; justify-content: space-between; margin-top: 1.4rem;
                  font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-secondary-text-color, #555); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-range-slider': MateuRangeSlider
    }
}
