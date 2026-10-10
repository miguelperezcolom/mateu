import { callMateu } from './transport.mjs'
import { chromeText } from './i18n.mjs'

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

/** Asks the app for the entities matching `text` ([] when there is nothing to ask). */
export async function fetchGlobalSearch(base, serverSideType, appState, text) {
  const searchText = String(text || '').trim()
  if (!searchText) return []
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
