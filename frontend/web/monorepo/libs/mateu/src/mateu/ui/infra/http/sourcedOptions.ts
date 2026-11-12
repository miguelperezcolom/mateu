import type RestDataSource from '@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts'
import type UIIncrement from '@mateu/shared/apiClients/dtos/UIIncrement.ts'
import { interpolate, templateResolver } from '../ui/interpolation.ts'
import { fetchExternalOptions, mapItemsToOptions, type FetchedOption } from './externalOptions.ts'
import { resolveRestSource, viaProxy } from './restSourceCatalogue.ts'

/** What a control that offers a REST source's options needs: its state, a data slot, a re-render. */
export interface SourcedOptionsHost extends EventTarget {
    state?: Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- the host component's own data bag (LitElement property), any by contract
    data?: Record<string, any>
    requestUpdate(): void
}

/**
 * The options of a field fed by a REST source (`optionsSource`), fetched CLIENT-SIDE into
 * `host.data[key].content`: what is loaded so far, `[]` until it lands. Refetched only when the
 * interpolated url changes (a state-dependent source), keyed by a signature so re-renders don't
 * loop. Every control that offers options uses it — single selects, multi-selects, list boxes,
 * comboboxes, choice cards — so none of them silently ignores a source.
 *
 * The RESOLVED source decides the leg: a field naming a catalogue entry by `ref` carries only the
 * name, and the entry is where `proxy` lives. Proxied, the reserved `__restfetch__` action asks the
 * Mateu server (no CORS, secrets injected there), and only `_sourceKind`/`_sourceId` leave the browser.
 */
export function sourcedOptionsOf(host: SourcedOptionsHost, key: string, fieldId: string, src: RestDataSource): FetchedOption[] {
    if (!host.data) host.data = {}
    const data = host.data
    const url = (resolveRestSource(src) ?? src).url
    const signature = (interpolate(url, host.state as never, data as never) ?? url) || `ref:${src.ref ?? ''}`
    if (data[key]?.sourceSignature !== signature) {
        data[key] = { content: data[key]?.content ?? [], sourceSignature: signature }
        const landed = (opts: FetchedOption[]) => {
            data[key] = { content: opts, totalElements: opts.length, sourceSignature: signature }
            host.requestUpdate()
        }
        if (viaProxy(src)) {
            host.dispatchEvent(new CustomEvent('action-requested', {
                detail: {
                    actionId: '__restfetch__',
                    parameters: { _sourceKind: 'options', _sourceId: fieldId },
                    callback: (uiIncrement: UIIncrement) => {
                        const json = uiIncrement?.appData?.['_restfetch']
                        const resolved = resolveRestSource(src) ?? src
                        landed(mapItemsToOptions(json, resolved.itemsPath, resolved.valuePath, resolved.labelPath))
                    },
                    callbackonly: true,
                },
                bubbles: true,
                composed: true,
            }))
        } else {
            fetchExternalOptions(src, templateResolver(host.state as never, data as never))
                .then(landed)
                .catch((e) => console.warn('mateu: external options fetch failed', e))
        }
    }
    return data[key]?.content ?? []
}
