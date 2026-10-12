import { callMateu } from './transport.mjs'
import { chromeText } from './i18n.mjs'
import { fetchRestJson, getByPath, pathOfField, resolveRestSource, viaProxy } from './restSources.mjs'

// GLOBAL SEARCH (the app's GlobalSearchSupplier): typing in the Ask palette also searches the
// app's entities through the app-level `_globalsearch` action ({searchText}) — the same contract
// as the web ⌘K palette (mateu-app fetchGlobalSearch). The hits ({label, description, route,
// category}) go under the destinations, grouped by their category, and choosing one navigates.

/** The hits of a `_globalsearch` answer: data._globalsearch of the first fragment that has it. */
export function globalSearchHitsOf(increment) {
  for (const f of (increment && increment.fragments) || []) {
    const hits = f && f.data && f.data._globalsearch
    if (Array.isArray(hits)) return hits.filter((h) => h && h.route)
  }
  return []
}

/** The palette rows of the hits, after the destinations; grouped (stable) by category. */
export function paletteRowsOfHits(hits) {
  const order = []
  const byCategory = new Map()
  for (const h of hits || []) {
    const category = h.category || chromeText('searchResults')
    if (!byCategory.has(category)) { byCategory.set(category, []); order.push(category) }
    byCategory.get(category).push(h)
  }
  return order.flatMap((category) => byCategory.get(category).map((h) => ({
    label: h.label + (h.description ? ' — ' + h.description : ''),
    route: h.route.startsWith('/') ? h.route : '/' + h.route,
    icon: 'oj-ux-ico-search',
    kind: category,
    isHit: true,
  })))
}

/** An APP-LEVEL action (an app @Fab, a header action): posted to the app with its serverSideType
 *  and route '' — the server dispatches app-level actions without menu resolution. */
export function runAppLevelAction(base, serverSideType, appState, actionId, parameters = {}) {
  return callMateu(base, {
    route: '',
    actionId,
    componentState: {},
    parameters,
    serverSideType: serverSideType || undefined,
    appState: appState || {},
  })
}

// ── SHELL SOURCES (a data-authored `type: AppShell`) ─────────────────────────────────────────
// The twins of the app class's suppliers, authored as data: `notifications.source` (+ `markRead`)
// feeds the bell and `globalSearch.source` the Ask palette — the same contract as libs/mateu's
// appSources.ts. A DIRECT source is fetched by the browser (served and static bundle alike); a
// PROXIED one goes through the server's app-level `_appsource` action, where the browser names the
// ROLE, never a url (the server only calls what the shell declares). Either way the same shaping
// applies, so the two legs cannot disagree. Without a source, the Java pipeline answers as before
// (`_notifications-list` / `_notifications-read` / `_globalsearch`).

export const APP_SOURCE_ACTION = '_appsource'
const NO_SHELL_SOURCES = { notifications: null, notificationsRead: null, globalSearch: null }
let shellSources = NO_SHELL_SOURCES

/** Adopts the sources the bootstrap App declares (AppDto.notificationsSource/…ReadSource/
 *  globalSearchSource). A replace: a shell without them goes back to the server actions. */
export function adoptShellSources(shell) {
  shellSources = shell ? {
    notifications: shell.notificationsSource || null,
    notificationsRead: shell.notificationsReadSource || null,
    globalSearch: shell.globalSearchSource || null,
  } : NO_SHELL_SOURCES
  return shellSources
}
export const shellSourcesOf = () => shellSources

/**
 * Fetches one shell source with `vars` (`${state.searchText}`, `${state.ids}`…): directly, or
 * through `_appsource` when it is proxied (`opts.fetchImpl`/`opts.callImpl` are the tests' doubles).
 * Throws on failure — the caller decides what an unavailable source leaves on screen.
 */
export async function runShellSource(base, serverSideType, appState, role, source, vars = {}, opts = {}) {
  if (viaProxy(source)) {
    const call = opts.callImpl || callMateu
    const increment = await call(base, {
      route: '',
      actionId: APP_SOURCE_ACTION,
      componentState: {},
      parameters: { ...vars, _appSource: role },
      serverSideType: serverSideType || undefined,
      appState: appState || {},
    })
    const appData = (increment && increment.appData) || {}
    if (appData._restfetchError) {
      const err = new Error(appData._restfetchError.message || 'Request failed')
      err.status = appData._restfetchError.status
      throw err
    }
    return appData._restfetch
  }
  return fetchRestJson(source, { state: vars, data: {}, appState: appState || {} }, opts.fetchImpl)
}

/** The items of a shell source's response: the array at its itemsPath, or the response itself. */
function shellItemsOf(json, source) {
  const resolved = resolveRestSource(source) || {}
  const items = resolved.itemsPath ? getByPath(json, resolved.itemsPath) : json
  return Array.isArray(items) ? items.filter((i) => i != null && typeof i === 'object') : []
}
const shellText = (v) => (v == null || v === '' ? '' : String(v))

/** A notifications source's response → inbox entries ({id, title, text, route, unread, when}),
 *  each field read through the source's field map. A missing `unread` counts as unread. */
export function sourcedNotificationsOf(json, source) {
  const at = (item, field) => getByPath(item, pathOfField(source, field))
  return shellItemsOf(json, source).map((item) => {
    const unread = at(item, 'unread')
    return {
      id: shellText(at(item, 'id')),
      title: shellText(at(item, 'title')),
      text: shellText(at(item, 'text')),
      route: shellText(at(item, 'route')),
      unread: unread == null ? true : unread === true || unread === 'true',
      when: shellText(at(item, 'when')),
    }
  })
}

/** A global-search source's response → palette hits ({label, description, route, category});
 *  a hit with nowhere to go is dropped. */
export function sourcedSearchHitsOf(json, source) {
  const at = (item, field) => getByPath(item, pathOfField(source, field))
  return shellItemsOf(json, source).map((item) => ({
    label: shellText(at(item, 'label')),
    description: shellText(at(item, 'description')),
    route: shellText(at(item, 'route')),
    category: shellText(at(item, 'category')),
  })).filter((h) => h.route)
}

/** The variables of a "mark as read": every id comma-joined, the first one, and whether it is "all". */
export function markReadVars(ids, all) {
  return { ids: (ids || []).join(','), id: (ids || [])[0] || '', all: !!all }
}

/** Asks the app for the entities matching `text` ([] when there is nothing to ask): the shell's
 *  `globalSearch.source` when it declares one, else the `_globalsearch` action. */
export async function fetchGlobalSearch(base, serverSideType, appState, text, opts = {}) {
  const searchText = String(text || '').trim()
  if (!searchText) return []
  if (shellSources.globalSearch) {
    const source = shellSources.globalSearch
    return sourcedSearchHitsOf(await runShellSource(base, serverSideType, appState, 'globalSearch', source, { searchText }, opts), source)
  }
  const increment = await callMateu(base, {
    route: '',
    actionId: '_globalsearch',
    componentState: {},
    parameters: { searchText },
    serverSideType: serverSideType || undefined,
    appState: appState || {},
  })
  return globalSearchHitsOf(increment)
}
