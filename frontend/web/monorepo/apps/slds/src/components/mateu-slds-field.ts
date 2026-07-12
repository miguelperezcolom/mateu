import { customElement, property } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import { LitElement } from 'lit'
import FormField from '@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts'
import Option from '@mateu/shared/apiClients/dtos/componentmetadata/Option.ts'
// Shared design-system-neutral widgets (Lumo vars + fallbacks) — reused so SLDS gets the full
// field set instead of collapsing capture/tree fields to a plain text input.
import '@infra/ui/mateu-signature-pad.ts'
import '@infra/ui/mateu-camera-capture.ts'
import '@infra/ui/mateu-tree-select.ts'
import '@infra/ui/mateu-grid'

type ValueChangedDetail = { value: unknown; fieldId: string | undefined }

/**
 * SLDS 2 form field. Renders native markup with slds-form-element / slds-input / slds-select /
 * slds-checkbox classes (so the global SLDS stylesheet styles it) and emits the same
 * `value-changed` event the rest of Mateu listens for. Light DOM, like the rest of the SLDS shell.
 */
@customElement('mateu-slds-field')
export class MateuSldsField extends LitElement {

    @property({ attribute: false }) field: FormField | undefined
    @property({ attribute: false }) state: any
    @property({ attribute: false }) data: any
    @property({ attribute: false }) labelAlreadyRendered: boolean | undefined

    createRenderRoot() {
        return this
    }

    private get value(): any {
        const fieldId = this.field?.fieldId
        if (fieldId && this.state && fieldId in this.state) return this.state[fieldId]
        return this.field?.initialValue ?? ''
    }

    private emit(value: unknown) {
        this.dispatchEvent(new CustomEvent<ValueChangedDetail>('value-changed', {
            detail: { value, fieldId: this.field?.fieldId },
            bubbles: true,
            composed: true,
        }))
    }

    private onInput = (e: Event) => this.emit((e.target as HTMLInputElement).value)
    private onNumberInput = (e: Event) => {
        const raw = (e.target as HTMLInputElement).value
        this.emit(raw === '' ? null : Number(raw))
    }
    private onCheckbox = (e: Event) => this.emit((e.target as HTMLInputElement).checked)

    private get options(): Option[] {
        return this.field?.options ?? []
    }

    private hasOptions(): boolean {
        return this.options.length > 0
    }

    private isCheckbox(): boolean {
        const st = this.field?.stereotype
        return this.field?.dataType === 'bool' || st === 'toggle'
    }

    private inputType(): string {
        const st = this.field?.stereotype
        if (st === 'email') return 'email'
        if (st === 'password') return 'password'
        if (this.field?.dataType === 'integer' || this.field?.dataType === 'number') return 'number'
        if (this.field?.dataType === 'date') return 'date'
        if (this.field?.dataType === 'dateTime') return 'datetime-local'
        if (this.field?.dataType === 'time') return 'time'
        return 'text'
    }

    // ── controls ──────────────────────────────────────────────────────────────

    private renderControl(): TemplateResult {
        const f = this.field!
        const disabled = f.disabled || f.readOnly
        const editable = !disabled

        if (f.stereotype === 'grid') {
            // Delegate to the shared design-system-neutral grid (same contract as mateu-field's
            // grid branch) instead of falling through to a text input showing [object Object].
            return html`<mateu-grid id="${f.fieldId}" .field="${f}" .state="${this.state}" .data="${this.data}"></mateu-grid>`
        }
        if (f.stereotype === 'badge') {
            const on = !!this.value
            return html`<span class="slds-badge ${on ? 'slds-theme_success' : ''}" style="${on ? '' : 'opacity:.4;'}">${f.label ?? f.fieldId ?? ''}</span>`
        }
        // Read-only / plain text (money formats, booleans as ✓/✗)
        if (f.stereotype === 'plainText') {
            const text = f.dataType === 'money' ? formatSldsMoney(this.value)
                : (f.dataType === 'bool' || f.dataType === 'boolean') ? (this.value ? '✓' : '✗')
                : (this.value ?? '')
            return html`<div class="slds-form-element__static">${text}</div>`
        }
        if (f.stereotype === 'money' && !editable) {
            return html`<div class="slds-form-element__static">${formatSldsMoney(this.value)}</div>`
        }
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

        // Checkbox / toggle
        if (this.isCheckbox()) {
            return html`
                <label class="slds-checkbox_toggle slds-grid">
                    <input type="checkbox"
                           .checked="${!!this.value}"
                           ?disabled="${disabled}"
                           @change="${this.onCheckbox}" />
                    <span class="slds-checkbox_faux_container" aria-live="assertive">
                        <span class="slds-checkbox_faux"></span>
                    </span>
                </label>`
        }

        // Textarea
        if (f.stereotype === 'textarea') {
            return html`<textarea class="slds-textarea"
                                  placeholder="${f.placeholder ?? ''}"
                                  ?disabled="${disabled}"
                                  @input="${this.onInput}">${this.value ?? ''}</textarea>`
        }

        // Radio group
        if (f.stereotype === 'radio' && this.hasOptions()) {
            return html`
                <div class="slds-form-element__control">
                    ${this.options.map(o => html`
                        <span class="slds-radio">
                            <input type="radio" name="${f.fieldId}"
                                   value="${o.value}"
                                   .checked="${this.value === o.value}"
                                   ?disabled="${disabled}"
                                   @change="${() => this.emit(o.value)}" />
                            <label class="slds-radio__label">
                                <span class="slds-radio_faux"></span>
                                <span class="slds-form-element__label">${o.label}</span>
                            </label>
                        </span>`)}
                </div>`
        }

        // Select / combo
        if (this.hasOptions()) {
            return html`
                <div class="slds-select_container">
                    <select class="slds-select" ?disabled="${disabled}" @change="${this.onInput}">
                        <option value=""></option>
                        ${this.options.map(o => html`
                            <option value="${o.value}" .selected="${this.value === o.value}">${o.label}</option>`)}
                    </select>
                </div>`
        }

        // Plain inputs (text/email/password/number/date/time)
        const numeric = f.dataType === 'integer' || f.dataType === 'number'
        return html`<input class="slds-input"
                           type="${this.inputType()}"
                           .value="${this.value ?? ''}"
                           placeholder="${f.placeholder ?? ''}"
                           ?disabled="${disabled}"
                           ?required="${f.required}"
                           min="${f.min ?? nothing}"
                           max="${f.max ?? nothing}"
                           @input="${numeric ? this.onNumberInput : this.onInput}" />`
    }

    render() {
        const f = this.field
        if (!f) return nothing

        // Checkbox renders its own inline label; keep the form-element wrapper minimal.
        const showLabel = !this.labelAlreadyRendered && !this.isCheckbox()

        return html`
            <div class="slds-form-element ${f.required ? 'slds-is-required' : ''}">
                ${showLabel ? html`
                    <label class="slds-form-element__label" for="${f.fieldId}">
                        ${f.required ? html`<abbr class="slds-required" title="required">* </abbr>` : nothing}
                        ${f.label ?? ''}
                    </label>` : nothing}
                <div class="slds-form-element__control">
                    ${this.isCheckbox() && !this.labelAlreadyRendered
                        ? html`<span class="slds-form-element__label" style="margin-right:.5rem;">${f.label ?? ''}</span>`
                        : nothing}
                    ${this.renderControl()}
                </div>
                ${f.description ? html`<div class="slds-form-element__help">${f.description}</div>` : nothing}
            </div>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-slds-field': MateuSldsField
    }
}

/** de-DE thousands + 2 decimals, for money read-only rendering. */
function formatSldsMoney(v: unknown): string {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? ''))
    if (isNaN(n)) return String(v ?? '')
    try { return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n) }
    catch { return n.toFixed(2) }
}
