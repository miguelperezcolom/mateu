import {customElement, property} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";

/**
 * Generic file upload for a @FileUpload String field — the generic sibling of @UploadableImage
 * (no preview): a pick-file action showing the chosen file's name plus a remove action. The
 * picked file is read client-side into a data URI committed through the standard `value-changed`
 * event, so the file travels in the field value and no upload endpoint is required. The original
 * file name is embedded as a data-URI parameter (`data:<mime>;name=<encoded>;base64,...` — RFC
 * 2397 allows parameters) so it can be shown again on re-render and offered as the download name.
 * DS-neutral: Lumo vars with fallbacks, shared by every renderer's field dispatch.
 */
/**
 * Reads a generic field attribute (e.g. the @FileUpload accept): the wire carries the
 * FormFieldDto attributes as a list of {key, value} pairs (PairDto), but tolerate a plain
 * object map too.
 */
export const fieldAttribute = (attributes: unknown, key: string): string | undefined => {
    if (!attributes) return undefined
    if (Array.isArray(attributes)) {
        const pair = (attributes as { key?: string, value?: unknown }[]).find(a => a.key == key)
        return pair?.value != null ? String(pair.value) : undefined
    }
    const value = (attributes as Record<string, unknown>)[key]
    return value != null ? String(value) : undefined
}

@customElement('mateu-file-upload')
export class MateuFileUpload extends LitElement {

    @property()
    fieldId = ''

    @property()
    value: string | undefined

    /** Forwarded to the file input's accept attribute (from the field's `accept` attribute). */
    @property()
    accept: string | undefined

    @property({type: Boolean})
    editable = true

    /** The display name: the `name=` data-URI parameter, a URL's last segment, or a fallback. */
    static fileName(value: string | undefined): string {
        if (!value) return ''
        if (value.startsWith('data:')) {
            const comma = value.indexOf(',')
            const meta = value.substring(5, comma < 0 ? value.length : comma)
            const name = meta.split(';').find(part => part.startsWith('name='))
            if (name) {
                try {
                    return decodeURIComponent(name.substring(5))
                } catch {
                    return name.substring(5)
                }
            }
            return 'Attached file'
        }
        return value.split('/').pop() || value
    }

    private emit(value: string) {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value, fieldId: this.fieldId },
            bubbles: true,
            composed: true
        }))
    }

    private filePicked = (e: Event) => {
        const input = e.target as HTMLInputElement
        const file = input.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            const comma = result.indexOf(',')
            // stamp the original file name as a data-URI parameter, before the base64 marker
            const meta = result.substring(0, comma)
                .replace(';base64', `;name=${encodeURIComponent(file.name)};base64`)
            this.emit(meta + result.substring(comma))
        }
        reader.readAsDataURL(file)
        input.value = '' // allow re-selecting the same file
    }

    private triggerPick() {
        (this.renderRoot.querySelector('input[type=file]') as HTMLInputElement)?.click()
    }

    render(): TemplateResult {
        const hasValue = this.value != null && this.value !== ''
        const name = MateuFileUpload.fileName(this.value)
        const isDataUri = hasValue && this.value!.startsWith('data:')
        const nameBlock = hasValue
            ? html`<span class="file" title="${name}">📄 ${isDataUri
                ? html`<a href="${this.value}" download="${name}">${name}</a>`
                : html`<a href="${this.value}" target="_blank">${name}</a>`}</span>`
            : nothing
        if (!this.editable) {
            return html`${hasValue ? nameBlock : html`<span class="empty">—</span>`}`
        }
        return html`
            <input type="file" accept="${this.accept || nothing}" style="display: none;"
                   @change="${this.filePicked}">
            <div class="row">
                ${nameBlock}
                <button class="button" @click="${this.triggerPick}">
                    ${hasValue ? 'Replace' : 'Choose file'}
                </button>
                ${hasValue ? html`
                    <button class="button button--danger" @click="${() => this.emit('')}">Remove</button>` : nothing}
            </div>`
    }

    static styles = css`
        :host {
            display: block;
        }
        .row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            flex-wrap: wrap;
            min-height: var(--lumo-size-m, 2.25rem);
        }
        .file {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 18rem;
            font-size: var(--lumo-font-size-s, 0.875rem);
        }
        .file a {
            color: var(--lumo-primary-text-color, rgb(0, 100, 200));
            text-decoration: none;
        }
        .empty {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
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
        .button--danger {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-file-upload': MateuFileUpload
    }
}
