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

    /** WCAG 2.2.2 Pause, Stop, Hide: the user stopped the autoplay with the visible button (or the
     *  system asks for reduced motion, which starts it stopped). Hover/focus only pause it for a while. */
    @state() stopped = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

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
                if (!this.paused && !this.stopped) this.selected = nextSlide(this.selected, 1, this.total, true)
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
                <div class="slides" aria-live="${this.auto && !this.stopped ? 'off' : 'polite'}"><slot @slotchange="${this.syncSlides}"></slot></div>
                ${this.nav ? html`<button type="button" class="nav next" aria-label="${chromeText('next')}"
                        ?disabled="${atEnd}" @click="${() => this.go(1)}">›</button>` : nothing}
            </div>
            ${this.auto && this.total > 1 ? html`<button type="button" class="play"
                    aria-pressed="${this.stopped ? 'false' : 'true'}"
                    aria-label="${chromeText(this.stopped ? 'carouselPlay' : 'carouselPause')}"
                    title="${chromeText(this.stopped ? 'carouselPlay' : 'carouselPause')}"
                    @click="${() => { this.stopped = !this.stopped }}">${this.stopped ? '▶' : '❚❚'}</button>` : nothing}
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
        .play { display: block; margin: var(--lumo-space-s, .5rem) auto 0; border: none; cursor: pointer;
                background: var(--lumo-contrast-10pct, #eee); color: inherit; border-radius: var(--lumo-border-radius-m, 6px);
                min-width: 2rem; height: 2rem; font-size: .8rem; }
        .play:focus-visible { outline: 2px solid var(--lumo-primary-color, #1676f3); outline-offset: 2px; }
        .dots { display: flex; justify-content: center; gap: 0; margin-top: var(--lumo-space-s, .5rem); }
        /* WCAG 2.5.8 Target Size: the dot is drawn .6rem wide but its button is 24×24 px */
        .dot { width: 24px; height: 24px; padding: 0; border-radius: 50%; border: none; cursor: pointer;
               background: radial-gradient(circle, var(--lumo-contrast-30pct, #bbb) 0 .3rem, transparent calc(.3rem + 1px)); }
        .dot.active { background: radial-gradient(circle, var(--lumo-primary-color, #1676f3) 0 .3rem, transparent calc(.3rem + 1px)); }
        .dot:focus-visible { outline: 2px solid var(--lumo-primary-color, #1676f3); outline-offset: -2px; }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-carousel': MateuCarousel
    }
}
