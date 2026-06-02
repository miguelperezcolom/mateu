import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { html, TemplateResult } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";

const makeDataProvider = (items: { value: unknown; label: string }[]) => {
    const req = (window as any).require
    if (!req) return null
    try {
        const ADP = req('ojs/ojarraydataprovider')
        return new ADP(items, { keyAttributes: 'value' })
    } catch {
        return null
    }
}

const valueChanged = (event: Event, fieldId: string, value: unknown) => {
    event.target?.dispatchEvent(new CustomEvent('value-changed', {
        detail: { value, fieldId },
        bubbles: true,
        composed: true
    }))
}

export const renderField = (component: ClientSideComponent, _baseUrl: string | undefined, state: any, _data: any): TemplateResult => {
    const metadata = component.metadata as FormField
    const fieldId = metadata?.fieldId ?? ''
    const value = state && fieldId in state ? state[fieldId] : metadata?.initialValue
    const label = metadata.label ?? ''
    const id = component.id ?? fieldId

    if (metadata.dataType === 'string') {
        if (metadata.stereotype === 'textarea') {
            return html`<oj-c-text-area
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? ''}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                ?readonly="${metadata.readOnly}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-text-area>`
        }
        if (metadata.stereotype === 'password') {
            return html`<oj-c-input-password
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? ''}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-input-password>`
        }
        if (metadata.stereotype === 'select') {
            const dp = makeDataProvider(metadata.options?.map(o => ({ value: o.value, label: o.label ?? '' })) ?? [])
            return html`<oj-c-select-single
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? null}"
                item-text="label"
                .data="${dp}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-select-single>`
        }
        if (metadata.stereotype === 'combobox') {
            const dp = makeDataProvider(metadata.options?.map(o => ({ value: o.value, label: o.label ?? '' })) ?? [])
            return html`<oj-c-select-single
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? null}"
                item-text="label"
                .data="${dp}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-select-single>`
        }
        if (metadata.stereotype === 'radio') {
            return html`<oj-c-radioset
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? null}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            >
                ${metadata.options?.map(o => html`<oj-option value="${o.value}">${o.label}</oj-option>`)}
            </oj-c-radioset>`
        }
        if (metadata.stereotype === 'html') {
            return html`<div id="${id}">${unsafeHTML(String(value ?? ''))}</div>`
        }
        if (metadata.stereotype === 'image') {
            return html`<figure>
                <figcaption style="font-size:0.75rem;color:#666;">${label}</figcaption>
                <img src="${value}" alt="${label}" style="${metadata.style ?? ''}" />
            </figure>`
        }
        if (metadata.stereotype === 'color') {
            return html`<div>
                <label for="${id}" style="display:block;font-size:0.75rem;color:#666;margin-bottom:4px;">${label}</label>
                <input id="${id}" type="color" .value="${value ?? '#000000'}"
                    @input="${(e: Event) => valueChanged(e, id, (e.target as HTMLInputElement).value)}" />
            </div>`
        }
        if (metadata.stereotype === 'link') {
            return html`<div>
                <div style="font-size:0.75rem;color:#666;margin-bottom:4px;">${label}</div>
                <a href="${value}" target="_blank">${value}</a>
            </div>`
        }
        return html`<oj-c-input-text
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? ''}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            ?readonly="${metadata.readOnly}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-text>`
    }

    if (metadata.dataType === 'number') {
        return html`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-number>`
    }

    if (metadata.dataType === 'integer') {
        if (metadata.stereotype === 'slider') {
            return html`<div>
                <label for="${id}" style="display:block;font-size:0.75rem;color:#666;margin-bottom:4px;">${label}</label>
                <input id="${id}" type="range"
                    min="${metadata.sliderMin ?? 0}"
                    max="${metadata.sliderMax ?? 10}"
                    .value="${String(value ?? 0)}"
                    @input="${(e: Event) => valueChanged(e, id, parseInt((e.target as HTMLInputElement).value))}" />
            </div>`
        }
        return html`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            step="1"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-number>`
    }

    if (metadata.dataType === 'bool') {
        if (metadata.stereotype === 'toggle') {
            return html`<div>
                <div style="font-size:0.75rem;color:#666;margin-bottom:4px;">${label}</div>
                <oj-c-toggle-button
                    data-oj-binding-provider="preact"
                    id="${id}"
                    label="${label}"
                    .value="${!!value}"
                    ?disabled="${metadata.disabled}"
                    @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
                ></oj-c-toggle-button>
            </div>`
        }
        return html`<oj-c-checkbox
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            .value="${!!value}"
            ?disabled="${metadata.disabled}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        >${label}</oj-c-checkbox>`
    }

    if (metadata.dataType === 'date') {
        return html`<oj-c-input-date-text
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-date-text>`
    }

    if (metadata.dataType === 'dateTime') {
        const dtValue = value as string | undefined
        const datePart = dtValue ? dtValue.split('T')[0] : null
        const timePart = dtValue ? dtValue.split('T')[1]?.substring(0, 5) : null
        return html`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-text
                data-oj-binding-provider="preact"
                id="${id}_date"
                label-hint="${label}"
                label-edge="top"
                .value="${datePart}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value + 'T' + (timePart ?? '00:00'))}"
            ></oj-c-input-date-text>
            <oj-c-input-time-mask
                data-oj-binding-provider="preact"
                id="${id}_time"
                label-hint="Time"
                label-edge="top"
                .value="${timePart}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, (datePart ?? '') + 'T' + e.detail.value)}"
            ></oj-c-input-time-mask>
        </div>`
    }

    if (metadata.dataType === 'time') {
        return html`<oj-c-input-time-mask
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-time-mask>`
    }

    if (metadata.dataType === 'dateRange') {
        const range = value as { from: string; to: string } | undefined
        return html`<div style="display:flex;gap:0.5rem;align-items:flex-end;">
            <oj-c-input-date-text
                data-oj-binding-provider="preact"
                id="${id}_from"
                label-hint="${label} From"
                label-edge="top"
                .value="${range?.from ?? null}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, { ...range, from: e.detail.value })}"
            ></oj-c-input-date-text>
            <oj-c-input-date-text
                data-oj-binding-provider="preact"
                id="${id}_to"
                label-hint="${label} To"
                label-edge="top"
                .value="${range?.to ?? null}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, { ...range, to: e.detail.value })}"
            ></oj-c-input-date-text>
        </div>`
    }

    if (metadata.dataType === 'array') {
        if (metadata.stereotype === 'combobox') {
            const dp = makeDataProvider(metadata.options?.map(o => ({ value: o.value, label: o.label ?? '' })) ?? [])
            return html`<oj-c-select-multiple
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? []}"
                item-text="label"
                .data="${dp}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-select-multiple>`
        }
        if (metadata.stereotype === 'select' || metadata.stereotype === 'listBox') {
            const dp = makeDataProvider(metadata.options?.map(o => ({ value: o.value, label: o.label ?? '' })) ?? [])
            return html`<oj-c-select-multiple
                data-oj-binding-provider="preact"
                id="${id}"
                label-hint="${label}"
                label-edge="top"
                .value="${value ?? []}"
                item-text="label"
                .data="${dp}"
                ?required="${metadata.required}"
                ?disabled="${metadata.disabled}"
                @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
            ></oj-c-select-multiple>`
        }
        return html`<oj-c-checkboxset
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? []}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        >
            ${metadata.options?.map(o => html`<oj-option value="${o.value}">${o.label}</oj-option>`)}
        </oj-c-checkboxset>`
    }

    if (metadata.dataType === 'status') {
        const status = value as { message: string; type: string } | undefined
        const severityMap: Record<string, string> = { danger: 'error', success: 'success', warning: 'warning', info: 'info' }
        const severity = severityMap[status?.type ?? ''] ?? 'info'
        return html`<div id="${id}">
            <div style="font-size:0.75rem;color:#666;margin-bottom:4px;">${label}</div>
            ${status ? html`<oj-c-badge
                data-oj-binding-provider="preact"
                .value="${status.message}"
                severity="${severity}"
            ></oj-c-badge>` : html``}
        </div>`
    }

    if (metadata.dataType === 'money') {
        if (metadata.readOnly) {
            const amount = value as any
            let formatted = ''
            if (amount?.locale && amount?.currency) {
                formatted = new Intl.NumberFormat(amount.locale, { style: 'currency', currency: amount.currency }).format(amount.value)
            } else if (amount != null) {
                formatted = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
            }
            return html`<div id="${id}">
                <div style="font-size:0.75rem;color:#666;">${label}</div>
                <div style="text-align:right;font-weight:bold;">${formatted}</div>
            </div>`
        }
        return html`<oj-c-input-number
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            label-edge="top"
            .value="${value ?? null}"
            ?required="${metadata.required}"
            ?disabled="${metadata.disabled}"
            @ojValueAction="${(e: CustomEvent) => valueChanged(e, id, e.detail.value)}"
        ></oj-c-input-number>`
    }

    if (metadata.dataType === 'file') {
        return html`<oj-c-file-picker
            data-oj-binding-provider="preact"
            id="${id}"
            label-hint="${label}"
            ?disabled="${metadata.disabled}"
            @ojSelect="${(e: CustomEvent) => {
                const file = e.detail.files?.[0]
                valueChanged(e, id, file ? { name: file.name, size: file.size } : null)
            }}"
        ></oj-c-file-picker>`
    }

    if (metadata.dataType === 'range') {
        const range = value as { from: number; to: number } | undefined
        return html`<div>
            <div style="font-size:0.75rem;color:#666;margin-bottom:4px;">${label}</div>
            <div style="display:flex;gap:1rem;align-items:center;">
                <input type="range"
                    min="${metadata.sliderMin ?? 0}" max="${metadata.sliderMax ?? 10}"
                    .value="${String(range?.from ?? 0)}"
                    @input="${(e: Event) => valueChanged(e, id, { ...range, from: parseInt((e.target as HTMLInputElement).value) })}" />
                <input type="range"
                    min="${metadata.sliderMin ?? 0}" max="${metadata.sliderMax ?? 10}"
                    .value="${String(range?.to ?? 0)}"
                    @input="${(e: Event) => valueChanged(e, id, { ...range, to: parseInt((e.target as HTMLInputElement).value) })}" />
            </div>
        </div>`
    }

    return html`<p>Unknown field type: ${metadata.dataType} / ${metadata.stereotype}</p>`
}
