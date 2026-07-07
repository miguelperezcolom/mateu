import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";

/**
 * Signature capture for a @Signature String field: a drawing canvas (mouse/touch via pointer
 * events) with Clear/Accept. Accepting commits the strokes as a PNG data URI through the standard
 * `value-changed` event, so the signature round-trips in the field value exactly like
 * @UploadableImage does — no upload endpoint involved. An existing value shows as the image with
 * a "Sign again" action. Styled with Lumo vars with fallbacks (design-system neutral).
 */
@customElement('mateu-signature-pad')
export class MateuSignaturePad extends LitElement {

    @property()
    fieldId = ''

    @property()
    value: string | undefined

    @state()
    private signing = false

    @state()
    private hasStrokes = false

    private drawing = false

    private emit(value: string) {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value, fieldId: this.fieldId },
            bubbles: true,
            composed: true
        }))
    }

    private canvas(): HTMLCanvasElement | null {
        return this.renderRoot.querySelector('canvas')
    }

    private pointerPosition(e: PointerEvent): [number, number] {
        const canvas = e.target as HTMLCanvasElement
        const rect = canvas.getBoundingClientRect()
        // the canvas buffer is sized to its CSS box on first stroke, so coordinates map 1:1
        return [e.clientX - rect.left, e.clientY - rect.top]
    }

    private ensureCanvasSize(canvas: HTMLCanvasElement) {
        const rect = canvas.getBoundingClientRect()
        if (canvas.width !== Math.round(rect.width) || canvas.height !== Math.round(rect.height)) {
            canvas.width = Math.round(rect.width)
            canvas.height = Math.round(rect.height)
        }
    }

    private startStroke = (e: PointerEvent) => {
        const canvas = e.target as HTMLCanvasElement
        this.ensureCanvasSize(canvas)
        canvas.setPointerCapture(e.pointerId)
        this.drawing = true
        const context = canvas.getContext('2d')!
        context.lineWidth = 2
        context.lineCap = 'round'
        context.lineJoin = 'round'
        context.strokeStyle = getComputedStyle(this).getPropertyValue('--lumo-body-text-color') || '#1a1a1a'
        const [x, y] = this.pointerPosition(e)
        context.beginPath()
        context.moveTo(x, y)
        e.preventDefault()
    }

    private stroke = (e: PointerEvent) => {
        if (!this.drawing) return
        const canvas = e.target as HTMLCanvasElement
        const context = canvas.getContext('2d')!
        const [x, y] = this.pointerPosition(e)
        context.lineTo(x, y)
        context.stroke()
        this.hasStrokes = true
        e.preventDefault()
    }

    private endStroke = (e: PointerEvent) => {
        this.drawing = false
        ;(e.target as HTMLCanvasElement).releasePointerCapture(e.pointerId)
    }

    private clear() {
        const canvas = this.canvas()
        if (canvas) {
            canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
        }
        this.hasStrokes = false
    }

    private accept() {
        const canvas = this.canvas()
        if (!canvas || !this.hasStrokes) return
        this.signing = false
        this.emit(canvas.toDataURL('image/png'))
    }

    private renderPad(): TemplateResult {
        return html`
            <canvas class="pad"
                    @pointerdown="${this.startStroke}"
                    @pointermove="${this.stroke}"
                    @pointerup="${this.endStroke}"
                    @pointercancel="${this.endStroke}"></canvas>
            <div class="actions">
                <button class="button" @click="${this.clear}">Clear</button>
                <button class="button button--primary" ?disabled="${!this.hasStrokes}"
                        @click="${this.accept}">Accept</button>
                ${this.value ? html`
                    <button class="button" @click="${() => { this.signing = false }}">Cancel</button>` : nothing}
            </div>`
    }

    render(): TemplateResult {
        const hasValue = this.value != null && this.value !== ''
        if (this.signing || !hasValue) {
            return this.renderPad()
        }
        return html`
            <img class="preview" src="${this.value}" alt="Signature"/>
            <div class="actions">
                <button class="button" @click="${() => { this.signing = true; this.hasStrokes = false; this.updateComplete.then(() => this.clear()) }}">Sign again</button>
                <button class="button button--danger" @click="${() => this.emit('')}">Delete</button>
            </div>`
    }

    static styles = css`
        :host {
            display: block;
            max-width: 420px;
        }
        .pad {
            width: 100%;
            height: 160px;
            display: block;
            touch-action: none;
            background: var(--lumo-base-color, #fff);
            border: 1px dashed var(--lumo-contrast-40pct, rgba(0, 0, 0, 0.35));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            cursor: crosshair;
        }
        .preview {
            max-width: 100%;
            max-height: 160px;
            object-fit: contain;
            display: block;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            background: var(--lumo-base-color, #fff);
        }
        .actions {
            display: flex;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }
        .button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.35rem 0.75rem;
            cursor: pointer;
        }
        .button--primary {
            background: var(--lumo-primary-color, rgb(0, 100, 200));
            color: var(--lumo-primary-contrast-color, #fff);
        }
        .button--primary[disabled] {
            opacity: 0.5;
            cursor: default;
        }
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-signature-pad': MateuSignaturePad
    }
}
