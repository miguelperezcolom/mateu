import { css, html, LitElement, nothing, PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { chromeText } from './chromeTexts'

/**
 * A dependency-free carousel for the `CarouselLayout` component: one slide (a direct child) at a
 * time, prev/next buttons (`nav`), dots (`dots`), wrap-around (`loop`), optional autoplay (`auto`,
 * every `duration` ms, paused while hovered/focused) and arrow-key navigation (unless
 * `disable-keys`). It replaces @fabricelements/skeleton-carousel, a Polymer 3 element that dragged
 * the Polymer runtime into the eager bundle.
 */

/** The slide index after moving `delta` from `current` among `total`, wrapping when `loop`. */
export const nextSlide = (current: number, delta: number, total: number, loop: boolean): number => {
    if (total <= 0) return 0
    const target = current + delta
    if (loop) return ((target % total) + total) % total
    return Math.max(0, Math.min(total - 1, target))
}

@customElement('mateu-carousel')
export class MateuCarousel extends LitElement {

    @property({ type: Boolean }) dots = false
    @property({ type: Boolean }) nav = false
    @property({ type: Boolean }) loop = false
    @property({ type: Boolean }) auto = false
    @property({ type: Number }) duration = 4000
    @property({ type: Boolean, attribute: 'disable-keys' }) disableKeys = false
    @property({ type: Number, reflect: true }) selected = 0

    @state() private total = 0

    private timer: ReturnType<typeof setInterval> | undefined
    private paused = false

    private get slides(): HTMLElement[] {
        return Array.from(this.children) as HTMLElement[]
    }

    go(delta: number) {
        this.selected = nextSlide(this.selected, delta, this.total, this.loop)
    }

    connectedCallback() {
        super.connectedCallback()
        this.restartTimer()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.stopTimer()
    }

    private stopTimer() {
        if (this.timer) clearInterval(this.timer)
        this.timer = undefined
    }

    private restartTimer() {
        this.stopTimer()
        if (this.auto && this.isConnected) {
            this.timer = setInterval(() => {
                if (!this.paused) this.selected = nextSlide(this.selected, 1, this.total, true)
            }, Math.max(500, this.duration || 4000))
        }
    }

    protected updated(changed: PropertyValues) {
        if (changed.has('auto') || changed.has('duration')) this.restartTimer()
        this.syncSlides()
    }

    private syncSlides = () => {
        const slides = this.slides
        if (this.total !== slides.length) this.total = slides.length
        if (this.selected >= slides.length && slides.length > 0) this.selected = slides.length - 1
        slides.forEach((slide, i) => {
            slide.hidden = i !== this.selected
            slide.setAttribute('aria-roledescription', 'slide')
            slide.setAttribute('aria-label', `${i + 1} / ${slides.length}`)
        })
    }

    private onKey = (e: KeyboardEvent) => {
        if (this.disableKeys) return
        if (e.key === 'ArrowRight') { this.go(1); e.preventDefault() }
        if (e.key === 'ArrowLeft') { this.go(-1); e.preventDefault() }
    }

    render() {
        const atStart = !this.loop && this.selected <= 0
        const atEnd = !this.loop && this.selected >= this.total - 1
        return html`
            <div class="frame" role="region" aria-roledescription="carousel" tabindex="0"
                 @keydown="${this.onKey}"
                 @mouseenter="${() => { this.paused = true }}" @mouseleave="${() => { this.paused = false }}"
                 @focusin="${() => { this.paused = true }}" @focusout="${() => { this.paused = false }}">
                ${this.nav ? html`<button type="button" class="nav prev" aria-label="${chromeText('previous')}"
                        ?disabled="${atStart}" @click="${() => this.go(-1)}">‹</button>` : nothing}
                <div class="slides" aria-live="${this.auto ? 'off' : 'polite'}"><slot @slotchange="${this.syncSlides}"></slot></div>
                ${this.nav ? html`<button type="button" class="nav next" aria-label="${chromeText('next')}"
                        ?disabled="${atEnd}" @click="${() => this.go(1)}">›</button>` : nothing}
            </div>
            ${this.dots && this.total > 1 ? html`<div class="dots">
                ${Array.from({ length: this.total }, (_, i) => html`<button type="button"
                        class="dot ${i === this.selected ? 'active' : ''}" aria-label="${i + 1} / ${this.total}"
                        aria-current="${i === this.selected ? 'true' : 'false'}"
                        @click="${() => { this.selected = i }}"></button>`)}
            </div>` : nothing}
        `
    }

    static styles = css`
        :host { display: block; }
        .frame { position: relative; display: flex; align-items: center; gap: var(--lumo-space-s, .5rem); outline: none; }
        .frame:focus-visible { box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct, #1676f380); border-radius: 4px; }
        .slides { flex: 1 1 auto; min-width: 0; }
        .nav { flex: 0 0 auto; border: none; background: var(--lumo-contrast-10pct, #eee); color: inherit;
               width: 2.25rem; height: 2.25rem; border-radius: 50%; font-size: 1.4rem; line-height: 1; cursor: pointer; }
        .nav:disabled { opacity: .35; cursor: default; }
        .dots { display: flex; justify-content: center; gap: .4rem; margin-top: var(--lumo-space-s, .5rem); }
        .dot { width: .6rem; height: .6rem; padding: 0; border-radius: 50%; border: none; cursor: pointer;
               background: var(--lumo-contrast-30pct, #bbb); }
        .dot.active { background: var(--lumo-primary-color, #1676f3); }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-carousel': MateuCarousel
    }
}
