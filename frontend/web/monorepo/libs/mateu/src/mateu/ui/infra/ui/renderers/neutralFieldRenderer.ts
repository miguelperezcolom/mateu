import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option";
import { html, nothing } from "lit";
import { ComponentState } from "@infra/ui/renderers/types.ts";

/*
 * Design-system-neutral FormField renderer — native form controls (<input>/<select>/<textarea>)
 * chosen by the field's dataType/stereotype, no `@vaadin`. The Vaadin adapter overrides FormField
 * with the full-featured <mateu-field> element; sapui5 has its own renderField. This is the safe
 * default any other renderer inherits: functional binding via the shared value-changed event.
 */

const emit = (fieldId: string, value: unknown, el: HTMLElement) => {
    el.dispatchEvent(new CustomEvent('value-changed', {
        detail: { fieldId, value }, bubbles: true, composed: true,
    }))
}

const onInput = (field: FormField) => (e: Event) => {
    const t = e.target as HTMLInputElement
    const value = t.type === 'checkbox' ? t.checked : t.value
    emit(field.fieldId, value, t)
}

export const renderNeutralField = (component: ClientSideComponent, state: ComponentState) => {
    const field = component.metadata as FormField
    const value = (state?.[field.fieldId] ?? '') as unknown
    const anyField = field as unknown as Record<string, any>
    const dataType = anyField.dataType as string | undefined
    const stereotype = anyField.stereotype as string | undefined
    const readOnly = !!anyField.readOnly
    const disabled = !!anyField.disabled
    const options = (anyField.options as Option[] | undefined)

    const labelHtml = field.label ? html`<label style="display:block; font-size: var(--lumo-font-size-s,.875rem); color: var(--lumo-secondary-text-color,#667); margin-bottom:.15rem;">${field.label}</label>` : nothing
    const inputStyle = 'width:100%; box-sizing:border-box; padding:.4rem .6rem; border:1px solid var(--lumo-contrast-30pct,rgba(0,0,0,.3)); border-radius: var(--lumo-border-radius-m,6px); font:inherit; background: var(--lumo-base-color,#fff); color: var(--lumo-body-text-color,#1a1a1a);'

    let control
    if (readOnly || stereotype === 'plainText') {
        control = html`<div style="padding:.4rem 0;">${String(value ?? '')}</div>`
    } else if (dataType === 'boolean' || stereotype === 'checkbox' || stereotype === 'badge') {
        control = html`<input type="checkbox" ?checked="${!!value}" ?disabled="${disabled}" @change="${onInput(field)}">`
    } else if (options && options.length) {
        control = html`
            <select style="${inputStyle}" ?disabled="${disabled}" @change="${onInput(field)}">
                <option value="">—</option>
                ${options.map(o => html`<option value="${o.value as any}" ?selected="${o.value === value}">${o.label}</option>`)}
            </select>`
    } else if (stereotype === 'textarea' || stereotype === 'richText' || stereotype === 'html') {
        control = html`<textarea style="${inputStyle}" rows="3" ?disabled="${disabled}" @input="${onInput(field)}">${String(value ?? '')}</textarea>`
    } else {
        const inputType =
            dataType === 'integer' || dataType === 'number' || dataType === 'double' || dataType === 'money' ? 'number'
            : dataType === 'date' ? 'date'
            : dataType === 'datetime' ? 'datetime-local'
            : dataType === 'time' ? 'time'
            : stereotype === 'password' ? 'password'
            : dataType === 'email' ? 'email'
            : 'text'
        control = html`<input type="${inputType}" style="${inputStyle}" .value="${String(value ?? '')}"
                              placeholder="${anyField.placeholder ?? nothing}" ?disabled="${disabled}" @input="${onInput(field)}">`
    }

    return html`
        <div style="${component.style}" class="${component.cssClasses}" slot="${component.slot ?? nothing}">
            ${labelHtml}
            ${control}
        </div>
    `
}
