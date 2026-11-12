import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { ifDefined } from 'lit/directives/if-defined.js'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'
import { icon as dsIcon } from '@infra/ui/renderers/neutralIcon.ts'
import { credentialHeadersFor } from '@infra/http/credentialScope.ts'
import {
    acceptsFile, fallbackMaxBytes, fileRefLabel, isHttpUrl, isUploadMode, parseFileRef, tooLargeMessage,
    uploadConfigOf, valuesOf, withFile, withoutFile, type UploadConfig,
} from '@infra/ui/fileUploads.ts'
import { UploadCancelled, uploadFile, xhrTransport, type UploadApi } from '@infra/ui/fileUploader.ts'

/**
 * Generic file upload for a @FileUpload String field — the generic sibling of @UploadableImage
 * (no preview): a pick-file action showing the chosen file's name plus a remove action. The
 * picked file is read client-side into a data URI committed through the standard `value-changed`
 * event, so the file travels in the field value and no upload endpoint is required. The original
 * file name is embedded as a data-URI parameter (`data:<mime>;name=<encoded>;base64,...` — RFC
 * 2397 allows parameters) so it can be shown again on re-render and offered as the download name.
 * DS-neutral: Lumo vars with fallbacks, shared by every renderer's field dispatch.
 *
 * UPLOAD MODE (design/uploads/file-uploads-contract.md): when the server gave the field an
 * `uploadTicket` (the app registered a FileStorage), the file is sent to `uploadUrl` instead —
 * streamed with a progress bar and a Cancel, or to the store's pre-signed target — and the value
 * becomes the `mateu-file:` reference the store returned, never the bytes. `multiple` makes the
 * value a list. Without a ticket a file over `maxBytes` (10 MB when undeclared) is refused.
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

    /** One entry, or a list of them for a `multiple` field. */
    @property()
    value: string | string[] | undefined

    /** Forwarded to the file input's accept attribute (from the field's `accept` attribute). */
    @property()
    accept: string | undefined

    @property({type: Boolean})
    editable = true

    /** The field's wire attributes (accept, maxBytes, multiple, uploadUrl, uploadTicket, uploadDirect). */
    @property({attribute: false})
    fieldAttributes: unknown

    /** The base url of the backend the UI talks to (a root-relative uploadUrl resolves against its origin). */
    @property()
    baseUrl: string | undefined

    /** The uploads in flight. */
    @state()
    private uploads: { key: number, name: string, fraction: number, controller: AbortController }[] = []

    @state()
    private error: string | undefined

    private nextKey = 0

    /** The display name: the `name=` data-URI parameter, a URL's last segment, or a fallback. */
    static fileName(value: string | undefined): string {
        if (!value) return ''
        const ref = parseFileRef(value)
        if (ref) return ref.name || ref.id
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
            return 'Attached file' // i18n-ok (a fallback file NAME, kept stable for links and tests)
        }
        return value.split('/').pop() || value
    }

    private config(): UploadConfig {
        const config = uploadConfigOf(this.fieldAttributes)
        return { ...config, accept: config.accept ?? (this.accept || undefined) }
    }

    private emit(value: unknown) {
        // keep our own copy current: several uploads may land before the host re-renders us
        this.value = value as string | string[]
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value, fieldId: this.fieldId },
            bubbles: true,
            composed: true
        }))
    }

    private api(): UploadApi {
        return {
            baseUrl: this.baseUrl ?? '',
            headers: async (extra: Record<string, string> = {}, url?: string) =>
                ({ ...extra, ...(url ? credentialHeadersFor(url) : {}) }),
        }
    }

    private filePicked = (e: Event) => {
        const input = e.target as HTMLInputElement
        const config = this.config()
        const picked = [...(input.files ?? [])]
        input.value = '' // allow re-selecting the same file
        const files = config.multiple ? picked : picked.slice(0, 1)
        this.error = undefined
        for (const file of files) {
            if (!acceptsFile(config.accept, file.name, file.type)) {
                this.error = chromeText('fileNotAccepted')
                continue
            }
            if (isUploadMode(config)) {
                if (config.maxBytes !== undefined && file.size > config.maxBytes) {
                    this.error = tooLargeMessage(config.maxBytes)
                    continue
                }
                this.upload(config, file)
            } else {
                const max = fallbackMaxBytes(config)
                if (file.size > max) {
                    this.error = tooLargeMessage(max)
                    continue
                }
                this.readInline(config, file)
            }
        }
    }

    private readInline(config: UploadConfig, file: File) {
        const reader = new FileReader()
        reader.onload = () => {
            const result = reader.result as string
            const comma = result.indexOf(',')
            // stamp the original file name as a data-URI parameter, before the base64 marker
            const meta = result.substring(0, comma)
                .replace(';base64', `;name=${encodeURIComponent(file.name)};base64`)
            this.emit(withFile(this.value, meta + result.substring(comma), config.multiple))
        }
        reader.readAsDataURL(file)
    }

    private async upload(config: UploadConfig, file: File) {
        const entry = { key: this.nextKey++, name: file.name, fraction: 0, controller: new AbortController() }
        this.uploads = [...this.uploads, entry]
        const progress = (fraction: number) => {
            this.uploads = this.uploads.map(u => u.key == entry.key ? { ...u, fraction } : u)
        }
        try {
            const value = await uploadFile(this.api(), config,
                { name: file.name, contentType: file.type || undefined, size: file.size, body: file },
                xhrTransport, progress, entry.controller.signal)
            this.emit(withFile(this.value, value, config.multiple))
        } catch (failure) {
            if (!(failure instanceof UploadCancelled)) {
                this.error = (failure as Error).message
            }
        } finally {
            this.uploads = this.uploads.filter(u => u.key != entry.key)
        }
    }

    private cancel(key: number) {
        this.uploads.find(u => u.key == key)?.controller.abort()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.uploads.forEach(u => u.controller.abort())
    }

    private triggerPick() {
        (this.renderRoot.querySelector('input[type=file]') as HTMLInputElement)?.click()
    }

    private renderEntry(value: string): TemplateResult {
        const name = MateuFileUpload.fileName(value)
        const ref = parseFileRef(value)
        const iconStyle = 'width: var(--lumo-icon-size-s, 1rem); height: var(--lumo-icon-size-s, 1rem); vertical-align: text-bottom;'
        if (ref) {
            const label = fileRefLabel(ref)
            return html`<span class="file" title="${label}">${dsIcon('vaadin:file-o', iconStyle)} ${isHttpUrl(ref.url)
                ? html`<a href="${ifDefined(safeHref(ref.url))}" target="_blank" rel="noopener noreferrer">${label}</a>`
                : html`<span>${label}</span>`}</span>`
        }
        const isDataUri = value.startsWith('data:')
        return html`<span class="file" title="${name}">${dsIcon('vaadin:file-o', iconStyle)} ${isDataUri
            ? html`<a href="${ifDefined(safeHref(value, { allowData: true }))}" download="${name}">${name}</a>`
            : html`<a href="${ifDefined(safeHref(value))}" target="_blank" rel="noopener noreferrer">${name}</a>`}</span>`
    }

    private renderProgress(): TemplateResult | typeof nothing {
        if (!this.uploads.length) return nothing
        return html`${this.uploads.map(u => html`
            <div class="row progress" role="status">
                <span class="file">${chromeTextf('uploadingFile', { name: u.name })}</span>
                <progress max="1" value="${u.fraction}" aria-label="${u.name}"></progress>
                <button class="button" @click="${() => this.cancel(u.key)}">${chromeText('cancel')}</button>
            </div>`)}`
    }

    render(): TemplateResult {
        const config = this.config()
        const entries = valuesOf(this.value)
        if (!this.editable) {
            return entries.length
                ? html`${entries.map(v => html`<div class="row">${this.renderEntry(v)}</div>`)}`
                : html`<span class="empty">—</span>`
        }
        const input = html`<input type="file" accept="${config.accept || nothing}" ?multiple="${config.multiple}"
                   style="display: none;" @change="${this.filePicked}">`
        const error = this.error ? html`<div class="error" role="alert">${this.error}</div>` : nothing
        if (config.multiple) {
            return html`
                ${input}
                ${entries.map((v, i) => html`
                    <div class="row">
                        ${this.renderEntry(v)}
                        <button class="button button--danger" @click="${() => this.emit(withoutFile(this.value, i, true))}">${chromeText('remove')}</button>
                    </div>`)}
                ${this.renderProgress()}
                <div class="row">
                    <button class="button" @click="${this.triggerPick}">${chromeText('chooseFiles')}</button>
                </div>
                ${error}`
        }
        const hasValue = entries.length > 0
        return html`
            ${input}
            <div class="row">
                ${hasValue ? this.renderEntry(entries[0]) : nothing}
                ${this.uploads.length ? nothing : html`<button class="button" @click="${this.triggerPick}">
                    ${hasValue ? chromeText('replace') : chromeText('chooseFile')}
                </button>`}
                ${hasValue && !this.uploads.length ? html`
                    <button class="button button--danger" @click="${() => this.emit('')}">${chromeText('remove')}</button>` : nothing}
            </div>
            ${this.renderProgress()}
            ${error}`
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
        .progress progress {
            flex: 1 1 8rem;
            min-width: 6rem;
            accent-color: var(--lumo-primary-color, rgb(0, 100, 200));
        }
        .error {
            color: var(--lumo-error-text-color, rgb(179, 49, 31));
            font-size: var(--lumo-font-size-s, 0.875rem);
            margin-top: 0.25rem;
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
