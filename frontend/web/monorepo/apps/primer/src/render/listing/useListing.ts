import { useEffect, useState } from 'react'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { routeQueryOf } from '@rn/core/componentContext'
import { fetchExternalJson, getByPath, mapItemsToRows } from '@rn/core/restFetch'
import { restListingPage } from '@rn/core/restListing'
import { rowRouteFields } from '@rn/core/rowOpen'
import { applySearchToState, normalizeCrudData } from '@rn/renderer/crudListing'
import { defaultView } from '@infra/savedViewsStore.ts'
import { useController } from '../ViewHost'
import { filterKeysOf, listingStateFromUrl, writeListingUrl } from '../listingUrl'
import type { Dict, Row } from './rows'

type Controller = ReturnType<typeof useController>

/** What a top-level listing opens with: the URL's ask, else (nothing in the URL) its starred saved view. */
function openingStateOf(ownsUrl: boolean, filterKeys: string[]) {
  if (!ownsUrl) return { fromUrl: null, fromView: null }
  const fromUrl = listingStateFromUrl(window.location.search, filterKeys)
  if (fromUrl || window.location.search) return { fromUrl, fromView: null }
  const view = defaultView(window.location.pathname)
  const keys = new Set(['searchText', ...filterKeys])
  const values = Object.fromEntries(Object.entries(view?.values ?? {}).filter(([k, v]) => keys.has(k) && v !== undefined && v !== null && v !== ''))
  return { fromUrl: null, fromView: Object.keys(values).length ? values : null }
}

/**
 * A REST source (`rowsSource`): rows fetched in the browser (or through the server's proxy), paged
 * in memory — or by the server when the source names a totalPath.
 */
function useRestRows(controller: Controller, args: {
  id: string; metadata: Dict; state: Dict; columnIds: string[]; filters: Dict[]; setLive: (d: unknown) => void
}) {
  const { id, metadata, state, columnIds, filters, setLive } = args
  const rowsSource = metadata['rowsSource'] as Dict | undefined
  const sources = controller.session.sources
  const resolved = rowsSource ? (sources.resolve(rowsSource) as Dict) : undefined
  const restTotalPath = rowsSource ? sources.serverTotalPath(rowsSource) : undefined
  const restPageSize = Number(metadata['pageSize'] ?? 0) || 0
  if (rowsSource && restTotalPath && restPageSize > 0) controller.currentComponentState['size'] ??= restPageSize
  const restState = () => ({ ...state, ...controller.currentComponentState })
  const restResolve = (t: unknown): string => interpolate(String(t ?? ''), { state: restState(), appState: controller.session.appState })
  const rowsUrl = resolved ? restResolve(resolved['url']) : ''
  const [restRows, setRestRows] = useState<Row[]>([])
  const [restRequest, setRestRequest] = useState(0)
  const [restError, setRestError] = useState<string | null>(null)
  const showRestPage = (rows: Row[]) => setLive({
    page: restListingPage(rows, { columnIds, filters: filters as never, state: controller.currentComponentState, pageSize: restPageSize }),
  })
  const refresh = () => (restTotalPath ? setRestRequest((n) => n + 1) : showRestPage(restRows))
  useEffect(() => {
    if (!rowsSource || !resolved) return
    let cancelled = false
    setRestError(null)
    const json = sources.viaProxy(rowsSource)
      ? controller.fetchViaProxy('rows', id)
      : fetchExternalJson(rowsSource, restResolve, (t) => interpolateUrl(String(t ?? ''), { state: restState(), appState: controller.session.appState }), sources)
    json.then((j) => {
      if (cancelled) return
      const rows = mapItemsToRows(j, resolved['itemsPath'] as string | undefined, columnIds, (f) => sources.pathOfField(rowsSource, f)) as Row[]
      setRestRows(rows)
      if (!restTotalPath) return showRestPage(rows)
      const total = Number(getByPath(j, restTotalPath))
      setLive({ page: {
        content: rows,
        totalElements: Number.isFinite(total) ? total : rows.length,
        pageSize: restPageSize || rows.length || 1,
        pageNumber: Number(controller.currentComponentState['page'] ?? 0) || 0,
      } })
    }).catch((e: unknown) => { if (!cancelled) setRestError(e instanceof Error ? e.message : String(e)) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowsUrl, restRequest])
  return { rest: !!rowsSource, restError, refresh }
}

/**
 * A listing's rows and how they are asked for: the data the server pushed (or a REST source's),
 * the search text, the filters, the page and the sort — written into the component state with the
 * crud's keys, then a `search` (or the REST rows again); a top-level listing mirrors them in the URL.
 */
export function useListing({ id, metadata, state, data, filters, columnMetas }: {
  id: string; metadata: Dict; state: Dict; data?: unknown; filters: Dict[]; columnMetas: Dict[]
}) {
  const controller = useController()
  const ownsUrl = !controller.windowless
  const filterKeys = filterKeysOf(filters)
  const [opening] = useState(() => openingStateOf(ownsUrl, filterKeys))
  const fromUrl = opening.fromUrl
  const [live, setLive] = useState<unknown>(() => normalizeCrudData(data))
  const [searchText, setSearchText] = useState(
    fromUrl?.searchText ?? String(opening.fromView?.['searchText'] ?? controller.currentComponentState['searchText'] ?? ''),
  )
  // a filter the route, the URL or the starred view names starts set
  const [filterValues, setFilterValues] = useState<Dict>(() => {
    const query = routeQueryOf(controller.currentRoute)
    const fromRoute = Object.fromEntries(filters.filter((f) => query[String(f['fieldId'])] !== undefined).map((f) => [String(f['fieldId']), query[String(f['fieldId'])]]))
    const { searchText: _s, ...viewFilters } = opening.fromView ?? {}
    return { ...fromRoute, ...viewFilters, ...(fromUrl?.filters ?? {}) }
  })
  useEffect(() => {
    const onData = (d: unknown) => setLive(normalizeCrudData(d))
    controller.registerDataHandler(id, onData)
    controller.registerDataHandler('crud', onData)
  }, [controller, id])

  const columnIds = [...new Set([
    ...columnMetas.map((cm) => String(cm['id'] ?? '')),
    ...columnMetas.flatMap((cm) => ['captionPath', 'leadingPath', 'tooltipPath'].map((k) => cm[k])),
    ...rowRouteFields(metadata['rowRoute']),
    ...(typeof metadata['detailPath'] === 'string' ? [metadata['detailPath']] : []),
  ].filter((f): f is string => typeof f === 'string' && !!f))]
  const { rest, restError, refresh } = useRestRows(controller, { id, metadata, state, columnIds, filters, setLive })

  const runSearch = (replaceUrl = false) => {
    if (ownsUrl) writeListingUrl(controller.currentComponentState, filterKeys, replaceUrl)
    if (rest) return refresh()
    void controller.runAction('search')
  }
  const seed = () => { if (!rest) controller.seedSearchState() }
  // a link (or the starred view) that asked for a search, filters, a page or a sort: applied once, on arrival
  useEffect(() => {
    if (!fromUrl && !opening.fromView) return
    seed()
    applySearchToState(controller.currentComponentState, searchText, filterValues)
    if (fromUrl?.page) controller.currentComponentState['page'] = fromUrl.page
    if (fromUrl?.sort) controller.currentComponentState['sort'] = fromUrl.sort
    runSearch(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // initialPage: a listing that opens on another page than the first (a link's page still wins)
  useEffect(() => {
    const initialPage = Number(metadata['initialPage'] ?? 0) || 0
    if (initialPage <= 0 || fromUrl?.page || controller.currentComponentState['page']) return
    seed()
    controller.currentComponentState['page'] = initialPage
    runSearch(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const search = (values: Dict = filterValues, text: string = searchText) => {
    seed()
    applySearchToState(controller.currentComponentState, text, values)
    runSearch()
  }
  const setFilters = (values: Dict) => {
    for (const k of Object.keys(filterValues)) if (!(k in values)) delete controller.currentComponentState[k]
    setFilterValues(values)
    search(values)
  }
  /** A saved view: its search text and filters, replacing what is applied. */
  const applyView = (values: Dict) => {
    const { searchText: text, ...rest } = values
    const t = typeof text === 'string' ? text : ''
    setSearchText(t)
    for (const k of Object.keys(filterValues)) if (!(k in rest)) delete controller.currentComponentState[k]
    setFilterValues(rest)
    search(rest, t)
  }
  const toPage = (pageIndex: number) => {
    seed()
    controller.currentComponentState['page'] = pageIndex
    runSearch()
  }
  const sortBy = (field: string, direction: 'ASC' | 'DESC') => {
    seed()
    controller.currentComponentState['sort'] = [{ field, direction: direction === 'ASC' ? 'ascending' : 'descending', fieldId: field }]
    controller.currentComponentState['page'] = 0
    runSearch()
  }
  return {
    live, restError, searchText, setSearchText, filterValues, setFilters, applyView, search, toPage, sortBy,
    initialSort: controller.currentComponentState['sort'] ?? fromUrl?.sort,
  }
}
