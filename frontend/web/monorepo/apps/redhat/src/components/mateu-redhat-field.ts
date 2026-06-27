import { customElement, property } from 'lit/decorators.js'
import { html, nothing, type TemplateResult, LitElement } from 'lit'
import FormField from '@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts'
import Option from '@mateu/shared/apiClients/dtos/componentmetadata/Option.ts'

type ValueChangedDetail = { value: unknown; fieldId: string | undefined }

/** PatternFly 6 form field: pf-v6-c-form__group + pf-v6-c-form-control / check / radio. Light DOM. */
@customElement('mateu-redhat-field')
export class MateuRedhatField extends LitElement {

    @property({ attribute: false }) field: FormField | undefined
    @property({ attribute: false }) state: any
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
        if (f.stereotype === 'plainText') return html`<div class="pf-v6-c-content"><p>${this.value ?? ''}</p></div>`
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
        const showLabel = !this.labelAlreadyRendered && !this.isCheckbox()
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
