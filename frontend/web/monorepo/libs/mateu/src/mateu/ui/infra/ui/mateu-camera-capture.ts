import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";

/**
 * Photo capture for a @PhotoCapture String field: opens the camera (getUserMedia) with a live
 * preview and a shutter; the shot is committed as a JPEG data URI through the standard
 * `value-changed` event, so the photo round-trips in the field value exactly like
 * @UploadableImage — no upload endpoint involved. When the camera is unavailable (no device,
 * permission denied, insecure context) it falls back to a file input with `capture`, which on
 * phones opens the native camera. Styled with Lumo vars with fallbacks.
 */
@customElement('mateu-camera-capture')
export class MateuCameraCapture extends LitElement {

    @property()
    fieldId = ''

    @property()
    value: string | undefined

    @state()
    private cameraOpen = false

    @state()
    private cameraError = false

    private stream: MediaStream | undefined

    disconnectedCallback() {
        super.disconnectedCallback();
        this.stopStream()
    }

    private emit(value: string) {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value, fieldId: this.fieldId },
            bubbles: true,
            composed: true
        }))
    }

    private stopStream() {
        this.stream?.getTracks().forEach(track => track.stop())
        this.stream = undefined
    }

    private async openCamera() {
        this.cameraError = false
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' },
                audio: false
            })
            this.cameraOpen = true
            await this.updateComplete
            const video = this.renderRoot.querySelector('video')
            if (video) {
                video.srcObject = this.stream
                await video.play()
            }
        } catch {
            // no camera / permission denied / insecure context: offer the file-input fallback,
            // which on phones opens the native camera through the capture attribute
            this.stopStream()
            this.cameraOpen = false
            this.cameraError = true
        }
    }

    private closeCamera() {
        this.stopStream()
        this.cameraOpen = false
    }

    private shoot() {
        const video = this.renderRoot.querySelector('video')
        if (!video || video.videoWidth === 0) return
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        canvas.getContext('2d')!.drawImage(video, 0, 0)
        this.closeCamera()
        this.emit(canvas.toDataURL('image/jpeg', 0.9))
    }

    private fileFallback = (e: Event) => {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => this.emit(reader.result as string)
        reader.readAsDataURL(file)
        input.value = ''
    }

    private triggerFallback() {
        (this.renderRoot.querySelector('input[type=file]') as HTMLInputElement)?.click()
    }

    render(): TemplateResult {
        const hasValue = this.value != null && this.value !== ''
        return html`
            <input type="file" accept="image/*" capture="environment" style="display: none;"
                   @change="${this.fileFallback}">
            ${this.cameraOpen ? html`
                <video class="viewfinder" playsinline muted></video>
                <div class="actions">
                    <button class="button button--primary" @click="${this.shoot}">Capture</button>
                    <button class="button" @click="${this.closeCamera}">Cancel</button>
                </div>
            ` : html`
                ${hasValue
                    ? html`<img class="preview" src="${this.value}" alt="Photo"/>`
                    : html`<div class="placeholder" aria-hidden="true">📷</div>`}
                <div class="actions">
                    <button class="button button--primary" @click="${this.openCamera}">
                        ${hasValue ? 'Retake' : 'Take photo'}
                    </button>
                    ${this.cameraError ? html`
                        <button class="button" @click="${this.triggerFallback}">Use file / native camera</button>` : nothing}
                    ${hasValue ? html`
                        <button class="button button--danger" @click="${() => this.emit('')}">Delete</button>` : nothing}
                </div>
                ${this.cameraError ? html`
                    <div class="error-hint">Camera unavailable — the file picker opens the device camera on phones.</div>` : nothing}
            `}`
    }

    static styles = css`
        :host {
            display: block;
            max-width: 420px;
        }
        .viewfinder {
            width: 100%;
            max-height: 260px;
            display: block;
            background: #000;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
        }
        .preview {
            max-width: 100%;
            max-height: 240px;
            object-fit: contain;
            display: block;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
        }
        .placeholder {
            height: 135px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border: 1px dashed var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
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
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
        .error-hint {
            margin-top: 0.35rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-camera-capture': MateuCameraCapture
    }
}
