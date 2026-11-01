import { html, nothing, TemplateResult } from 'lit'
import { interpolate, templateResolver } from '@components/interpolation'
import { fetchExternalOptions, mapItemsToOptions } from '@mateu/ui/infra/http/externalOptions'
import { resolveRestSource, viaProxy } from '@mateu/ui/infra/http/restSourceCatalogue'
import UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement.ts'
import type Option from '@mateu/shared/apiClients/dtos/componentmetadata/Option.ts'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** A string chosen among options: inline, a REST source, or the server (remote coordinates). */

/** A string field with no stereotype of its own that nonetheless brings options: a select. */
export const offersItsOptions = (field: { stereotype?: string, options?: unknown[] } | undefined): boolean =>
    !!field && (!field.stereotype || field.stereotype === 'regular')
    && Array.isArray(field.options) && field.options.length > 0

/**
 * The options of a field fed by a REST source (`optionsSource`), fetched CLIENT-SIDE (no Mateu
 * server mediating) into `host.data[host.id].content`: what is loaded so far, `[]` until it lands.
 * Refetched only when the interpolated url changes (a state-dependent source), keyed by a signature
 * so re-renders don't loop. Shared by every stereotype that offers options — a select, a combobox,
 * a multi-select — so none of them silently ignores a source.
 */
export function sourcedOptions(host: MateuField): Option[] {
    if (!host.field?.optionsSource) return []
    const src = host.field.optionsSource
    // the url may live in the catalogue entry the field names by `ref`
    const url = (resolveRestSource(src) ?? src).url
    const signature = (interpolate(url, host.state, host.data) ?? url) || `ref:${src.ref ?? ''}`
    if (host.data[host.id]?.sourceSignature !== signature) {
        host.data[host.id] = { content: host.data[host.id]?.content ?? [], sourceSignature: signature }
        // the RESOLVED source decides: a field naming a catalogue entry by `ref`
        // carries only the name, and the entry is where `proxy` lives — read off the
        // declared one, a keyed entry was fetched directly with its `${secret.X}`
        // placeholder as the header (401) (viaProxy also honours sample mode)
        if (viaProxy(src)) {
            // Proxy mode: route the fetch through the Mateu server (no CORS, secrets
            // injected server-side). Dispatch the reserved __restfetch__ action; the
            // app fills route/serverSideType/componentState and the server resolves the
            // DECLARED source, so nothing but _sourceKind/_sourceId leaves the browser.
            host.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId: '__restfetch__',
                    parameters: { _sourceKind: 'options', _sourceId: host.field.fieldId },
                    callback: (uiIncrement: UIIncrement) => {
                        const json = uiIncrement?.appData?.['_restfetch']
                        const resolved = resolveRestSource(src) ?? src
                        const opts = mapItemsToOptions(json, resolved.itemsPath, resolved.valuePath, resolved.labelPath)
                        host.data[host.id] = { content: opts, totalElements: opts.length, sourceSignature: signature }
                        host.requestUpdate()
                    },
                    callbackonly: true
                },
                bubbles: true,
                composed: true
            }))
        } else {
            fetchExternalOptions(src, templateResolver(host.state, host.data))
                .then((opts) => {
                    host.data[host.id] = { content: opts, totalElements: opts.length, sourceSignature: signature }
                    host.requestUpdate()
                })
                .catch((e) => console.warn('mateu: external options fetch failed', e))
        }
    }
    return host.data[host.id]?.content ?? []
}

/**
 * vaadin-select (and vaadin-combo-box) match their value against the items' values as STRINGS, so
 * an option whose value is a number (an id from a REST source, `{value: 25}`) never matched the
 * field's value and the control showed blank. The control gets the values as strings…
 */
export const asSelectItems = <T extends { value?: unknown }>(options: T[] | undefined): T[] | undefined => {
    // the same array back when nothing changes (the usual case), and the same copy for the same
    // options: a fresh array on every render would make the control rebuild its items each time
    if (!options || options.every(o => o.value == null || typeof o.value === 'string')) return options
    let copy = stringKeyed.get(options) as T[] | undefined
    if (!copy) {
        copy = options.map(o => o.value == null || typeof o.value === 'string' ? o : { ...o, value: String(o.value) })
        stringKeyed.set(options, copy)
    }
    return copy
}
const stringKeyed = new WeakMap<object, unknown[]>()

/** …and the field's value as a string too (nothing stays nothing)… */
export const asSelectValue = (value: unknown): unknown =>
    value == null || typeof value === 'string' || typeof value === 'object' ? value : String(value)

/** …and what the control picks goes back as the option's OWN value (25, not "25"). */
export const optionValueOf = (options: { value?: unknown }[] | undefined, picked: unknown): unknown => {
    if (picked == null || picked === '') return picked
    const hit = options?.find(option => option.value != null && String(option.value) === String(picked))
    return hit ? hit.value : picked
}

/** The control's value-changed, re-announced with the option's own value. */
export const selectValueChanged = (host: MateuField, options: { value?: unknown }[] | undefined) =>
    (e: CustomEvent) => host.valueChanged(new CustomEvent('value-changed', {
        detail: { ...e.detail, value: optionValueOf(options, e.detail?.value) },
    }))

/** The options a multi-valued field's value picks, matched as strings (`[5, 11]` picks `{value: 5}`). */
export const pickedOptionsOf = <T extends { value?: unknown }>(options: T[] | undefined, value: unknown): T[] => {
    if (!Array.isArray(value) || value.length === 0 || !options) return noneSelected as T[]
    // the same picks for the same value and options, for the same reason as asSelectValues
    const cached = pickedCache.get(value)
    if (cached && cached.options === options) return cached.picked as T[]
    const picked = new Set(value.map(v => String(v)))
    const hits = options.filter(o => o.value != null && picked.has(String(o.value)))
    pickedCache.set(value, { options, picked: hits })
    return hits
}
const noneSelected: never[] = []
const pickedCache = new WeakMap<unknown[], { options: unknown[], picked: unknown[] }>()

/**
 * A multi-valued control that speaks strings (vaadin-checkbox-group): the value as strings… The
 * same array back when it already is (the usual case), and the same copy for the same value: a
 * fresh array on every render made the group announce a value-changed, which re-rendered the
 * field with another fresh array — a loop that froze the page.
 */
export const asSelectValues = (value: unknown): unknown => {
    if (!Array.isArray(value) || value.every(v => v == null || typeof v === 'string' || typeof v === 'object')) return value
    let copy = stringValues.get(value)
    if (!copy) {
        copy = value.map(v => asSelectValue(v))
        stringValues.set(value, copy)
    }
    return copy
}
const stringValues = new WeakMap<unknown[], unknown[]>()

/**
 * What a multi-valued control picks, as the options' own values — the SAME array when no value
 * changes: the field takes an identical array for "nothing changed", and a fresh copy of the value
 * the control was just given read as an edit, re-rendered the field and made the control announce
 * it again (a loop that froze the page).
 */
export const optionValuesOf = (options: { value?: unknown }[] | undefined, picked: unknown): unknown => {
    if (!Array.isArray(picked)) return picked
    const mapped = picked.map(v => optionValueOf(options, v))
    return mapped.every((v, i) => v === picked[i]) ? picked : mapped
}

/** …and what it picks goes back as the options' own values. */
export const selectValuesChanged = (host: MateuField, options: { value?: unknown }[] | undefined) =>
    (e: CustomEvent) => host.valueChanged(new CustomEvent('value-changed', {
        detail: {
            ...e.detail,
            value: optionValuesOf(options, e.detail?.value),
        },
    }))

// a plain string field that comes WITH options (a fluent FormField built with them — the
// GeneralOverview record switcher — or an OptionsSupplier's) is a choice among them: as a
// text field it showed the raw value ("r1") and the options went nowhere
export function renderSelectField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    // options from an arbitrary REST endpoint (sourcedOptions), from the server (remote
    // coordinates) or inline
    let options: Option[] | undefined
    if (host.field.optionsSource) {
        options = sourcedOptions(host)
    } else if (host.field.remoteCoordinates) {
        host.requestRemoteOptions(host.field.remoteCoordinates.action)
        options = host.data[host.id]?.content
    } else {
        options = host.field.options
    }
    let realValue = value
    if (value && value.value) {
        realValue = value.value
    }
    return html`
        <vaadin-select
                placeholder="${host.field?.placeholder ?? nothing}"
                id="${host.field.fieldId}"
                label="${label}"
                item-label-path="label"
                item-value-path="value"
                .items="${asSelectItems(options)}"
                .helperText="${host.helperText()}"
                @value-changed="${selectValueChanged(host, options)}"
                .value="${asSelectValue(realValue)}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        ></vaadin-select>
    `
}
