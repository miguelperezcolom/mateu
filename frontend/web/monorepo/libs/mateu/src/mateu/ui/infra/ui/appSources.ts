import type App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import type RestDataSource from '@mateu/shared/apiClients/dtos/componentmetadata/RestDataSource.ts'
import { mateuApiClient } from '@infra/http/AxiosMateuApiClient.ts'
import { fetchExternalJson, getByPath, mapItemsToOptions, type FetchedOption } from '@infra/http/externalOptions.ts'
import { pathOfField, resolveRestSource, viaProxy } from '@infra/http/restSourceCatalogue.ts'
import { templateResolver } from '@infra/ui/interpolation.ts'

/**
 * The REST sources a DATA-AUTHORED app shell (`type: AppShell`) feeds its header from — the twins
 * of the Java app class's suppliers: the context pickers' options (`@AppContext`), the inbox
 * (`NotificationsSupplier`) and the palette's entity search (`GlobalSearchSupplier`).
 *
 * A direct source is fetched by the BROWSER (so it works served and in a static bundle alike); a
 * proxied one goes through the server's `_appsource` action, which only calls what the shell
 * declares — the browser names the role, never a url. Either way the same shaping applies, so the
 * two legs cannot disagree.
 */
export type AppSourceRole = 'notifications' | 'notificationsRead' | 'globalSearch' | 'contextOptions'

/** The variables a shell source interpolates with: `${state.searchText}`, `${state.ids}`… */
export type AppSourceVars = Record<string, unknown>

export const APP_SOURCE_ACTION = '_appsource'

/** Fetch one shell source: directly, or through `_appsource` when it is proxied. */
export async function runAppSource(
    app: App,
    baseUrl: string,
    role: AppSourceRole,
    source: RestDataSource,
    vars: AppSourceVars,
    host: HTMLElement,
    field?: string,
): Promise<unknown> {
    if (viaProxy(source)) {
        const increment = await mateuApiClient.runAction(
            baseUrl ?? '', app.rootRoute ?? '', '', APP_SOURCE_ACTION, 'app-source', undefined,
            app.serverSideType, {}, { ...vars, _appSource: role, ...(field ? { _field: field } : {}) },
            host, true)
        const appData = (increment?.appData ?? {}) as Record<string, unknown>
        const error = appData['_restfetchError'] as { status?: number, message?: string } | undefined
        if (error) throw new Error(error.message ?? 'Request failed')
        return appData['_restfetch']
    }
    return fetchExternalJson(source, templateResolver(vars as never, {}))
}

/** The items a response carries: the array at the source's `itemsPath`, or the response itself. */
function itemsOf(json: unknown, source: RestDataSource): unknown[] {
    const resolved = resolveRestSource(source)
    const items = resolved?.itemsPath ? getByPath(json, resolved.itemsPath) : json
    return Array.isArray(items) ? items : []
}

const text = (v: unknown): string | null => v == null || v === '' ? null : String(v)

/** One inbox entry, as the bell shows it (the shape of the `_notifications-list` answer). */
export interface SourcedNotification {
    id: string
    title: string
    text: string | null
    route: string | null
    unread: boolean
    when: string | null
}

/** A source's response → inbox entries; each field read through the source's field map. A missing
 *  `unread` counts as unread, as a Java AppNotification built without it is. */
export function notificationsOf(json: unknown, source: RestDataSource): SourcedNotification[] {
    const at = (item: unknown, field: string) => getByPath(item, pathOfField(source, field))
    return itemsOf(json, source)
        .filter((item) => item != null && typeof item === 'object')
        .map((item) => {
            const unread = at(item, 'unread')
            return {
                id: String(at(item, 'id') ?? ''),
                title: String(at(item, 'title') ?? ''),
                text: text(at(item, 'text')),
                route: text(at(item, 'route')),
                unread: unread == null ? true : unread === true || unread === 'true',
                when: text(at(item, 'when')),
            }
        })
}

/** One palette hit (the shape of the `_globalsearch` answer). */
export interface SourcedSearchHit {
    label: string
    description: string | null
    route: string
    category: string | null
}

/** A source's response → palette hits; a hit with nowhere to go is dropped. */
export function searchHitsOf(json: unknown, source: RestDataSource): SourcedSearchHit[] {
    const at = (item: unknown, field: string) => getByPath(item, pathOfField(source, field))
    return itemsOf(json, source)
        .filter((item) => item != null && typeof item === 'object')
        .map((item) => ({
            label: String(at(item, 'label') ?? ''),
            description: text(at(item, 'description')),
            route: String(at(item, 'route') ?? ''),
            category: text(at(item, 'category')),
        }))
        .filter((hit) => hit.route !== '')
}

/** A source's response → picker options, through its itemsPath/valuePath/labelPath. */
export function contextOptionsOf(json: unknown, source: RestDataSource): FetchedOption[] {
    const resolved = resolveRestSource(source) ?? source
    return mapItemsToOptions(json, resolved.itemsPath, resolved.valuePath || 'value', resolved.labelPath || 'label')
}

/** The variables of a "mark as read": every id comma-joined, the first one, and whether it is "all". */
export function markReadVars(ids: string[], all: boolean): AppSourceVars {
    return { ids: ids.join(','), id: ids[0] ?? '', all }
}

/**
 * The palette's entity search, whoever answers it: the shell's `globalSearch.source` (a data-authored
 * shell), else the `_globalsearch` action of an app class implementing GlobalSearchSupplier. Shared
 * by the ⌘K palette and the command center so the two cannot drift.
 */
export async function searchGlobally(app: App, baseUrl: string, query: string, host: HTMLElement,
                                     initiator: string): Promise<SourcedSearchHit[]> {
    const source = app.globalSearchSource
    if (source) {
        return searchHitsOf(await runAppSource(app, baseUrl, 'globalSearch', source, { searchText: query }, host), source)
    }
    const increment = await mateuApiClient.runAction(baseUrl ?? '', app.rootRoute ?? '', '', '_globalsearch',
        initiator, undefined, app.serverSideType, {}, { searchText: query }, host, true)
    const data = increment?.fragments?.map(f => f.data)
        .find(d => d && (d as Record<string, unknown>)['_globalsearch'])
    return ((data as Record<string, unknown> | undefined)?.['_globalsearch'] as SourcedSearchHit[]) ?? []
}
