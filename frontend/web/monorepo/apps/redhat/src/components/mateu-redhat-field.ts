import { customElement, property } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, LitElement } from 'lit'
import FormField from '@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts'
import Option from '@mateu/shared/apiClients/dtos/componentmetadata/Option.ts'
// Shared design-system-neutral widgets (Lumo vars + fallbacks) — reused so PatternFly gets the
// full field set instead of collapsing capture/tree fields to a plain text input.
import '@infra/ui/mateu-signature-pad.ts'
import '@infra/ui/mateu-camera-capture.ts'
import '@infra/ui/mateu-tree-select.ts'
import '@infra/ui/mateu-grid'

type ValueChangedDetail = { value: unknown; fieldId: string | undefined }

/** PatternFly 6 form field: pf-v6-c-form__group + pf-v6-c-form-control / check / radio. Light DOM. */
@customElement('mateu-redhat-field')
export class MateuRedhatField extends LitElement {

    @property({ attribute: false }) field: FormField | undefined
    @property({ attribute: false }) state: any
    @property({ attribute: false }) data: any
    @property({ attribute: false }) appState: any
    @property({ attribute: false }) appData: any
    @property({ attribute: false }) labelAlreadyRendered: boolean | undefined

    createRenderRoot() { return this }

    private get value(): any {
        const id = this.field?.fieldId
        if (id && this.state && id in this.state) return this.state[id]
        return this.field?.initialValue ?? ''
    }
    private emit(value: unknown) {
        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
            detail: { value, fieldId: this.field?.fieldId }, bubbles: true, composed: true,
        }))
    }
    private onInput = (e: Event) => this.emit((e.target as HTMLInputElement).value)
    private onNumber = (e: Event) => { const r = (e.target as HTMLInputElement).value; this.emit(r === '' ? null : Number(r)) }
    private onCheck = (e: Event) => this.emit((e.target as HTMLInputElement).checked)

    private get options(): Option[] { return this.field?.options ?? [] }
    private isCheckbox(): boolean { return this.field?.dataType === 'bool' || this.field?.stereotype === 'toggle' }
    private inputType(): string {
        const st = this.field?.stereotype, dt = this.field?.dataType
        if (st === 'email') return 'email'
        if (st === 'password') return 'password'
        if (dt === 'integer' || dt === 'number') return 'number'
        if (dt === 'date') return 'date'
        if (dt === 'dateTime') return 'datetime-local'
        if (dt === 'time') return 'time'
        return 'text'
    }

    private control(): TemplateResult {
        const f = this.field!
        const disabled = f.disabled || f.readOnly
        const editable = !disabled
        if (f.stereotype === 'grid') {
            // Delegate to the shared design-system-neutral grid (same contract as mateu-field's
            // grid branch) instead of falling through to a text input showing [object Object].
            return html`<mateu-grid id="${f.fieldId}" .field="${f}" .state="${this.state}" .data="${this.data}"
                                    .appState="${this.appState}" .appdata="${this.appData}"></mateu-grid>`
        }
        if (f.stereotype === 'badge') {
            const on = !!this.value
            return html`<span class="pf-v6-c-label ${on ? 'pf-m-green' : ''}" style="${on ? '' : 'opacity:.4;'}">
                <span class="pf-v6-c-label__content">${f.label ?? f.fieldId ?? ''}</span></span>`
        }
        if (f.stereotype === 'plainText') {
            const text = f.dataType === 'money' ? formatMoney(this.value)
                : (f.dataType === 'bool' || f.dataType === 'boolean') ? (this.value ? '✓' : '✗')
                : (this.value ?? '')
            return html`<div class="pf-v6-c-content"><p>${text}</p></div>`
        }
        if (f.stereotype === 'money' && !editable) return html`<div class="pf-v6-c-content"><p>${formatMoney(this.value)}</p></div>`
        // Shared DS-neutral widgets for the capture/tree/rich stereotypes.
        if (f.stereotype === 'signature') {
            return html`<mateu-signature-pad .fieldId="${f.fieldId}" .value="${this.value ?? ''}" .editable="${editable}"></mateu-signature-pad>`
        }
        if (f.stereotype === 'camera') {
            return html`<mateu-camera-capture .fieldId="${f.fieldId}" .value="${this.value ?? ''}" .editable="${editable}"></mateu-camera-capture>`
        }
        if (f.stereotype === 'treeSelect') {
            return html`<mateu-tree-select .fieldId="${f.fieldId}" .value="${this.value ?? ''}" .options="${this.options}" .leavesOnly="${(f as any).treeLeavesOnly === true}"></mateu-tree-select>`
        }
        if ((f.stereotype === 'image' || f.stereotype === 'uploadableImage') && this.value) {
            return html`<img src="${this.value}" style="max-width: 100%; max-height: 200px; border-radius: 4px;" />`
        }
        if (this.isCheckbox()) {
            return html`<div class="pf-v6-c-check">
                <input class="pf-v6-c-check__input" type="checkbox" id="${f.fieldId}_cb" .checked="${!!this.value}" ?disabled="${disabled}" @change="${this.onCheck}" />
                ${this.labelAlreadyRendered ? nothing : html`<label class="pf-v6-c-check__label" for="${f.fieldId}_cb">${f.label ?? ''}</label>`}
            </div>`
        }
        if (f.stereotype === 'textarea') {
            return html`<span class="pf-v6-c-form-control pf-m-resize-both"><textarea ?disabled="${disabled}" placeholder="${f.placeholder ?? ''}" @input="${this.onInput}">${this.value ?? ''}</textarea></span>`
        }
        if (f.stereotype === 'radio' && this.options.length) {
            return html`${this.options.map(o => html`<div class="pf-v6-c-radio">
                <input class="pf-v6-c-radio__input" type="radio" name="${f.fieldId}" value="${o.value}" .checked="${this.value === o.value}" ?disabled="${disabled}" @change="${() => this.emit(o.value)}" />
                <label class="pf-v6-c-radio__label">${o.label}</label>
            </div>`)}`
        }
        if (this.options.length) {
            return html`<span class="pf-v6-c-form-control">
                <select ?disabled="${disabled}" @change="${this.onInput}">
                    <option value=""></option>
                    ${this.options.map(o => html`<option value="${o.value}" .selected="${this.value === o.value}">${o.label}</option>`)}
                </select>
            </span>`
        }
        const numeric = f.dataType === 'integer' || f.dataType === 'number'
        return html`<span class="pf-v6-c-form-control">
            <input type="${this.inputType()}" .value="${this.value ?? ''}" placeholder="${f.placeholder ?? ''}"
                   ?disabled="${disabled}" ?required="${f.required}"
                   @input="${numeric ? this.onNumber : this.onInput}" />
        </span>`
    }

    render() {
        const f = this.field
        if (!f) return nothing
        const showLabel = !this.labelAlreadyRendered && !this.isCheckbox() && f.stereotype !== 'badge'
        return html`
            <div class="pf-v6-c-form__group">
                ${showLabel ? html`
                    <div class="pf-v6-c-form__group-label">
                        <label class="pf-v6-c-form__label" for="${f.fieldId}">
                            <span class="pf-v6-c-form__label-text">${f.label ?? ''}</span>
                            ${f.required ? html`<span class="pf-v6-c-form__label-required" aria-hidden="true"> *</span>` : nothing}
                        </label>
                    </div>` : nothing}
                <div class="pf-v6-c-form__group-control">
                    ${this.control()}
                    ${f.description ? html`<div class="pf-v6-c-form__helper-text">${f.description}</div>` : nothing}
                </div>
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-redhat-field': MateuRedhatField }
}

/** de-DE thousands + 2 decimals, for money read-only rendering. */
function formatMoney(v: unknown): string {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
    if (isNaN(n)) return String(v ?? '')
    try { return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) }
    catch { return n.toFixed(2) }
}
