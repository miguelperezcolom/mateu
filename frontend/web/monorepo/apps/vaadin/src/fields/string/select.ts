import { html, nothing, TemplateResult } from 'lit'
import { interpolate, templateResolver } from '@components/interpolation'
import { fetchExternalOptions, mapItemsToOptions } from '@mateu/ui/infra/http/externalOptions'
import { resolveRestSource, viaProxy } from '@mateu/ui/infra/http/restSourceCatalogue'
import UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement.ts'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'

/** A string chosen among options: inline, a REST source, or the server (remote coordinates). */

/** A string field with no stereotype of its own that nonetheless brings options: a select. */
export const offersItsOptions = (field: { stereotype?: string, options?: unknown[] } | undefined): boolean =>
    !!field && (!field.stereotype || field.stereotype === 'regular')
    && Array.isArray(field.options) && field.options.length > 0

// a plain string field that comes WITH options (a fluent FormField built with them — the
// GeneralOverview record switcher — or an OptionsSupplier's) is a choice among them: as a
// text field it showed the raw value ("r1") and the options went nowhere
export function renderSelectField(host: MateuField, value: FieldValue, label: FieldLabel): TemplateResult {
    if (!host.field) return html``
    if (host.field?.optionsSource) {
        // Options from an arbitrary REST endpoint, fetched CLIENT-SIDE (no Mateu server
        // mediating). Refetch only when the interpolated url changes (a state-dependent
        // source), keyed by a signature so re-renders don't loop.
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
                .items="${host.data[host.id]?.content ?? []}"
                .helperText="${host.helperText()}"
                @value-changed="${host.valueChanged}"
                .value="${realValue}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        ></vaadin-select>
        `
    }
    if (host.field?.remoteCoordinates) {
        const coords = host.field.remoteCoordinates;
        host.requestRemoteOptions(coords.action)

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
                .items="${host.data[host.id]?.content}"
                .helperText="${host.helperText()}"
                @value-changed="${host.valueChanged}"
                .value="${realValue}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        ></vaadin-select>
        `
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
                .items="${host.field.options}"
                .helperText="${host.helperText()}"
                @value-changed="${host.valueChanged}"
                .value="${realValue}"
                ?autofocus="${host.field.wantsFocus}"
                required="${host.field.required || nothing}"
                data-colspan="${host.field.colspan}"
        ></vaadin-select>
    `
}
