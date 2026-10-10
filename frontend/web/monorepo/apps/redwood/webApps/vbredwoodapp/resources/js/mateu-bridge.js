/* GENERADO por poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd poc && node test.mjs). */
define(['require', 'ojs/ojarraydataprovider', 'ojs/ojconverter-number', 'ojs/ojarraytreedataprovider', 'ojs/ojflattenedtreedataproviderview', 'ojs/ojrowdatagridprovider', 'ojs/ojkeyset'], (require, ArrayDataProvider, NumberConverter, ArrayTreeDataProvider, FlattenedTreeDataProviderView, RowDataGridProvider, KeySet) => {
  'use strict';
  // PERSONALIZACIÓN DE LISTADOS en el navegador: el SELECTOR DE COLUMNAS (cuáles se ven y en qué
  // orden) y las VISTAS GUARDADAS (una combinación con nombre de búsqueda + filtros, con una por
  // defecto). Mismo formato y mismas claves de localStorage que el renderer web (libs/mateu
  // columnPrefsStore.ts / savedViewsStore.ts), así que un usuario que cambie de renderer conserva
  // lo suyo. El ámbito es la ruta del listado. Sin cambios de wire: el servidor sigue mandando todas
  // las columnas y aquí se filtran antes de pintar.

  const COLUMNS_KEY = 'mateu-column-prefs'
  const VIEWS_KEY = 'mateu-saved-views'

  const storageOf = (storage) => storage || (typeof localStorage !== 'undefined' ? localStorage : null)
  const readAll = (key, storage) => {
    try {
      const s = storageOf(storage)
      return s ? JSON.parse(s.getItem(key) || '{}') || {} : {}
    } catch (e) { return {} }
  }
  const writeAll = (key, value, storage) => {
    try { const s = storageOf(storage); if (s) s.setItem(key, JSON.stringify(value)) } catch (e) { /* lleno o bloqueado */ }
  }

  // columnas que no se ocultan ni se reordenan: las técnicas (selección, acciones, líneas)
  const PROTECTED = (c) => !c || !c.field || c.field === '_select' || c.template === 'cellRowActions'
    || c.field === '__rowLines' || c.id === '__rowLines'

  /** Las preferencias de columnas de un ámbito: { hidden: [], order: [] } o null. */
  function readColumnPrefs(scope, storage) {
    const p = readAll(COLUMNS_KEY, storage)[scope]
    if (!p || typeof p !== 'object') return null
    return { hidden: Array.isArray(p.hidden) ? p.hidden : [], order: Array.isArray(p.order) ? p.order : [] }
  }

  function writeColumnPrefs(scope, prefs, storage) {
    const all = readAll(COLUMNS_KEY, storage)
    if (!prefs || (!(prefs.hidden || []).length && !(prefs.order || []).length)) delete all[scope]
    else all[scope] = { hidden: prefs.hidden || [], order: prefs.order || [] }
    writeAll(COLUMNS_KEY, all, storage)
  }

  /** Las columnas del oj-table con las preferencias aplicadas: sin las ocultas, en el orden pedido
   *  (las no mencionadas, detrás, en su orden). Las técnicas no se tocan. */
  function applyColumnPrefs(columns, prefs) {
    if (!prefs) return columns
    const hidden = new Set(prefs.hidden || [])
    const order = prefs.order || []
    const rank = (c) => { const i = order.indexOf(c.field || c.id); return i < 0 ? order.length : i }
    const movable = columns.filter((c) => !PROTECTED(c) && !hidden.has(c.field || c.id))
    const sorted = movable.map((c, i) => ({ c, i })).sort((a, b) => (rank(a.c) - rank(b.c)) || (a.i - b.i)).map((x) => x.c)
    // las técnicas conservan su sitio relativo: delante las de selección, detrás acciones/líneas
    const lead = columns.filter((c) => PROTECTED(c) && c.field === '_select')
    const tail = columns.filter((c) => PROTECTED(c) && c.field !== '_select')
    return lead.concat(sorted, tail)
  }

  /** El modelo del diálogo de columnas: [{ id, label, visible }] en el orden actual. */
  function columnChooserOf(columns, prefs) {
    const hidden = new Set((prefs && prefs.hidden) || [])
    const order = (prefs && prefs.order) || []
    const items = columns.filter((c) => !PROTECTED(c)).map((c, i) => ({ id: c.field || c.id, label: c.headerText || c.field, visible: !hidden.has(c.field || c.id), i }))
    const rank = (x) => { const k = order.indexOf(x.id); return k < 0 ? order.length : k }
    return items.sort((a, b) => (rank(a) - rank(b)) || (a.i - b.i)).map(({ id, label, visible }) => ({ id, label, visible }))
  }

  /** Del modelo del diálogo a preferencias. */
  function prefsFromChooser(items) {
    return { hidden: items.filter((x) => !x.visible).map((x) => x.id), order: items.map((x) => x.id) }
  }

  /** Mover un elemento del diálogo arriba (-1) o abajo (+1). */
  function moveChooserItem(items, id, delta) {
    const i = items.findIndex((x) => x.id === id)
    const j = i + delta
    if (i < 0 || j < 0 || j >= items.length) return items
    const out = [...items]
    ;[out[i], out[j]] = [out[j], out[i]]
    return out
  }

  // ── vistas guardadas ──────────────────────────────────────────────────────────────────────────

  function listSavedViews(scope, storage) {
    const v = readAll(VIEWS_KEY, storage)[scope]
    return Array.isArray(v) ? v : []
  }

  function saveView(scope, view, storage) {
    const all = readAll(VIEWS_KEY, storage)
    const views = (all[scope] || []).filter((x) => x.name !== view.name)
      .map((x) => (view.isDefault ? { ...x, isDefault: false } : x))
    views.push({ name: view.name, values: view.values || {}, isDefault: !!view.isDefault })
    all[scope] = views
    writeAll(VIEWS_KEY, all, storage)
  }

  function deleteView(scope, name, storage) {
    const all = readAll(VIEWS_KEY, storage)
    const views = (all[scope] || []).filter((x) => x.name !== name)
    if (views.length) all[scope] = views
    else delete all[scope]
    writeAll(VIEWS_KEY, all, storage)
  }

  function defaultView(scope, storage) {
    return listSavedViews(scope, storage).find((v) => v.isDefault) || null
  }

  /** La ruta que aplica una vista: el listado con sus filtros en la query (el camino de los
   *  filtros por URL, que ya pone los chips y relanza la búsqueda). */
  function viewRouteOf(route, values) {
    const path = String(route || '').split('?')[0]
    const q = Object.keys(values || {})
      .filter((k) => values[k] != null && values[k] !== '' && !(Array.isArray(values[k]) && !values[k].length))
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(Array.isArray(values[k]) ? values[k].join(',') : String(values[k])))
    return q.length ? path + '?' + q.join('&') : path
  }

  /** Lo que se guarda de la búsqueda actual: el texto libre y los filtros aplicados. */
  function currentViewValues(filterValues, searchText) {
    const values = { ...(filterValues || {}) }
    if (searchText) values.searchText = searchText
    return values
  }

  /** Las opciones del menú de vistas (oj-menu): las guardadas (★ la de por defecto) + acciones. */
  function viewsMenuOf(scope, storage) {
    const views = listSavedViews(scope, storage).map((v) => ({ value: 'view:' + v.name, label: (v.isDefault ? '★ ' : '') + v.name }))
    return views.concat([{ value: 'save', label: 'Save current view…' }])
      .concat(views.length ? [{ value: 'clear', label: 'Clear filters' }] : [])
  }

  /** El ámbito de las preferencias: la ruta del listado en pantalla, sin query (en modo hash, lo
   *  que va detrás de #). */
  function listingScope(loc = typeof window !== 'undefined' ? window.location : null) {
    if (!loc) return ''
    const raw = loc.hash && loc.hash.startsWith('#/') ? loc.hash.slice(1) : loc.pathname
    return String(raw || '').split('?')[0]
  }


  // El árbol de navegación: las reglas de libs/mateu/.../navTree.ts que necesita este renderer,
  // PORTADAS (no compartidas): el bridge se construye concatenando estos .mjs (make-amd.mjs) y no
  // puede importar TypeScript. Mismas reglas, mismos casos en test.mjs; si cambia una, cambian las dos.
  //
  // Una sección remota llega como marcador (`remote: true`, sin hijos) hasta que su pod contesta. Lo
  // que la shell sabe de ella antes —su rótulo y el prefijo bajo el que viven sus pantallas— basta
  // para la sección activa y la primera miga.

  const navRoute = (r) => {
    let s = String(r == null ? '' : r).trim()
    const q = s.search(/[?#]/)
    if (q >= 0) s = s.slice(0, q)
    if (s && s[0] !== '/') s = '/' + s
    while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
    return s
  }

  /** `path` es `route` o cuelga de ella. La raíz no casa por prefijo. */
  function routeCovers(route, path) {
    return !!route && route !== '/' && (path === route || path.indexOf(route + '/') === 0)
  }

  /** Una sección remota que aún no ha contestado (o que no contestó). */
  function isMount(option) {
    return !!(option && option.remote)
  }

  /** El prefijo de una sección remota: el que manda el servidor (`routePrefix`) o, si no, su path (o su ruta). */
  function mountPrefix(option) {
    return isMount(option) ? navRoute(option.routePrefix || option.path || option.route) : ''
  }

  /** Por qué una sección está deshabilitada, en el idioma de la UI. */
  function unavailableHint(label, lang) {
    const language = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || ''
    // Strip markup until nothing is left, then any stray angle bracket (as navTree.ts does): one pass of
    // the tag pattern can leave a tag behind (CodeQL js/incomplete-multi-character-sanitization).
    let name = String(label == null ? '' : label)
    for (let before = ''; before !== name;) {
      before = name
      name = name.replace(/<[^<>]*>/g, '')
    }
    name = name.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
    return String(language).toLowerCase().startsWith('es')
      ? `${name} no está disponible ahora. Se volverá a intentar.`
      : `${name} is not available right now. It will be retried.`
  }

  /**
   * Lo que contestó el pod, con el rótulo de la shell si lo DECLARÓ (`shellLabel`) y el pod contesta
   * con UNA entrada —lo normal: un grupo con el nombre del servicio—: manda la palabra de la shell, y
   * la barra no cambia bajo el lector. Varias entradas se pegan tal cual: no hay un nodo que nombrar.
   */
  function labelledByShell(entries, option) {
    if (option.shellLabel && option.label && entries.length === 1) {
      return [Object.assign({}, entries[0], { label: option.label, icon: option.icon || entries[0].icon })]
    }
    return entries
  }

  /**
   * HAMBURGER_SECTIONS: lo que contesta un pod montado en el primer nivel es UNA sección. Un grupo
   * ya lo es; varias entradas, o una sola pantalla, pasan a ser las entradas de una sección con el
   * rótulo (y el path) que la shell dio al montaje —pegarlas haría de cada pantalla del pod una
   * sección, y la subcabecera no tendría nada que enseñar—. Port de mergeRemoteMenus de navTree.ts.
   */
  function asSection(entries, option) {
    const list = entries || []
    const oneGroup = list.length === 1 && ((list[0].submenus || list[0].submenu || []).length > 0)
    if (oneGroup || !list.length) return list
    return [{ label: option.label, icon: option.icon, path: option.path, route: '', visible: option.visible, submenus: list }]
  }

  /** Las entradas de una sección oculta: no se pintan a ninguna profundidad, pero siguen en el árbol. */
  function markHidden(entries) {
    return entries.map((option) => {
      const children = option.submenus || option.submenu || []
      return Object.assign({}, option, { visible: false }, children.length ? { submenus: markHidden(children) } : {})
    })
  }

  /** La sección de un pod que no contestó: sigue ahí, deshabilitada y diciendo por qué. */
  function unavailableMount(option, lang) {
    return Object.assign({}, option, { unavailable: true, disabled: true, description: unavailableHint(option.label, lang) })
  }

  /**
   * Las rutas de una sección de primer nivel: las de sus entradas a cualquier profundidad (ocultas
   * incluidas: una pantalla bajo una sigue siendo de esa sección), el prefijo de una sección remota
   * que aún no contestó y los ids con que navega el menú ya proyectado (`node`, de shellNavOf).
   */
  function sectionRoutes(option, node) {
    const out = new Set()
    const add = (r) => {
      const s = navRoute(r)
      if (s && s !== '/') out.add(s)
    }
    const walkOption = (o) => {
      if (!o || o.separator) return
      if (isMount(o)) add(mountPrefix(o))
      add(o.route || o.path)
      for (const child of o.submenus || o.submenu || []) walkOption(child)
    }
    const walkNode = (n) => {
      if (!n) return
      add(n.id)
      for (const child of n.children || []) walkNode(child)
    }
    walkOption(option)
    walkNode(node)
    return Array.from(out)
  }

  /**
   * La sección de primer nivel que está en pantalla (la misma regla que activeSection.ts del
   * renderer web: la entrada que es la ruta, o el grupo que la contiene a cualquier profundidad):
   * su id, o null si la ruta no cuelga de ninguna — la home, p. ej. Gana la ruta más larga: una
   * sección no se queda con las pantallas de otra porque su prefijo sea más corto.
   */
  function nodeRoutes(node, out = []) {
    if (!node) return out
    const route = navRoute(node.id)
    if (route && route !== '/') out.push(route)
    for (const child of node.children || []) nodeRoutes(child, out)
    return out
  }

  function activeSectionOf(sections, current) {
    const path = navRoute(current)
    if (!path || path === '/') return null
    let best = null
    let length = 0
    for (const section of sections || []) {
      // una sección de primer nivel trae sus rutas (sectionRoutes); un ítem del segundo nivel
      // (HAMBURGER_SECTIONS) no: valen los ids de lo que cuelga de él
      for (const route of section.routes || nodeRoutes(section)) {
        if (routeCovers(route, path) && route.length > length) {
          best = section.id
          length = route.length
        }
      }
    }
    return best
  }


  /*
   * HAMBURGER_SECTIONS (al estilo de Opera Cloud): el primer nivel del menú son las SECCIONES, en la
   * hamburguesa; la subcabecera lleva el segundo nivel de la sección en pantalla (un grupo, en
   * desplegable: el tercer nivel). Port de activeSection/sectionHome de navTree.ts, sobre los nodos ya
   * proyectados por shellNavOf (id, children, disabled; lo oculto ya no está).
   */

  /**
   * Adónde lleva elegir una sección: la propia sección si es una pantalla, si no su primera entrada
   * que se pueda abrir, en profundidad —la home de la sección, como en Opera—. null si no hay nada
   * que abrir (una sección remota que no contestó).
   */
  function sectionHomeOf(node) {
    if (!node || node.disabled) return null
    const children = node.children || []
    if (!children.length) return node.id || null
    for (const child of children) {
      const home = sectionHomeOf(child)
      if (home) return home
    }
    return null
  }

  /** El nodo de la sección en pantalla (activeSectionOf), o null —la home, p. ej.—. */
  function sectionOf(sections, current) {
    const id = activeSectionOf(sections, current)
    return id == null ? null : ((sections || []).find((section) => section.id === id) || null)
  }

  /** Las rutas centinela del servidor que significan «no hay home declarada»: la shell abre entonces
   *  la primera pantalla del menú (en profundidad), como la home de una sección. */
  function isSentinelHome(route) {
    const r = String(route || '')
    return !r || /(^|\/)_no_home_route$/.test(r) || /(^|\/)_page$/.test(r)
  }

  /**
   * La opción LOCAL del menú (no remota) que cubre una ruta —la de prefijo más largo, por tramos—,
   * o null. Una ruta de menú (`/inventory/floorPlan`) es del APP: el servidor sólo la resuelve si la
   * petición lleva el serverSideType del app que declara ese menú; sin él contesta «Not found.»
   * (en demo-vb no se notaba porque cada @Menu se llamaba como la ruta @UI de su clase).
   */
  function localMenuOptionOf(menu, route) {
    const path = String(route || '').split('?')[0]
    if (!path) return null
    let best = null
    const visit = (options) => {
      for (const o of options || []) {
        if (!o || o.remote || o.baseUrl) continue
        const r = o.route || o.path
        if (r && routeCovers(r, path) && (!best || r.length > (best.route || best.path).length)) best = o
        visit(o.submenus || o.submenu)
      }
    }
    visit(menu)
    return best
  }


  // CALENDARIO (Calendar → átomo isCalendar). JET no trae un calendario: la rejilla se dibuja con los
  // tokens de Redwood; el selector de vista es el oj-buttonset-one de JET y los eventos, enlaces.
  // TODAS las vistas (mes, semana, día, lista) van precomputadas en el átomo — el CSP de VB no
  // calcula fechas — y cambiar de vista es estado del DOM (installCalendars): sin re-proyectar ni
  // preguntar al servidor. Mismas reglas que libs/mateu calendarModel.ts (fechas ISO en UTC, para
  // que ningún huso mueva un día; el evento de varios días en todos sus días; por hora de inicio).

  const toUtc = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
  const fromUtc = (ms) => new Date(ms).toISOString().slice(0, 10)
  const calAddDays = (iso, n) => fromUtc(toUtc(iso) + n * 86400000)
  /** 0 = lunes … 6 = domingo */
  const calWeekday = (iso) => (new Date(toUtc(iso)).getUTCDay() + 6) % 7
  const firstOfMonth = (iso) => iso.slice(0, 8) + '01'
  const lastOfMonth = (iso) => { const [y, m] = iso.split('-').map(Number); return fromUtc(Date.UTC(y, m, 0)) }
  const datesBetween = (from, to) => { const out = []; for (let d = from; d <= to; d = calAddDays(d, 1)) out.push(d); return out }

  function calPeriod(view, anchor) {
    if (view === 'day') return { from: anchor, to: anchor }
    if (view === 'week') { const monday = calAddDays(anchor, -calWeekday(anchor)); return { from: monday, to: calAddDays(monday, 6) } }
    return { from: firstOfMonth(anchor), to: lastOfMonth(anchor) }
  }

  const calEventsOn = (events, date) => (events || [])
    .filter((e) => e.date && e.date <= date && (e.endDate || e.date) >= date)
    .map((e, i) => ({ e, i }))
    .sort((a, b) => (a.e.startTime || '').localeCompare(b.e.startTime || '') || a.i - b.i)
    .map(({ e }) => e)

  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const DOWS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const TONES = { info: 1, success: 1, warning: 1, danger: 1, neutral: 1 }
  const dayNum = (iso) => Number(iso.slice(8))
  const monthName = (iso) => MONTHS[Number(iso.slice(5, 7)) - 1]
  const longDate = (iso) => DOWS_LONG[calWeekday(iso)] + ', ' + monthName(iso) + ' ' + dayNum(iso)

  /** El átomo del calendario, con las cuatro vistas precomputadas. */
  function calendarAtomOf(m, id, today = new Date().toISOString().slice(0, 10)) {
    const anchor = m.month || today
    const events = m.events || []
    const days = {}
    for (const d of m.days || []) if (d && d.date) days[d.date] = d
    const dayAction = m.dayActionId || ''
    const chipOf = (e, withTime) => {
      const time = withTime && e.startTime ? e.startTime + (e.endTime ? '–' + e.endTime : '') : ''
      return {
        id: e.id || '', title: e.title || '', date: e.date || '', time,
        text: (time ? time + ' ' : '') + (e.title || ''),
        actionId: e.actionId || '',
        clickable: e.actionId ? 'true' : 'false',
        // un OBJETO: el :style de JET no aplica una cadena CSS
        style: e.color ? { borderLeftColor: e.color } : {},
      }
    }
    const cellOf = (date, withTime) => {
      const info = days[date] || {}
      const evs = calEventsOn(events, date)
      return {
        date, num: String(dayNum(date)), blank: false,
        label: info.label || '',
        cls: 'mateu-cal-cell' + (info.tone && TONES[info.tone] ? ' mateu-cal-' + info.tone : '')
          + (date === today ? ' mateu-cal-today' : '') + (dayAction ? ' mateu-cal-clickable' : ''),
        ariaLabel: longDate(date) + (info.label ? ', ' + info.label : '') + (evs.length ? ', ' + evs.length + (evs.length > 1 ? ' events' : ' event') : ''),
        events: evs.map((e) => chipOf(e, withTime)),
      }
    }
    // mes: celdas de lunes a domingo, en blanco fuera del mes
    const month = calPeriod('month', anchor)
    const monthCells = Array.from({ length: calWeekday(month.from) }, () => ({ blank: true, cls: 'mateu-cal-cell mateu-cal-blank', events: [], label: '', num: '', date: '' }))
    monthCells.push(...datesBetween(month.from, month.to).map((d) => cellOf(d, false)))
    while (monthCells.length % 7) monthCells.push({ blank: true, cls: 'mateu-cal-cell mateu-cal-blank', events: [], label: '', num: '', date: '' })
    const week = calPeriod('week', anchor)
    const weekDates = datesBetween(week.from, week.to)
    const agenda = datesBetween(month.from, month.to)
      .map((date) => ({ date, cell: cellOf(date, true) }))
      .filter((x) => x.cell.events.length)
      .map(({ date, cell }) => ({ date, dateLabel: longDate(date), label: cell.label, cls: cell.cls.replace('mateu-cal-cell', 'mateu-cal-agenda-date'), events: cell.events }))
    const view = ['month', 'week', 'day', 'list'].includes(m.view) ? m.view : 'month'
    const views = (m.views || []).filter((v) => ['month', 'week', 'day', 'list'].includes(v))
    return {
      isCalendar: true,
      calId: 'mateuCal-' + String(id || 'calendar').replace(/[^A-Za-z0-9_-]/g, '_'),
      view,
      dayActionId: dayAction,
      hasSwitcher: views.length > 1,
      viewOptions: views.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
      titles: {
        month: monthName(anchor) + ' ' + anchor.slice(0, 4),
        week: monthName(week.from).slice(0, 3) + ' ' + dayNum(week.from) + ' – ' + monthName(week.to).slice(0, 3) + ' ' + dayNum(week.to) + ', ' + week.to.slice(0, 4),
        day: longDate(anchor) + ', ' + anchor.slice(0, 4),
        list: monthName(anchor) + ' ' + anchor.slice(0, 4),
      },
      dows: DOWS,
      monthCells,
      weekHeads: weekDates.map((d) => DOWS[calWeekday(d)] + ' ' + dayNum(d)),
      weekCells: weekDates.map((d) => cellOf(d, true)),
      dayHead: longDate(anchor),
      dayCells: [cellOf(anchor, true)],
      agenda,
      hasAgenda: agenda.length > 0,
    }
  }

  // ── comportamiento del DOM (una vez por documento) ────────────────────────────────────────────
  let calendarSink = null
  function setCalendarActionSink(fn) { calendarSink = typeof fn === 'function' ? fn : null }

  function installCalendars(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuCalendars) return
    doc.__mateuCalendars = true
    // cambiar de vista: el oj-buttonset-one NO burbujea valueChanged; la captura sí lo ve
    doc.addEventListener('valueChanged', (e) => {
      const set = e.target
      if (!set || !set.hasAttribute || !set.hasAttribute('data-cal-switch')) return
      const cal = set.closest('.mateu-cal')
      if (cal && e.detail && e.detail.value) cal.setAttribute('data-cal-shown', e.detail.value)
    }, true)
    const run = (target) => {
      const chip = target.closest('[data-cal-event]')
      const cal = target.closest('.mateu-cal')
      if (!cal || !calendarSink) return false
      if (chip) {
        if (chip.getAttribute('data-cal-clickable') !== 'true') return false
        calendarSink(chip.getAttribute('data-cal-action'), {
          _clickedEvent: { id: chip.getAttribute('data-cal-event'), title: chip.getAttribute('data-cal-title'), date: chip.getAttribute('data-cal-date') },
        }, {})
        return true
      }
      const cell = target.closest('[data-cal-date]')
      const action = cal.getAttribute('data-day-action')
      if (cell && action && cell.getAttribute('data-cal-date')) {
        calendarSink(action, { _date: cell.getAttribute('data-cal-date') }, {})
        return true
      }
      return false
    }
    doc.addEventListener('click', (e) => { if (e.target && e.target.closest && run(e.target)) e.stopPropagation() }, true)
    doc.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('.mateu-cal') && run(e.target)) e.preventDefault()
    }, true)
  }


  // Los enlaces HTML corrientes dentro del contenido (`<a href="/journey/bookings/ZUAAKJ">Ver
  // recorrido</a>`, de un Text/Html de la app) navegan DENTRO de la shell, como en Vaadin: allí el
  // cliente de Flow (RouterLinkHandler) se queda con el clic en un enlace a una ruta de la app y
  // navega sin recargar. Aquí, sin esto, el navegador cargaba la página entera y la shell de Redwood
  // volvía a arrancar (20–40 s en blanco). Mismas reglas que Flow: sólo un clic normal (botón
  // principal, sin Ctrl/Cmd/Mayús/Alt) que nadie haya atendido ya, en un enlace del mismo origen,
  // sin target (o _self), sin download ni router-ignore; además, nada que no sea una pantalla: las
  // rutas internas (/_inbox, /_xxx), el API, el login/logout y los ficheros (algo.pdf) siguen
  // siendo del navegador, y un ancla a la misma página (#expand=…, el foldout) también.

  /** Prefijos de rutas que no son pantallas de la app: el navegador las carga como siempre. */
  const NOT_A_SCREEN = /^\/(_|api(\/|$)|oauth2(\/|$)|login(\/|$)|logout(\/|$)|sso(\/|$)|actuator(\/|$)|webjars(\/|$)|assets(\/|$)|static(\/|$)|resources(\/|$)|version_)/i

  /** El último tramo con extensión de fichero (`informe.pdf`, `bundle.js`): no es una pantalla (un id
   *  con punto, `/customers/ana.ruiz`, sí). */
  const LOOKS_LIKE_FILE = /\.(pdf|csv|tsv|xlsx?|docx?|pptx?|odt|ods|zip|gz|tar|json|xml|txt|md|png|jpe?g|gif|svg|ico|webp|avif|mp4|webm|mp3|wav|js|mjs|css|map|html?|woff2?|ttf|otf)$/i

  /**
   * La ruta de la app a la que navega un clic en un enlace (con su query), o null si el clic sigue
   * siendo del navegador. `location` es la de la página (window.location); `hashMode` es la shell
   * servida en estático, cuyas rutas viven en `#/ruta`.
   */
  function inAppRouteOfLink(anchor, event, location, hashMode = false) {
    if (!anchor || !anchor.getAttribute || !location) return null
    if (event && (event.defaultPrevented || event.button > 0
      || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return null
    const href = anchor.getAttribute('href')
    if (href == null || href.trim() === '') return null
    const target = (anchor.getAttribute('target') || '').trim().toLowerCase()
    if (target && target !== '_self') return null
    if (anchor.getAttribute('download') != null || anchor.getAttribute('router-ignore') != null) return null
    // en estático (#/ruta) un `#/ruta` también es una pantalla
    if (hashMode && /^#\//.test(href.trim())) {
      return href.trim().slice(1)
    }
    // `#`, `#expand=…`: anclas de esta misma página (el foldout, los href="#" de JET), del navegador
    if (href.trim().charAt(0) === '#') return null
    let url
    try {
      url = new URL(href.trim(), location.href)
    } catch (e) {
      return null
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (url.origin !== location.origin) return null
    const path = url.pathname || '/'
    // un ancla a esta misma página (#expand=…): la hace el navegador
    if (url.hash && path === location.pathname && url.search === (location.search || '')) return null
    if (NOT_A_SCREEN.test(path) || LOOKS_LIKE_FILE.test(path)) return null
    return path + url.search
  }


  // Renderer de Mateu sobre VB — el NÚCLEO, en JS puro y testeable sin VB.
  // En la app VB estas funciones serían métodos de app-flow.js; aquí son funciones
  // libres para testearlas en Node.
  //
  // v3 (2026-07-24): ajustado al WIRE REAL (fixtures/real/*.json, capturados con capture.mjs
  // contra demo/demo-vb en :9005). Contrato observado:
  //   - Bootstrap del shell: POST {base}/mateu/v3/components/_/action (route '', __load__) → App.
  //     Todo lo demás: POST {base}/mateu/v3/sync/{route|_no_route} con actionId '' para cargas.
  //   - `targetComponentId` es el ECO del `initiatorComponentId` de la request ('' → host), y el
  //     server DERIVA los ids internos del initiator ('crud1' → 'crud1_app', 'crud1_list'): la
  //     unicidad de ids entre superficies es responsabilidad del CLIENTE (un contextId por superficie).
  //   - El estado viaja en `fragment.state`; los overlays (Drawer) llevan `metadata.initialData`.
  //   - Un mediador (crud, isla) llega como ServerSide cuyo child0 es un App (chromeless): su
  //     CONTENIDO se carga con una segunda request con consumedRoute=rootRoute del App interior
  //     + serverSideType=homeServerSideType. `mediatorOf(ctx)` extrae esa info.
  //   - CloseModal lleva data.eventName → hay que emitir el evento del bus (@SubscribeTo);
  //     p.ej. el crud refresca el listado suscrito a 'mateu-crud:saved-in-drawer'.
  //   - Una frontera de isla embebida es un nodo ServerSide interior con id = nombre de campo
  //     ('_guestNote') y initialData con los marcadores (_embeddedMediator/_inline).

  const HOST_ID = '__root__'

  /** Recorrido que NO cruza fronteras de isla: un ServerSide INTERIOR es otra superficie
   *  (sus campos/acciones pertenecen a su propio contexto, no al host). */
  function walkWithinSurface(node, visit) {
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return // frontera de isla: parar
      visit(n)
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(node, true)
  }

  /** Helper de RENDER: recolecta los FormFields de la superficie (sin cruzar islas). */
  function collectFields(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.fieldId) out.push(n) })
    return out
  }

  /** Helper de RENDER: recolecta botones/acciones de la superficie (sin cruzar islas). */
  function collectActions(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.actionId && n.label && !n.fieldId) out.push(n) })
    return out
  }

  /** Fronteras de isla embebida — DOS sabores confirmados en wire real:
   *  (a) nodos ServerSide INTERIORES (id propio, p.ej. '_guestNote');
   *  (b) nodos ClientSide App variant=MEDIATOR con id estable (p.ej.
   *      'island_checkin_st_maria') cuya PROPIA metadata trae homeRoute
   *      (?_embeddedMediator=1) + homeConsumedRoute + homeServerSideType —
   *      el detalle del TaskQueue del front-office llega así. */
  function collectIslands(tree, out = []) {
    const walk = (node, isRoot) => {
      if (!node || typeof node !== 'object') return
      if (!isRoot && node.type === 'ServerSide') {
        // un @Subresource no es la isla de la pantalla: lo carga loadSubresources cuando queda a
        // la vista (ver subresourceIslandOf)
        if (!subresourceIslandOf(node)) out.push(node)
        return // sus hijos pertenecen a la isla, no al host
      }
      if (!isRoot && node.type === 'ClientSide' && node.id && node.metadata
          && node.metadata.type === 'App' && node.metadata.variant === 'MEDIATOR') {
        out.push({
          id: node.id,
          route: node.metadata.homeRoute,
          consumedRoute: node.metadata.homeConsumedRoute || node.metadata.homeRoute,
          serverSideType: node.metadata.homeServerSideType,
          // el CONTEXTO sembrado por el host (stayId, paxIndex…): debe viajar como
          // componentState en la carga inicial de la isla (mateu-ux.initialState)
          initialData: node.initialData || null,
        })
        return
      }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** Helper de RENDER: FormField[] del árbol → metadata de oj-dyn-form (mapa campo → meta).
   *  null si el árbol no tiene campos (página sin formulario). */
  function dynFormMetadataOf(tree) {
    const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
    const metadata = {}
    for (const f of collectFields(tree)) {
      if (!f.dataType || metadata[f.fieldId]) continue // duplicados = referencias de FormRow
      // una LISTA (grid de formulario) no es un campo de texto: la pinta el contenido como tabla
      // (un @Searchable de varios ids sí es un campo: sus chips)
      // una lista es una tabla (no un campo) salvo @Searchable y las de elección múltiple
      if ((f.dataType === 'array' && f.stereotype !== 'searchable' && !isExtraLayoutField(f)) || (f.columns || []).length) continue
      metadata[f.fieldId] = {
        type: NUMERIC.indexOf(f.dataType) >= 0 ? 'number'
          : f.dataType === 'bool' || f.dataType === 'boolean' ? 'boolean' : 'string',
        displayName: f.label || f.fieldId,
        required: !!f.required,
        readonly: !!f.readOnly,
        stereotype: f.stereotype || '',
      }
    }
    return Object.keys(metadata).length ? metadata : null
  }

  /** Helper de RENDER: botones únicos del árbol. chroming viene PRECOMPUTADO (los bindings
   *  VB deben quedar como paths simples: un ternario en un atributo rompe la evaluación CSP
   *  de TODAS las propiedades del elemento). */
  function actionsOf(tree) {
    const seen = {}
    const out = []
    for (const a of collectActions(tree)) {
      if (seen[a.actionId]) continue
      seen[a.actionId] = true
      out.push({
        actionId: a.actionId,
        label: a.label,
        style: a.buttonStyle || 'outlined',
        chroming: a.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        parameters: a.parameters || {},
      })
    }
    return out
  }

  /** Helper de RENDER: lista de campos para el switch widgetFor (isText/isNumber/isBoolean/
   *  isSelect/isDate/isDateTime PRECOMPUTADOS — los bindings VB deben ser paths simples), con el
   *  valor sacado del state. Es la MISMA resolución de widget que el editor de fila
   *  (fieldWidgetOf): un select con opciones (options/OptionsSupplier/enum) se pinta como
   *  oj-select-one y una fecha como oj-input-date también en el formulario de página, el drawer
   *  y la isla, no sólo en el diálogo de la fila. Un lookup REMOTO sin opciones todavía se queda
   *  en texto: aquí nadie lanza su búsqueda (sólo el editor de fila lo hace). */
  function fieldListOf(tree, state, data) {
    if (!dynFormMetadataOf(tree)) return []
    const s = state || {}
    const seen = {}
    const out = []
    for (const f of collectFields(tree)) {
      if (!f.dataType || seen[f.fieldId]) continue
      seen[f.fieldId] = true
      // una lista es una tabla (no un campo) salvo @Searchable y las de elección múltiple
      if ((f.dataType === 'array' && f.stereotype !== 'searchable' && !isExtraLayoutField(f)) || (f.columns || []).length) continue
      // la vista de detalle de un @Searchable llega como `<campo>-label`: su texto viaja en data
      const raw = s[f.fieldId] == null && f.stereotype === 'searchable' && data ? data[f.fieldId] : s[f.fieldId]
      // un lookup REMOTO es un desplegable también aquí: sus opciones las carga la chain
      // (bridge.loadLookups) al abrir la pantalla, como las del editor de fila
      const widget = fieldWidgetOf(f, data, { lookups: true, value: raw, textWhenEmpty: true })
      let value = raw == null ? null : (widget.isSelect ? plainValueOf(raw) : raw)
      if (widget.isMultiSelect || widget.isCheckboxSet)
        value = Array.isArray(raw) ? raw.map(plainValueOf) : (raw == null || raw === '' ? [] : String(raw).split(','))
      else if (widget.isMoney) value = raw == null || raw === '' || Number.isNaN(Number(raw)) ? null : Number(raw)
      out.push({ ...widget, value })
    }
    return out
  }

  /** ¿Es este nodo una SECCIÓN del formulario (@Section)? El wire la manda como una Card con la
   *  clase mateu-section, su título en un Text de cabecera (h3) y sus campos en un FormLayout. */
  function isSectionNode(n) {
    return !!(n && n.metadata && n.metadata.type === 'Card' && /(^|\s)mateu-section(\s|$)/.test(n.cssClasses || ''))
  }

  /** El título y las columnas de una sección: el primer Text de cabecera y el primer FormLayout
   *  de SU contenido (sin bajar a una sección anidada ni a otra isla). */
  function sectionHeadOf(card) {
    let title = ''
    let columns = 0
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && (n.type === 'ServerSide' || isSectionNode(n))) return
      const md = n.metadata
      if (md && md.type === 'Text' && !title && /^h[1-6]$/.test(md.container || '') && md.text) title = String(md.text)
      if (md && md.type === 'FormLayout' && !columns) columns = md.maxColumns || md.columns || 0
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(card, true)
    return { title, columns: columns > 0 ? Math.min(columns, 4) : 1, declaredColumns: columns > 0 }
  }

  /**
   * Las columnas de un grupo de campos en un formulario a TODO EL ANCHO (página, wizard): las
   * declaradas (FormLayout maxColumns, @Section(columns)) o, sin declarar, dos — el reparto por
   * defecto del FormLayout de Vaadin en escritorio. oj-form-layout las baja solo cuando no caben
   * (cada columna pide 18rem como mínimo), así que en un teléfono vuelve a ser una.
   */
  function wideColumnsOf(section) {
    return section.declaredColumns ? section.columns : 2
  }

  /**
   * Helper de RENDER: los campos del formulario AGRUPADOS por sus secciones (@Section), en el
   * orden del wire → [{ key, title, hasTitle, columns, fields }]. Los campos fuera de toda
   * sección van a un grupo sin título; un formulario sin secciones es UN grupo sin título, así
   * que el template pinta siempre secciones → campos. [] si el árbol no tiene formulario.
   */
  function formSectionsOf(tree, state, data) {
    const fields = fieldListOf(tree, state, data)
    if (!fields.length) return []
    const byId = {}
    for (const f of fields) byId[f.fieldId] = f
    const sections = []
    const placed = {}
    let loose = null
    const walk = (n, isRoot, section) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return // frontera de isla: sus campos no son de aquí
      let here = section
      if (isSectionNode(n)) {
        here = { key: 's' + sections.length, ...sectionHeadOf(n), fields: [] }
        sections.push(here)
      }
      if (n.fieldId && byId[n.fieldId] && !placed[n.fieldId]) {
        placed[n.fieldId] = true
        if (here) {
          here.fields.push(byId[n.fieldId])
        } else {
          if (!loose || sections[sections.length - 1] !== loose) {
            loose = { key: 's' + sections.length, title: '', columns: 1, declaredColumns: false, fields: [] }
            sections.push(loose)
          }
          loose.fields.push(byId[n.fieldId])
        }
      }
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false, here))
        else if (v && typeof v === 'object') walk(v, false, here)
      }
    }
    walk(tree, true, null)
    // un formulario sin FormLayout propio (los campos sueltos de un ServerSide) toma sus columnas
    // del FormLayout raíz, si lo hay
    const rootColumns = sectionHeadOf(tree)
    return sections
      .filter((sec) => sec.fields.length)
      .map((sec) => {
        const head = !sec.declaredColumns && rootColumns.declaredColumns ? { ...sec, columns: rootColumns.columns, declaredColumns: true } : sec
        // (el @Colspan de un campo no se aplica: de los hijos del oj-form-layout clásico sólo
        // oj-label-value tiene colspan, y envolver el control en uno descuadra la rejilla)
        return { ...head, hasTitle: !!sec.title, wideColumns: wideColumnsOf(head) }
      })
  }

  /** Proyección del OVERLAY superior del stack (drawer del crud): título + campos + acciones.
   *  null si no hay overlays. Sus acciones se postean contra el HOST (el drawer no lleva
   *  ServerSide propio — confirmado en el wire). */
  function overlayOf(reg) {
    const id = reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    if (!id || !reg.contexts[id]) return null
    const ctx = reg.contexts[id]
    // bloques display del contenido del drawer (ResourceGrid/OfferCard/StatusList…):
    // el panel VB los pinta con el MISMO template de átomos que el host — un drawer no
    // es solo campos y botones (p.ej. el picker de habitaciones)
    // los FormFields del drawer ya los pinta su gramática de CAMPOS (oj-form-layout):
    // fuera los átomos isInput de los bloques o saldrían DUPLICADOS (y el usuario
    // escribiría en el par equivocado)
    // pauta del drawer Redwood: las ACCIONES van en la barra del pie. Un Button del
    // contenido SIN parámetros se mueve al pie (p.ej. Enviar); los que llevan parameters
    // (listas de opciones: métodos de cobro, habitaciones…) se quedan en su sitio y NO se
    // repiten en el pie. En un DIALOG (modal de decisión puntual) TODOS los botones son
    // acciones del pie — el listener del modal despacha actionId + parameters, así que
    // "Check-in de <nombre>" (con su _item) viaja igual que "Volver al listado"
    const isDialog = !!(ctx.tree && ctx.tree.metadata && ctx.tree.metadata.type === 'Dialog')
    const conParams = (btn) => !!(btn.parameters && Object.keys(btn.parameters).length)
    const keepInContent = isDialog ? () => false : conParams
    // un formulario EMBEBIDO en el overlay (EmbeddedView: un ServerSide propio dentro del Dialog
    // o del Drawer) es la superficie: sus campos, sus botones y sus textos. Recorrer el árbol
    // del overlay no los encontraba — el recorrido no cruza a otro ServerSide — y el diálogo
    // salía vacío.
    const surface = ctx.surface || ctx.tree
    const surfaceCtx = surface === ctx.tree ? ctx : { ...ctx, tree: surface }
    const content = (islandContentOf(surfaceCtx) || [])
      .map((block) => ({
        ...block,
        items: block.items
          .filter((a) => !a.isInput && !a.isFormLayout)
          .map((a) => (a.isButtons ? { ...a, buttons: (a.buttons || []).filter(keepInContent) } : a))
          .filter((a) => !a.isButtons || a.buttons.length),
      }))
      .filter((block) => block.items.length)
    const contentActionIds = new Set()
    for (const block of content) {
      for (const a of block.items) {
        if (a.isButtons) for (const btn of a.buttons || []) contentActionIds.add(btn.actionId)
      }
    }
    return {
      id,
      title: ctx.title || '',
      // el subtítulo del Drawer (General Drawer: «Room 102 · 12 oct → 14 oct») bajo el título
      subtitle: ctx.subtitle || '',
      position: ctx.position || 'end',
      width: ctx.width,
      state: ctx.state || {},
      fields: fieldListOf(surface, ctx.state, ctx.data),
      sections: formSectionsOf(surface, ctx.state, ctx.data),
      actions: actionsOf(surface).filter((a) => !contentActionIds.has(a.actionId)),
      content: content,
      hasContent: !!content.length,
      // un overlay Dialog se pinta como MODAL (oj-dialog: decisión puntual), no como
      // drawer (tarea con formulario); texts = sus líneas de mensaje
      isDialog,
      texts: collectTexts(surface),
    }
  }

  /** Vigía del diálogo de progreso de un LongTask sobre el stream SSE: consume el Add del
   *  Dialog-con-ProgressBar y los state-only dirigidos a su id; devuelve eventos
   *  {kind: open|progress, title?, text?, value?, rest} para que el chain pinte el
   *  oj-dialog — `rest` lleva los commands/messages del increment (el último los trae:
   *  dispatchEvent del refresco) SIN el fragment del diálogo, listos para reducir. */
  function longTaskWatcher() {
    const hasProgressBar = (node) => {
      if (!node || typeof node !== 'object') return false
      if (node.metadata && node.metadata.type === 'ProgressBar') return true
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) { if (v.some(hasProgressBar)) return true }
        else if (v && typeof v === 'object' && hasProgressBar(v)) return true
      }
      return false
    }
    const w = { dialogId: null, closeAfter: null }
    w.consume = (inc) => {
      for (const fragment of inc.fragments || []) {
        const md = fragment.component && fragment.component.metadata
        if (fragment.action === 'Add' && md && md.type === 'Dialog' && hasProgressBar(fragment.component)) {
          w.dialogId = md.id
          const seed = md.initialData || {}
          return {
            kind: 'open',
            title: seed.title,
            text: seed.progressText,
            value: seed.progressValue || 0,
            rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
          }
        }
      }
      if (!w.dialogId) return null
      const frs = inc.fragments || []
      if (frs.length && frs.every((f) => !f.component && f.targetComponentId === w.dialogId)) {
        const st = frs[0].state || {}
        if (st._closeAfterMillis != null) w.closeAfter = st._closeAfterMillis
        return {
          kind: 'progress',
          title: st.title,
          text: st.progressText,
          value: st.progressValue,
          rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
        }
      }
      return null
    }
    return w
  }

  /** Helper de RENDER: recolecta los textos (metadata.type Text) de un subárbol. */
  function collectTexts(node, out = []) {
    if (!node || typeof node !== 'object') return out
    if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
      out.push(node.metadata.text)
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach((x) => collectTexts(x, out))
      else if (v && typeof v === 'object') collectTexts(v, out)
    }
    return out
  }

  /** Proyección del FOLDOUT (Fase 7): overview + paneles con sus cabeceras (metadata.panels)
   *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout.
   *  Cada slot proyecta además sus bloques RICOS (mismo pipeline que el host: tarjetas
   *  StatusList, botones, inputs, notices…) — el markup pinta blocks y deja texts solo
   *  como forma legada para tests/fixtures. */
  function foldoutOf(ctx) {
    // el foldout de PÁGINA: uno metido en una pestaña (o en un panel de consola) es contenido de esa
    // pestaña — visit() lo pinta allí, con sus paneles plegables — y no se adueña de la pantalla
    const node = ctx && ctx.tree ? findOutside(ctx.tree, 'FoldoutLayout', { ...PANE_TYPES, TabLayout: true }) : null
    if (!node) return null
    const md = node.metadata
    const children = node.children || []
    const bySlot = {}
    for (const child of children) bySlot[child.slot || ''] = child
    const blocksOf = (slotNode) => {
      const blocks = slotNode
        ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {}, data: (ctx && ctx.data) || {} })
        : null
      // mismo contrato visual que hostContentOf: bloques-columna con su colClass,
      // el resto a fila completa
      return (blocks || []).map((block) => ({
        ...block,
        blockClass: block.colClass || 'oj-flex-item oj-sm-12',
      }))
    }
    // Las insignias de la PÁGINA (el @Status de la cabecera: «Confirmed») encabezan el overview:
    // el web las pinta junto al título, y la cabecera de VB no tiene sitio para ellas. Mismas
    // clases badge de JET que las celdas @Status; una plantilla sin resolver no se pinta.
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    const state = (ctx && ctx.state) || {}
    const pageBadges = ((page && page.metadata && page.metadata.badges) || [])
      .map((b) => {
        const label = interpolate(b.text || '', state)
        const color = interpolate(b.color || '', state)
        return {
          isBadge: true,
          label,
          badgeClass: STATUS_BADGE[color] || BADGE_CLASSES[String(color).toLowerCase()] || STATUS_BADGE.NONE,
          blockClass: 'oj-flex-item oj-sm-12',
        }
      })
      .filter((b) => b.label && b.label.trim() && !b.label.includes('${'))
    return {
      headerTitle: md.headerTitle || '',
      badges: pageBadges,
      overview: {
        texts: collectTexts(bySlot['overview']),
        // un bloque PLANO que las lleva como átomos: el template del overview solo pinta bloques
        // isCard/isPlain e isBadge es un átomo de sus items — un bloque isBadge suelto no se veía
        blocks: (pageBadges.length
          ? [{ isPlain: true, isCard: false, blockClass: 'oj-flex-item oj-sm-12', items: pageBadges }]
          : []).concat(blocksOf(bySlot['overview'])),
      },
      panels: (md.panels || []).map((panel, i) => ({
        title: panel.title || '',
        subtitle: panel.subtitle || '',
        // título compuesto del panel: "Operaciones · 1 de 7" — el contador vive en la
        // CABECERA (leído del contenido vivo por índice, refresca sin re-stampar)
        headerLabel: (panel.title || '') + (panel.subtitle ? ' · ' + panel.subtitle : ''),
        open: panel.open !== false,
        // width EXPLÍCITO del wire (FoldoutPanel.width): el markup fija el panel a esa
        // medida — sin él, el motor responsive del foldout reparte a su aire y las
        // tarjetas del cockpit se solapan
        width: panel.width || '',
        texts: collectTexts(bySlot['panel-' + i]),
        blocks: blocksOf(bySlot['panel-' + i]),
      })),
    }
  }

  /** Proyección del WIZARD (Fase 8): los ProgressSteps del wire → pasos ({id,label} + currentStep
   *  por id). null si la página no es un wizard. En la pantalla de resultado todos los pasos van
   *  'done' → currentStep = el último.
   *
   *  ORIENTACIÓN: la decide el propio wizard con @WizardProgress — RAIL manda un ProgressSteps
   *  VERTICAL (el rail lateral: el oj-sp-guided-process auténtico, con su columna de pasos a la
   *  derecha); STEPS manda uno HORIZONTAL, y eso es un tren de pasos ARRIBA (horizontal: true →
   *  oj-train sobre el contenido, y en pantallas estrechas la lista de pasos en vertical, que un
   *  tren de 4-5 rótulos no cabe en un móvil). */
  function wizardOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
    if (!node) return null
    const md = node.metadata
    const wire = md.steps || []
    const current = wire.find((s) => s.status === 'current')
    const currentId = current ? current.id : (wire.length ? wire[wire.length - 1].id : null)
    const currentIndex = Math.max(0, wire.findIndex((s) => s.id === currentId))
    const statusOf = (s, i) => s.status || (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming')
    // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on'. El
    // status es el del TEMPLATE (success | error | none), no el de Mateu: un paso hecho es
    // 'success' — el overview pinta «Completado» al pie de su columna y el rail su marca
    const steps = wire.map((s, i) => ({
      id: s.id,
      label: s.title || s.id,
      title: s.title || s.id,
      display: 'on',
      status: statusOf(s, i) === 'done' ? 'success' : 'none',
    }))
    const currentStep = currentId
    // el título del proceso (el h2 del wizard) y su subtítulo (@Subtitle): el overview del
    // guided process los pinta arriba a la izquierda, sobre las columnas de los pasos
    const heading = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
      && n.metadata.container === 'h2' && !!n.metadata.text) : null
    const subtitleNode = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
      && /(^|\s)mateu-wizard-subtitle(\s|$)/.test(n.cssClasses || '')) : null
    return {
      title: heading ? String(heading.metadata.text) : '',
      subtitle: subtitleNode ? String(subtitleNode.metadata.text || '') : '',
      // Start del overview: el primer paso; con el wizard ya empezado, «Reanudar» en el suyo
      resumeStepId: currentIndex > 0 && currentId ? currentId : '',
      steps,
      currentStep,
      horizontal: !md.vertical,
      currentIndex,
      currentLabel: steps.length ? steps[currentIndex].label : '',
      total: steps.length,
      // el tren (oj-train): los hechos se pueden VISITAR (volver atrás), los que faltan no —
      // se avanza con el botón del paso, que valida
      trainSteps: wire.map((s, i) => {
        const status = statusOf(s, i)
        return {
          id: s.id,
          label: s.title || s.id,
          visited: status === 'done',
          disabled: status === 'upcoming',
        }
      }),
      // la misma lista, para la variante vertical (pantallas estrechas): número o ✓ + rótulo
      listSteps: wire.map((s, i) => {
        const status = statusOf(s, i)
        return {
          id: s.id,
          label: s.title || s.id,
          marker: status === 'done' ? '✓' : String(i + 1),
          cls: 'mateu-wizard-step mateu-wizard-step-' + status,
        }
      }),
    }
  }

  // ── MatrixGrid → oj-data-grid ────────────────────────────────────────────────────────────────
  // La matriz (filas × fechas, secciones plegables, celdas que enlazan y filas editables) la pinta
  // el oj-data-grid de JET sobre un RowDataGridProvider de un FlattenedTreeDataProviderView: las
  // secciones son nodos del árbol (el disclosure lo pinta JET), las columnas c0..cN. Aquí se arma
  // la especificación PURA (probada en Node); el provider lo crea la fábrica del bridge.
  let matrixProviderFactory = null
  function setMatrixProviderFactory(factory) { matrixProviderFactory = factory }

  const MATRIX_TONES = { info: 1, success: 1, warning: 1, danger: 1, neutral: 1 }
  const toneClass = (tone) => (tone && MATRIX_TONES[tone] ? 'mateu-matrix-' + tone : '')

  /** Clave del estado plegado de una sección (el mismo almacén que los paneles plegables). */
  const matrixSectionKey = (gridId, sectionId) => 'matrix:' + gridId + ':' + sectionId

  function matrixSpecOf(m, id) {
    const gridId = String(id || 'matrix').replace(/[^A-Za-z0-9_-]/g, '_')
    const columns = m.columns || []
    const columnKeys = columns.map((c, i) => 'c' + i)
    const cellsOf = (row, sectionId) => {
      const out = { id: sectionId + '/' + row.id, label: row.label || '', _rowId: row.id, _editable: !!row.editable,
        _emphasis: !!row.emphasis }
      columns.forEach((col, i) => {
        const cell = (row.cells || [])[i] || { value: '' }
        const cls = ['mateu-matrix-cell', toneClass(cell.tone) || toneClass(col.tone),
          row.emphasis ? 'mateu-matrix-emphasis' : '', cell.link && m.cellActionId ? 'mateu-matrix-link' : '',
          row.editable && m.editActionId ? 'mateu-matrix-editable' : ''].filter(Boolean).join(' ')
        out['c' + i] = { v: cell.value == null ? '' : String(cell.value), cls, link: !!(cell.link && m.cellActionId),
          editable: !!(row.editable && m.editActionId), rowId: row.id, columnId: col.id }
      })
      return out
    }
    const data = []
    const expanded = []
    for (const section of m.sections || []) {
      const rows = (section.rows || []).map((r) => cellsOf(r, section.id))
      if (section.title) {
        const key = '§' + section.id
        const blank = {}
        columnKeys.forEach((k) => { blank[k] = { v: '', cls: 'mateu-matrix-cell mateu-matrix-section-cell', link: false } })
        data.push({ id: key, label: section.title, _section: section.id, ...blank, children: rows })
        if (panelExpanded(matrixSectionKey(gridId, section.id), !section.collapsed)) expanded.push(key)
      } else {
        data.push(...rows)
      }
    }
    // cabeceras: si hay grupos (el mes), dos niveles — el grupo abarca sus columnas consecutivas
    const hasGroups = columns.some((c) => c.group)
    const columnHeaders = []
    if (!hasGroups) columns.forEach((c) => columnHeaders.push(c.label || c.id))
    else {
      for (const c of columns) {
        const last = columnHeaders[columnHeaders.length - 1]
        if (c.group && last && last.group === c.group) last.children.push({ data: c.label || c.id })
        else if (c.group) columnHeaders.push({ data: c.group, group: c.group, children: [{ data: c.label || c.id }] })
        else columnHeaders.push({ data: c.label || c.id, depth: 2 })
      }
    }
    return { gridId, data, expanded, columnKeys, columnHeaders: hasGroups ? columnHeaders.map(({ group, ...h }) => h) : columnHeaders,
      rowHeaderLabel: m.rowHeaderLabel || '' }
  }

  function matrixAtomOf(m, id, interp = (x) => x) {
    const spec = matrixSpecOf({ ...m, rowHeaderLabel: interp(m.rowHeaderLabel || '') }, id)
    const rows = spec.data.reduce((n, r) => n + 1 + (r.children && spec.expanded.includes(r.id) ? r.children.length : 0), 0)
    return {
      isMatrix: true,
      gridId: 'mateuMatrix-' + spec.gridId,
      matrixId: spec.gridId,
      cellActionId: m.cellActionId || '',
      editActionId: m.editActionId || '',
      // alto a la medida (cabecera(s) + filas visibles), con techo: el grid hace scroll dentro
      // (un OBJETO: el :style de JET no acepta la cadena CSS)
      gridStyle: { width: '100%', height: Math.min(36, 3 + (spec.columnHeaders.some((h) => h && h.children) ? 2.25 : 0) + rows * 2.375) + 'rem' },
      provider: matrixProviderFactory ? matrixProviderFactory(spec) : null,
      // el tono va en la CELDA del grid (no en el texto): JET pide la clase por contexto
      cellClassName: (ctx) => {
        // en el callback de clase el valor viene en ctx.data.data (en la plantilla, en cell.item)
        const d = (ctx && ctx.data && ctx.data.data) || (ctx && ctx.item && ctx.item.data && ctx.item.data.data)
        return 'oj-helper-justify-content-right ' + ((d && d.cls) || '')
      },
      // qué celdas se editan lo decide JET (cell.editable): las demás quedan read-only nativas
      cellEditable: (ctx) => {
        const d = (ctx && ctx.data && ctx.data.data) || (ctx && ctx.item && ctx.item.data && ctx.item.data.data)
        return d && d.editable ? 'enable' : 'disable'
      },
      columnHeaderClassName: (ctx) => {
        const col = (m.columns || [])[ctx && ctx.index]
        return (ctx && ctx.level === 0 && (m.columns || []).some((c) => c.group)) ? '' : toneClass(col && col.tone)
      },
      spec,
    }
  }

  /** «ctrl+i» → «Ctrl+I», para el rótulo del disparador. */
  function shortcutHintOf(shortcut) {
    if (!shortcut) return ''
    return String(shortcut).split('+').map((k) => k.trim()).filter(Boolean)
      .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')
  }

  /** PANEL DE ACCIONES por categorías («I want to…»): columnas por categoría, las acciones CON
   *  datos primero (y en negrita), hasta maxPerCategory visibles y el resto tras «Show more».
   *  Mostrar más / ocultar las vacías / abrir y cerrar es estado del DOM (installActionPanels):
   *  sin ida y vuelta al servidor y sin re-proyectar. */
  function actionPanelAtomOf(m, id, interp = (x) => x) {
    const max = m.maxPerCategory > 0 ? m.maxPerCategory : 10
    const panelId = 'mateuActionPanel-' + String(id || m.label || 'actions').replace(/[^A-Za-z0-9_-]/g, '_')
    const categories = (m.categories || []).map((c, ci) => {
      const actions = (c.actions || [])
        .map((a, i) => ({ a, i }))
        .sort((x, y) => (Number(!!y.a.populated) - Number(!!x.a.populated)) || (x.i - y.i))
        .map(({ a }, i) => ({
          label: interp(a.label || '') + (a.count > 0 ? ' (' + (a.count > 25 ? '25+' : a.count) + ')' : ''),
          actionId: a.actionId || '',
          parameters: a.parameters || {},
          disabled: !!a.disabled,
          itemClass: 'mateu-ap-item' + (a.populated ? ' mateu-ap-populated' : ' mateu-ap-unpopulated') + (i >= max ? ' mateu-ap-extra' : ''),
        }))
      const extra = Math.max(0, actions.length - max)
      // con «ocultar vacías» una columna sin acciones con datos sobra entera, y el «mostrar más»
      // también cuando lo que esconde son sólo vacías (los poblados van primero: si alguno queda
      // fuera del corte, todo lo que hay antes también es poblado)
      const populated = (c.actions || []).filter((a) => a.populated).length
      return {
        key: panelId + ':' + ci, title: interp(c.title || ''), actions, hasMore: extra > 0,
        moreLabel: 'Show more (' + extra + ')',
        columnClass: 'mateu-ap-column' + (populated ? '' : ' mateu-ap-column-unpopulated'),
        moreClass: 'mateu-ap-more' + (populated > max ? '' : ' mateu-ap-unpopulated'),
      }
    }).filter((c) => c.actions.length)
    return {
      isActionPanel: true,
      panelId,
      label: interp(m.label || 'I want to…'),
      shortcut: String(m.shortcut || '').toLowerCase(),
      title: interp(m.label || 'I want to…') + (m.shortcut ? '  (' + shortcutHintOf(m.shortcut) + ')' : ''),
      hideToggle: !!m.hideUnpopulatedToggle,
      categories,
    }
  }

  /** Las pistas de un grid-template-columns como PESOS: repeat(N, x) se expande, «Nfr», «N%» y
   *  minmax(…, Nfr) pesan N, lo demás (px, rem, auto, min-content…) pesa 1 — una aproximación: el
   *  flex de JET reparte en doceavos, no en pistas. */
  function gridTrackWeights(template) {
    const src = String(template || '').trim()
    if (!src) return []
    // trocea por espacios de primer nivel (no dentro de paréntesis)
    const tokens = []
    let depth = 0, cur = ''
    for (const ch of src) {
      if (ch === '(') depth++
      if (ch === ')') depth--
      if (/\s/.test(ch) && depth === 0) { if (cur) tokens.push(cur); cur = '' } else cur += ch
    }
    if (cur) tokens.push(cur)
    const weightOf = (tok) => {
      const fr = /(\d*\.?\d+)(fr|%)\)?$/.exec(tok)
      return fr ? Number(fr[1]) : 1
    }
    const out = []
    for (const tok of tokens) {
      const rep = /^repeat\(\s*(\d+)\s*,\s*(.+)\)$/.exec(tok)
      if (rep) {
        const inner = gridTrackWeights(rep[2])
        for (let i = 0; i < Number(rep[1]); i++) out.push(...inner)
      } else if (/^repeat\(/.test(tok)) return [] // auto-fill/auto-fit: lo decide el ancho, no se sabe aquí
      else out.push(weightOf(tok))
    }
    return out
  }

  /** Clase oj-flex de cada hijo de una rejilla (auto-colocación CSS: en orden, saltando de fila
   *  cuando el span no cabe). null si la rejilla es de una pista (o no se sabe): se apila. */
  function gridColClasses(template, colSpans, count) {
    const weights = gridTrackWeights(template)
    if (weights.length < 2) return null
    const total = weights.reduce((a, b) => a + b, 0)
    const classes = []
    let cursor = 0
    for (let i = 0; i < count; i++) {
      const span = Math.max(1, Math.min(weights.length, (colSpans && colSpans[i]) || 1))
      if (cursor + span > weights.length) cursor = 0
      const share = weights.slice(cursor, cursor + span).reduce((a, b) => a + b, 0) / total
      const twelfths = Math.max(1, Math.min(12, Math.round(12 * share)))
      classes.push('oj-flex-item oj-sm-12 oj-md-' + twelfths + (twelfths < 12 ? ' oj-sm-padding-2x-end' : ''))
      cursor = (cursor + span) % weights.length
    }
    return classes
  }

  /** «colSpan de N columnas» → la clase oj-flex del bloque (doceavos, nunca más de 12). */
  function panelColClass(colSpan, columns) {
    const span = Math.max(1, Math.min(columns, colSpan > 0 ? colSpan : 1))
    const twelfths = Math.max(1, Math.min(12, Math.round((12 * span) / columns)))
    return 'oj-flex-item oj-sm-12 oj-md-' + twelfths + ' oj-sm-padding-2x-end'
  }

  const TREND_TEXT = { up: '▲', down: '▼', neutral: '■' }
  /** Un MetricCard (KPI) listo para la plantilla: valor grande, tendencia con color, y si lleva
   *  actionId, un botón que lanza la acción (p.ej. la búsqueda filtrada que lo explica). */
  function metricOf(m, interp = (x) => x) {
    const trend = m.trend || ''
    return {
      title: interp(m.title || ''),
      value: String(m.value == null ? '' : m.value),
      unit: m.unit || '',
      trendText: trend ? (TREND_TEXT[trend] || '') + (m.trendLabel ? ' ' + interp(m.trendLabel) : '') : (m.trendLabel ? interp(m.trendLabel) : ''),
      trendClass: 'oj-typography-body-sm ' + (trend === 'up' ? 'mateu-trend-up' : trend === 'down' ? 'mateu-trend-down' : 'oj-text-color-secondary'),
      description: interp(m.description || ''),
      actionId: m.actionId || '',
      parameters: {},
    }
  }

  // Chart.js (el vocabulario del wire) → oj-chart de JET
  const CHART_TYPES = {
    bar: { type: 'bar' }, line: { type: 'line' }, pie: { type: 'pie' }, doughnut: { type: 'pie', innerRadius: 0.55 },
    radar: { type: 'line', polar: true }, polarArea: { type: 'bar', polar: true },
    scatter: { type: 'line', markersOnly: true }, bubble: { type: 'line', markersOnly: true },
  }
  /** Un Chart (series × etiquetas) o un TrendChart (una serie) → átomo de oj-chart: los ITEMS
   *  precomputados ({series, group, value}); en una tarta cada etiqueta es una serie (una porción). */
  function chartAtomOf(m, t, interp = (x) => x) {
    const trend = t === 'TrendChart'
    const labels = (trend ? m.labels : m.chartData && m.chartData.labels) || []
    const datasets = trend
      ? [{ label: m.title || '', data: m.values || [] }]
      : ((m.chartData && m.chartData.datasets) || [])
    const spec = trend ? { type: m.area ? 'area' : 'line' } : (CHART_TYPES[m.chartType] || CHART_TYPES.bar)
    const pie = spec.type === 'pie'
    const items = []
    datasets.forEach((d, si) => (d.data || []).forEach((value, i) => {
      const label = labels[i] != null ? String(labels[i]) : String(i + 1)
      items.push({
        _rowNumber: items.length,
        id: si + ':' + i,
        value: value == null ? null : Number(value),
        series: pie ? label : (d.label || 'Series ' + (si + 1)),
        group: pie ? (d.label || 'Total') : label,
      })
    }))
    return {
      isChart: true,
      title: trend ? interp(m.title || '') : '',
      chartType: spec.type,
      coordinateSystem: spec.polar ? 'polar' : 'cartesian',
      innerRadius: spec.innerRadius || 0,
      lineType: spec.markersOnly ? 'none' : 'auto',
      markerDisplayed: spec.markersOnly ? 'on' : 'auto',
      legend: datasets.length > 1 || pie ? 'on' : 'off',
      chartStyle: { width: '100%', height: pie ? '18rem' : '16rem' },
      items,
      provider: dataProviderFactory ? dataProviderFactory(items) : null,
    }
  }

  /** ¿Es un átomo RICO (display de verdad, no un campo suelto)? Cuando el contenido de una pantalla
   *  los trae, el formulario genérico sobra: sus campos ya se ven en ellos. */
  const RICH_ATOM_FLAGS = [
    'isEntityHeader', 'isTaskProgress', 'isMeter', 'isStatusList', 'isLedger', 'isPayment',
    'isResourceGrid', 'isAddOns', 'isStat', 'isNotice', 'isPropertyRow',
    // reto PMS: cualquier átomo NUEVO tiene que estar aquí — si no, en una página que también
    // lleva campos gana el formulario genérico (que solo pinta campos) y el átomo desaparece
    'isAnchor', 'isQueue', 'isPlanning', 'isCollapsible', 'isActionPanel', 'isMatrix', 'isChart', 'isScoreboard', 'isCalendar', 'isPopover',
  ]
  function isRichAtom(a) {
    return !!a && RICH_ATOM_FLAGS.some((flag) => a[flag])
  }

  /** ¿Es este bloque de botones el PIE del wizard (Back / Next / la acción de completar)? */
  function isWizardNavAtom(a) {
    return !!(a && a.isButtons && (a.buttons || []).some((b) => b.actionId === 'back' || b.actionId === 'next'))
  }

  /**
   * El PASO actual de un wizard, listo para pintar: { title, content, sections, nav }.
   *
   * - content: los bloques display del paso (hostContentOf en modo wizard, con la isla fusionada).
   * - sections: los campos del paso agrupados por @Section (formSectionsOf), o [] si el contenido
   *   es RICO (la misma regla que el host: el header/las property rows ya muestran esos datos).
   * - Cada campo UNA vez: los FormFields que el formulario pinta (con su widget de verdad: select,
   *   fecha…) salen del contenido, donde sólo serían un oj-input-text de texto — antes salían dos
   *   veces, arriba como texto y abajo con su desplegable. Los de una isla fusionada (fromNested)
   *   son de otro contexto y se quedan.
   * - En HORIZONTAL (tren arriba) el pie Back/Next del wire sale del contenido a `nav` (la barra
   *   del pie), y el título del wizard (su h2) sale a `title` si la página no trae otro.
   */
  function wizardStepViewOf(ctx, islandBlocks, opts = {}) {
    const wizard = wizardOf(ctx)
    if (!wizard) return null
    let content = hostContentOf(ctx, islandBlocks,
      { forWizard: true, keepWizardNav: wizard.horizontal, title: opts.title || '' }) || []
    let sections = opts.sections || []
    if (content.some((block) => (block.items || []).some(isRichAtom))) sections = []
    const onForm = new Set()
    for (const section of sections) for (const f of section.fields || []) onForm.add(f.fieldId)
    let title = opts.title || ''
    let nav = []
    let subtitleDropped = false
    content = content.map((block) => {
      let movedToForm = 0
      const items = block.items.map((a) => {
        if (!a.isFormLayout || a.fromNested) return a
        const kept = a.fields.filter((f) => !onForm.has(f.fieldId))
        movedToForm += a.fields.length - kept.length
        return kept.length === a.fields.length ? a : { ...a, fields: kept }
      }).filter((a) => {
        if (a.isFormLayout && !a.fields.length) return false
        if (a.isInput && !a.fromNested && onForm.has(a.fieldId)) { movedToForm++; return false }
        // el título del wizard (su h2) va a la cabecera — el h1 sobre el tren, o el título del
        // proceso del guided process —, y su subtítulo con él: ninguno se repite en el paso
        if (a.isText && a.isH2 && (!title || a.text === title || a.text === wizard.title)) {
          if (!title) title = a.text
          return false
        }
        if (!subtitleDropped && wizard.subtitle && a.isText && !a.isHeading && a.text === wizard.subtitle) {
          subtitleDropped = true
          return false
        }
        if (wizard.horizontal && isWizardNavAtom(a)) { nav = a.buttons; return false }
        return true
      })
      // una tarjeta de @Section cuyos campos se fueron al form se queda en su título: el form
      // ya pinta esa sección con su encabezado — fuera la tarjeta vacía
      const onlyHeadings = items.every((a) => a.isText && a.isHeading)
      return { ...block, items: movedToForm && onlyHeadings ? [] : items }
    }).filter((block) => block.items.length)
    // el rótulo del paso ya lo pinta la cabecera del paso (el h2 bajo el tren, o el título del
    // paso del guided process): una @Section que se llama igual que su paso no lo repite
    const stepLabel = wizard.currentLabel
    sections = sections.map((section) => (
      stepLabel && section.title && section.title.trim() === stepLabel.trim()
        ? { ...section, title: '', hasTitle: false }
        : section))
    // la acción de AVANCE (Next, o la de completar) es la llamada a la acción del pie
    nav = nav.map((b) => ({
      ...b,
      chroming: b.actionId === 'back' ? 'outlined' : 'callToAction',
    }))
    return { wizard, title: title || wizard.title, subtitle: wizard.subtitle, content, sections, nav }
  }

  /** Helper de RENDER: todos los nodos de un tipo (sin cruzar fronteras de isla). */
  function findAllByType(tree, type) {
    const out = []
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return
      if (n.metadata && n.metadata.type === type) out.push(n)
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** Card → {title, texts} (el título del Card es un componente Text anidado). */
  function cardOf(node) {
    const md = (node && node.metadata) || {}
    return { title: collectTexts(md.title)[0] || '', texts: collectTexts(md.content) }
  }

  /** Arquetipo WELCOME: hero (título/subtítulo + CTAs) + tiles del DashboardLayout. */
  /** Los pares color + ilustración del hero de la welcome: las 5 parejas bg+fg de la galería OFICIAL
   *  (fnd/gallery illust-welcome-banner-*-01..05), cada una con su tono de la paleta oscura RDS. */
  const WELCOME_LOOKS = [
    ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
    ['dark-sienna', '04'], ['dark-teal', '05'],
  ]
  const WELCOME_GALLERY = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/'

  /** Qué welcome es la que se pinta: su clase de servidor (o, sin ella, el id del árbol). */
  function welcomeKeyOf(ctx) {
    const tree = ctx && ctx.tree
    return tree ? (tree.serverSideType || tree.id || '') : ''
  }

  /**
   * El aspecto del hero: uno al azar al ENTRAR en una welcome, y el mismo mientras se siga en ella.
   *
   * Rotaba en cada proyección, y una welcome se reproyecta con la respuesta de cada acción que se
   * lanza desde ella — también la de un CTA que devuelve una ruta ("Ir a Reservas"): el hero cambiaba
   * de color justo antes de navegar, durante todo lo que tardara en llegar la página siguiente.
   * Ahora sólo rota en una visita nueva: no había welcome pintada (`previous` nulo) o era otra.
   *
   * @param key       welcomeKeyOf del contexto que se proyecta
   * @param previous  el aspecto pintado ({key, theme, illuBg, illu}) si ya había una welcome, o null
   */
  function welcomeLookOf(key, previous, random = Math.random) {
    if (previous && previous.theme && previous.key === key) return previous
    const [theme, n] = WELCOME_LOOKS[Math.floor(random() * WELCOME_LOOKS.length) % WELCOME_LOOKS.length]
    return {
      key,
      theme,
      illuBg: WELCOME_GALLERY + 'illust-welcome-banner-bg-' + n + '.png',
      illu: WELCOME_GALLERY + 'illust-welcome-banner-fg-' + n + '.png',
    }
  }

  function welcomeOf(ctx) {
    const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
    if (!hero) return null
    const md = hero.metadata
    const ctas = actionsOf(hero)
    const panels = findAllByType(ctx.tree, 'DashboardPanel')
    // un TrendChart en un tile → CHART a todo el ancho bajo los KPIs (oj-chart en VB);
    // items PRECOMPUTADOS (id/value/group/series) — el CSP de VB no construye arrays
    const trendPanel = panels.find(
      (panel) => findByType(panel, 'TrendChart') || findByType(panel, 'Chart'))
    const chartNode = trendPanel
      ? findByType(trendPanel, 'TrendChart') || findByType(trendPanel, 'Chart') : null
    const tm = chartNode ? chartNode.metadata : null
    // valores/labels de las dos formas del wire: TrendChart (values/labels planos) o
    // Chart (chartData.labels + datasets[0].data — se toma la primera serie)
    const dataset = tm && tm.chartData && tm.chartData.datasets && tm.chartData.datasets.length
      ? tm.chartData.datasets[0] : null
    const values = tm ? (tm.values || (dataset ? dataset.data : []) || []) : []
    const labels = tm ? (tm.labels || (tm.chartData ? tm.chartData.labels : []) || []) : []
    const series = (dataset && dataset.label) || 'Ocupación %'
    const trend = tm
      ? {
          title: trendPanel.metadata.title || tm.title || '',
          items: (values || []).map((value, i) => ({
            id: i,
            value,
            group: [labels[i] != null ? labels[i] : String(i + 1)],
            series,
          })),
        }
      : null
    const tiles = panels.filter((panel) => panel !== trendPanel).map((panel) => {
      // un MetricCard dentro del tile → KPI (valor grande + etiqueta + caption)
      const metric = findByType(panel, 'MetricCard') || findByType(panel, 'Stat')
      const mm = metric ? metric.metadata : null
      return {
        title: panel.metadata.title || '',
        texts: collectTexts(panel),
        isKpi: !!mm,
        kpiTitle: mm ? (mm.title || mm.label || '') : '',
        kpiValue: mm ? String(mm.value == null ? '' : mm.value) : '',
        kpiCaption: mm ? (mm.description || mm.caption || '') : '',
        kpiActionId: mm ? (mm.actionId || '') : '',
      }
    })
    return {
      trend,
      title: md.title || '',
      subtitle: md.subtitle || '',
      ctas,
      primaryCta: ctas.length ? { label: ctas[0].label } : { label: '' },
      primaryCtaId: ctas.length ? ctas[0].actionId : '',
      secondaryCta: ctas.length > 1 ? { label: ctas[1].label } : null,
      secondaryCtaId: ctas.length > 1 ? ctas[1].actionId : '',
      tiles,
    }
  }

  /** Arquetipo GENERAL OVERVIEW: switcher de registro + EntityHeader + cards. */
  function generalOverviewOf(ctx) {
    const header = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
    if (!header) return null
    const md = header.metadata
    const switcher = collectFields(ctx.tree).find((f) => f.options && f.options.length)
    // el arquetipo REQUIERE el switcher de registro: un EntityHeader suelto (p.ej. el 360
    // de en casa o el folio de check-out como página) NO es un General Overview
    if (!switcher) return null
    const state = ctx.state || {}
    const badgeText = (md.badges || []).map((b) => b.label).join(' · ')
    const facts = (md.facts || []).map((f) => ({ label: f.label, value: f.value }))
    if (md.metricLabel) facts.push({ label: md.metricLabel, value: md.metricValue })
    const cards = findAllByType(ctx.tree, 'Card')
      .map(cardOf)
      .filter((card) => card.title) // los Card sin título son wrappers de sección/estructura
    return {
      title: md.title || '',
      subtitle: (md.subtitle || '') + (badgeText ? ' · ' + badgeText : ''),
      facts,
      switcherField: switcher ? switcher.fieldId : '',
      switcherOptions: switcher
        ? switcher.options.map((o) => ({ value: o.value, label: o.label }))
        : [],
      switcherValue: switcher ? state[switcher.fieldId] : null,
      cards,
    }
  }

  /** Clave de una barra de pestañas del contenido: '' para la primera de primer nivel (la de
   *  siempre, así una página con una sola barra no cambia); dentro de una pestaña, el id de esa
   *  pestaña; las hermanas siguientes llevan '/tabs-N'. */
  function tabStripKeyOf(scope, ordinal) {
    return [scope || '', ordinal ? 'tabs-' + ordinal : ''].filter(Boolean).join('/')
  }

  /** Id de la pestaña i de una barra: 'tab-i' en la de primer nivel, '<clave>/tab-i' en el resto. */
  function tabIdOf(stripKey, index) {
    return (stripKey ? stripKey + '/' : '') + 'tab-' + index
  }

  /** La barra a la que pertenece una pestaña (inversa de tabIdOf). */
  function tabStripOf(tabId) {
    const s = String(tabId || '')
    const cut = s.lastIndexOf('/')
    return cut < 0 ? '' : s.slice(0, cut)
  }

  /** Anota la pestaña elegida en el mapa de activas (una por barra), sin tocar las demás barras. */
  function withActiveTab(activeTabs, tabId) {
    return { ...(activeTabs || {}), [tabStripOf(tabId)]: tabId }
  }

  /** Ids de las barras de pestañas (átomos isTabs) de unos bloques: las chains las refrescan. */
  function tabBarIdsOf(blocks) {
    const ids = []
    const walk = (items) => (items || []).forEach((a) => {
      if (a && a.isTabs && a.barId) ids.push(a.barId)
      if (a && a.items) walk(a.items)
    })
    ;(blocks || []).forEach((b) => walk(b.items))
    return ids
  }

  /** Arquetipo ITEM OVERVIEW: panel de datos clave + tabs. */
  function itemOverviewOf(ctx) {
    const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
    if (!tabLayout) return null
    const keyCard = findAllByType(ctx.tree, 'Card').find((card) => !findByType(card, 'TabLayout'))
    // El arquetipo es panel de datos clave + pestañas: sin panel esto no es un item overview,
    // es un FORMULARIO que resulta que lleva pestañas dentro. Reclamarlo igual dejaba la página
    // sin sus campos (no hay tarjeta clave que pintar) y las pestañas reducidas a sus rótulos
    // (de su contenido solo se sacan textos sueltos). Le pasaba al detalle de un proceso.
    if (!keyCard) return null
    // solo las pestañas de la barra EXTERIOR: las de una barra anidada son contenido de su
    // pestaña (sus textos van en los de ella), no hermanas de la lista
    const tabs = (tabLayout.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab').map((tab, i) => ({
      id: 'itab-' + i,
      label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
      texts: collectTexts(tab),
    }))
    return {
      key: keyCard ? cardOf(keyCard) : { title: '', texts: [] },
      tabs,
    }
  }

  /** Puerta 1.3: banners de página (Page.metadata.banners) → items del
   *  oj-sp-messages-banner del starter (MessagesBannerType). */
  function bannersOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    // los messageType del oj-sp-messages-banner van con prefijo general-* (patrón del starter)
    const THEMES = { INFO: 'general-info', SUCCESS: 'general-success', WARNING: 'general-warning', DANGER: 'general-error' }
    return (((page || {}).metadata || {}).banners || []).map((banner, i) => ({
      id: 'mateu-banner-' + i,
      messageType: THEMES[banner.theme] || 'general-info',
      primaryText: banner.title || '',
      secondaryText: banner.description || '',
    }))
  }

  /** Puerta 1.6: anatomía RDS del ancho de página (medición Toolkit 24C) — el wrapper del
   *  contenido aplica contexts[host].pageWidth: fixed = tope 1408px con gutters 24px;
   *  fullWidth = fluido con gutters 24px; edgeToEdge = 0 márgenes. En FIXED el borde
   *  DERECHO se ancla a la MISMA fórmula con la que oj-sp-simple-ui-shell coloca su
   *  chrome flotante (chat FAB: right = (100vw - 1536px)/2, medido) — el shell calcula
   *  su caja sobre el viewport COMPLETO e ignora el navigator drawer, así que centrar
   *  el contenido en el área restante lo desalineaba del FAB en viewports anchos;
   *  izquierda auto (absorbe el drawer), tope 1408. */
  function pageStyleOf(ctx) {
    const width = (ctx && ctx.pageWidth) || 'fixed'
    if (width === 'edgeToEdge') return { maxWidth: 'none', margin: '0', padding: '0' }
    if (width === 'fullWidth') return { maxWidth: 'none', margin: '0', padding: '24px' }
    return {
      maxWidth: '1408px',
      margin: '0 max(24px, calc((100vw - 1536px) / 2 + 64px)) 0 auto',
      padding: '24px',
    }
  }

  /** Proyección de NAVEGACIÓN de la shell: items de primer nivel + grupos con sus hijos.
   *  Los hijos de un grupo navegan por su ruta COMPUESTA (/gestion/person) con el serverSideType
   *  del app (como Vaadin); un RouteLink dentro de un grupo no resuelve así y se carga por su
   *  ruta TERMINAL (loadMenuRouteInto, en transport.mjs).
   *  Selectores de contexto y acciones de cabecera salen listos para bindings simples. */
  // Iconos de menú: el wire trae nombres NEUTRALES (convención Mateu: set de Vaadin,
  // p.ej. "vaadin:calendar-user") — cada renderer los traduce a su set; aquí, al icon
  // font Redwood (oj-ux-ico-*, clases del gallery bundle). Un valor que ya venga como
  // clase oj-ux pasa tal cual; sin traducción conocida → sin icono.
  const OJ_ICONS = {
    'vaadin:calendar-user': 'oj-ux-ico-calendar-contact',
    'vaadin:calendar': 'oj-ux-ico-calendar',
    'vaadin:tasks': 'oj-ux-ico-task',
    'vaadin:automation': 'oj-ux-ico-robot-action',
    'vaadin:cog': 'oj-ux-ico-settings',
    'vaadin:cogs': 'oj-ux-ico-settings',
    'vaadin:home': 'oj-ux-ico-home',
    'vaadin:user': 'oj-ux-ico-contact',
    'vaadin:users': 'oj-ux-ico-contact-group',
    'vaadin:bed': 'oj-ux-ico-bed',
    'vaadin:chart': 'oj-ux-ico-bar-chart',
    'vaadin:table': 'oj-ux-ico-table',
    'vaadin:money': 'oj-ux-ico-currency-money',
    'vaadin:barcode': 'oj-ux-ico-scan-barcode',
    'vaadin:pencil': 'oj-ux-ico-edit',
    'vaadin:ban': 'oj-ux-ico-do-not-enter',
    'vaadin:rotate-left': 'oj-ux-ico-undo',
    'vaadin:exchange': 'oj-ux-ico-exchange-h',
    'vaadin:wifi': 'oj-ux-ico-connection',
    'vaadin:key': 'oj-ux-ico-key',
    'vaadin:pen': 'oj-ux-ico-signature',
    'vaadin:credit-card': 'oj-ux-ico-bank-card',
    'vaadin:gift': 'oj-ux-ico-gift',
    'vaadin:cart': 'oj-ux-ico-cart',
    'vaadin:check': 'oj-ux-ico-check',
    'vaadin:clock': 'oj-ux-ico-clock',
    // la campana del badge de la bandeja (widget de cabecera)
    'vaadin:bell': 'oj-ux-ico-notification',
    'vaadin:bell-o': 'oj-ux-ico-notification',
    'vaadin:envelope': 'oj-ux-ico-email',
    'vaadin:sign-out': 'oj-ux-ico-logout',
    'vaadin:sign-in': 'oj-ux-ico-login',
    'vaadin:cloud': 'oj-ux-ico-cloud',
    'vaadin:trending-up': 'oj-ux-ico-trending-up',
    'vaadin:building': 'oj-ux-ico-building',
    'vaadin:refresh': 'oj-ux-ico-refresh',
    'vaadin:close-circle': 'oj-ux-ico-close-circle',
  }
  function ojIconOf(icon) {
    if (!icon) return undefined
    if (icon.indexOf('oj-ux-') === 0) return icon
    return OJ_ICONS[icon] || undefined
  }

  /** El icono genérico para un icono DECLARADO que no tiene traducción a Redwood. */
  const GENERIC_ICON = 'oj-ux-ico-arrow-circle-right'

  /**
   * Como ojIconOf, pero un icono declarado sin traducción cae en uno genérico: una entrada de menú
   * o un botón de sólo icono nunca se queda en blanco («Llegadas» con vaadin:sign-in salía sin
   * icono junto a sus hermanas). ojIconOf sigue estricto: el HTML de los widgets quita los que no
   * conoce y el FAB de Ask cae en su propio glifo.
   */
  function ojIconOrGenericOf(icon) {
    if (!icon) return undefined
    return ojIconOf(icon) || GENERIC_ICON
  }

  /**
   * Una opción de menú → nodo del árbol que pintan la barra y el navigator.
   *
   * RECURSIVO porque el menú lo es: una shell federada llega con tres niveles sin pedir permiso
   * (grupo de la shell → grupo del pod → sus pantallas), y aplanarlo no deja el tercer nivel feo,
   * lo deja INALCANZABLE — el grupo del pod se navega como si fuese pantalla y contesta vacío.
   *
   * `id` es la ruta con la que se navega: la TERMINAL para una hoja local (la compuesta,
   * /gestion/person, es un camino de menú y no una ruta que el backend resuelva) y la COMPUESTA
   * para una traída de otro pod (la marca es el baseUrl que le dejó expandRemoteMenus): allí es
   * justo al revés — es la que ese pod sirve, y recortarla la deja sin dueño.
   */
  function navNodeOf(option, parentRoute) {
    const raw = option.route || option.path || ''
    // la ruta COMPUESTA (/gestion/person), como en Vaadin: es un camino de menú que el backend
    // resuelve con el serverSideType del app (onMateuNavigate lo añade vía localMenuOptionOf).
    // Recortarla a la terminal (/person) sólo funcionaba si el campo @Menu se llamaba como la ruta
    // @UI de su clase; con `@Menu FloorPlan floorPlan` + @UI("/floor-plan") quedaba sin dueño.
    void parentRoute
    const id = raw
    // una entrada OCULTA (@Menu @Hidden, visible:false) no se dibuja a ninguna profundidad: su ruta
    // sigue resolviendo (la registra el transporte), pero el menú no la enseña
    const children = (option.submenus || option.submenu || []).filter((child) => child.visible !== false)
    return {
      id,
      label: option.caption || option.label || id,
      icon: ojIconOrGenericOf(option.icon),
      // una sección remota cuyo pod no contestó: está, pero no se abre, y dice por qué
      disabled: !!option.unavailable,
      hint: option.unavailable ? (option.description || '') : '',
      hasChildren: children.length > 0,
      // el padre de un nieto es la ruta CRUDA del hijo, no su id ya recortado
      children: children.map((child) => navNodeOf(child, raw)),
      // MENÚ DE TARJETAS (@Menu(display = cards) en un grupo): en vez de un oj-menu, un oj-popup
      // con una rejilla de oj-action-card — título, descripción, icono/imagen y, si la entrada tiene
      // hijos, esos hijos como acciones de la tarjeta. Los ids del popup y de su lanzador van
      // precalculados (el CSP de VB no concatena en las plantillas).
      ...cardsOf(option, children, raw),
    }
  }

  function cardsOf(option, children, raw) {
    const isCards = option.display === 'cards' && children.length > 0
    if (!isCards) return { isCards: false, cards: [], popupId: '', anchorId: '' }
    const key = String(raw || option.label || 'cards').replace(/[^A-Za-z0-9_-]/g, '_')
    return {
      isCards: true,
      popupId: 'mateuCards_' + key,
      anchorId: 'mateuCardsBtn_' + key,
      cards: children.filter((c) => !c.separator).map((child) => {
        const node = navNodeOf(child, raw)
        return {
          id: node.id,
          label: node.label,
          description: child.description || '',
          // un icono declarado sin equivalente Redwood toma el genérico: las tarjetas quedan alineadas
          iconClass: child.icon ? ojIconOrGenericOf(child.icon) : '',
          image: child.image || '',
          hasImage: !!child.image,
          hasIcon: !child.image && !!child.icon,
          navigable: !node.hasChildren,
          actions: node.children.filter((a) => !a.hasChildren).map((a) => ({ id: a.id, label: a.label })),
        }
      }),
    }
  }

  function shellNavOf(reg) {
    const shell = reg.shell || {}
    const items = []
    const menuTree = []
    let hasGroups = false
    for (const option of shell.menu || []) {
      // una opción que viaja sin pintarse (remota oculta): expandRemoteMenus ya la quita, pero un
      // menú que no pase por ahí tampoco debe dibujarla
      if (option.visible === false) continue
      const node = navNodeOf(option, '')
      items.push(node.disabled
        ? { id: node.id, label: node.label, icon: node.icon, disabled: true }
        : { id: node.id, label: node.label, icon: node.icon })
      if (node.hasChildren) hasGroups = true
      // las rutas que cubre la sección: con ellas se marca la que está en pantalla (activeSectionOf)
      node.routes = sectionRoutes(option, node)
      // HAMBURGER_SECTIONS: adónde lleva elegir la sección en la hamburguesa (su primera pantalla)
      node.home = sectionHomeOf(node)
      menuTree.push(node)
    }
    // la VARIANTE del wire manda: TABS → in-app navigation; HAMBURGUER_MENU/TILES →
    // hamburguesa que abre un DRAWER izquierdo con oj-navigation-list (como el navigator
    // FA); MENU_ON_TOP → SUBCABECERA: una banda clara bajo la cabecera oscura con el título de la
    // consola y las opciones de primer nivel (dropdown oj-menu para los grupos), como la banda 2
    // del renderer web; TABS con grupos (no caben en la barra inferior) → esas mismas opciones
    // dentro de la cabecera oscura (topbar)
    // HAMBURGER_SECTIONS (Opera Cloud) → SECCIONES: la hamburguesa abre un drawer con el primer
    // nivel (sólo las secciones) y la subcabecera lleva el segundo nivel de la sección en pantalla.
    // HAMBURGER_MENU es la grafía correcta de HAMBURGUER_MENU (el servidor manda la vieja; una
    // definición que llegue sin pasar por él puede traer la nueva).
    let mode = 'tabs'
    if (shell.variant === 'HAMBURGUER_MENU' || shell.variant === 'HAMBURGER_MENU' || shell.variant === 'TILES') mode = 'drawer'
    else if (shell.variant === 'HAMBURGER_SECTIONS') mode = 'sections'
    else if (shell.variant === 'MENU_ON_TOP') mode = 'subheader'
    else if (hasGroups) mode = 'topbar'
    return {
      mode,
      title: shell.title || '',
      items,
      menuTree,
      // la lista de la hamburguesa en modo secciones: cada sección, sin lo que cuelga de ella; su id
      // es su home (lo que navega al elegirla) y `section` el de la sección (lo que se marca)
      sections: menuTree.map((node) => ({
        id: node.home || node.id,
        section: node.id,
        label: node.label,
        icon: node.icon,
        disabled: node.disabled || !node.home,
        hint: node.hint,
        hasChildren: false,
        children: [],
      })),
      selectors: (shell.appContext || []).map((selector) => ({
        fieldName: selector.fieldName,
        label: selector.label || selector.fieldName,
        options: (selector.options || []).map((o) => ({ value: o.value, label: o.label || String(o.value) })),
      })),
      headerActions: (shell.headerActions || []).map((a) => ({
        actionId: a.actionId,
        label: a.label,
        hasChildren: !!(a.children && a.children.length),
        children: (a.children || []).map((c) => ({ actionId: c.actionId, label: c.label })),
      })),
      serverSideType: shell.serverSideType,
      // sin home declarada (centinela del servidor) → la primera pantalla del menú EN PROFUNDIDAD:
      // con secciones (HAMBURGER_SECTIONS) el primer nivel son grupos y la home de la sección es su
      // primera entrada; el centinela se cargaba tal cual y la app arrancaba en «Not found.»
      homeRoute: isSentinelHome(shell.homeRoute)
        ? ((menuTree.find((node) => node.home) || {}).home || '')
        : shell.homeRoute,
    }
  }

  /** Colores de Chip del wire → clases badge de JET (sistema, Redwood). PRECOMPUTADO (CSP). */
  const BADGE_CLASSES = {
    error: 'oj-badge oj-badge-danger oj-badge-subtle',
    danger: 'oj-badge oj-badge-danger oj-badge-subtle',
    warning: 'oj-badge oj-badge-warning oj-badge-subtle',
    success: 'oj-badge oj-badge-success oj-badge-subtle',
    contrast: 'oj-badge oj-badge-neutral oj-badge-subtle',
    // the plain chip — Vaadin paints it in the primary tone; entityHeaderOf already reads it as info
    normal: 'oj-badge oj-badge-info oj-badge-subtle',
    info: 'oj-badge oj-badge-info oj-badge-subtle',
  }

  /** Proyección del TaskQueue (cola de trabajo del front-office): grupos de cards con
   *  badges; el clic despacha metadata.actionId con parameters._item = id del item
   *  (contrato del renderer web compartido: mateu-task-queue.ts). Los datos viajan
   *  INLINE en la metadata — no hay eje data ni triggers. */
  function taskQueueOf(tree) {
    // una cola DENTRO de un panel de consola es la lista de esa consola (átomo isQueue del
    // dispatcher), no el modo «cola de trabajo + isla» de página completa
    const node = findOutsidePanes(tree, 'TaskQueue')
    if (!node) return null
    return queueProjectionOf(node.metadata)
  }

  /** Los grupos de tarjetas de una TaskQueue, listos para pintar (modo página y átomo isQueue). */
  function queueProjectionOf(md) {
    return {
      actionId: md.actionId,
      groups: (md.groups || []).map((group) => ({
        label: group.label,
        items: (group.items || []).map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption || '',
          selected: !!item.selected,
          cardClass: item.selected ? 'oj-sm-margin-2x-bottom oj-bg-neutral-20' : 'oj-sm-margin-2x-bottom',
          badges: (item.badges || []).map((badge) => ({
            label: badge.label,
            badgeClass: BADGE_CLASSES[badge.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
          })),
          // opción de LÍNEA (p.ej. "Check-out" solo en reservas in house): botón en la card
          // que despacha su propio actionId con {_item} — mismo contrato que el renderer web
          hasAction: !!(item.actionLabel && item.actionId),
          actionLabel: item.actionLabel || '',
          actionId: item.actionId || '',
          parameters: { _item: item.id },
        })),
      })),
    }
  }

  /** Proyección del EmptyState suelto (placeholder del panel de detalle, o página de
   *  bienvenida). Tras seleccionar un item el server lo sustituye por la isla → null. */
  function emptyStateOf(tree) {
    const node = findByType(tree, 'EmptyState')
    if (!node) return null
    const md = node.metadata
    return {
      title: (md.icon ? md.icon + ' ' : '') + (md.title || ''),
      description: md.description || '',
    }
  }

  const NOT_FOUND_TEXTS = {
    es: { title: 'No encontrado', message: 'Puede que se haya borrado o que el enlace no sea correcto.', back: 'Volver' },
    en: { title: 'Not found', message: 'It may have been deleted, or the link is wrong.', back: 'Go back' },
  }

  /** Proyección de la página NOT FOUND: lo que contesta el server cuando la ruta nombra un registro
   *  o una pantalla que no existe (una reserva borrada, un enlace mal copiado) — en lugar de un
   *  toast de error sobre una página vacía. Se pinta con el idioma de Redwood para esto, el
   *  oj-sp-empty-state a página completa (su ilustración de fondo + texto primario/secundario + la
   *  navigationAction como vuelta atrás), dentro de la shell. Los textos los manda el server (el
   *  mensaje de la excepción como titular); si faltan, los genéricos en el idioma de la página.
   *  null si el host no es un not-found. */
  function notFoundOf(tree, lang) {
    const node = findByType(tree, 'NotFound')
    if (!node) return null
    const md = node.metadata || {}
    const texts = String(lang || '').toLowerCase().startsWith('es') ? NOT_FOUND_TEXTS.es : NOT_FOUND_TEXTS.en
    const backRoute = md.backRoute || ''
    return {
      title: md.title || texts.title,
      message: md.message || texts.message,
      backRoute,
      // la vuelta atrás es la navigationAction del empty-state (un enlace); sin ruta, ninguna
      navigationAction: backRoute ? { label: md.backLabel || texts.back, display: 'on' } : null,
    }
  }

  /** Interpolación del wire (labels con plantillas): ${state.clave} → valor del state. */
  /** La ruta que abre una fila (`/customers/${row.id}`), o '' si la plantilla no se resuelve entera. */
  function rowRouteOf(template, row) {
    if (!template) return ''
    let unresolved = false
    const route = String(template).replace(/\$\{\s*row\.([A-Za-z0-9_]+)\s*\}/g, (all, field) => {
      const value = row ? row[field] : undefined
      if (value == null || value === '') { unresolved = true; return '' }
      return encodeURIComponent(typeof value === 'object' ? (value.value ?? value.message ?? '') : String(value))
    })
    return unresolved || route.includes('${') ? '' : route
  }

  function interpolate(text, state) {
    // `${state.x}` y también `${state['x']}` / `${state["x"]}` (la posición del editor de filas
    // llega como ${state['_position']})
    // y rutas anidadas: `${state.status.message}` (la insignia de un @Status de la cabecera)
    return String(text == null ? '' : text).replace(
      /\$\{state(?:\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)|\[\s*['"]([^'"\]]+)['"]\s*\])\}/g,
      (all, dotted, quoted) => {
        if (quoted) return state && state[quoted] != null ? String(state[quoted]) : ''
        let value = state
        for (const part of dotted.split('.')) {
          value = value != null && typeof value === 'object' ? value[part] : undefined
        }
        return value != null && typeof value !== 'object' ? String(value) : ''
      },
    )
  }

  const TEXT_CLASSES = {
    xl: 'oj-typography-heading-md',
    l: 'oj-typography-subheading-md',
    s: 'oj-typography-body-sm',
    xs: 'oj-typography-body-xs oj-text-color-secondary',
  }
  const NOTICE_CLASSES = {
    success: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30',
    warning: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-warning-30',
    danger: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-danger-30',
    info: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-info-30',
  }

  /** Proyección GENÉRICA del contenido display de una isla (p.ej. el CheckInWizard
   *  embebido del front-office): BLOQUES (plain | card) de átomos precomputados para el
   *  CSP de VB (flags is*, clases, textos interpolados contra el state). Las islas
   *  ANIDADAS (App mediador dentro de la isla, p.ej. el documento) se saltan — fase
   *  posterior. null si el árbol no aporta nada display (isla de formulario puro). */
  /** Fábrica de data providers de JET, inyectada por la app (en Node no hay ninguna: el atom
   *  viaja con las filas y sin proveedor, que es lo que los tests comprueban). */
  let dataProviderFactory = null
  function setDataProviderFactory(factory) { dataProviderFactory = factory }

  /** Fábrica de conversores de JET (oj-input-number de un importe): JET 18 ya no acepta el
   *  conversor como JSON, quiere una instancia de IntlNumberConverter. En Node se queda la
   *  especificación, que es lo que los tests comprueban. */
  /** Quién lee las preferencias de columnas del listado en pantalla (la app: localStorage por
   *  ruta). En Node, nadie: las columnas salen tal cual. */
  let columnPrefsReader = null
  function setColumnPrefsReader(fn) { columnPrefsReader = typeof fn === 'function' ? fn : null }

  /** Paneles plegables abiertos/cerrados por el usuario (clave → bool); lo no tocado, como manda
   *  el wire (AccordionPanel.active, Details.opened). Estado de cliente, como la pestaña activa. */
  const panelState = {}
  function setPanelExpanded(key, expanded) { panelState[key] = !!expanded }
  function panelExpanded(key, fallback) { return key in panelState ? panelState[key] : !!fallback }

  let converterFactory = null
  function setConverterFactory(factory) { converterFactory = factory }
  function converterOf(spec) {
    return converterFactory ? converterFactory(spec) : spec
  }

  function islandContentOf(ctx, opts = {}) {
    if (!ctx || !ctx.tree) return null
    // La pestaña activa es POR BARRA: un mapa {clave de barra: id de pestaña} (opts.activeTabs).
    // opts.activeTab (un único id) sigue valiendo para la barra de primer nivel.
    const activeTabs = { ...(opts.activeTab ? { '': opts.activeTab } : {}), ...(opts.activeTabs || {}) }
    // Barras ANIDADAS (un TabLayout dentro de una pestaña): cada barra tiene su clave, derivada de
    // la pestaña que la contiene (tabScope) y de su ordinal entre hermanas — ver tabStripKeyOf.
    let tabScope = ''
    const stripsPerScope = {}
    let tabBars = 0
    const state = ctx.state || {}
    const interp = (t) => interpolate(t, state)
    const badgeOf = (b) => ({
      label: b.label,
      badgeClass: BADGE_CLASSES[b.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
    })
    const buttonOf = (m) => ({
      actionId: m.actionId,
      label: m.label || m.actionId,
      disabled: !!m.disabled,
      chroming: m.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      parameters: m.parameters || {},
    })
    const money = (value, currency) => (currency || '€') + ' ' + Number(value || 0)
      .toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const STATUS_TEXT = {
      success: 'oj-text-color-success',
      warning: 'oj-text-color-warning',
      danger: 'oj-text-color-danger',
      error: 'oj-text-color-danger',
    }
    const blocks = []
    let plain = null
    let elementOrdinal = 0
    const atom = (a, container) => {
      if (container) { container.items.push(a); return }
      if (!plain) { plain = { isPlain: true, items: [] }; blocks.push(plain) }
      plain.items.push(a)
    }
    // los hijos de un nodo viajan en children Y/O en metadata.content (CustomField, Notice…)
    const kidsOf = (node) => {
      const out = [...(node.children || [])]
      const inner = node.metadata && node.metadata.content
      if (Array.isArray(inner)) out.push(...inner)
      else if (inner && typeof inner === 'object') out.push(inner)
      return out
    }
    const collectButtons = (node, out) => {
      if (!node || typeof node !== 'object') return out
      if (node.metadata && node.metadata.type === 'Button') { out.push(buttonOf(node.metadata)); return out }
      for (const child of kidsOf(node)) collectButtons(child, out)
      return out
    }
    // Proyecta hijos como BLOQUES-COLUMNA de la rejilla oj-flex (colClass oj-md-(NN→doceavos)): las
    // zonas de @Zones y los dos paneles de un maestro-detalle. Si una columna genera varios bloques
    // se FUSIONAN en uno (un flex no puede apilar dos items en la misma celda de fila).
    const projectColumns = (children, percents, extraClass) => {
      children.forEach((child, i) => {
        const col = Math.min(11, Math.max(1, Math.round(percents[i] * 12 / 100)))
        // las cssClasses del wire de la COLUMNA viajan al bloque (p.ej. la banda
        // neutra de la info secundaria del general overview: oj-panel + oj-bg-*)
        const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
          + (extraClass ? ' ' + extraClass : '')
          + (child.cssClasses ? ' ' + child.cssClasses : '')
        const before = blocks.length
        plain = null
        visit(child, null)
        plain = null
        const created = blocks.splice(before)
        if (created.length === 1) {
          created[0].colClass = colClass
          blocks.push(created[0])
        } else if (created.length > 1) {
          blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
        }
      })
    }
    // hijos con su clase de columna YA calculada (rejillas: ResponsiveGrid, DashboardLayout)
    // Devuelve false (y no deja nada) si alguna columna genera bloques que no se pueden fusionar en
    // una celda: una isla anidada (el hoisting convierte su bloque entero en la isla) o un bloque
    // especial sin átomos — entonces el llamante apila los hijos como antes.
    const projectSized = (children, colClasses) => {
      const start = blocks.length
      const out = []
      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        const before = blocks.length
        plain = null
        if (child && child.metadata && child.metadata.type === 'DashboardPanel') visitDashboardPanel(child, null)
        else visit(child, null)
        plain = null
        const created = blocks.splice(before)
        if (created.length === 1) out.push({ ...created[0], colClass: colClasses[i] })
        else if (created.length > 1) {
          if (created.some((b) => !Array.isArray(b.items) || b.items.some((a) => a && a.isNested))) {
            blocks.splice(start)
            return false
          }
          out.push({ isPlain: true, colClass: colClasses[i], items: created.flatMap((b) => b.items) })
        }
      }
      blocks.push(...out)
      return true
    }
    // un DashboardPanel = una tarjeta-bloque (título + subtítulo + su contenido) con su ancho
    const visitDashboardPanel = (panel, colClass) => {
      const pm = panel.metadata || {}
      const card = { isCard: true, items: [], ...(colClass ? { colClass } : {}) }
      blocks.push(card)
      plain = null
      if (pm.title) card.items.push({ isText: true, text: interp(pm.title), cls: 'oj-typography-subheading-xs' })
      if (pm.subtitle) card.items.push({ isText: true, text: interp(pm.subtitle), cls: 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-bottom' })
      for (const child of kidsOf(panel)) visit(child, card)
      plain = null
    }
    const visit = (node, container) => {
      if (!node || typeof node !== 'object') return
      // @Subresource: el listado embebido es OTRA superficie (su ServerSide). Deja un hueco que
      // withSubresources rellena con su tabla cuando está cargada — bajar a su App de mediador lo
      // tomaba por la isla anidada del check-in (isNested), y la fusión vaciaba el bloque entero:
      // con la pestaña Orders o Billing activa no quedaba ni la barra de pestañas
      if (node !== ctx.tree) {
        const sub = subresourceIslandOf(node)
        if (sub) { atom({ isSubresource: true, islandId: sub.id, subresource: sub }, container); return }
      }
      const m = node.metadata
      const t = m && m.type
      // FILA ZONADA (@Zones): HorizontalLayout cuyos hijos son columnas con
      // flex: 1 1 calc(NN% …) — cada zona se proyecta como bloque-columna (colClass
      // oj-md-(NN→doceavos)); si una zona genera varios bloques se FUSIONAN en uno
      // (un flex no puede apilar dos items en la misma celda de fila)
      if (t === 'HorizontalLayout' && !container) {
        const zoneMatches = (node.children || []).map(
          (ch) => String(ch.style || '').match(/flex:\s*1 1 calc\((\d+(?:\.\d+)?)%/))
        if (zoneMatches.length >= 2 && zoneMatches.every(Boolean)) {
          projectColumns(node.children, node.children.map((_, i) => parseFloat(zoneMatches[i][1])))
          return
        }
      }
      // CONSOLA / MAESTRO-DETALLE (MasterDetailLayout, SplitLayout): children = [maestro, detalle].
      // Misma proyección que las zonas: dos bloques-columna de la rejilla oj-flex (lista a la
      // izquierda, detalle a la derecha, 5/12 + 7/12), que bajo md se apilan — como la vista
      // Console de OPERA. Vertical (SplitLayout orientation vertical) → uno debajo del otro. Dentro
      // de otro bloque no hay columnas que repartir: se proyecta en su sitio, en orden.
      if ((t === 'MasterDetailLayout' || t === 'SplitLayout') && !container) {
        const kids = (node.children || []).filter(Boolean)
        if (kids.length >= 2 && String(m.orientation || '').toLowerCase() !== 'vertical') {
          projectColumns(kids.slice(0, 2), [41.7, 58.3], 'mateu-split-pane')
          return
        }
        for (const kid of kids) visit(kid, container)
        return
      }
      if (t === 'App') {
        // isla ANIDADA (p.ej. el documento del check-in): marcador de posición — el
        // contenido vive en su propio contexto y lo pinta mateuNested en ese hueco
        atom({ isNested: true, islandId: node.id }, container)
        return
      }
      // FORMULARIO (FormLayout: sus FormRow de FormFields, con maxColumns y el colspan de cada
      // campo) → UN atom isFormLayout que la plantilla pinta con el oj-form-layout de JET
      // (max-columns / direction=row / colspan en cada hijo): el reparto en columnas es el de
      // JET, no una rejilla propia. Cada campo lleva su widget de verdad (texto, número, fecha,
      // booleano, select) y su readonly — la vista de detalle de un crud manda todos sus campos
      // readOnly y se tienen que ver como tales, no como inputs editables. Lo que no es un
      // campo escalar (un grid, una property row, otro componente) corta el grupo y se proyecta
      // como siempre, en su sitio.
      if (t === 'FormLayout') {
        const columns = Math.min(4, Math.max(1, m.maxColumns || m.columns || 1))
        const layouts = []
        let layout = null
        const walkLayout = (n) => {
          if (!n || typeof n !== 'object') return
          const md = n.metadata
          if (md && md.type === 'FormRow') { kidsOf(n).forEach(walkLayout); return }
          const field = md && md.type === 'FormField' ? layoutFieldOf(md, state, ctx.data, columns) : null
          if (field) {
            if (!layout) {
              layout = { isFormLayout: true, columns, fields: [] }
              layouts.push(layout)
              atom(layout, container)
            }
            layout.fields.push(field)
            return
          }
          layout = null
          visit(n, container)
        }
        kidsOf(node).forEach(walkLayout)
        // todo de sólo lectura (la vista de detalle): el propio form layout va readonly y JET
        // pinta cada campo como valor, sin caja de input
        for (const l of layouts) l.readonly = l.fields.every((f) => f.readonly)
        return
      }
      if (t === 'FormField') {
        const fieldId = m.fieldId || m.id
        // GRID embebido en un formulario (una lista con columnas: los Steps/Messages de un
        // proceso). No es el listado de un crud —ése tiene su propia rama y su cabecera de
        // búsqueda—, es una tabla más del contenido.
        if ((m.columns || []).length) {
          const rows = Array.isArray(state[fieldId]) ? state[fieldId] : []
          // lista EDITABLE con el editor de fila en un diálogo (@DetailFormCustomisation
          // position = modal): "+" debajo y, por fila, Editar / Quitar en su última columna
          const rowEditable = isModalRowEditor(m)
          const columns = m.columns
            .map((col) => col.metadata || col)
            // la columna-botón `_select` ("Edit") del wire la sustituye la de acciones de fila
            .filter((c) => !(c.id === '_select' && c.stereotype === 'button'))
            .map((c) => {
              const def = { headerText: c.label || c.id, field: c.id }
              if (c.dataType === 'status') def.template = 'cellStatusBadge'
              return def
            })
          if (rowEditable) {
            columns.push({ headerText: '', field: '__rowActions', template: 'cellListRowActions', sortable: 'disabled' })
          }
          // en una lista editable, una celda que aún no tiene valor (la línea y el total de una
          // habitación recién añadida: los pone el servidor al crear) dice «—», no un hueco
          const dashEmpty = (row) => {
            const out = { ...row }
            for (const col of columns) {
              if (col.field !== '__rowActions' && (out[col.field] == null || out[col.field] === '')) out[col.field] = EMPTY_VALUE
            }
            return out
          }
          const shown = statusBadgeRows(rows, m.columns).map((row, i) => (rowEditable
            ? {
              ...dashEmpty(row),
              _rowNumber: row._rowNumber == null ? i : row._rowNumber,
              __rowKey: String(row._rowNumber == null ? i : row._rowNumber),
              __editActionId: fieldId + '_select',
              __removeActionId: fieldId + '_remove',
            }
            : row))
          atom({
            isGrid: true,
            fieldId,
            label: m.label || '',
            columns,
            rows: shown,
            // el data provider lo construye la app (JET); en Node no hay, y el atom viaja igual
            adp: dataProviderFactory ? dataProviderFactory(shown) : null,
            isEmpty: rows.length === 0,
            rowEditable,
            addActionId: rowEditable ? fieldId + '_add' : '',
            addLabel: 'Add',
          }, container)
          return
        }
        if (m.propertyRow) {
          // un lookup de sólo lectura viaja como el campo '<campo>-label', con su ETIQUETA en
          // data['<campo>-label'] (no en el state); un campo normal puede traer su etiqueta igual
          const data = ctx.data || {}
          const fromData = (key) => (data[key] != null && typeof data[key] !== 'object' ? data[key] : null)
          const raw = state[fieldId] != null ? state[fieldId]
            : fromData(fieldId) != null ? fromData(fieldId) : (m.value != null ? m.value : '')
          const lookupLabel = fromData(fieldId + '-label')
          const shown = lookupLabel != null && lookupLabel !== '' ? lookupLabel : raw
          atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(shown)) }, container)
          return
        }
        // FormField FLUIDO editable (p.ej. el buscador de cargos del modo check-out):
        // input ligado por fieldId al estado del contexto (draft + auto-save)
        if (m.dataType === 'string' || m.dataType === 'integer' || m.dataType === 'number') {
          atom({
            isInput: true,
            fieldId,
            label: m.label || '',
            value: state[fieldId] == null ? '' : String(state[fieldId]),
          }, container)
        }
        return
      }
      if (t === 'TabLayout') {
        // Las pestañas se APLANAN: el atom de la barra + el contenido de la pestaña activa
        // como átomos normales del mismo contenedor. Anidar átomos dentro de átomos obligaría a
        // duplicar toda la plantilla dentro de la pestaña y a pelearse con el $current anidado
        // de VB; así el vocabulario que ya existe pinta el contenido sin enterarse.
        const tabs = (node.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab')
        if (!tabs.length) return
        // una sola pestaña visible no es una elección: su contenido sin barra (conserva su clave de
        // ruta, así nada se mueve cuando un flag vuelve a mostrar las otras)
        if (tabs.length === 1) {
          for (const child of tabs[0].children || []) visit(child, container)
          return
        }
        // cada barra con SU clave y SUS ids (la de primer nivel conserva 'tab-N'): con ids y
        // pestaña activa compartidos, pulsar la pestaña 2 de una barra interior cambiaba también
        // la exterior
        const ordinal = stripsPerScope[tabScope] || 0
        stripsPerScope[tabScope] = ordinal + 1
        const stripKey = tabStripKeyOf(tabScope, ordinal)
        const ids = tabs.map((tab, i) => tabIdOf(stripKey, i))
        const wanted = ids.indexOf(activeTabs[stripKey] || '')
        const selected = wanted >= 0 ? wanted : tabs.findIndex((tab) => tab.metadata.active)
        const current = selected >= 0 ? selected : 0
        atom({
          isTabs: true,
          // la primera barra conserva el id de siempre (las chains la refrescan por selector)
          barId: tabBars++ ? 'mateuContentTabs-' + (tabBars - 1) : 'mateuContentTabs',
          stripKey,
          selectedId: ids[current],
          tabs: tabs.map((tab, i) => ({
            id: ids[i],
            // el contador de sus @Subresource EAGER viaja con la pestaña («Subnets (12)»)
            label: interp(tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1))
              + (tab.metadata.badge ? ' (' + tab.metadata.badge + ')' : ''),
            // @Tab(key): seleccionarla empuja su URL (ver contentTabSelected)
            routeKey: tab.metadata.routeKey || '',
            // @Tab(shortcut): la selecciona por teclado (keys.mjs)
            shortcut: String(tab.metadata.shortcut || '').toLowerCase(),
          })),
        }, container)
        const outerScope = tabScope
        tabScope = ids[current]
        try {
          for (const child of tabs[current].children || []) visit(child, container)
        } finally {
          tabScope = outerScope
        }
        return
      }
      if (t === 'CustomField') {
        // envoltorio: lo que importa es lo que lleva dentro — en metadata.content o, para un
        // campo que guarda un componente (un Anchor, un Chart… declarado como campo del form),
        // en children: mirando solo content esos campos desaparecían sin dejar rastro
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'Element') {
        // Componente WEB de terceros (el grafo de un proceso). Los atributos son su único canal
        // de datos y viajan en la METADATA, que un State no reenvía: escritos como `${state.x}`
        // son VALORES y se reevalúan en cada render — mismo idioma que cualquier rótulo. El
        // módulo del atributo `import` lo carga la app la primera vez que se usa la etiqueta.
        const attributes = {}
        for (const key of Object.keys(m.attributes || {})) attributes[key] = interp(m.attributes[key])
        atom({
          isElement: true,
          // el servidor manda un id de relleno ("fieldId") a TODOS los Element (un record sin id):
          // dos en la misma pantalla (un plano por planta, dos tablas en un foldout) compartían
          // hueco y se pisaban. Sin id propio, nombre + ordinal: estable mientras la estructura
          // de la pantalla no cambie
          elementId: node.id && node.id !== 'fieldId' ? node.id : m.name + '#' + (elementOrdinal++),
          name: m.name,
          importUrl: (m.attributes || {}).import || '',
          attributes,
          style: node.style || '',
          cssClasses: node.cssClasses || '',
          content: interp(m.content || ''),
          asHtml: !!m.html,
          // el contenido llevaba `${…}` → ha entrado DATO en el marcado: se sanea al montarlo
          dataInContent: String(m.content || '').indexOf('${') >= 0,
          on: m.on || null,
        }, container)
        return
      }
      // ── DASHBOARD en cualquier página: rejilla de paneles (cada DashboardPanel, una tarjeta con su
      // ancho en columnas), banda de KPIs (Scoreboard/MetricCard) y gráficos (oj-chart) ──
      // ResponsiveGrid (la rejilla general): sus pistas (grid-template-columns) y los colSpans de
      // cada hijo → bloques-columna oj-flex de su ancho. Dentro de una tarjeta, apilado.
      if (t === 'ResponsiveGrid' && !container) {
        // el span de cada hijo: el del wire (colSpans) o el que el hijo lleva consigo — un
        // DashboardPanel su colSpan, la banda de KPIs (Scoreboard) la fila entera
        const kids = kidsOf(node)
        const spans = kids.map((k, i) => (m.colSpans && m.colSpans[i])
          || (k && k.metadata && k.metadata.type === 'DashboardPanel' ? k.metadata.colSpan
            : k && k.metadata && k.metadata.type === 'Scoreboard' ? 999 : 1))
        const classes = gridColClasses(m.gridTemplateColumns, spans, kids.length)
        if (classes && projectSized(kids, classes)) return
      }
      if (t === 'DashboardLayout') {
        const columns = m.columns > 0 ? m.columns : 3
        const kids = kidsOf(node)
        if (projectSized(kids, kids.map((k) => panelColClass(k && k.metadata && k.metadata.colSpan, columns)))) return
        for (const child of kids) visit(child, container)
        return
      }
      if (t === 'DashboardPanel') {
        visitDashboardPanel(node, null)
        return
      }
      if (t === 'Scoreboard') {
        const metrics = findAllByType(node, 'MetricCard').map((n) => metricOf(n.metadata, interp))
        if (metrics.length) atom({ isScoreboard: true, metrics }, container)
        return
      }
      if (t === 'MetricCard') {
        // consecutivos se juntan en la misma banda (como los botones)
        const target = container || plain
        const last = target && target.items.length ? target.items[target.items.length - 1] : null
        if (last && last.isScoreboard) last.metrics.push(metricOf(m, interp))
        else atom({ isScoreboard: true, metrics: [metricOf(m, interp)] }, container)
        return
      }
      if (t === 'Chart' || t === 'TrendChart') {
        atom(chartAtomOf(m, t, interp), container)
        return
      }
      if (t === 'Card') {
        const card = { isCard: true, items: [] }
        blocks.push(card)
        plain = null
        const title = m.title && (m.title.text || (typeof m.title === 'string' ? m.title : ''))
        if (title) card.items.push({ isText: true, text: interp(title), cls: 'oj-typography-subheading-xs oj-sm-margin-2x-bottom' })
        for (const child of node.children || []) visit(child, card)
        const cardInner = m.content
        if (Array.isArray(cardInner)) cardInner.forEach((c) => visit(c, card))
        else if (cardInner && typeof cardInner === 'object' && cardInner.metadata) visit(cardInner, card)
        plain = null
        return
      }
      if (t === 'Page') {
        // título de la isla + su TOOLBAR (los @Toolbar del server viajan en metadata.toolbar)
        const pageTitle = interp(m.title || '')
        if (pageTitle) atom({ isText: true, text: pageTitle, cls: 'oj-typography-subheading-sm' }, container)
        const toolbar = (m.toolbar || []).filter((b) => b && b.actionId)
        if (toolbar.length) atom({ isButtons: true, fromPageToolbar: true, buttons: toolbar.map(buttonOf) }, container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'CustomComponent') {
        // Escape hatch (#14): VB no trae un renderer para el tipo → placeholder visible + los hijos
        // slotted igualmente (paridad con el <mateu-unsupported> del web).
        atom({
          isNotice: true,
          text: 'Custom component "' + (m.name || '') + '" — no VB renderer',
          noticeClass: NOTICE_CLASSES.warning,
          buttons: [],
        }, container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'Text') {
        const text = interp(m.text)
        if (text) {
          // container h1..h6 → HEADING de contenido: h3 real (el escalón siguiente al h2
          // de la sección), con ritmo de grupo (margin-top) cuando no abre el bloque
          const heading = /^h[1-6]$/.test(m.container || '')
          if (heading) {
            const target = container || plain
            const notFirst = !!(target && target.items.length)
            atom({
              isText: true,
              isHeading: true,
              // un h2 al frente de una zona es el TITULO del fold (el gop lo asciende a
              // cabecera de slot con el subrayado del foldout)
              isH2: m.container === 'h2',
              text,
              cls: 'oj-typography-subheading-xs' + (notFirst ? ' oj-sm-margin-10x-top' : ''),
            }, container)
          } else {
            atom({ isText: true, text, cls: TEXT_CLASSES[m.size] || 'oj-typography-body-md' }, container)
          }
        }
        return
      }
      // ENLACE (Anchor): un <a> de verdad — el tema Redwood lo pinta como enlace, el manejador
      // global de links.mjs navega DENTRO de la shell si es una ruta de la app, y target=_blank
      // (una URL externa, un PDF) abre otra pestaña sin pasar por el servidor
      if (t === 'Anchor') {
        const href = interp(m.url)
        if (href) {
          const target = m.target ? String(m.target) : ''
          atom({
            isAnchor: true,
            text: interp(m.text) || href,
            href,
            target: target || '_self',
            rel: target === '_blank' ? 'noopener noreferrer' : '',
          }, container)
        }
        return
      }
      // FOLDOUT DENTRO DE UNA PESTAÑA (el de página lo pinta oj-sp-foldout-layout, foldoutOf): el
      // overview en su sitio y cada panel como un panel plegable — su título y, abierto, su
      // contenido; los paneles abiertos por defecto (open) se respetan
      if (t === 'FoldoutLayout' && tabScope) {
        const bySlot = {}
        for (const child of node.children || []) bySlot[child.slot || ''] = child
        if (bySlot.overview) visit(bySlot.overview, container)
        ;(m.panels || []).forEach((panel, i) => {
          const key = 'fold:' + (node.id || 'foldout') + ':' + i
          const expanded = panelExpanded(key, panel.open !== false)
          atom({ isCollapsible: true, collapsibleKey: key, title: interp(panel.title || ''), expanded, disabled: false }, container)
          const content = bySlot['panel-' + i]
          if (expanded && content) visit(content, container)
        })
        return
      }
      // PANELES PLEGABLES (AccordionLayout de AccordionPanel, Details): como las pestañas, se
      // APLANAN — la cabecera es un átomo isCollapsible (un oj-collapsible de JET) y el contenido
      // del panel va detrás, como átomos normales, sólo si está abierto. Abierto/cerrado es estado
      // del CLIENTE (panelExpanded, por clave): plegar re-proyecta sin preguntar al servidor.
      if (t === 'AccordionLayout') {
        kidsOf(node).forEach((panel, i) => {
          const pm = panel.metadata || {}
          const key = 'acc:' + (node.id || 'accordion') + ':' + i
          const expanded = panelExpanded(key, !!pm.active)
          atom({ isCollapsible: true, collapsibleKey: key, title: interp(pm.label || ''), expanded, disabled: !!pm.disabled }, container)
          if (expanded) for (const child of kidsOf(panel)) visit(child, container)
        })
        return
      }
      if (t === 'Details') {
        const summaryTexts = m.summary ? collectTexts(m.summary) : []
        const key = 'det:' + (node.id && node.id !== 'fieldId' ? node.id : (summaryTexts[0] || 'details'))
        const expanded = panelExpanded(key, !!m.opened)
        atom({ isCollapsible: true, collapsibleKey: key, title: interp(summaryTexts.join(' ')), expanded, disabled: false }, container)
        if (expanded && m.content) visit(m.content, container)
        return
      }
      // TAPE CHART (PlanningBoard → oj-gantt de JET): filas = recursos (con sus columnas de
      // atributos en la etiqueta), tareas = bloques. Proyección en planningAtomOf (pura, testeada);
      // los eventos de JET (ojMove, ojResize, doble clic, rango) los traduce planningActionOf.
      if (t === 'PlanningBoard') {
        atom(planningAtomOf(m, node.id), container)
        return
      }
      // COLA como pieza de contenido (la lista de una consola maestro-detalle): las mismas tarjetas
      // oj-action-card del modo cola; cada una lleva su acción (la de la cola, con {_item}) para
      // que el despachador genérico de bloques la ejecute, y la opción de línea va DEBAJO de la
      // tarjeta (dentro, su clic sería también el de la tarjeta)
      if (t === 'TaskQueue') {
        const q = queueProjectionOf(m)
        atom({
          isQueue: true,
          groups: q.groups.map((g) => ({
            label: g.label,
            items: g.items.map((it) => ({
              ...it,
              actionId: q.actionId,
              parameters: { _item: it.id },
              lineActions: it.hasAction ? [{ actionId: it.actionId, label: it.actionLabel, parameters: it.parameters }] : [],
            })),
          })),
        }, container)
        return
      }
      if (t === 'ProgressSteps') {
        const steps = (m.steps || []).map((step) => ({ id: step.id, label: step.title || step.label || step.id }))
        const current = (m.steps || []).find((step) => step.status === 'current')
        atom({ isProgress: true, steps, selectedId: current ? current.id : (steps[0] && steps[0].id) }, container)
        return
      }
      if (t === 'EntityHeader') {
        atom({
          isEntityHeader: true,
          title: interp(m.title),
          subtitle: interp(m.subtitle || ''),
          badges: (m.badges || []).map(badgeOf),
          facts: (m.facts || []).map((f) => ({ label: f.label, value: interp(f.value) })),
          metricLabel: m.metricLabel || '',
          metricValue: interp(m.metricValue || ''),
        }, container)
        return
      }
      if (t === 'Notice') {
        // Como en el web: un aviso sin texto (un @Notice cuyo campo vale null o blanco) y sin
        // contenido no se pinta — el valor del campo es su propio interruptor de visibilidad.
        const noticeText = interp(m.text)
        if (!noticeText.trim() && !kidsOf(node).length) return
        atom({
          isNotice: true,
          text: noticeText,
          noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
          buttons: collectButtons({ children: kidsOf(node) }, []),
        }, container)
        return
      }
      if (t === 'Popover') {
        // lo envuelto se pinta como un disparador con su texto; el contenido, como líneas en la
        // ventana flotante compartida (hover.mjs) — al pasar/enfocar (hover) o al pulsar (click)
        const wrappedTexts = m.wrapped ? collectTexts(m.wrapped).map(interp).filter(Boolean) : []
        const label = wrappedTexts.join(' ') || (m.wrapped && m.wrapped.metadata && m.wrapped.metadata.label) || 'Details'
        const lines = m.content ? collectTexts(m.content).map(interp).filter(Boolean) : []
        const text = lines.join('\n')
        atom({
          isPopover: true,
          label: interp(label),
          hoverText: m.trigger === 'hover' ? text : '',
          clickText: m.trigger === 'hover' ? '' : text,
        }, container)
        return
      }
      if (t === 'Calendar') {
        atom(calendarAtomOf(m, node.id), container)
        return
      }
      if (t === 'MatrixGrid') {
        atom(matrixAtomOf(m, node.id, interp), container)
        return
      }
      if (t === 'ActionPanel') {
        atom(actionPanelAtomOf(m, node.id, interp), container)
        return
      }
      if (t === 'BulletedList') {
        atom({ isBullets: true, items: (m.items || []).map(interp) }, container)
        return
      }
      if (t === 'Separator') {
        atom({ isSeparator: true }, container)
        return
      }
      if (t === 'Badge') {
        atom({ isBadge: true, label: interp(m.text), badgeClass: BADGE_CLASSES[m.color] || 'oj-badge oj-badge-neutral oj-badge-subtle' }, container)
        return
      }
      if (t === 'ResourceGrid') {
        const columns = m.columns && m.columns > 0 && m.columns <= 12 ? m.columns : 4
        const colClass = 'oj-flex-item oj-sm-' + Math.max(1, Math.floor(12 / columns))
        atom({
          isResourceGrid: true,
          items: (m.items || []).map((it) => ({
            id: it.id,
            title: it.title,
            subtitle: it.subtitle || '',
            statusLabel: it.statusLabel || '',
            statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
            note: it.note || '',
            recommendedLabel: it.recommended ? (m.recommendedLabel || '') : '',
            enabled: !it.disabled,
            disabled: !!it.disabled,
            actionId: m.actionId,
            parameters: { _item: it.id },
            colClass,
            cardClass: it.selected ? 'oj-bg-neutral-20' : '',
          })),
        }, container)
        return
      }
      if (t === 'OfferCard') {
        atom({
          isOffer: true,
          tag: interp(m.tag || ''),
          title: interp(m.title || ''),
          subtitle: interp(m.subtitle || ''),
          features: (m.features || []).map(interp).join(' · '),
          currentLabel: m.current ? (m.currentLabel || '') : '',
          addedLabel: m.added ? (m.addedLabel || '') : '',
          priceLabel: interp(m.priceLabel || ''),
          actionLabel: m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'AddOnPicker') {
        atom({
          isAddOns: true,
          actionId: m.actionId,
          currency: m.currency || '€',
          totalLabel: m.totalLabel || 'Total',
          items: (m.items || []).map((it) => ({
            id: it.id,
            icon: it.icon || '',
            title: interp(it.title),
            description: interp(it.description || ''),
            price: it.price || 0,
            priceText: money(it.price, m.currency) + (it.unit ? ' / ' + it.unit : ''),
            includedLabel: it.includedLabel || '',
            selectable: !it.includedLabel,
            added: !!it.added,
          })),
        }, container)
        return
      }
      if (t === 'StatusList') {
        // columns > 1 → grid responsive de N columnas: el wrapper pasa a oj-flex (wrap) y
        // cada ítem se pinta como TARJETA (oj-panel: borde propio, badge de estado dentro)
        // — celdas sin borde dejaban ambiguo a qué tarea pertenece cada chip y el conjunto
        // no se leía como listado de tareas. La celda exterior es a su vez oj-flex para que
        // el panel interior estire a la altura de la fila (align-items stretch).
        // Todo precomputado por ítem — el CSP de VB no divide ni compara.
        const cols = m.columns && m.columns > 1 && m.columns <= 12 ? m.columns : 0
        const rowClass = 'oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom'
        // SOLO columns>1 fuerza tarjetas: una lista de una columna con acciones (los
        // huéspedes) se pinta con la rama APILADA del markup — nombre como h3 (nivel
        // siguiente al h2 de la sección), sin avatar, ritmo .mateu-list-item
        const asCards = cols > 0
        // la rejilla del cockpit: celdas de MEDIDA FIJA (.mateu-grid-cell, 22rem) con el
        // aire entre tarjetas como gap de la rejilla (.mateu-grid) — ver app.css
        const cellClass = cols
          ? 'oj-flex-item mateu-grid-cell oj-flex oj-sm-margin-4x-bottom'
          : (asCards ? 'oj-flex-item oj-sm-12 oj-flex oj-sm-margin-4x-bottom' : '')
        atom({
          isStatusList: true,
          wrapClass: cols > 0 ? 'oj-flex mateu-grid' : (asCards ? 'oj-flex' : ''),
          items: (m.items || []).map((it) => {
            // hasta DOS acciones por fila (p.ej. Escanear / A mano por pax) — array
            // precomputado; una fila CON acciones se pinta APILADA (título+chip /
            // descripción / botones) para no descolocarse en carriles estrechos
            // hasta TRES acciones por fila; con actionIcon* el botón se pinta SOLO-ICONO
            // (label como tooltip/aria) — iconClass precomputado vía ojIconOf
            const rowActions = []
            if (it.actionLabel && it.actionId) {
              rowActions.push({ label: it.actionLabel, actionId: it.actionId, parameters: { _item: it.id },
                iconClass: ojIconOrGenericOf(it.actionIcon) || '' })
            }
            if (it.actionLabel2 && it.actionId2) {
              rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
                iconClass: ojIconOrGenericOf(it.actionIcon2) || '' })
            }
            if (it.actionLabel3 && it.actionId3) {
              rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
                iconClass: ojIconOrGenericOf(it.actionIcon3) || '' })
            }
            return {
              rowClass,
              gridCell: asCards,
              cellClass,
              statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
              avatar: it.avatar || '',
              icon: it.icon || '',
              title: interp(it.title),
              description: interp(it.description || ''),
              status: interp(it.status || ''),
              statusClass: STATUS_TEXT[it.statusColor] || 'oj-text-color-secondary',
              actions: rowActions,
              hasActions: rowActions.length > 0,
              // nivel del heading del titulo apilado: h4 bajo un grupo con h3 propio
              isH4: m.itemHeadingLevel === 4,
              // cronologia bajo el titulo (p.ej. las entradas de una incidencia)
              lines: (it.lines || []).map(interp),
              hasLines: !!(it.lines && it.lines.length),
              actionLabel: it.actionLabel || '',
              actionId: it.actionId || m.rowActionId || '',
              parameters: { _item: it.id },
              // rowActionId SIN botón propio = la FILA ENTERA es actuable (contrato del
              // renderer web: clic de fila → rowActionId con {_item})
              rowClickable: !!(m.rowActionId && !it.actionLabel),
            }
          }),
        }, container)
        return
      }
      if (t === 'Ledger') {
        atom({
          isLedger: true,
          lines: (m.lines || []).map((line) => ({
            concept: interp(line.concept),
            amountText: line.included ? (line.includedLabel || '') : money(line.amount, m.currency),
            amountClass: (line.amount || 0) < 0 ? 'oj-text-color-success' : '',
          })),
          totalLabel: m.totalLabel || 'Total',
          totalText: money(m.total, m.currency),
        }, container)
        return
      }
      if (t === 'PaymentPicker') {
        atom({
          isPayment: true,
          contextLabel: m.contextLabel || '',
          contextValue: interp(m.contextValue || ''),
          methods: (m.methods || []).map((method) => ({
            label: method.label,
            chroming: method.id === m.selected ? 'callToAction' : 'outlined',
            actionId: m.methodActionId,
            parameters: { _method: method.id },
          })),
          confirmLabel: m.confirmLabel || 'Confirmar',
          confirmActionId: m.actionId,
          confirmParameters: { _method: m.selected },
        }, container)
        return
      }
      if (t === 'Meter') {
        atom({
          isMeter: true,
          label: m.label || '',
          value: m.value || 0,
          max: m.max || 100,
          valueText: (m.unit === '€' ? money(m.value, '€') : String(m.value)) + ' / ' + (m.unit === '€' ? money(m.max, '€') : String(m.max)),
          caption: interp(m.caption || ''),
        }, container)
        return
      }
      if (t === 'TaskProgress') {
        // banner de subtareas N-de-M (checklist de operaciones): completo → panel success y
        // sin botón (contrato del componente); todo precomputado (el CSP de VB no compara)
        const total = m.total || 0
        const done = m.done || 0
        const complete = total > 0 && done >= total
        atom({
          isTaskProgress: true,
          label: interp(m.label || ''),
          value: done,
          max: total,
          valueText: done + ' de ' + total,
          panelClass: complete
            ? 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30'
            : 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-neutral-20',
          actionLabel: !complete && m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'Stat') {
        atom({
          isStat: true,
          label: m.label || '',
          value: String(m.value == null ? '' : m.value) + (m.unit ? ' ' + m.unit : ''),
        }, container)
        return
      }
      if (t === 'Button') {
        const target = container || plain
        const last = target && target.items.length ? target.items[target.items.length - 1] : null
        if (last && last.isButtons) last.buttons.push(buttonOf(m))
        else atom({ isButtons: true, buttons: [buttonOf(m)] }, container)
        return
      }
      for (const child of kidsOf(node)) visit(child, container)
    }
    visit(ctx.tree, null)
    // HOISTING de la isla anidada: un bloque cuyo contenido es la isla (card "Documento")
    // se convierte en bloque isNestedBlock — el markup la pinta a nivel de BLOQUE porque
    // a más profundidad el evaluador CSP de VB deja de resolver los bindings del template
    const hoisted = blocks.map((block) => (
      block.items.some((a) => a.isNested)
        ? { ...block, isNestedBlock: true, items: block.items.filter((a) => !a.isNested) }
        : block
    ))
    const hasDisplay = hoisted.some((b) => b.items.some((a) => !a.isButtons) || b.isNestedBlock)
    return hasDisplay ? hoisted : null
  }

  /** ¿Hace el contenido de la pantalla de cuerpo de la página? (si no, lo pinta el form genérico)
   *
   *  Sí cuando trae algo RICO (isRichAtom, una barra de pestañas, una tabla, un componente web, un
   *  listado @Subresource): sus campos ya se ven ahí. Y sí cuando el form genérico no tiene NADA
   *  que pintar: una página de solo lectura llega como textos sueltos — sus campos @ReadOnly son
   *  Text en el wire, no FormFields — y sin esta regla salía vacía (CustomerHistory). */
  function hostContentShown(blocks, summary) {
    if (!blocks || !blocks.length) return false
    const rich = (a) => isRichAtom(a) || !!(a && (a.isTabs || a.isGrid || a.isElement || a.isSubresource))
    if (blocks.some((block) => (block.items || []).some(rich))) return true
    const s = summary || {}
    return !s.formMetadata && !(s.fields || []).length && !(s.sections || []).length && !s.text
  }

  // ── @Subresource: listados embebidos en el contenido (P1) ─────────────────────────────────────
  //
  // Un campo @Subresource llega como un ServerSide INTERIOR (su isla) con un App de mediador cuya
  // homeRoute lleva `_hideTitle=1` (y `_scope`, y `_lazy` si es ON_OPEN): el servidor solo marca
  // así a los sub-recursos. Se carga al quedar a la vista — la pestaña activa —, con el estado que
  // el padre le siembra (initialData: el id del maestro) y su búsqueda OnLoad, y se pinta como una
  // tabla en su sitio del contenido.

  /** Si el nodo es la frontera de un @Subresource, cómo cargarlo; si no, null. */
  function subresourceIslandOf(node) {
    if (!node || typeof node !== 'object' || node.type !== 'ServerSide' || !node.id) return null
    const app = (node.children || [])[0]
    const md = app && app.metadata
    if (!md || md.type !== 'App' || md.variant !== 'MEDIATOR' || !md.homeRoute) return null
    const [path, query] = String(md.homeRoute).split('?')
    const params = {}
    for (const pair of String(query || '').split('&')) {
      if (!pair) continue
      const at = pair.indexOf('=')
      params[decodeURIComponent(at < 0 ? pair : pair.slice(0, at))] = at < 0 ? '' : decodeURIComponent(pair.slice(at + 1))
    }
    if (params._hideTitle !== '1') return null
    return {
      id: node.id,
      route: md.homeRoute,
      consumedRoute: md.homeConsumedRoute || path,
      serverSideType: md.homeServerSideType || node.serverSideType,
      // la marca de la ruta viaja también en el estado (_scope: lo que el padre fija), como en Vaadin
      componentState: { ...params, ...(node.initialData || {}) },
      lazy: params._lazy === '1',
    }
  }

  /** Los huecos @Subresource del contenido que aún no tienen su superficie cargada. */
  function pendingSubresourcesOf(blocks, contexts) {
    const out = []
    for (const block of blocks || []) {
      for (const a of block.items || []) {
        if (a && a.isSubresource && !(contexts && contexts[a.islandId] && contexts[a.islandId].tree)) out.push(a.subresource)
      }
    }
    return out
  }

  /** El contenido con cada hueco @Subresource cargado convertido en su tabla (o, si no es un
   *  listado, en su contenido). Los que aún no están cargados se quedan como hueco (no pintan). */
  function withSubresources(blocks, contexts) {
    if (!blocks) return blocks
    return blocks.map((block) => ({
      ...block,
      items: (block.items || []).flatMap((a) => {
        if (!a || !a.isSubresource) return [a]
        const ctx = contexts && contexts[a.islandId]
        if (!ctx || !ctx.tree) return [a]
        const crud = findByType(ctx.tree, 'Crud')
        if (!crud) {
          const inner = islandContentOf(ctx)
          return inner ? inner.flatMap((b) => b.items) : []
        }
        const md = crud.metadata || {}
        const wire = (md.columns || []).map((col) => col.metadata || col)
          // las acciones por fila no tienen sitio en la tabla de solo consulta
          .filter((c) => c.dataType !== 'actionGroup' && !(c.id === '_select' && c.stereotype === 'button'))
        const page = (((ctx.data || {}).crud || {}).page) || {}
        const rows = statusBadgeRows(page.content || [], wire)
        return [{
          isGrid: true,
          isSubresourceGrid: true,
          fieldId: a.islandId,
          label: md.title || '',
          columns: wire.map((c) => (c.dataType === 'status'
            ? { headerText: c.label || c.id, field: c.id, template: 'cellStatusBadge' }
            : { headerText: c.label || c.id, field: c.id })),
          rows,
          adp: dataProviderFactory ? dataProviderFactory(rows) : null,
          isEmpty: rows.length === 0,
          total: page.totalElements == null ? rows.length : page.totalElements,
          rowEditable: false,
          addActionId: '',
          addLabel: '',
        }]
      }),
    }))
  }

  /** Fusiona el contenido de la isla ANIDADA dentro de los bloques de la isla madre:
   *  el bloque isNestedBlock (la card que solo contenía la isla) pasa a ser una card
   *  normal cuyos items son los átomos de la anidada, MARCADOS fromNested (también sus
   *  botones) para que el dispatcher enrute sus acciones al contexto anidado. Motivo:
   *  leer $application.variables DENTRO de un template anidado no re-liga los contextos
   *  internos en el evaluador CSP de VB — los datos deben fluir por $current. */
  function mergeNestedContent(islandBlocks, nestedBlocks) {
    if (!islandBlocks) return islandBlocks
    const nestedAtoms = (nestedBlocks || []).reduce((out, block) => out.concat(block.items), [])
      .map((a) => {
        const marked = { ...a, fromNested: true }
        if (a.buttons) marked.buttons = a.buttons.map((btn) => ({ ...btn, fromNested: true }))
        if (a.fields) marked.fields = a.fields.map((f) => ({ ...f, fromNested: true }))
        return marked
      })
    return islandBlocks.map((block) => (
      block.isNestedBlock
        ? { ...block, isNestedBlock: false, isCard: true, isPlain: false, items: nestedAtoms }
        : block
    ))
  }

  /** Contenido display del HOST (páginas de detalle standalone: /encasa/:id, /checkout/:id,
   *  y los pasos del wizard /checkin/:id): los mismos bloques que una isla, con la PRIMERA
   *  isla del host (p.ej. el documento) fusionada en su hueco (atomos fromNested → despachan
   *  al contexto de la isla). En modo wizard se filtran el título de página, el ProgressSteps
   *  y los botones back/next: el guided process ya aporta rail, título y Continue. */
  /** ¿El card llevaba título? visit() lo mete como primer átomo de texto con la clase del
   *  subencabezado — que es justo lo que distingue una tarjeta de verdad del marco de la página. */
  function cardHasTitle(block) {
    const first = (block.items || [])[0]
    return !!(first && first.isText && String(first.cls || '').indexOf('oj-typography-subheading') >= 0)
  }

  function hostContentOf(ctx, islandBlocks, opts = {}) {
    const blocks = islandContentOf(ctx, opts)
    if (!blocks) return null
    let merged = mergeNestedContent(blocks, islandBlocks || null)
    const title = opts.title || ''
    let titleDropped = false
    let entityDropped = false
    merged = merged
      .map((block) => ({
        ...block,
        items: block.items.filter((atom) => {
          // el título de Page sobra: la banda del header (o el guided process) ya lo pinta
          if (!titleDropped && atom.isText && title && atom.text === title) {
            titleDropped = true
            return false
          }
          // el TOOLBAR de Page tampoco va al contenido: se proyecta a las acciones del
          // header (pageToolbarOf → primary/secondary de la banda) — SALVO el de la ISLA
          // fusionada (fromNested, p.ej. Cancel/Save del editor del documento): ese
          // pertenece a la isla y se pinta en su bloque
          if (atom.fromPageToolbar && !atom.fromNested) return false
          // y el EntityHeader tampoco cuando el header de pantalla lo muestra (título/
          // subtítulo/facts del huésped en la banda, en vez del título genérico)
          if (opts.dropEntityHeader && atom.isEntityHeader && !entityDropped) {
            entityDropped = true
            return false
          }
          if (opts.forWizard) {
            if (atom.isProgress) return false
            if (!opts.keepWizardNav && atom.isButtons && atom.buttons.length
                && atom.buttons.every((b) => b.actionId === 'next' || b.actionId === 'back')) return false
          }
          return true
        }),
      }))
      .filter((block) => block.items.length)
      // el loop del host pinta los bloques dentro de un oj-flex: los bloques-columna de una
      // fila zonada llevan su colClass; el resto ocupa la fila entera (oj-sm-12)
      .map((block) => ({ ...block, blockClass: block.colClass || 'oj-flex-item oj-sm-12' }))
    // Un ÚNICO card SIN TÍTULO que envuelve todo el contenido no es una tarjeta: es el marco de
    // la página, y ése ya lo pinta el contenedor de contenido. Pintarlo además como oj-panel deja
    // una caja dentro de otra, que es como se veía cualquier pantalla con pestañas o con una
    // tabla dentro — mientras que una ficha normal (la rama de formulario) no la tiene. Con
    // título sí es una tarjeta de verdad y se respeta, igual que cuando hay varias.
    if (merged.length === 1 && merged[0].isCard && !cardHasTitle(merged[0])) {
      merged = [{ ...merged[0], isCard: false, isPlain: true }]
    }
    return merged.length ? merged : null
  }

  /** Acción FORWARD del wizard (Continue/Completar): se deriva del PIE real del árbol — el
   *  bloque de botones que acompaña a 'back' (los wizards ricos tienen además acciones de
   *  página como selectPax que NO son el forward; elegir "primera acción no-back" fallaba). */
  function wizardForwardOf(ctx) {
    const blocks = islandContentOf(ctx)
    if (!blocks) return null
    let forward = null
    for (const block of blocks) {
      for (const atomItem of block.items) {
        if (!atomItem.isButtons) continue
        const hasBack = atomItem.buttons.some((b) => b.actionId === 'back')
        const candidate = atomItem.buttons.find((b) => b.actionId !== 'back')
        if (candidate && (hasBack || candidate.actionId === 'next')) {
          forward = { actionId: candidate.actionId, label: candidate.label }
        }
      }
    }
    return forward
  }

  /** El EntityHeader del host (p.ej. el huésped de la Reserva 360) proyectado al HEADER de
   *  pantalla: título = el nombre, subtítulo = subtitle + badges, facts (+métrica) →
   *  contextualInfo del oj-sp-header-general-overview. */
  // Paneles cuyo contenido es de UN elemento de una colección (el detalle de una consola): un
  // EntityHeader ahí dentro es la ficha del elegido, no la entidad de la PÁGINA — subirlo a la
  // cabecera vaciaba el panel de detalle y ponía el nombre del huésped como título de la pantalla.
  const PANE_TYPES = { MasterDetailLayout: true, SplitLayout: true }
  function pageEntityHeaderNode(tree) {
    return findOutsidePanes(tree, 'EntityHeader')
  }
  /** findByType, pero sin entrar en los paneles de una consola (MasterDetailLayout/SplitLayout): lo
   *  que hay dentro es contenido de un panel, no una pieza de la PÁGINA (su cabecera, su cola). */
  function findOutsidePanes(tree, type) {
    return findOutside(tree, type, PANE_TYPES)
  }

  /** findByType sin bajar a los tipos de `stops`. */
  function findOutside(tree, type, stops) {
    let found = null
    const walk = (n) => {
      if (found || !n || typeof n !== 'object') return
      const t = n.metadata && n.metadata.type
      if (t === type) { found = n; return }
      if (t && stops[t]) return
      for (const c of n.children || []) walk(c)
      const inner = n.metadata && n.metadata.content
      if (Array.isArray(inner)) inner.forEach(walk)
      else if (inner && typeof inner === 'object') walk(inner)
    }
    walk(tree)
    return found
  }

  function entityHeaderOf(ctx) {
    const node = ctx && ctx.tree ? pageEntityHeaderNode(ctx.tree) : null
    if (!node) return null
    const m = node.metadata
    const state = ctx.state || {}
    const badgeText = (m.badges || []).map((b) => b.label).join(' · ')
    const facts = (m.facts || []).map((f) => ({ label: f.label, value: interpolate(f.value, state) }))
    if (m.metricLabel) facts.push({ label: m.metricLabel, value: interpolate(m.metricValue || '', state) })
    // los colores de Chip de Mateu → status del badge oj-sp
    const BADGE_STATUS = { success: 'success', error: 'danger', warning: 'warning', contrast: 'neutral', normal: 'info' }
    return {
      title: interpolate(m.title, state),
      subtitle: interpolate(m.subtitle || '', state) + (badgeText ? ' · ' + badgeText : ''),
      // el subtítulo SIN los badges concatenados (para templates que pintan el badge aparte)
      subtitlePlain: interpolate(m.subtitle || '', state),
      badges: (m.badges || []).map((b) => ({ label: b.label, status: BADGE_STATUS[b.color] || 'neutral' })),
      facts,
    }
  }

  /** Los KPIs de la Page (@KPI: Page.metadata.kpis = [{title, text}]) → facts del header de
   *  pantalla ({label, value}), como los del EntityHeader: los totales de una reserva arriba, junto
   *  al título, y no perdidos dentro de un panel. `text` puede llevar ${state.x}. */
  function pageKpisOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    if (!page) return []
    const state = ctx.state || {}
    return ((page.metadata || {}).kpis || [])
      .filter((k) => k && (k.title || k.text))
      .map((k) => ({ label: k.title || '', value: interpolate(k.text == null ? '' : String(k.text), state) }))
  }

  /** El subtítulo de la Page (SubtitleSupplier/@Subtitle: p.ej. los importes de una reserva) para
   *  el header de pantalla cuando no hay EntityHeader. Interpolado como el título. */
  function pageSubtitleOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    const subtitle = page && page.metadata ? page.metadata.subtitle : ''
    return subtitle ? interpolate(String(subtitle), ctx.state || {}) : ''
  }

  /** ITEM OVERVIEW nativo (oj-sp-item-overview-page): página de entidad con dos
   *  bloques-columna cuya PRIMERA zona es la ESTRECHA — la anatomía RDS del template
   *  (panel de datos clave a la izquierda + main ancho a la derecha), frente al general
   *  overview (main ancho primero + info estrecha después). El EntityHeader del host se
   *  convierte en el oj-sp-item-overview del slot overview (itemTitle/subtitle/badge +
   *  facts como filas clave en el body); un botón "Volver…" del toolbar pasa a la flecha
   *  goToParent del header de navegación del template y el resto a secondaryActions. */
  function itemOverviewPageOf(entity, blocks, toolbar) {
    if (!entity) return null
    const zoned = (blocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
    if ((blocks || []).length !== 2 || zoned.length !== 2) return null
    const col = (b) => parseInt((b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '0', 10)
    if (col(zoned[0]) >= col(zoned[1])) return null // la ancha primero → general overview
    const full = (b) => Object.assign({}, b, { blockClass: 'oj-flex-item oj-sm-12' })
    const back = (toolbar || []).find((b) => /^volver\b/i.test(b.label || ''))
    const badge = (entity.badges || [])[0] || null
    return {
      on: true,
      overview: {
        title: entity.title || '',
        subtitle: entity.subtitlePlain != null ? entity.subtitlePlain : (entity.subtitle || ''),
        badge: badge ? { text: badge.label, status: badge.status, style: 'subtle', position: 'trailing' } : null,
        facts: entity.facts || [],
        blocks: [full(zoned[0])],
      },
      main: { blocks: [full(zoned[1])] },
      back: { show: !!back, actionId: back ? back.actionId : '', label: back ? back.label : '' },
      secondary: (toolbar || []).filter((b) => b !== back)
        .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
    }
  }

  /** El TOOLBAR de la Page del host (para las acciones del header de banda):
   *  [{actionId, label, chroming}]. El de estilo primary va al primaryAction del header. */
  function pageToolbarOf(ctx) {
    if (!ctx || !ctx.tree) return []
    const page = findByType(ctx.tree, 'Page')
    if (!page) return []
    return (page.metadata.toolbar || [])
      .filter((b) => b && b.actionId)
      .map((b) => ({
        actionId: b.actionId,
        label: b.label || b.actionId,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        disabled: !!b.disabled,
      }))
  }

  /**
   * Cuál de los botones del toolbar ocupa el hueco de acción PRIMARIA de la cabecera.
   *
   * `oj-sp-header-general-overview` da UN hueco visible para la primaria y pinta la primera
   * secundaria como botón; el resto va al desbordamiento `···`. Con lo que manda el wire hoy —
   * ningún botón marcado `primary` en la vista de un crud — todo caía en secundarias y la acción
   * de verdad (Edit) quedaba escondida detrás de los puntos suspensivos.
   *
   * Manda el wire cuando dice algo (`buttonStyle: primary`). Si no dice nada, se toma la ÚLTIMA
   * que no sea de vuelta: en los toolbars de Mateu el orden es "salir, …, avanzar" — Cancel→Save,
   * Back to list→Add another→Edit —, así que la última no-vuelta es la que uno vino a hacer.
   * Heurística explícita, a sustituir el día que el wire traiga el rol del botón.
   */
  const BACK_ACTIONS = { back: true, 'back-to-list': true, close: true, cancel: true }
  // `cancel` y los `cancel-<modo>` del crud (cancel-view, cancel-edit, cancel-new) son la vuelta;
  // una acción del dominio que EMPIEZA por cancel no lo es: el «Cancel booking» de una reserva
  // (`cancelBooking`) acababa convertido en el enlace de vuelta de la cabecera.
  const isBackButton = (button) => !!button && (
    BACK_ACTIONS[button.actionId] || /^cancel-/.test(String(button.actionId || '')))

  /** El botón de VOLVER del toolbar, si lo hay: en RDS eso no es una acción más, es la
   *  afordancia `goToParent` de la cabecera — meterlo entre las secundarias lo esconde en el
   *  desbordamiento justo cuando es lo que más se pulsa. */
  function backToolbarButton(toolbar) {
    return (toolbar || []).find(isBackButton) || null
  }

  function primaryToolbarButton(toolbar) {
    const buttons = toolbar || []
    const declared = buttons.find((b) => b.chroming === 'callToAction')
    if (declared) return declared
    for (let i = buttons.length - 1; i >= 0; i -= 1) {
      if (!isBackButton(buttons[i])) return buttons[i]
    }
    return null
  }

  /**
   * El botón del toolbar que eligió una ACCIÓN SECUNDARIA de un header oj-sp (spSecondaryAction),
   * o null. Los items que les pasamos son { id: actionId, value: actionId, label }, y el header
   * devuelve el item por su id (p.ej. 'walkIn') — o, según la variante, el objeto entero o su
   * label —, así que se resuelve PRIMERO por actionId y sólo después por el rótulo. Buscarlo
   * sólo por label dejaba muertas las secundarias de un listado: el id nunca es el rótulo.
   */
  function secondaryActionOf(detail, toolbar) {
    const d = detail || {}
    const item = d.secondaryItem != null ? d.secondaryItem : (d.item != null ? d.item : d.value)
    const keys = []
    const add = (k) => { if (k != null && k !== '' && typeof k !== 'object') keys.push(String(k)) }
    if (item && typeof item === 'object') {
      add(item.id); add(item.value); add(item.actionId); add(item.key); add(item.label)
    } else {
      add(item)
    }
    add(d.id)
    if (!keys.length) return null
    const buttons = (toolbar || []).filter((b) => b && b.actionId)
    for (const k of keys) {
      const byId = buttons.find((b) => String(b.actionId) === k)
      if (byId) return byId
    }
    for (const k of keys) {
      const byLabel = buttons.find((b) => b.label === k)
      if (byLabel) return byLabel
    }
    return null
  }

  /** Descartar el overlay superior SIN guardar (✕/Esc/backdrop — no emite evento alguno). */
  function dismissOverlay(reg) {
    if (!reg.stack || !reg.stack.length) return reg
    const id = reg.stack[reg.stack.length - 1]
    const contexts = { ...reg.contexts }
    delete contexts[id]
    return { ...reg, contexts, stack: reg.stack.slice(0, -1) }
  }

  /** Acciones suscritas a un evento del bus (@SubscribeTo): p.ej. el listing refresca con
   *  'search' cuando el CloseModal del drawer emite mateu-crud:saved-in-drawer. */
  function eventTriggersOf(ctx, eventName) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .filter((t) => t.type === 'OnCustomEvent' && t.eventName === eventName && t.actionId)
      .map((t) => t.actionId)
  }

  /** Trigger @AutoSave/AutoSaveTrigger del host (buscar-al-teclear, autoguardado):
   *  {actionId, debounceMillis} o null. El renderer lo honra re-lanzando la acción
   *  debounced en cada pulsación (raw-value de los inputs del host). */
  function autoSaveOf(ctx) {
    const trigger = ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .find((t) => t.type === 'AutoSave' && t.actionId)
    return trigger
      ? { actionId: trigger.actionId, debounceMillis: trigger.debounceMillis || 400 }
      : null
  }

  /** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
  /** La opción de menú de una ruta, a cualquier profundidad. */
  function menuOptionAt(options, route) {
    for (const option of options || []) {
      if ((option.route || option.path) === route) return option
      const found = menuOptionAt(option.submenus || option.submenu, route)
      if (found) return found
    }
    return null
  }

  /** El título que declara el Crud del host, si lo hay. */
  function crudTitleOf(host) {
    const crud = host && host.tree ? findByType(host.tree, 'Crud') : null
    return crud && crud.metadata ? crud.metadata.title : ''
  }

  function summarizeHost(reg, route) {
    const host = reg.contexts[HOST_ID] || {}
    const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
    const menu = (reg.shell && reg.shell.menu) || []
    // a CUALQUIER profundidad: en una shell federada la pantalla que se está viendo cuelga del
    // grupo del pod, dos niveles por debajo, y buscar solo en el primero dejaba el título vacío
    const option = menuOptionAt(menu, route)
    // un listado (pageType collection) también lleva FormFields (columnas) — NO es un form
    const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
    const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
    const state = host.state || {}
    const fields = formMetadata ? fieldListOf(host.tree, state, host.data) : []
    const sections = formMetadata ? formSectionsOf(host.tree, state, host.data) : []
    return {
      // la Page de un listado no lleva título: viaja en la metadata del Crud, y si tampoco
      // está, en el rótulo del menú
      title: pageMetadata.title || crudTitleOf(host) || (option && (option.caption || option.label)) || '',
      // el rastro automático (breadcrumbs.mjs): la cabecera saca de él su «ir al padre». Apagado con
      // @NoBreadcrumbs en la página o en la shell
      trail: pageMetadata.noBreadcrumbs || (reg.shell && reg.shell.noBreadcrumbs)
        ? []
        : autoTrail(menu, route, { title: pageMetadata.title || crudTitleOf(host) }),
      text: formMetadata ? '' : String(state.message == null ? '' : state.message),
      formMetadata,
      fields,
      sections,
      formValue: formMetadata ? { ...state } : null,
      actions: host.tree ? actionsOf(host.tree) : [],
    }
  }

  /** Helper de RENDER: primer nodo del árbol con metadata.type dado. */
  function findByType(tree, type) {
    let found = null
    const walk = (node) => {
      if (found || !node || typeof node !== 'object') return
      if (node.metadata && node.metadata.type === type) { found = node; return }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach(walk)
        else if (v && typeof v === 'object') walk(v)
      }
    }
    walk(tree)
    return found
  }

  /** Primer nodo de la SUPERFICIE (sin cruzar islas) que cumple `test`; null si ninguno. */
  function findFirst(tree, test) {
    let found = null
    walkWithinSurface(tree, (n) => { if (!found && test(n)) found = n })
    return found
  }

  /** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
   *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
   *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
  /**
   * El listado del host listo para pintar. `allColumns` son todas las del wire (de ahí parte el
   * diálogo de columnas) y `columns` las que se pintan, con las preferencias del usuario aplicadas
   * (prefs.mjs: ocultas fuera, en su orden) — leídas por columnPrefsReader (localStorage por ruta).
   */
  function listingOf(ctx, opts = {}) {
    const listing = listingBaseOf(ctx, opts)
    if (!listing) return listing
    const prefs = columnPrefsReader ? columnPrefsReader() : null
    return { ...listing, allColumns: listing.columns, columns: applyColumnPrefs(listing.columns, prefs) }
  }

  function listingBaseOf(ctx, opts = {}) {
    const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
    if (!crudNode) return null
    const md = crudNode.metadata
    const page = (((ctx.data || {}).crud || {}).page) || {}
    // FILAS DE VARIAS LÍNEAS (@Line → GridColumn.line): las columnas de la línea 1 son las de la
    // tabla (cabecera, orden, anchos); las demás se pintan DEBAJO de cada fila, a lo ancho, como
    // pares «Etiqueta: valor» secundarios — ver rowLinesOf / la plantilla cellLines
    const lines = rowLinesSplit(md.columns || [])
    const tableColumns = lines.extra.length ? lines.first : (md.columns || [])
    return {
      // PAGINACIÓN: la página que mandó el server (Page: pageNumber/pageSize/totalElements) →
      // pie de la tabla con el rango y los controles; precomputado (CSP de VB)
      paging: listingPagingOf(page, md.pageSize || 20, opts.lang),
      title: md.title || '',
      subtitle: md.subtitle || '',
      // @RowRoute / Listing.rowRoute: una fila ABRE una ruta (el maestro de un registro) — ver rowRouteOf
      rowRoute: md.rowRoute || '',
      searchable: !!md.searchable,
      pageSize: md.pageSize || 20,
      emptyStateMessage: md.emptyStateMessage || 'No data.',
      columns: tableColumns.map((col) => {
        const c = col.metadata || col
        const def = { headerText: c.label || c.id, field: c.id }
        // celda editable → plantilla de editor por tipo (siempre visible, commit por celda:
        // el contrato es update-row + parameters._editedRow; fixtures/real/update-row.json)
        if (c.editable && c.editorType) {
          def.template = c.editorType === 'boolean' ? 'cellEditBoolean'
            : (c.editorType === 'integer' || c.editorType === 'number') ? 'cellEditNumber'
              : 'cellEditText'
        }
        // ACCIONES por fila (ColumnActionGroup): botones que despachan
        // action-on-row-<método> con el id de la fila (Listing.handleActionOnRow)
        if (c.dataType === 'actionGroup') {
          def.template = 'cellRowActions'
          def.headerText = ''
          def.sortable = 'disabled'
        }
        // la clave de la columna = el id del wire: el ojSort la devuelve y es lo que el server
        // ordena (la celda puede leer otro campo, p.ej. el UUID abreviado)
        def.id = c.id
        // pie de totales (@Aggregate): la plantilla footerTotal lee totals[columnKey]
        if (aggregateFootersOf(md, (ctx.data || {}).crud)) def.footerTemplate = 'footerTotal'
        // ESTADO como badge (@Status): el valor de la celda es {type, message} — la clase
        // JET del badge se precomputa en las filas (statusBadgeRows, CSP sin ternarios)
        if (c.dataType === 'status') {
          def.template = 'cellStatusBadge'
        }
        // COLUMNA PRINCIPAL (@PrimaryColumn: stereotype 'primary'): imagen delante del título
        // (leadingPath, p.ej. la bandera del huésped) y línea de caption debajo (captionPath) —
        // campos de la fila que no son columnas. Precomputado por fila en primaryCellRows (CSP).
        if (!def.template && c.stereotype === 'primary') {
          def.field = c.id + PRIMARY_CELL_SUFFIX
          def.template = 'cellPrimary'
        }
        // UUID abreviado: una columna de texto cuyos valores son UUID se pinta "…-<último bloque>"
        // con el UUID entero en el tooltip. La fila NO cambia: la celda lee un campo aparte,
        // precomputado en uuidCellRows (CSP de VB: la plantilla no puede recortar el texto).
        if (!def.template && uuidColumnIds(page.content || [], md.columns || []).indexOf(c.id) >= 0) {
          def.field = c.id + UUID_CELL_SUFFIX
          def.template = 'cellUuid'
        }
        // ANCHO de la columna (@ColumnWidth: width + flexGrow "0" + tooltipPath en el wire, el
        // mismo contrato que aplica el gridRenderer de Vaadin): oj-table fija ese ancho; con
        // flexGrow 0 la columna no crece (min = max = width) y su texto se corta con elipsis,
        // entero en el tooltip (tooltipPath). Las demás columnas siguen a su contenido.
        Object.assign(def, columnWidthOf(c))
        if (!def.template && clipColumn(c)) {
          def.field = c.id + CLIP_CELL_SUFFIX
          def.template = 'cellClip'
        }
        return def
      }).concat(lines.extra.length ? [ROW_LINES_COLUMN] : []),
      // nº de líneas extra (0 = listado normal) y la clase de la tabla que les hace sitio
      // (PRECOMPUTADA: CSP de VB)
      extraLines: lines.extra.length,
      tableClass: lines.extra.length ? 'oj-sm-12 mateu-multiline-table mateu-lines-' + Math.min(lines.extra.length, 4) : 'oj-sm-12',
      // densidad Redwood de la tabla: el 'grid' compacto es para tablas de TRABAJO —
      // se activa cuando el crud es editable inline (@InlineEditing marca las columnas
      // como editable en el wire); un listado de consulta queda en 'list' (aireado).
      // PRECOMPUTADO (CSP de VB).
      display: (md.columns || []).some((col) => (col.metadata || col).editable) ? 'grid' : 'list',
      // tabla de TRABAJO: el clic de fila NO navega (las celdas se editan in situ)
      editable: (md.columns || []).some((col) => (col.metadata || col).editable),
      // DETALLE de fila (@Details en la fila): el campo que no es columna y se abre al pulsar la
      // fila. Una fila NAVEGABLE (primera columna con actionId 'view') sigue abriendo el registro:
      // el detalle es para los listados de consulta, donde el clic no tenía otro destino.
      detailPath: md.detailPath || null,
      navigable: (md.columns || []).some((col, i) => i === 0 && (col.metadata || col).actionId === 'view'),
      // SELECCIÓN de filas (Listing.rowsSelectionEnabled): casillas en la tabla, y las acciones de la
      // toolbar reciben las filas marcadas en crud_selected_items — el mismo contrato que Vaadin
      // (HttpRequest.getSelectedRows lo lee del componentState). El modo va PRECOMPUTADO (CSP de VB).
      rowsSelectionEnabled: !!md.rowsSelectionEnabled,
      selectionMode: { row: md.rowsSelectionEnabled ? 'multiple' : 'none' },
      // las acciones que no tienen sentido sin selección (Action.rowsSelectedRequired: Delete…)
      // (las acciones declaradas del ServerSide host, no los botones)
      selectionRequired: ((ctx.tree && ctx.tree.actions) || [])
        .filter((a) => a.rowsSelectedRequired).map((a) => a.id),
      // @RowStatus: cada fila lleva su tono (_tone) — lo pinta tables.mjs sobre los tr del oj-table;
      // @GroupBy: filas de grupo intercaladas (valor (n) + subtotales), sólo presentación
      rows: groupedRows(toneRows(rowLinesRows(clipCellRows(primaryCellRows(uuidCellRows(statusBadgeRows(page.content || [], md.columns || []), md.columns || []), md.columns || []), md.columns || []), lines.extra), md.rowStatusField), md, (ctx.data || {}).crud),
      // @Aggregate: los totales del conjunto filtrado, por columna (pie del oj-table)
      totals: aggregateFootersOf(md, (ctx.data || {}).crud),
      hasTotals: !!aggregateFootersOf(md, (ctx.data || {}).crud),
      rowStatusField: md.rowStatusField || '',
      // la propiedad por la que ordena el server cada columna (GridColumn.sortingProperty o su id)
      sortFields: Object.fromEntries((md.columns || []).map((col) => col.metadata || col)
        .map((c) => [c.id, c.sortingProperty || c.id])),
      total: page.totalElements == null ? null : page.totalElements,
      isEmpty: (page.content || []).length === 0,
      toolbar: (md.toolbar || []).map((b) => ({
        actionId: b.actionId,
        label: b.label,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      })),
      // selector RÁPIDO del listado: filtros de opciones (p.ej. un enum en Filters, como
      // la Vista del listado de reservas) → chips oj-sp-filter-chip junto al smart search;
      // los filtros viajan como FormField select en la metadata (a veces en el mediator,
      // no en el nodo Crud — se busca en todo el árbol)
      filters: filtersOf(ctx),
    }
  }

  const PAGING_TEXTS = {
    en: { of: 'of', page: 'Page', first: 'First page', prev: 'Previous page', next: 'Next page', last: 'Last page' },
    es: { of: 'de', page: 'Página', first: 'Primera página', prev: 'Página anterior', next: 'Página siguiente', last: 'Última página' },
  }

  function pagingLangOf(lang) {
    const raw = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || ''
    return PAGING_TEXTS[String(raw).toLowerCase().split(/[-_]/)[0]] || PAGING_TEXTS.en
  }

  /**
   * La PAGINACIÓN del listado, de la Page que manda el server (pageNumber/pageSize/totalElements) →
   * lo que pinta el pie de la tabla: "11–20 de 57", "Página 2 de 6" y qué botones están activos.
   * Sin total conocido (un Listing que no cuenta) hay "siguiente" mientras la página venga llena.
   * `visible` = hay más de una página (un listado corto no lleva pie).
   */
  function listingPagingOf(page, fallbackSize, lang) {
    const p = page || {}
    const t = pagingLangOf(lang)
    const size = p.pageSize > 0 ? p.pageSize : (fallbackSize > 0 ? fallbackSize : 20)
    const number = p.pageNumber > 0 ? p.pageNumber : 0
    const shown = (p.content || []).length
    const total = p.totalElements == null || p.totalElements < 0 ? null : p.totalElements
    const pageCount = total == null ? null : Math.max(1, Math.ceil(total / size))
    const from = shown === 0 ? 0 : number * size + 1
    const to = number * size + shown
    const hasPrev = number > 0
    const hasNext = total == null ? shown >= size : (number + 1) * size < total
    return {
      pageNumber: number,
      pageSize: size,
      total,
      pageCount,
      lastPage: pageCount == null ? null : pageCount - 1,
      hasPrev,
      hasNext,
      hasLast: hasNext && pageCount != null,
      // los disabled ya negados (CSP de VB: la plantilla no evalúa "!")
      prevDisabled: !hasPrev,
      nextDisabled: !hasNext,
      lastDisabled: !(hasNext && pageCount != null),
      visible: hasPrev || hasNext,
      rangeText: total == null ? `${from}–${to}` : `${from}–${to} ${t.of} ${total}`,
      pageText: pageCount == null ? `${t.page} ${number + 1}` : `${t.page} ${number + 1} ${t.of} ${pageCount}`,
      labels: { first: t.first, prev: t.prev, next: t.next, last: t.last },
    }
  }

  /**
   * La página a la que lleva un botón del pie: 'first' | 'prev' | 'next' | 'last' sobre el paging
   * actual → número de página, o null si el botón no lleva a ningún sitio.
   */
  function targetPageOf(paging, which) {
    if (!paging) return null
    if (which === 'first') return paging.hasPrev ? 0 : null
    if (which === 'prev') return paging.hasPrev ? paging.pageNumber - 1 : null
    if (which === 'next') return paging.hasNext ? paging.pageNumber + 1 : null
    if (which === 'last') return paging.hasLast ? paging.lastPage : null
    const n = Number(which)
    return Number.isInteger(n) && n >= 0 ? n : null
  }

  /**
   * El componentState de una búsqueda del listado: el estado del host + el texto, la página, el
   * tamaño, el orden y los filtros aplicados (los chips; un rango ocupa dos claves) — lo que
   * SearchActionHandler lee. Paginar o reordenar conserva texto y filtros; el orden viaja como
   * lista [{field, direction}] y sólo si lo hay.
   */
  function listingSearchStateOf(hostState, opts = {}) {
    const state = Object.assign({}, hostState || {}, {
      searchText: opts.searchText == null ? '' : opts.searchText,
      page: opts.page > 0 ? opts.page : 0,
      size: opts.size > 0 ? opts.size : 20,
    })
    const applied = opts.filters || {}
    for (const key of Object.keys(applied)) state[key] = applied[key]
    if (opts.sort && opts.sort.length) state.sort = opts.sort.map((s) => ({ field: s.field, direction: s.direction }))
    else delete state.sort
    return state
  }

  /**
   * El orden pedido por la cabecera de oj-table (ojSort: detail.header = clave de la columna,
   * detail.direction 'ascending'|'descending') → [{field, direction}] en el vocabulario del
   * server (io.mateu.uidl.data.Sort). La clave es el id del wire (listingOf la fija); si llega el
   * campo de la celda (p.ej. el UUID abreviado), se le quita el sufijo.
   */
  function listingSortOf(detail, sortFields) {
    if (!detail || !detail.header) return []
    const key = String(detail.header).replace(new RegExp('(' + UUID_CELL_SUFFIX + '|' + PRIMARY_CELL_SUFFIX + '|' + CLIP_CELL_SUFFIX + ')$'), '')
    const field = (sortFields && sortFields[key]) || key
    const direction = detail.direction === 'descending' ? 'descending' : 'ascending'
    return [{ field, direction }]
  }

  /**
   * La selección de la tabla, en una forma que sobrevive a un refresco: el KeySet de oj-table
   * (`detail.value.row` de ojSelectedChanged) → { all, keys, except }. Un "seleccionar todo" es
   * un KeySet de tipo addAll: todas menos las desmarcadas, no una lista de claves.
   */
  function selectionOfKeySet(keySet) {
    if (!keySet) return { all: false, keys: [], except: [] }
    if (typeof keySet.isAddAll === 'function' && keySet.isAddAll()) {
      const deleted = typeof keySet.deletedValues === 'function' ? Array.from(keySet.deletedValues()) : []
      return { all: true, keys: [], except: deleted }
    }
    const values = typeof keySet.values === 'function' ? Array.from(keySet.values()) : []
    return { all: false, keys: values, except: [] }
  }

  /** Las filas marcadas, resueltas contra las filas ACTUALES por su clave (_rowNumber). Lo que se
   *  manda es la fila tal como llegó: el badge precomputado de las columnas @Status no viaja. */
  function selectedRowsOf(rows, selection) {
    if (!selection) return []
    const picked = selection.all
      ? (rows || []).filter((r) => selection.except.indexOf(r._rowNumber) < 0)
      : (rows || []).filter((r) => selection.keys.indexOf(r._rowNumber) >= 0)
    return picked.map((row) => {
      const out = {}
      for (const key of Object.keys(row)) {
        const value = row[key]
        if (key.endsWith(UUID_CELL_SUFFIX) || key.endsWith(CLIP_CELL_SUFFIX)) {
          continue
        }
        if (value && typeof value === 'object' && !Array.isArray(value) && 'badgeClass' in value) {
          const { badgeClass, ...rest } = value
          out[key] = rest
        } else {
          out[key] = value
        }
      }
      return out
    })
  }

  /** El componentState de una acción del host de un listado con selección: lleva las filas
   *  marcadas en crud_selected_items, como Vaadin. Sin listado o sin selección, intacto. */
  function withListingSelection(componentState, listing, rows, selection) {
    if (!listing || !listing.rowsSelectionEnabled) return componentState
    return Object.assign({}, componentState, { crud_selected_items: selectedRowsOf(rows, selection) })
  }

  // filas con columnas @Status: al valor {type, message} se le estampa la clase badge de
  // JET (Redwood, sistema) — el template de celda no puede mapear (CSP sin ternarios)
  const STATUS_BADGE = {
    SUCCESS: 'oj-badge oj-badge-success oj-badge-subtle',
    WARNING: 'oj-badge oj-badge-warning oj-badge-subtle',
    DANGER: 'oj-badge oj-badge-danger oj-badge-subtle',
    INFO: 'oj-badge oj-badge-info oj-badge-subtle',
    NONE: 'oj-badge oj-badge-neutral oj-badge-subtle',
  }
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const UUID_CELL_SUFFIX = '__uuidCell'

  /** "…-<último bloque>" de un UUID canónico; cualquier otro valor, tal cual. */
  function abbreviateUuid(value) {
    return typeof value === 'string' && UUID.test(value)
      ? '…-' + value.substring(value.lastIndexOf('-') + 1)
      : value
  }

  // las columnas de TEXTO (sin plantilla propia, ni editables) con algún valor que es un UUID entero
  function uuidColumnIds(rows, columns) {
    return columns
      .map((col) => col.metadata || col)
      .filter((c) => !c.editable && (!c.dataType || c.dataType === 'string'))
      .filter((c) => rows.some((row) => typeof row[c.id] === 'string' && UUID.test(row[c.id])))
      .map((c) => c.id)
  }

  // filas con columnas de UUID: a cada una se le añade <id>__uuidCell = {text, full}, que es lo que
  // pinta la celda; el valor original de la fila queda intacto (navegación, acciones, selección)
  function uuidCellRows(rows, columns) {
    const ids = uuidColumnIds(rows, columns)
    if (!ids.length) return rows
    return rows.map((row) => {
      const out = { ...row }
      for (const id of ids) {
        const value = row[id] == null ? '' : String(row[id])
        out[id + UUID_CELL_SUFFIX] = { text: abbreviateUuid(value), full: value }
      }
      return out
    })
  }

  const PRIMARY_CELL_SUFFIX = '__primary'

  /** La celda (de la columna técnica ROW_LINES_COLUMN) que pinta las líneas extra de cada fila. */
  const ROW_LINES_FIELD = '__rowLines'

  const ROW_LINES_COLUMN = {
    id: ROW_LINES_FIELD,
    field: ROW_LINES_FIELD,
    headerText: '',
    template: 'cellLines',
    sortable: 'disabled',
    className: 'mateu-row-lines-cell',
    headerClassName: 'mateu-row-lines-cell',
    width: '1px',
    minWidth: '1px',
    maxWidth: '1px',
  }

  /** La línea (1-based) de una columna: su `line` si es > 1; si no, 1. */
  function lineOfColumn(c) {
    const line = c && typeof c.line === 'number' ? c.line : 0
    return line > 1 ? Math.floor(line) : 1
  }

  /** Reparte las columnas del wire por línea: {first: las de la línea 1, extra: [[línea 2], [línea 3]…]}
   *  en el orden del wire (las líneas vacías no cuentan). Sin @Line, extra = [] y nada cambia. */
  function rowLinesSplit(columns) {
    const first = []
    const byLine = new Map()
    for (const col of columns || []) {
      const c = col.metadata || col
      const line = c.type === 'GridGroupColumn' ? 1 : lineOfColumn(c)
      if (line === 1) first.push(col)
      else {
        if (!byLine.has(line)) byLine.set(line, [])
        byLine.get(line).push(col)
      }
    }
    return { first, extra: [...byLine.keys()].sort((a, b) => a - b).map((k) => byLine.get(k)) }
  }

  /** El texto de un valor en una línea extra: un estado por su mensaje, dinero «importe moneda». */
  function lineValueText(v) {
    if (v == null) return ''
    if (Array.isArray(v)) return v.map(lineValueText).filter(Boolean).join(', ')
    if (typeof v === 'object') {
      if (v.message !== undefined) return String(v.message == null ? '' : v.message)
      if (v.amount !== undefined) return [v.amount, v.currency].filter((x) => x != null).join(' ')
      return String(v.label || v.text || v.name || '')
    }
    if (typeof v === 'boolean') return v ? '✓' : '✗'
    return String(v)
  }

  /** A cada fila, <ROW_LINES_FIELD> = {lines: [{key, pairs: [{key, label, text, cls}]}]}: lo que pinta
   *  la plantilla cellLines (CSP de VB: precomputado). Un estado lleva su badge (cls). */
  function rowLinesRows(rows, extra) {
    if (!extra || !extra.length) return rows
    const lines = extra.map((line) => line.map((col) => col.metadata || col))
    return rows.map((row) => ({
      ...row,
      [ROW_LINES_FIELD]: {
        lines: lines.map((cols, i) => ({
          key: 'l' + (i + 2),
          pairs: cols.map((c) => {
            const v = row[c.id]
            return {
              key: c.id,
              label: c.label || c.id,
              text: lineValueText(v),
              cls: (v && typeof v === 'object' && v.badgeClass) || '',
            }
          }),
        })),
      },
    }))
  }

  const CLIP_CELL_SUFFIX = '__clipCell'

  /** El ancho que el wire pide para una columna (GridColumn.width / flexGrow), en las claves de
   *  oj-table: width (y, si no crece — flexGrow "0" —, minWidth = maxWidth = width). Sin width, {}. */
  function columnWidthOf(c) {
    const width = c && typeof c.width === 'string' ? c.width.trim() : (c && typeof c.width === 'number' ? c.width + 'px' : '')
    if (!width || width === 'auto') return {}
    return String(c.flexGrow) === '0'
      ? { width, minWidth: width, maxWidth: width }
      : { width, minWidth: width }
  }

  // una columna de TEXTO con ancho fijo (flexGrow 0) o con tooltip: su celda se corta con elipsis
  // y el texto entero (o el del campo tooltipPath) va al title
  function clipColumn(c) {
    return !c.editable && c.dataType !== 'actionGroup' && c.dataType !== 'status' && c.stereotype !== 'primary'
      && (!!c.tooltipPath || (!!columnWidthOf(c).maxWidth))
  }

  /** A cada columna recortable se le añade <id>__clipCell = {text, title, cls}: lo que pinta la celda
   *  (CSP de VB: la plantilla no puede leer un campo variable de la fila). La fila queda intacta. */
  function clipCellRows(rows, columns) {
    const cols = (columns || []).map((c) => c.metadata || c).filter(clipColumn)
    if (!cols.length) return rows
    const text = (v) => (v == null ? '' : (typeof v === 'object' ? (v.message || v.text || v.label || '') : String(v)))
    return rows.map((row) => {
      const out = { ...row }
      for (const c of cols) {
        const shown = text(row[c.id])
        // tooltipPath a OTRO campo (@Tooltip): un detalle → la ventana flotante; a sí mismo (un ancho
        // fijo que corta): el texto entero en el title de siempre
        const tip = c.tooltipPath && c.tooltipPath !== c.id ? text(row[c.tooltipPath]) : ''
        // solo la columna de ancho fijo se corta; con tooltipPath y sin ancho, el texto sigue entero
        // con @Tooltip(otro campo) el detalle sale en la ventana flotante (hover.mjs), no en el title
        // del navegador: varias líneas y estilo Redwood; sin él, el title enseña lo que se corta
        out[c.id + CLIP_CELL_SUFFIX] = { text: shown, title: tip ? '' : shown, hover: tip, cls: columnWidthOf(c).maxWidth ? 'mateu-cell-clip' : '' }
      }
      return out
    })
  }

  /** La celda de cada columna principal: {title, caption, leading} (vacíos si no hay). */
  function primaryCellRows(rows, columns) {
    const cols = (columns || []).map((c) => c.metadata || c).filter((c) => c.stereotype === 'primary')
    if (!cols.length) return rows
    const text = (v) => (v == null ? '' : String(v))
    return rows.map((row) => {
      const out = { ...row }
      for (const c of cols) {
        out[c.id + PRIMARY_CELL_SUFFIX] = {
          title: text(row[c.id]),
          caption: c.captionPath ? text(row[c.captionPath]) : '',
          leading: c.leadingPath ? text(row[c.leadingPath]) : '',
        }
      }
      return out
    })
  }

  function statusBadgeRows(rows, columns) {
    const statusCols = columns
      .map((col) => col.metadata || col)
      .filter((c) => c.dataType === 'status')
      .map((c) => c.id)
    if (!statusCols.length) return rows
    return rows.map((row) => {
      const out = { ...row }
      for (const id of statusCols) {
        const value = out[id]
        if (value && typeof value === 'object') {
          out[id] = { ...value, badgeClass: STATUS_BADGE[value.type] || STATUS_BADGE.NONE }
        }
      }
      return out
    })
  }

  /**
   * TODOS los filtros que declara el listado, cada uno ya resuelto al widget que le toca.
   *
   * Antes sólo salían los de opciones, y sólo el primero: un listado con un booleano, un
   * lookup, un enum y dos fechas mostraba una tira de chips sueltos con los valores del enum
   * —sin decir siquiera de qué campo eran— y los otros cuatro filtros no existían para el
   * usuario. En el renderer Vaadin salen los cinco.
   *
   * El `kind` se PRECOMPUTA aquí porque las plantillas de VB corren bajo CSP y no pueden
   * evaluar expresiones; el orden de resolución es el mismo que el de la barra compartida
   * (rango → multi → opciones → booleano → texto), para que un mismo listado ofrezca lo
   * mismo en los dos renderers.
   */
  function filtersOf(ctx) {
    const found = []
    const walk = (node) => {
      if (!node || typeof node !== 'object') return
      for (const f of ((node.metadata || {}).filters) || []) {
        // un filtro readOnly es el ÁMBITO del listado (el :id del maestro que lo contiene, el
        // contexto de un @Subresource): lo fija la ruta, no es una condición que el usuario quite
        if (f.readOnly) continue
        found.push(filterDescriptorOf(f, ctx && ctx.data))
      }
      ;(node.children || []).forEach(walk)
    }
    walk(ctx && ctx.tree)
    return found
  }

  function filterDescriptorOf(f, data) {
    // un filtro @Lookup trae sus opciones por su búsqueda (search-<campo>, bridge.loadLookups):
    // llegan a data[campo] como las de un campo del formulario
    const options = optionsOf(f, data).map((o) => ({ value: o.value, label: o.label || o.value }))
    // 'bool' lo emite el server Java y 'boolean' el .NET
    const isBool = f.dataType === 'bool' || f.dataType === 'boolean'
      || f.stereotype === 'checkbox' || f.stereotype === 'toggle'
    const isNumeric = ['integer', 'decimal', 'number', 'money'].indexOf(f.dataType) >= 0
    let kind
    if (f.stereotype === 'dateRange' || f.stereotype === 'numberRange') kind = 'range'
    else if (f.stereotype === 'multiSelect') kind = 'multi'
    else if (options.length) kind = 'options'
    else if (isBool) kind = 'bool'
    else kind = 'text'
    return {
      fieldId: f.fieldId,
      label: f.label || f.fieldId,
      kind,
      options,
      // el tipo del <input> de los kinds 'range' y 'text' (una fecha se teclea fatal como texto)
      inputType: f.stereotype === 'dateRange'
        ? (f.dataType === 'dateTime' ? 'datetime-local' : 'date')
        : (f.stereotype === 'numberRange' || isNumeric) ? 'number' : 'text',
      isRange: kind === 'range',
      isMulti: kind === 'multi',
      isOptions: kind === 'options',
      isBool: kind === 'bool',
      isText: kind === 'text',
      fromKey: f.fieldId + '_from',
      toKey: f.fieldId + '_to',
    }
  }

  /**
   * Los filtros como CHIPS: uno por filtro, aplicado o no.
   *
   * Uno por FILTRO y no uno por valor posible, que es lo que se pintaba antes: los ocho
   * estados de un enum salían como ocho chips sueltos, sin decir de qué campo eran, y ocupando
   * la fila entera que debían compartir los otros cuatro filtros. Un chip sin aplicar abre su
   * editor; uno aplicado enseña el valor y se quita por la ✕.
   *
   * `keys` son las claves de estado que hay que borrar para quitarlo — un rango ocupa dos, y
   * quitarlo a medias deja el listado filtrado por algo que ya no se ve.
   */
  function filterChipsOf(filters, values) {
    const v = values || {}
    const chips = (filters || []).map((f) => {
      if (f.isRange) {
        const from = v[f.fromKey]
        const to = v[f.toKey]
        const applied = !isBlank(from) || !isBlank(to)
        const text = !applied ? ''
          : isBlank(from) ? '≤ ' + to
          : isBlank(to) ? '≥ ' + from
          : from + ' → ' + to
        return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fromKey, f.toKey] }
      }
      const value = v[f.fieldId]
      const applied = !isBlank(value)
      let text = ''
      if (applied) {
        if (f.isMulti) {
          const selected = Array.isArray(value) ? value : String(value).split(',')
          text = selected.map((s) => labelOfOption(f, s)).join(', ')
        } else if (f.isBool) {
          text = (value === true || value === 'true') ? 'Yes' : 'No'
        } else if (f.isOptions) {
          text = labelOfOption(f, value)
        } else {
          text = String(value)
        }
      }
      return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fieldId] }
    })
    // la selección por ids (?ids=…): sólo cuando está aplicada — no es un filtro que se ofrezca
    if (!declaresIds(filters) && !isBlank(v[IDS_PARAM])) {
      chips.unshift({ fieldId: IDS_PARAM, label: 'Ids', text: idsChipLabelOf(v[IDS_PARAM]), applied: true, keys: [IDS_PARAM] })
    }
    return chips
  }

  /**
   * Los filtros que trae la query de una ruta (`integration=MRU01&status=PROPOSED,APPROVED`) →
   * { campo: valor }. Todos los parámetros, decodificados (`+` es un espacio, como en un
   * formulario); los vacíos no filtran, ni la página ni el orden. Un multi-select toma la lista separada por comas
   * (multiValuesOf), igual que la escribe Vaadin en la URL.
   */
  /**
   * Una navegación pedida (ruta con o sin ?query) frente a la que hay en pantalla. `full` (ruta +
   * query) es lo que la identifica — el id de la entrada del menú, la URL —; `filters` son
   * EXACTAMENTE los de su query: ninguno si no trae (ir a /reservas desde /reservas?vista=… quita el
   * filtro). `same` = es la que ya hay (el eco del writeback de la selección del menú): no recargar.
   */
  function navTargetOf(requested, currentFull) {
    const raw = String(requested || '')
    const q = raw.indexOf('?')
    const route = q >= 0 ? raw.slice(0, q) : raw
    const query = q >= 0 ? raw.slice(q + 1) : ''
    const full = query ? route + '?' + query : route
    return { route, full, filters: queryFiltersOf(query), same: full === (currentFull || '') }
  }

  function queryFiltersOf(query) {
    const out = {}
    const text = String(query || '').replace(/^\?/, '')
    if (!text) return out
    for (const part of text.split('&')) {
      const eq = part.indexOf('=')
      if (eq <= 0) continue
      const decode = (v) => {
        try { return decodeURIComponent(v.replace(/\+/g, ' ')) } catch (e) { return v }
      }
      const key = decode(part.slice(0, eq))
      const value = decode(part.slice(eq + 1))
      if (key && value !== '' && !PAGING_PARAMS[key]) out[key] = value
    }
    return out
  }

  // la página y el orden también viajan en la URL de un listado de Vaadin, pero no son filtros
  const PAGING_PARAMS = { page: true, size: true, sort: true }

  // ── Filtros por URL: los declarados, el texto libre y la selección por ids ─────────────────────
  // Cualquier filtro declarado de un listado se pone desde la URL con su nombre de campo (un rango,
  // con <campo>_from / <campo>_to; un multi-select, separado por comas). Además, dos que no declara
  // nadie: el texto libre (`searchText`, o `q` como alias al leer) y `ids`, la SELECCIÓN — un
  // conjunto concreto de filas por su id (`?ids=4MBZS7,JXD3G6`), que el framework aplica en el
  // server a cualquier listado. Todos salen como chips que se quitan, y la URL los refleja.

  /** El filtro reservado de la selección por ids (lo aplica el server, ningún listado lo declara). */
  const IDS_PARAM = 'ids'

  const IDS_TEXTS = {
    en: { few: 'Selection: ', many: (n) => n + ' selected items' },
    es: { few: 'Selección: ', many: (n) => n + ' elementos seleccionados' },
  }

  function idsTextsOf(lang) {
    const raw = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || ''
    return IDS_TEXTS[String(raw).toLowerCase().split(/[-_]/)[0]] || IDS_TEXTS.en
  }

  /** El rótulo del chip de la selección: los ids si son pocos (≤3), si no cuántos son. */
  function idsChipLabelOf(ids, lang) {
    const list = multiValuesOf(ids)
    const texts = idsTextsOf(lang)
    return list.length <= 3 ? texts.few + list.join(', ') : texts.many(list.length)
  }

  /**
   * Los filtros de una query (queryFiltersOf) separados en el texto libre y el resto: `searchText`
   * (o su alias `q`, si no viene searchText) es lo que se busca, no un filtro — va al chip keyword.
   */
  function splitListingQuery(filters) {
    const values = Object.assign({}, filters || {})
    let searchText = ''
    if (!isBlank(values.searchText)) searchText = String(values.searchText)
    else if (!isBlank(values.q)) searchText = String(values.q)
    delete values.searchText
    delete values.q
    return { searchText, values }
  }

  /**
   * La query que refleja los filtros aplicados de un listado (sin '?'): cada valor con su clave, las
   * listas separadas por comas (como las escribe Vaadin), el texto libre como `searchText`. Las comas
   * se dejan legibles; el resto, codificado.
   */
  function listingQueryOf(values, searchText) {
    const enc = (s) => encodeURIComponent(String(s)).replace(/%2C/gi, ',')
    const parts = []
    const v = values || {}
    for (const key of Object.keys(v)) {
      const value = v[key]
      if (isBlank(value) || PAGING_PARAMS[key]) continue
      parts.push(enc(key) + '=' + enc(Array.isArray(value) ? value.join(',') : value))
    }
    const text = searchText == null ? '' : String(searchText).trim()
    if (text) parts.push('searchText=' + enc(text))
    return parts.join('&')
  }

  /** La ruta COMPLETA (con su query) de un listado con esos filtros: lo que va a la URL. */
  function listingUrlOf(route, values, searchText) {
    const bare = String(route || '').split('?')[0]
    const query = listingQueryOf(values, searchText)
    return query ? bare + '?' + query : bare
  }

  const declaresIds = (filters) => (filters || []).some((f) => f && f.fieldId === IDS_PARAM)

  /** Los valores de un multi-select, que llegan como lista o como cadena separada por comas. */
  function multiValuesOf(value) {
    if (value == null) return []
    if (Array.isArray(value)) return value.map(String)
    const text = String(value).trim()
    return text === '' ? [] : text.split(',').map((s) => s.trim()).filter((s) => s)
  }

  // ── Filtros DENTRO de la cabecera del buscador ────────────────────────────────────────────
  // Los filtros viajan por la API `smartFilters` de oj-sp-smart-filter-search, no en una fila
  // propia debajo: el componente pinta su cabecera (título + buscador + filtros) y, al pie, la
  // franja de color de Redwood. Una fila de filtros FUERA del componente quedaba al otro lado de
  // la franja, que así parecía una ilustración suelta en mitad de la página.
  //
  // La API cubre todos los kinds de Mateu, cada uno con el editor que el propio componente abre
  // en su popup (un oj-dynamic-form alimentado por `filtersMetadata`):
  //   - `suggestionFilters`: los filtros SIN aplicar — un chip por filtro declarado bajo el
  //     buscador; el componente quita de ahí los que ya están aplicados.
  //   - `value`: los aplicados — chips DENTRO del campo de búsqueda, con su ✕; el texto libre
  //     viaja ahí mismo como chips `keyword`.
  //   - `filtersMetadata`: un JsonMetadataProvider de oj-dynamic, polimórfico por `filter` (el
  //     fieldId): el editor del valor de cada filtro.

  const KEYWORD_FILTER = 'keyword'
  const BOOL_CHOICES = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]

  /** El editor del valor de un filtro, en el vocabulario de oj-dynamic (lo que abre el popup). */
  function smartFilterValueMetadataOf(f) {
    const labelHint = f.label
    if (f.isRange) {
      // gte/lte oj-input-date (string) u oj-input-number (number): con esa forma exacta el
      // componente reconoce el rango y pinta el chip como "desde - hasta" formateado
      const numeric = f.inputType === 'number'
      const componentType = numeric ? 'oj-input-number'
        : f.inputType === 'datetime-local' ? 'oj-input-date-time' : 'oj-input-date'
      const type = numeric ? 'number' : 'string'
      return {
        type: 'object',
        labelHint,
        properties: {
          gte: { type, componentType, labelHint: 'Desde' },
          lte: { type, componentType, labelHint: 'Hasta' },
        },
      }
    }
    const options = (f.options || []).map((o) => ({ value: String(o.value), label: o.label }))
    if (f.isMulti) {
      return { type: 'array', items: { type: 'string' }, componentType: 'oj-checkboxset', labelHint, options }
    }
    if (f.isOptions) return { type: 'string', componentType: 'oj-select-single', labelHint, options }
    if (f.isBool) return { type: 'string', componentType: 'oj-select-single', labelHint, options: BOOL_CHOICES }
    if (f.inputType === 'number') return { type: 'number', componentType: 'oj-input-number', labelHint }
    return { type: 'string', componentType: 'oj-input-text', labelHint }
  }

  /**
   * `filtersMetadata` en crudo (JSON de oj-dynamic): polimórfico por `filter`, un tipo por filtro
   * declarado. El componente lo consulta con getMetadataByDiscriminator('filter', fieldId).
   */
  function smartFiltersMetadataOf(filters) {
    const polymorphicTypes = {}
    for (const f of filters || []) {
      polymorphicTypes[f.fieldId] = { type: 'object', properties: { value: smartFilterValueMetadataOf(f) } }
    }
    // el chip de la selección por ids también puede abrir su editor: un texto (ids separados por comas)
    if (!declaresIds(filters)) {
      polymorphicTypes[IDS_PARAM] = { type: 'object',
        properties: { value: { type: 'string', componentType: 'oj-input-text', labelHint: 'Ids' } } }
    }
    return {
      type: 'object',
      properties: { filter: { type: 'string' }, label: { type: 'string' } },
      discriminator: 'filter',
      polymorphicTypes,
    }
  }

  // Los de opciones llevan `filterLabel` (el nombre del campo): el componente pone en `label` la
  // etiqueta de la opción elegida y el chip se lee "Vista Llegadas hoy". Un texto o un rango NO:
  // con filterLabel el componente enseña la etiqueta en vez del valor tecleado.
  const usesFilterLabel = (f) => f.isOptions || f.isMulti || f.isBool

  /** Los chips de `suggestionFilters`: uno por filtro declarado, sin valor. */
  function smartFilterSuggestionsOf(filters) {
    return (filters || []).map((f) => {
      const chip = { filter: f.fieldId, label: f.label }
      if (usesFilterLabel(f)) chip.filterLabel = f.label
      // el formulario del popup saca sus campos de las claves del valor: sin ellas, un rango
      // abre un popup vacío
      if (f.isRange) chip.value = { gte: null, lte: null }
      return chip
    })
  }

  /** El `value` del componente (los chips aplicados) a partir del estado de Mateu. */
  function smartFilterValueOf(filters, values, searchText) {
    const v = values || {}
    const out = []
    const text = searchText == null ? '' : String(searchText).trim()
    if (text) out.push({ filter: KEYWORD_FILTER, label: text, value: text })
    // la selección por ids: un chip más, que se quita como cualquiera (sin filterLabel: el rótulo
    // ya dice qué es)
    if (!declaresIds(filters) && !isBlank(v[IDS_PARAM])) {
      const ids = multiValuesOf(v[IDS_PARAM])
      if (ids.length) out.push({ filter: IDS_PARAM, label: idsChipLabelOf(ids), value: ids.join(',') })
    }
    for (const f of filters || []) {
      if (f.isRange) {
        const from = v[f.fromKey]
        const to = v[f.toKey]
        if (isBlank(from) && isBlank(to)) continue
        out.push({ filter: f.fieldId, label: f.label,
          value: { gte: isBlank(from) ? null : from, lte: isBlank(to) ? null : to } })
        continue
      }
      const value = v[f.fieldId]
      if (isBlank(value)) continue
      if (f.isMulti) {
        const selected = multiValuesOf(value)
        if (!selected.length) continue
        out.push({ filter: f.fieldId, label: labelOfOption(f, selected[0]), filterLabel: f.label, value: selected })
      } else if (f.isBool) {
        const bool = value === true || value === 'true' ? 'true' : 'false'
        out.push({ filter: f.fieldId, label: bool === 'true' ? 'Yes' : 'No', filterLabel: f.label, value: bool })
      } else if (f.isOptions) {
        out.push({ filter: f.fieldId, label: labelOfOption(f, value), filterLabel: f.label, value: String(value) })
      } else {
        out.push({ filter: f.fieldId, label: f.label, value })
      }
    }
    return out
  }

  /**
   * Lo inverso: los chips aplicados del componente → el texto buscado (los keywords, en orden) y
   * los valores de filtro que viajan en el componentState. Un chip recién sacado de las
   * sugerencias todavía no tiene valor: no filtra hasta que se elige uno en su popup.
   */
  function filterStateOfSmartFilters(filters, chips) {
    const byId = {}
    for (const f of filters || []) byId[f.fieldId] = f
    const values = {}
    const keywords = []
    for (const chip of chips || []) {
      if (!chip) continue
      if (chip.filter === KEYWORD_FILTER) {
        if (!isBlank(chip.value)) keywords.push(String(chip.value))
        continue
      }
      if (chip.filter === IDS_PARAM && !byId[IDS_PARAM]) {
        const ids = multiValuesOf(chip.value)
        if (ids.length) values[IDS_PARAM] = ids.join(',')
        continue
      }
      const f = byId[chip.filter]
      if (!f) continue
      if (f.isRange) {
        const range = chip.value || {}
        if (!isBlank(range.gte)) values[f.fromKey] = range.gte
        if (!isBlank(range.lte)) values[f.toKey] = range.lte
      } else if (f.isMulti) {
        const selected = multiValuesOf(chip.value)
        if (selected.length) values[f.fieldId] = selected
      } else if (!isBlank(chip.value)) {
        values[f.fieldId] = chip.value
      }
    }
    return { searchText: keywords.join(' '), values }
  }

  /**
   * Las sugerencias que tocan para un fetch del componente: fuera las de los filtros ya
   * aplicados (el criterio trae `{op:'$ne', value:{filters}}`) y, si hay texto, las que no lo
   * contienen. Es el contrato del SuggestionFiltersDataProvider de oj-sp, que es REST; aquí las
   * sugerencias son locales.
   */
  function suggestionRowsFor(rows, criterion) {
    const parts = !criterion ? [] : criterion.criteria ? criterion.criteria : [criterion]
    let applied = []
    let text = ''
    for (const c of parts) {
      if (c && c.op === '$ne' && c.value && Array.isArray(c.value.filters)) applied = c.value.filters
      if (c && typeof c.text === 'string') text = c.text.trim().toLowerCase()
    }
    const taken = applied.map((a) => a && a.filter)
    return (rows || [])
      .filter((r) => taken.indexOf(r.filter) < 0)
      .filter((r) => !text || String(r.filterLabel || r.label).toLowerCase().indexOf(text) >= 0)
  }

  /** Un DataProvider (la parte que usa oj-sp-smart-filters) sobre las sugerencias locales. */
  function suggestionFiltersProviderOf(rows) {
    const all = rows || []
    const block = (data, params) => ({
      done: true,
      value: { data, metadata: data.map((r) => ({ key: r.filter })), fetchParameters: params },
    })
    return {
      fetchFirst(params) {
        const data = suggestionRowsFor(all, params && params.filterCriterion)
        return { [Symbol.asyncIterator]: () => ({ next: () => Promise.resolve(block(data, params)) }) }
      },
      fetchByKeys(params) {
        const results = new Map()
        for (const key of (params && params.keys) || []) {
          const row = all.filter((r) => r.filter === key)[0]
          if (row) results.set(key, { data: row, metadata: { key } })
        }
        return Promise.resolve({ fetchParameters: params, results })
      },
      containsKeys(params) {
        const results = new Set()
        for (const key of (params && params.keys) || []) {
          if (all.some((r) => r.filter === key)) results.add(key)
        }
        return Promise.resolve({ containsParameters: params, results })
      },
      getCapability() { return null },
      getTotalSize() { return Promise.resolve(all.length) },
      isEmpty() { return all.length ? 'no' : 'yes' },
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return true },
    }
  }

  /**
   * Las filas del DESPLEGABLE del buscador (la propiedad `suggestions` de oj-sp-smart-filters, un
   * SmartSuggestionChipsDataProvider): una por filtro declarado, cada una con su chip. Al entrar en
   * el campo el componente las abre en su popup bajo la caja; elegir una aplica ese filtro y, como
   * es un chip complejo, abre su editor (oj-dynamic, filtersMetadata) — el mismo editor que los chips.
   * `category: 'suggestion'` es el icono de caja del componente (los otros son historial y texto).
   */
  function smartFilterDropdownRowsOf(filters) {
    return smartFilterSuggestionsOf(filters).map((chip) => ({ id: chip.filter, category: 'suggestion', chips: [chip] }))
  }

  /** Las filas del desplegable que tocan: fuera los filtros ya aplicados y, si hay texto, las que no lo contienen. */
  function dropdownRowsFor(rows, criterion) {
    const parts = !criterion ? [] : criterion.criteria ? criterion.criteria : [criterion]
    let applied = []
    let text = ''
    for (const c of parts) {
      if (c && c.op === '$ne' && c.value && Array.isArray(c.value.filters)) applied = c.value.filters
      if (c && typeof c.text === 'string') text = c.text.trim().toLowerCase()
    }
    const taken = applied.map((a) => a && a.filter)
    return (rows || [])
      .filter((r) => taken.indexOf(r.id) < 0)
      .filter((r) => !text || r.chips.some((chip) => String(chip.filterLabel || chip.label).toLowerCase().indexOf(text) >= 0))
  }

  /** Un DataProvider (lo que usa el popup del buscador) sobre las filas locales del desplegable. */
  function suggestionsProviderOf(rows) {
    const all = rows || []
    return {
      // como un ArrayDataProvider de JET: un bloque con las filas (done: false) y después el final
      // vacío (done: true). Un único bloque ya «done» lo pinta bien el primer fetch, pero al
      // refiltrar el oj-list-view del popup conservaba las filas de antes con el dato nuevo
      fetchFirst(params) {
        const data = dropdownRowsFor(all, params && params.filterCriterion)
        return {
          [Symbol.asyncIterator]: () => {
            let sent = false
            return {
              next: () => {
                const rowsNow = sent ? [] : data
                const done = sent
                sent = true
                return Promise.resolve({ done, value: { data: rowsNow, metadata: rowsNow.map((r) => ({ key: r.id })), fetchParameters: params } })
              },
            }
          },
        }
      },
      fetchByKeys(params) {
        const results = new Map()
        for (const key of (params && params.keys) || []) {
          const row = all.filter((r) => r.id === key)[0]
          if (row) results.set(key, { data: row, metadata: { key } })
        }
        return Promise.resolve({ fetchParameters: params, results })
      },
      containsKeys(params) {
        const results = new Set()
        for (const key of (params && params.keys) || []) {
          if (all.some((r) => r.id === key)) results.add(key)
        }
        return Promise.resolve({ containsParameters: params, results })
      },
      fetchByOffset(params) {
        const data = dropdownRowsFor(all, params && params.filterCriterion)
        const offset = (params && params.offset) || 0
        const size = params && params.size > 0 ? params.size : data.length
        const slice = data.slice(offset, offset + size)
        return Promise.resolve({
          done: offset + size >= data.length,
          fetchParameters: params,
          results: slice.map((r) => ({ data: r, metadata: { key: r.id } })),
        })
      },
      // el filtrado lo hace el propio provider (texto + aplicados): el ListDataProviderView del
      // componente se lo pasa tal cual
      getCapability(name) { return name === 'filter' ? { operators: ['$and', '$ne'], textFilter: {} } : null },
      // el total depende del filtro: «desconocido» (-1). Con el de todas las filas, el oj-list-view
      // del popup pintaba seis veces «Business key» al teclear «busi»
      getTotalSize() { return Promise.resolve(-1) },
      isEmpty() { return all.length ? 'no' : 'yes' },
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return true },
    }
  }

  // el JsonMetadataProvider de oj-dynamic: lo pone el módulo AMD (el core no depende de JET)
  let metadataProviderFactory = null
  function setMetadataProviderFactory(factory) { metadataProviderFactory = factory }

  /**
   * La configuración ENTERA de `smart-filters` para un listado: el desplegable de filtros, los
   * aplicados y el editor de cada filtro. Sin filtros declarados, sólo el buscador de texto.
   *
   * Los filtros sin aplicar se ofrecen en el DESPLEGABLE que abre el buscador al entrar en él
   * (`suggestions`), no como una fila de botones bajo la caja (`suggestionFilters`, lo que hubo
   * desde 8af850e63): el buscador del listado vuelve a ser una caja con su menú de filtros.
   */
  async function smartFiltersOf(filters, values, searchText) {
    const config = { askHint: 'Buscar…', value: smartFilterValueOf(filters, values, searchText) }
    const hasIds = !isBlank((values || {})[IDS_PARAM])
    if ((!filters || !filters.length) && !hasIds) return config
    // sin filtros declarados pero con selección por ids: el chip necesita su metadata, no sugerencias
    if (filters && filters.length) {
      config.suggestions = suggestionsProviderOf(smartFilterDropdownRowsOf(filters))
    }
    if (metadataProviderFactory) {
      config.filtersMetadata = await metadataProviderFactory(smartFiltersMetadataOf(filters))
    }
    return config
  }

  function labelOfOption(filter, value) {
    const hit = (filter.options || []).filter((o) => String(o.value) === String(value))[0]
    return hit ? hit.label : String(value)
  }

  function isBlank(value) {
    if (value == null) return true
    if (Array.isArray(value)) return value.length === 0
    return String(value).trim() === ''
  }

  /** Triggers OnLoad del contexto (p.ej. el listing dispara 'search' al cargar). */
  function onLoadTriggers(ctx) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      // los que llevan espera (refresco periódico) los programa polling.mjs, no se lanzan ya
      .filter((t) => t.type === 'OnLoad' && t.actionId && !(t.timeoutMillis > 0))
      .map((t) => t.actionId)
  }

  /**
   * La URL de una pestaña con clave de ruta (@Tab(key)): la ruta de la página con la clave de la
   * pestaña de su barra que ya nombre (si la hay) sustituida — /vcns/7/subnets → /vcns/7/gateways.
   */
  function tabRoutePath(pathname, keys, key) {
    const trimmed = String(pathname || '').replace(/\/+$/, '')
    const segments = trimmed.split('/')
    const last = segments[segments.length - 1]
    const base = keys.includes(last) ? segments.slice(0, -1).join('/') : trimmed
    return base + '/' + key
  }

  // ── APPS ANIDADAS: el maestro de un registro con pestañas que son páginas (P1) ──────────────────
  //
  // Una ruta con HIJOS en routes.yaml (`customers/:customerId` → orders, addresses…) la pinta un
  // @App(TABS) cuyo contenido es la pestaña. En el wire llega como un ClientSide App de PRIMER nivel
  // — igual que el App del bootstrap —, y tratarlo como la shell la machacaba y dejaba el contenido
  // en blanco. Un App anidado es CONTENIDO: un NIVEL (título, pestañas, «← padre») sobre la
  // pantalla que ocupa su hueco. Hay una barra de pestañas por nivel.

  /** Si el fragmento es un App ANIDADO (no la shell, no un mediador), su nivel; si no, null. */
  function appLevelOf(fragment, shellServerSideType, requestedRoute = '') {
    const c = fragment && fragment.component
    const md = c && c.metadata
    if (!c || c.type !== 'ClientSide' || !md || md.type !== 'App') return null
    if (md.variant === 'MEDIATOR') return null
    if (shellServerSideType && md.serverSideType === shellServerSideType) return null
    // un App sin hueco que rellenar (su home es él mismo) es una shell, no un nivel
    if (!md.homeServerSideType || md.homeServerSideType === md.serverSideType) return null
    const path = (r) => String(r || '').split('?')[0].replace(/\/+$/, '')
    const requested = path(requestedRoute || md.homeRoute)
    const tabs = (md.menu || [])
      .filter((o) => o && !o.separator && (o.route || o.path))
      .map((o) => ({ id: o.route || o.path, label: o.label || '', route: o.route || o.path }))
    // la pestaña activa: la de ruta más larga que sea prefijo de lo que se pidió (un registro
    // dentro del crud de la pestaña sigue en esa pestaña)
    const pick = (target) => {
      let found = ''
      for (const tab of tabs) {
        const r = path(tab.route)
        if ((target === r || target.startsWith(r + '/')) && r.length > path(found).length) found = tab.route
      }
      return found
    }
    // …o, con el maestro pedido a secas (/customers/3), la de su home: la pestaña por defecto
    const selected = pick(requested) || pick(path(md.homeRoute))
    return {
      id: 'mateuAppTabs-' + path(md.route).replace(/[^a-zA-Z0-9]/g, '_'),
      title: md.title || '',
      route: md.route || '',
      serverSideType: md.serverSideType,
      tabs,
      // una sola pestaña visible no es una elección: sin barra (la ruta se conserva)
      showTabs: tabs.length > 1,
      selected,
      backRoute: md.backRoute || '',
      backLabel: md.backLabel || '',
      actions: (md.contextActions || []).map((a) => ({ id: a.actionId, label: a.label })),
      home: { route: md.homeRoute, consumedRoute: md.homeConsumedRoute, serverSideType: md.homeServerSideType },
    }
  }

  /**
   * Separa del incremento los Apps ANIDADOS: devuelve el incremento sin ellos (para que el reducer
   * no los tome por la shell) y sus niveles, en orden.
   */
  function splitNestedApps(increment, shellServerSideType, requestedRoute) {
    const levels = []
    const fragments = []
    for (const fr of (increment && increment.fragments) || []) {
      const level = appLevelOf(fr, shellServerSideType, requestedRoute)
      if (level) levels.push(level)
      else fragments.push(fr)
    }
    return { increment: { ...(increment || {}), fragments }, levels }
  }

  /** Si el contexto es un MEDIADOR (ServerSide → child App), la info para cargar su contenido. */
  function mediatorOf(ctx) {
    const tree = ctx?.tree
    if (tree?.type !== 'ServerSide') return null
    const child = (tree.children || [])[0]
    const md = child?.metadata
    if (md?.type !== 'App') return null
    return {
      // homeConsumedRoute ANTES que rootRoute: en un deep-link a una sub-ruta (el detalle de un
      // proceso) `rootRoute` es la ruta ENTERA que se pidió, mientras que lo consumido por el
      // mediador es su propia ruta (`/workflow/processes`). Mandar la entera como consumedRoute
      // hace que el servidor sirva la vista por defecto del crud: se entraba por el enlace de un
      // proceso y aparecía el listado. En una opción de menú (la raíz del crud) valen lo mismo.
      rootRoute: md.homeConsumedRoute || md.rootRoute || ctx.state?._route || '',
      homeRoute: md.homeRoute ?? '',
      serverSideType: md.homeServerSideType ?? md.serverSideType,
      variant: md.variant,
    }
  }

  const metaOf = (fr) => fr.component?.metadata || {}

  let overlaySeq = 0
  /** Construye un contexto de overlay (drawer/dialog) a partir de un fragmento Add. */
  function buildOverlay(fr, opener) {
    const md = metaOf(fr)
    const id = 'overlay-' + ++overlaySeq
    // Un formulario EMBEBIDO (EmbeddedView: el «Cancel booking» de una reserva) llega como un
    // ServerSide propio en md.content, con SU estado (initialData), SU título (el de su Page) y
    // SUS acciones: es la superficie del overlay.
    const surface = md.content && md.content.type === 'ServerSide' ? md.content : null
    const filled = (o) => (o && typeof o === 'object' && Object.keys(o).length ? o : null)
    const surfacePage = surface ? findByType(surface, 'Page') : null
    return {
      id,
      kind: 'drawer',
      tree: fr.component, // el árbol completo — md.content lleva el contenido (patrón Card)
      surface,
      state: filled(md.initialData) || filled(fr.state) || (surface && filled(surface.initialData)) || {},
      title: md.headerTitle || md.title || (surfacePage && surfacePage.metadata.title) || '',
      subtitle: md.subtitle,
      position: md.position || 'end',
      width: md.width,
      size: md.size,
      dirty: false,
      // quien lo abrió: a él van los value-changed/data-changed del overlay (applyOverlayEvent)
      opener: opener || HOST_ID,
    }
  }

  /** Resuelve a qué clave del registro va un target: eco del initiator; ''/null → host. */
  const resolveTarget = (contexts, t) => {
    if (t == null || t === '') return HOST_ID
    if (contexts[t]) return t
    // eco de un id de componente ya registrado (p.ej. SSE que responde al uuid del árbol, o el
    // formulario embebido de un overlay, que contesta a SU id)
    const byTreeId = Object.keys(contexts).find((k) => contexts[k].tree?.id === t || contexts[k].surface?.id === t)
    return byTreeId || t
  }

  /**
   * EL REDUCER. reg = { contexts, stack, shell }; devuelve el NUEVO reg + los efectos que VB
   * aplica. Puro e inmutable con structural sharing: solo las entradas tocadas cambian de ref.
   * opts.initiator = contextId de la superficie que lanzó la request (para comandos sin target,
   * como el MarkAsClean del save-in-drawer).
   */
  function reduceContexts(reg, increment, opts = {}) {
    const contexts = { ...reg.contexts }
    const stack = [...reg.stack]
    let shell = reg.shell || null
    const effects = {
      toasts: [],
      banners: increment.banners || [],
      navigate: null,
      urlPush: null,
      download: null,
      downloads: [], // todos los DownloadFile del increment (download = el último, compat)
      runActions: [],
      docTitle: null,
      events: [], // bus @SubscribeTo: [{ name, detail }]
    }

    for (const m of increment.messages || [])
      effects.toasts.push({
        text: m.text || m.title, variant: m.variant || 'info',
        // Message.undoable: el toast lleva su «Undo» (notify.mjs lo pinta con oj-message)
        ...(m.undoActionId ? { undoActionId: m.undoActionId, undoLabel: m.undoLabel || 'Undo', undoParameters: m.undoParameters || {} } : {}),
      })

    // ── fragmentos → shell | superficies ──────────────────────────────────────
    for (const fr of increment.fragments || []) {
      const md = metaOf(fr)

      // El App del BOOTSTRAP (root ClientSide type App) configura el chrome. Un App de
      // mediador NO pasa por aquí: llega envuelto en un ServerSide (child0) y es contenido.
      if (fr.component?.type === 'ClientSide' && md.type === 'App') {
        shell = {
          title: md.title,
          menu: md.menu || [],
          variant: md.variant,
          serverSideType: md.serverSideType, // para las acciones de cabecera (app-level)
          appContext: md.contextSelectors || [],
          headerActions: md.contextActions || [],
          themeToggle: md.themeToggle,
          // @App(accessKeys): mantener Alt enseña las teclas de acceso (keys.mjs)
          accessKeys: !!md.accessKeys,
          // NotificationsSupplier del App → la campana de la cabecera (notify.mjs)
          notificationsEnabled: !!md.notificationsEnabled,
          // el logo del @App (@Logo, p.ej. /images/riu.svg — relativo al backend)
          logo: md.logo || '',
          // la HOME del app (@HomeRoute) — el boot de la shell la prefiere sobre la
          // primera opción del menú
          homeRoute: md.homeRoute || '',
          // chat de IA (@AI → App.sseUrl): si viene, la shell pinta el botón del chat del agente en la cabecera
          sseUrl: md.sseUrl || '',
          // el FAB de "ask" del shell (@App(askLabel, askIcon)): vacíos = la marca de Ask Oracle
          askLabel: md.askLabel || '',
          askIcon: md.askIcon || '',
          // los widgets de CABECERA (WidgetSupplier / @Widget): viajan como hijos del App con
          // slot "widgets"; los proyecta headerWidgetsOf (widgets.mjs)
          widgets: (fr.component.children || []).filter((child) => child && child.slot === 'widgets'),
        }
        continue
      }

      if (fr.action === 'Add') {
        const ctx = buildOverlay(fr, opts.initiator)
        contexts[ctx.id] = ctx
        stack.push(ctx.id)
        continue
      }

      // Replace / ReplaceKeepData / State-only: MISMO camino para form, mediador, isla…
      const id = resolveTarget(contexts, fr.targetComponentId)
      const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {}, data: {} }
      const ss = fr.component?.type === 'ServerSide' ? fr.component : null
      contexts[id] = {
        ...prev,
        kind: prev.kind,
        tree: fr.component || prev.tree, // sin component => State-only: conserva el árbol
        pageType: ss?.pageType ?? (fr.component ? undefined : prev.pageType),
        pageWidth: ss?.pageWidth ?? (fr.component ? undefined : prev.pageWidth),
        state: !fr.component
          ? { ...prev.state, ...(fr.state || {}) } // State-only: MERGE (no borrar la isla)
          : fr.action === 'ReplaceKeepData'
            ? { ...prev.state, ...(fr.state || md.initialData || {}) }
            : (fr.state ?? md.initialData ?? prev.state),
        // data = eje de DATOS calculados por el server (p.ej. las filas del listing, keyed
        // por id de componente: {crud: {page: …}}); un fragmento data-only MERGEA
        data: !fr.component
          ? { ...prev.data, ...(fr.data || {}) }
          : (fr.data ?? {}),
        dirty: false,
      }
    }

    // ── comandos → efectos (algunos mutan el registro) ────────────────────────
    const emit = (data) => {
      if (!data) return
      if (typeof data === 'string') effects.events.push({ name: data, detail: null })
      else if (data.eventName) effects.events.push({ name: data.eventName, detail: data.detail ?? null })
    }
    for (const c of increment.commands || []) {
      const t = c.targetComponentId
      switch (c.type) {
        case 'SetWindowTitle':
          effects.docTitle = c.data
          break
        case 'NavigateTo': {
          const d = String(c.data || '')
          effects.navigate = /^https?:/.test(d) ? { url: d } : { route: d }
          break
        }
        case 'PushStateToHistory':
          effects.urlPush = c.data
          break
        case 'CloseModal': {
          const id = t && contexts[t] ? t : stack[stack.length - 1]
          if (id) {
            delete contexts[id]
            const i = stack.indexOf(id)
            if (i >= 0) stack.splice(i, 1)
          }
          emit(c.data) // eventName del cierre → bus (p.ej. refresco del listado del crud)
          break
        }
        case 'DispatchEvent':
          // lo que un componente del overlay devuelve a quien lo abrió (el selector de un
          // @Searchable: el valor elegido, su rótulo, y cerrarse)
          if (applyOverlayEvent(contexts, stack, c.data)) break
          emit(c.data)
          break
        case 'MarkAsClean': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: false }
          break
        }
        case 'MarkAsDirty': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: true }
          break
        }
        case 'DownloadFile':
          effects.download = c.data
          effects.downloads.push(c.data)
          break
        case 'RunAction':
          effects.runActions.push(c.data)
          break
      }
    }

    // los niveles de app (P1) son de la PANTALLA, no de un incremento: una acción sobre la pestaña
    // (la búsqueda OnLoad del listado) no los borra
    const kept = {}
    if (reg.appLevels) kept.appLevels = reg.appLevels
    if (reg.loadedRoute) kept.loadedRoute = reg.loadedRoute
    return { ...kept, contexts, stack, shell, effects }
  }

  // ── EDITOR DE FILAS de una lista del formulario (@DetailFormCustomisation position = modal) ──
  //
  // Contrato del wire (fixtures/real/rowedit-*.json, capturados contra el booking de ec-demo1):
  //  - `<campo>_add` / `<campo>_select` (con parameters._rowNumber) contestan DOS fragmentos: el
  //    State del contenedor (con `_show_detail[campo] = true`) y un ServerSide con el formulario
  //    de la fila dirigido a `<campo>-container` (title "New room"/"Edit room", `buttons` al pie:
  //    Save —primary—, "Save and add another" al crear, Cancel —tertiary—; Prev/Next en
  //    `toolbar` al editar, y la posición "1/3" como Text de `header`).
  //  - Save/Create/Cancel/Prev/Next viajan con el estado del CONTENEDOR (el formulario o el
  //    wizard) y la fila en parameters.initiatorState — como Vaadin desde 367
  //    (libs/mateu … common.ts resolveComponentState/isOwnListAction). Mandar la fila como
  //    componentState reconstruía el contenedor desde una habitación: el wizard volvía vacío a
  //    su primer paso.
  //  - El contenedor contesta un State con la lista nueva y `_show_detail[campo] = false`
  //    (cierra); `_create-and-stay` contesta además una fila nueva en `<campo>-container`.
  //  - Prev/Next contestan un State-only a `<campo>-container` (la fila vecina).
  //  - Los lookups de la fila (`search-<campo>`) los resuelve el ServerSide de la FILA con el
  //    estado de la fila: su respuesta es un fragmento data-only a su id.

  /** Las acciones que el editor de una fila manda al contenedor de la lista: `rooms_create`… */
  const LIST_ACTION = /^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/

  /** Verbos que llevan la fila del diálogo en parameters.initiatorState. */
  const ROW_EDITOR_VERBS = { create: true, 'create-and-stay': true, save: true, cancel: true, prev: true, next: true }

  /** Verbos que validan la fila antes de salir (los obligatorios vacíos). */
  const ROW_VALIDATING_VERBS = { create: true, 'create-and-stay': true, save: true }

  /** ¿El FormField es una lista cuyo editor de fila se abre en un diálogo? */
  function isModalRowEditor(field) {
    return !!(field && !field.readOnly && !field.inlineEditing
      && (field.columns || []).length && /^modal/.test(field.formPosition || ''))
  }

  /** Las listas con editor modal de un árbol (sin cruzar islas): fieldId → FormField. */
  function modalListsOf(tree) {
    const out = {}
    for (const f of collectFields(tree)) if (isModalRowEditor(f)) out[f.fieldId] = f
    return out
  }

  /**
   * ¿`actionId` es una acción de una lista del contenedor? → { fieldId, verb } o null. La lista
   * se reconoce como en Vaadin (el `<campo>_rowClass` que su estado lleva por cada lista) o, si
   * el estado no lo trae, por un FormField lista con ese id en el árbol del contenedor.
   */
  function listActionOf(state, actionId, tree) {
    const match = actionId ? LIST_ACTION.exec(actionId) : null
    if (!match) return null
    const fieldId = match[1]
    const known = (state && (fieldId + '_rowClass') in state)
      || collectFields(tree || {}).some((f) => f.fieldId === fieldId && (f.dataType === 'array' || (f.columns || []).length))
    return known ? { fieldId, verb: match[2] } : null
  }

  /** El contexto de transporte del contenedor: las acciones de sus listas van a SU ServerSide
   *  (el formulario, el wizard), no al mediador por el que se cargó la pantalla — el crud
   *  orquestador no sabe qué es `rooms_add` ("component() … DtoSupplier"). */
  function holderTransportOf(holder) {
    const outbound = holder.outbound || {}
    const tree = holder.tree || {}
    return {
      ...holder,
      outbound: {
        ...outbound,
        serverSideType: tree.type === 'ServerSide' && tree.serverSideType ? tree.serverSideType : outbound.serverSideType,
      },
    }
  }

  /** El _rowNumber REAL (número o uuid) de la fila cuyo texto es `key` — el DOM sólo da texto,
   *  y el servidor compara con equals: "0" no es 0. */
  function rowOf(rows, key) {
    return (rows || []).find((row) => row && String(row._rowNumber) === String(key)) || null
  }

  /**
   * La request de una acción de lista: componentState = el estado del CONTENEDOR (+ su borrador),
   * y la fila del diálogo (+ su borrador) en parameters.initiatorState para los verbos del
   * editor. `_select` lleva el _rowNumber real; `_remove` de una fila, la fila en
   * `<campo>_selected_items` (el servidor quita las filas iguales). null si no es de una lista.
   */
  function listActionRequestOf(reg, actionId, opts = {}) {
    const holderId = opts.holderId || HOST_ID
    const holder = reg && reg.contexts && reg.contexts[holderId]
    if (!holder) return null
    const componentState = { ...(holder.state || {}), ...(opts.hostDraft || {}) }
    const hit = listActionOf(componentState, actionId, holder.tree)
    if (!hit) return null
    const { fieldId, verb } = hit
    const parameters = { ...(opts.parameters || {}) }
    const rowCtx = reg.contexts[fieldId + '-container']
    if (ROW_EDITOR_VERBS[verb] && rowCtx) {
      parameters.initiatorState = { ...(rowCtx.state || {}), ...(opts.rowDraft || {}) }
    }
    if ((verb === 'select' || verb === 'remove') && parameters._rowNumber != null) {
      const row = rowOf(componentState[fieldId], parameters._rowNumber)
      if (verb === 'select') {
        if (row) parameters._rowNumber = row._rowNumber
      } else {
        delete parameters._rowNumber
        componentState[fieldId + '_selected_items'] = row ? [row] : []
      }
    }
    return { fieldId, verb, componentState, parameters, ctx: holderTransportOf(holder) }
  }

  const ROW_CHROMING = { primary: 'callToAction', tertiary: 'borderless' }

  function rowButtonOf(b) {
    return {
      actionId: b.actionId,
      label: b.label || b.actionId,
      chroming: ROW_CHROMING[b.buttonStyle] || 'outlined',
    }
  }

  /** Opciones de un select/lookup: las estáticas del campo o las que trajo su búsqueda. */
  function optionsOf(field, data) {
    const found = data && data[field.fieldId] && data[field.fieldId].content
    const raw = (field.options && field.options.length) ? field.options : (found || [])
    return raw.map((o) => ({ value: o.value, label: o.label == null ? String(o.value) : o.label }))
  }

  /** El valor de un campo tal como lo edita su widget: un lookup puede llegar como {value,label}. */
  function plainValueOf(value) {
    if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) return value.value
    return value
  }

  const NUMERIC_TYPES = { integer: true, int: true, long: true, number: true, double: true, float: true, money: true }

  /**
   * Los campos del formulario de la fila, cada uno resuelto al widget que le toca (flags
   * PRECOMPUTADOS: el CSP de VB no evalúa expresiones) con su valor, sus opciones y sus
   * errores (messagesCustom de JET). Las listas anidadas (p.ej. las edades de los niños) no
   * se editan aquí.
   */
  function rowFieldsOf(ctx, values, errors) {
    if (!ctx || !ctx.tree) return []
    const state = { ...(ctx.state || {}), ...(values || {}) }
    const seen = {}
    const out = []
    for (const f of collectFields(ctx.tree)) {
      if (!f.dataType || seen[f.fieldId]) continue
      seen[f.fieldId] = true
      if (f.dataType === 'array' || (f.columns || []).length) continue
      const raw = plainValueOf(state[f.fieldId])
      const widget = fieldWidgetOf(f, ctx.data, { lookups: true, value: raw })
      const error = errors && errors[f.fieldId]
      // un campo de SÓLO LECTURA todavía vacío (la «Line» y el «Total» de una habitación nueva, que
      // pone el servidor) se pinta como su rótulo y «—», texto que no se enfoca: un oj-input-number
      // readonly sin valor es una cajita punteada de 20px que parece un control roto (y, el primero
      // del diálogo, se quedaba con el foco)
      if (widget.readonly && !widget.isBoolean && (raw == null || raw === '')) {
        out.push({
          ...widget, ...EMPTY_READONLY_WIDGET,
          value: EMPTY_VALUE,
          messagesCustom: [],
        })
        continue
      }
      out.push({
        ...widget,
        value: widget.isBoolean ? !!raw : (raw == null || raw === '' ? null : (widget.isNumber ? Number(raw) : raw)),
        messagesCustom: error ? [{ severity: 'error', summary: error, detail: '' }] : [],
      })
    }
    return out
  }

  /** Lo que se pinta en lugar de un valor que todavía no hay (sólo lectura). */
  const EMPTY_VALUE = '—'
  const EMPTY_READONLY_WIDGET = { isText: false, isEmptyReadonly: true, isTextArea: false, isNumber: false, isDate: false, isDateTime: false,
    isSelect: false, isLookup: false, lookupActionId: '', options: [] }

  /** Tipos de campo que el form layout sabe pintar con un widget de JET. */
  const LAYOUT_TYPES = { string: true, integer: true, int: true, long: true, number: true, double: true,
    float: true, date: true, dateTime: true, bool: true, boolean: true }

  /**
   * Un campo ESCALAR de un FormLayout, listo para el oj-form-layout: su widget (fieldWidgetOf),
   * su valor y su colspan. El valor sale del state o, si no está, de data — ahí manda el server
   * la etiqueta de un lookup de sólo lectura (hotelCode-label), que antes salía vacía. null si
   * no es un campo que el layout pinte (un grid, una property row, un tipo sin widget).
   */
  function layoutFieldOf(md, state, data, columns = 1) {
    const fieldId = md.fieldId || md.id
    if (!fieldId || (md.columns || []).length || md.propertyRow
      || !(LAYOUT_TYPES[md.dataType] || md.stereotype === 'searchable' || isExtraLayoutField(md))) return null
    const s = state || {}
    const d = data || {}
    const raw = s[fieldId] != null ? s[fieldId] : d[fieldId]
    const widget = fieldWidgetOf(md, data, { lookups: !md.readOnly, value: raw, textWhenEmpty: true })
    let value = raw == null || raw === '' ? null : raw
    if (widget.isBoolean) value = !!raw
    else if (widget.isSelect) value = value == null ? null : plainValueOf(value)
    else if (widget.isNumber || widget.isMoney) value = value == null || Number.isNaN(Number(value)) ? null : Number(value)
    else if (widget.isMultiSelect || widget.isCheckboxSet) value = Array.isArray(raw) ? raw.map(plainValueOf) : (raw == null || raw === '' ? [] : String(raw).split(','))
    else if (value != null && typeof value === 'object') value = plainValueOf(value)
    return {
      ...widget,
      value,
      // el del wire, acotado a las columnas del layout. La plantilla (oj-form-layout clásico, con
      // los labels dentro) aún no lo aplica: eso pide oj-c-form-layout y sus column-span
      colspan: Math.max(1, Math.min(Math.floor(Number(md.colspan) || 1), columns)),
      messagesCustom: [],
    }
  }

  // ── @Searchable: el selector en un diálogo ─────────────────────────────────────────────────
  //
  // Un @Searchable (un id, o una List/Set/array de ids) se pinta como chips — uno por id, con su
  // rótulo de data `<campo>-labels` ({id → rótulo}; en uno simple, `<campo>-label`) — y un botón
  // que abre su selector (`codesearch-<campo>`): un listado en un Dialog. Elegir una fila
  // (`action-on-row-select`) o «Add selected» (`action-on-row-select-selected`, con las filas
  // marcadas en crud_selected_items) contesta value-changed / data-changed / close-modal-requested,
  // que aquí se aplican al contexto que abrió el diálogo. El servidor fusiona: un campo de varios
  // valores AÑADE a los que tenía. Quitar un chip es sólo del cliente. Vaadin hace lo mismo
  // (libs/mateu searchableMulti.ts).

  /** ¿Es un @Searchable editable como tal? (la vista de detalle lo manda como `<campo>-label`:
   *  su texto, que se pinta como cualquier valor de sólo lectura) */
  function isSearchableField(f) {
    return !!f && f.stereotype === 'searchable' && !/-label$/.test(String(f.fieldId || ''))
  }

  /** Los ids de un campo, lleguen como lleguen (lista, un id suelto, nada). */
  function searchableIdsOf(value) {
    if (value == null || value === '') return []
    const list = Array.isArray(value) ? value : [value]
    return list.filter((id) => id != null && id !== '')
  }

  /**
   * Los chips de un @Searchable: uno por id, rotulado (o el propio id si no hay rótulo). Cada chip
   * lleva lo que queda al quitarlo (`remaining`: en uno simple, null) — precomputado (CSP de VB).
   */
  function searchableChipsOf(fieldId, ids, labels, opts = {}) {
    const map = labels && typeof labels === 'object' ? labels : {}
    return ids.map((id) => {
      const raw = opts.singleLabel != null && opts.singleLabel !== '' ? opts.singleLabel : map[String(id)]
      const label = raw != null && raw !== '' ? String(raw) : String(id)
      return {
        fieldId,
        id,
        label,
        removeLabel: 'Remove ' + label,
        removable: !opts.readonly,
        remaining: opts.multi ? ids.filter((other) => String(other) !== String(id)) : null,
      }
    })
  }

  /** El widget de un @Searchable: sus chips y el botón que abre el selector. */
  function searchableWidgetOf(f, data, value) {
    const fieldId = f.fieldId
    const multi = f.dataType === 'array'
    const ids = searchableIdsOf(plainValueOf(value))
    const d = data || {}
    const readonly = !!f.readOnly
    const chips = searchableChipsOf(fieldId, multi ? ids : ids.slice(0, 1),
      multi ? d[fieldId + '-labels'] : null,
      { multi, readonly, singleLabel: multi ? null : d[fieldId + '-label'] })
    return {
      fieldId,
      label: f.label || fieldId,
      required: !!f.required,
      readonly,
      editable: !readonly,
      isSearchable: true,
      isSearchableMulti: multi,
      chips,
      hasChips: chips.length > 0,
      // el botón despacha como cualquier bloque del host (hostBlockAction: actionId + parameters)
      actionId: 'codesearch-' + fieldId,
      parameters: {},
      addLabel: multi ? 'Add' : 'Search',
      isSelect: false,
      isLookup: false,
      lookupActionId: '',
      options: [],
      isBoolean: false,
      isDate: false,
      isDateTime: false,
      isNumber: false,
      isTextArea: false,
      isText: false,
    }
  }

  /** ¿Es el overlay el diálogo de un selector (un listado cuyo ServerSide atiende la elección)? */
  function isPickerOverlay(ctx) {
    const surface = ctx && ctx.surface
    if (!surface || !findByType(surface, 'Crud')) return false
    return ((surface.actions || []).some((a) => a && a.id === SEARCHABLE_PICK_ACTION))
  }

  const SEARCHABLE_PICK_ACTION = 'action-on-row-select'
  const SEARCHABLE_ADD_ACTION = 'action-on-row-select-selected'

  /**
   * El SELECTOR de un @Searchable abierto (el overlay superior, si lo es), listo para el oj-dialog
   * del selector: título, columnas (sin la columna-botón «Select»: elegir es pulsar la fila),
   * filas, búsqueda, paginación y — en un campo de varios valores — la selección múltiple y el
   * botón «Add selected». null si el overlay superior no es un selector.
   */
  function searchPickerOf(reg) {
    const id = reg && reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    const ctx = id && reg.contexts ? reg.contexts[id] : null
    if (!isPickerOverlay(ctx)) return null
    const listing = listingOf({ tree: ctx.surface, data: ctx.data }) || {}
    const state = ctx.state || {}
    const multi = state._searchableMulti === true || state._searchableMulti === 'true'
      || !!listing.rowsSelectionEnabled
    const addButton = (listing.toolbar || []).find((b) => b.actionId === SEARCHABLE_ADD_ACTION)
    // sin título propio, el del campo que lo abrió (su rótulo)
    const opener = reg.contexts[ctx.opener || HOST_ID]
    const field = opener && opener.tree && state._searchableField
      ? collectFields(opener.tree).find((f) => f.fieldId === state._searchableField) : null
    return {
      id,
      title: ctx.title || (field && field.label) || 'Search',
      multi,
      searchable: !!listing.searchable,
      searchText: state.searchText || '',
      columns: (listing.columns || []).filter((c) => c.id !== 'select' && c.id !== ROW_LINES_FIELD),
      rows: listing.rows || [],
      isEmpty: !!listing.isEmpty,
      emptyText: listing.emptyStateMessage || 'No data.',
      selectionMode: { row: multi ? 'multiple' : 'none' },
      pageSize: listing.pageSize || 20,
      paging: listing.paging,
      pickActionId: SEARCHABLE_PICK_ACTION,
      addActionId: SEARCHABLE_ADD_ACTION,
      addLabel: (addButton && addButton.label) || 'Add selected',
    }
  }

  /** El estado de la búsqueda del selector: lo que su `search` lleva en componentState. */
  function pickerSearchStateOf(picker, opts = {}) {
    const size = (picker && picker.pageSize) || 20
    return {
      searchText: opts.searchText != null ? opts.searchText : ((picker && picker.searchText) || ''),
      page: opts.page != null ? opts.page : 0,
      size,
    }
  }

  /**
   * Aplica al contexto que abrió el overlay superior los eventos con los que un componente del
   * overlay le devuelve un valor — value-changed {fieldId, value}, data-changed {key, value} — y
   * close-modal-requested (cierra el overlay). Es lo que en Vaadin hace el mateu-event-interceptor
   * del diálogo al reenviarlos a su dueño. true si el evento se aplicó; sin overlay, false (el
   * evento sigue al bus, como siempre).
   */
  function applyOverlayEvent(contexts, stack, data) {
    const name = data && data.eventName
    if (name !== 'value-changed' && name !== 'data-changed' && name !== 'close-modal-requested') return false
    const topId = stack.length ? stack[stack.length - 1] : null
    const top = topId ? contexts[topId] : null
    if (!top) return false
    if (name === 'close-modal-requested') {
      delete contexts[topId]
      stack.pop()
      return true
    }
    const detail = data.detail || data.payload || {}
    const openerId = top.opener && contexts[top.opener] ? top.opener : HOST_ID
    const opener = contexts[openerId]
    if (!opener) return false
    if (name === 'value-changed' && detail.fieldId) {
      contexts[openerId] = { ...opener, state: { ...(opener.state || {}), [detail.fieldId]: detail.value } }
      return true
    }
    if (name === 'data-changed' && detail.key) {
      contexts[openerId] = { ...opener, data: { ...(opener.data || {}), [detail.key]: detail.value } }
      return true
    }
    return false
  }

  /** El registro con `values` fundidos en el estado del contexto `id` (p.ej. el borrador del
   *  formulario al abrir un selector: lo escrito no se pierde cuando el diálogo se cierra). */
  function withContextState(reg, id, values) {
    const ctx = reg && reg.contexts && reg.contexts[id]
    if (!ctx || !values || !Object.keys(values).length) return reg
    return { ...reg, contexts: { ...reg.contexts, [id]: { ...ctx, state: { ...(ctx.state || {}), ...values } } } }
  }

  /**
   * Una proyección (secciones del formulario, bloques del host…) con los chips del @Searchable
   * `fieldId` rehechos para `ids` — al quitar un chip, sin volver al servidor. Los rótulos salen
   * de los chips que ya había.
   */
  function withSearchableIds(projection, fieldId, ids) {
    const visit = (node) => {
      if (Array.isArray(node)) return node.map(visit)
      if (!node || typeof node !== 'object') return node
      if (node.isSearchable && node.fieldId === fieldId) {
        const labels = {}
        for (const chip of node.chips || []) labels[String(chip.id)] = chip.label
        const list = searchableIdsOf(ids)
        const chips = searchableChipsOf(fieldId, node.isSearchableMulti ? list : list.slice(0, 1), labels,
          { multi: node.isSearchableMulti, readonly: node.readonly })
        return { ...node, chips, hasChips: chips.length > 0 }
      }
      const out = {}
      for (const key of Object.keys(node)) out[key] = visit(node[key])
      return out
    }
    return visit(projection)
  }

  /**
   * El WIDGET que le toca a un FormField (flags PRECOMPUTADOS: el CSP de VB no evalúa
   * expresiones), compartido por el editor de fila y los formularios de página/drawer/isla:
   * select si trae opciones (estáticas, o las que trajo su búsqueda) — o, con lookups, si es un
   * lookup remoto —, fecha, fecha-hora, número, booleano, área de texto o texto.
   */
  // Estereotipos de campo con widget propio más allá del texto/número/fecha/booleano/select (reto
  // PMS): radio, selección múltiple, importe y los de captura. Cada familia es un flag is* de la
  // plantilla (ver poc/templates/fields-extra.html).
  const MULTI_SELECT_STEREOTYPES = { multiSelect: true, combobox: true, listBox: true }
  const CHECKBOX_SET_STEREOTYPES = { checkbox: true, choice: true }
  const CAPTURE_MODES = { fileUpload: 'file', uploadableImage: 'image', image: 'image', signature: 'signature', camera: 'camera' }

  /** El widget de un estereotipo «extra», o null si el campo es de los de siempre. */
  function extraWidgetOf(f, options) {
    const st = f.stereotype
    if (st === 'radio' && options.length) return { isRadio: true }
    if (f.dataType === 'array' && options.length && MULTI_SELECT_STEREOTYPES[st]) return { isMultiSelect: true }
    if (f.dataType === 'array' && options.length && (CHECKBOX_SET_STEREOTYPES[st] || !st || st === 'regular'))
      return { isCheckboxSet: true }
    if (st === 'money' || f.dataType === 'money') {
      const currency = (f.attributes || []).find && ((f.attributes || []).find((a) => a && a.key === 'currency') || {}).value
      return {
        isMoney: true,
        // conversor de JET (oj-input-number): número con 2 decimales y su símbolo de moneda
        converter: converterOf({ type: 'number', options: { style: 'currency', currency: currency || 'EUR', minimumFractionDigits: 2 } }),
      }
    }
    if (CAPTURE_MODES[st]) return { isCapture: true, captureMode: CAPTURE_MODES[st], accept: f.accept || '' }
    return null
  }

  /** ¿Lo pinta el oj-form-layout? (además de los LAYOUT_TYPES de siempre) */
  function isExtraLayoutField(md) {
    return !!(md.stereotype === 'radio' || md.stereotype === 'money' || md.dataType === 'money'
      || CAPTURE_MODES[md.stereotype]
      || (md.dataType === 'array' && (md.options || []).length
        && (MULTI_SELECT_STEREOTYPES[md.stereotype] || CHECKBOX_SET_STEREOTYPES[md.stereotype])))
  }

  function fieldWidgetOf(f, data, { lookups, value, textWhenEmpty }) {
    if (isSearchableField(f)) return searchableWidgetOf(f, data, value)
    const extra = extraWidgetOf(f, optionsOf(f, data))
    if (extra) {
      const flags = { isSelect: false, isBoolean: false, isDate: false, isDateTime: false, isNumber: false, isTextArea: false, isText: false }
      return {
        fieldId: f.fieldId,
        label: f.label || f.fieldId,
        required: !!f.required,
        readonly: !!f.readOnly,
        isLookup: false,
        lookupActionId: '',
        options: (extra.isRadio || extra.isMultiSelect || extra.isCheckboxSet) ? optionsOf(f, data) : [],
        ...flags,
        isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false,
        converter: null, captureMode: '', accept: '',
        ...extra,
      }
    }
    const lookupActionId = (f.remoteCoordinates && f.remoteCoordinates.action) || ''
    let options = optionsOf(f, data)
    // Un lookup con valor que aún no está entre sus opciones (no han llegado, o sólo llegó la
    // del valor) lo lleva como opción propia, con su etiqueta si el server la mandó: un
    // oj-select-one con un valor que no está en sus opciones se pinta VACÍO.
    const current = plainValueOf(value)
    if (lookups && lookupActionId && current != null && current !== ''
        && !options.some((o) => String(o.value) === String(current))) {
      const label = (value && typeof value === 'object' && value.label) || (data && data[f.fieldId + '-label'])
      options = [{ value: current, label: label != null && label !== '' ? String(label) : String(current) }].concat(options)
    }
    // en una página, un lookup cuya búsqueda no trajo nada se queda en texto: un desplegable
    // vacío no deja ni escribir el código (el editor de fila sí lo pinta siempre como select)
    const isSelect = (lookups && !!lookupActionId && !(textWhenEmpty && !options.length)) || options.length > 0
    const isBoolean = !isSelect && (f.dataType === 'bool' || f.dataType === 'boolean')
    const isDate = !isSelect && f.dataType === 'date'
    const isDateTime = !isSelect && f.dataType === 'dateTime'
    const isNumber = !isSelect && !!NUMERIC_TYPES[f.dataType]
    const isTextArea = !isSelect && f.stereotype === 'textarea'
    return {
      fieldId: f.fieldId,
      label: f.label || f.fieldId,
      required: !!f.required,
      readonly: !!f.readOnly,
      isSelect,
      isLookup: lookups && !!lookupActionId,
      lookupActionId: lookups ? lookupActionId : '',
      options: isSelect ? options : [],
      isBoolean,
      isDate,
      isDateTime,
      isNumber,
      isTextArea,
      isText: !isSelect && !isBoolean && !isDate && !isDateTime && !isNumber && !isTextArea,
      isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false,
      converter: null, captureMode: '', accept: '',
    }
  }

  /** Los obligatorios vacíos de la fila → { fieldId: mensaje }; {} si está bien. */
  function validateRow(ctx, values) {
    const errors = {}
    for (const f of rowFieldsOf(ctx, values)) {
      if (f.required && !f.readonly && !f.isBoolean && isBlank(f.value)) errors[f.fieldId] = 'Required'
    }
    return errors
  }

  /**
   * La acción `actionId` tal como la DECLARA el ServerSide del contexto (`tree.actions`), o null.
   * La exacta gana a un comodín ('*', 'prefijo*'), como en Vaadin: un flag de la declarada
   * (confirmación, validación) no puede quedar tapado por un catch-all listado antes.
   */
  function declaredActionOf(ctx, actionId) {
    const actions = (ctx && ctx.tree && ctx.tree.actions) || []
    const id = String(actionId || '')
    return actions.find((a) => a && a.id === id)
      || actions.find((a) => a && typeof a.id === 'string' && a.id.endsWith('*')
        && id.startsWith(a.id.slice(0, -1)))
      || null
  }

  /**
   * El contexto de TRANSPORTE de una acción del host: a qué ServerSide va.
   *
   * Una pantalla cargada a través de un mediador (el crud orquestador, el home de un pod remoto)
   * guarda en `outbound.serverSideType` el del mediador, y el árbol del host es el componente que
   * pintó — la vista de la reserva, `BookingViewModel`. Las acciones que ese componente DECLARA
   * (sus `@Toolbar`: «Ver recorrido», «Cancel booking», «Activate») son suyas: el mediador no las
   * conoce y contestaba «verRecorrido not supported by BookingCrudOrchestrator». Las que no
   * declara (edit, new, cancel-view: las del crud) y las marcadas `bubble` siguen subiendo al
   * mediador. Es la regla de Vaadin (mateu-component: la acción la atiende el ServerSide que la
   * anuncia; si no, burbujea).
   */
  function actionTransportOf(ctx, actionId) {
    const tree = ctx && ctx.tree
    if (!tree || tree.type !== 'ServerSide' || !tree.serverSideType) return ctx
    const action = declaredActionOf(ctx, actionId)
    if (!action || action.bubble) return ctx
    const outbound = ctx.outbound || {}
    if (outbound.serverSideType === tree.serverSideType) return ctx
    return { ...ctx, outbound: { ...outbound, serverSideType: tree.serverSideType } }
  }

  /**
   * El transporte de una acción del OVERLAY superior cuando la declara su formulario embebido
   * (EmbeddedView: un ServerSide propio dentro del Dialog/Drawer): va a ESE componente — su
   * serverSideType, su id como initiator, su estado — sin ruta, como en Vaadin. null si no hay
   * overlay o su formulario no declara la acción (entonces va al host, como siempre: el drawer
   * del crud no lleva ServerSide propio).
   */
  function overlayTransportOf(reg, actionId) {
    const id = reg && reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    const top = id && reg.contexts ? reg.contexts[id] : null
    const surface = top && top.surface
    if (!surface || !surface.serverSideType) return null
    const action = declaredActionOf({ tree: surface }, actionId)
    if (!action || action.bubble) return null
    const host = (reg.contexts && reg.contexts[HOST_ID]) || {}
    return {
      id: surface.id || top.id,
      tree: surface,
      state: top.state,
      outbound: { ...(host.outbound || {}), serverSideType: surface.serverSideType, route: '', consumedRoute: '' },
    }
  }

  // Los textos genéricos del diálogo de confirmación, en el idioma de la interfaz (el lang del
  // documento, que copy.mjs fija al del navegador — como pagingLangOf): una consola en español no
  // pregunta «Yes / No».
  const CONFIRMATION_DEFAULTS = {
    en: { title: 'One moment, please', message: 'Are you sure?', confirmText: 'Yes', denyText: 'No' },
    es: { title: 'Un momento, por favor', message: '¿Estás seguro?', confirmText: 'Sí', denyText: 'No' },
  }

  /** Los textos genéricos del diálogo de confirmación para `lang` (o el idioma de la interfaz). */
  function confirmationDefaultsOf(lang) {
    const raw = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || ''
    return CONFIRMATION_DEFAULTS[String(raw).toLowerCase().split(/[-_]/)[0]] || CONFIRMATION_DEFAULTS.en
  }

  /**
   * El diálogo de confirmación que pide la acción antes de salir (`confirmationRequired`), o null
   * si no pide ninguno. Cada texto cae por su cuenta al genérico — como en Vaadin
   * (confirmationTexts.ts): una acción que sólo declara el mensaje los trae vacíos al resto.
   */
  function confirmationOf(ctx, actionId, lang) {
    const action = declaredActionOf(ctx, actionId)
    if (!action || !action.confirmationRequired) return null
    const texts = action.confirmationTexts || {}
    const defaults = confirmationDefaultsOf(lang)
    const pick = (value, fallback) => (value != null && String(value).trim() ? String(value) : fallback)
    return {
      title: pick(texts.title, defaults.title),
      message: pick(texts.message, defaults.message),
      confirmText: pick(texts.confirmationText, defaults.confirmText),
      denyText: pick(texts.denialText, defaults.denyText),
    }
  }

  // La respuesta pendiente del diálogo de confirmación: la chain que lanza la acción espera la
  // promesa; los botones del diálogo (y su ✕ / Esc) la resuelven. Una sola a la vez: abrir otra
  // antes de contestar la primera la da por denegada.
  let pendingConfirmation = null

  /** Espera la respuesta del diálogo de confirmación (true = confirmar). */
  function awaitConfirmation() {
    if (pendingConfirmation) pendingConfirmation(false)
    return new Promise((resolve) => { pendingConfirmation = resolve })
  }

  /** Contesta el diálogo de confirmación abierto; sin ninguno esperando, no hace nada. */
  function answerConfirmation(confirmed) {
    const resolve = pendingConfirmation
    pendingConfirmation = null
    if (resolve) resolve(!!confirmed)
  }

  /**
   * ¿Pide la acción `actionId` del contexto validar el formulario antes de salir? Es el
   * validationRequired de las acciones del ServerSide (p.ej. el `next` de un wizard, el `save`
   * de un formulario): lo que Vaadin comprueba en el navegador antes de llamar al servidor.
   * → { fields } (los fieldsToValidate de la acción; [] = todos) o null si no pide validar.
   * La acción EXACTA gana a un comodín ('*', 'prefijo*'), como en Vaadin.
   */
  function validationOf(ctx, actionId) {
    const action = declaredActionOf(ctx, actionId)
    if (!action || !action.validationRequired) return null
    return { fields: Array.isArray(action.fieldsToValidate) ? action.fieldsToValidate : [] }
  }

  /**
   * Los obligatorios vacíos del formulario de la página (sus secciones, tal como se pintan) con
   * lo que el usuario ha escrito (el borrador gana al estado) → [fieldId] en el orden del
   * formulario: el primero es el que recibe el foco. `only` restringe a esos campos.
   */
  function formErrorsOf(sections, draft, only) {
    const restrict = Array.isArray(only) && only.length ? new Set(only) : null
    const d = draft || {}
    const out = []
    for (const section of sections || []) {
      for (const f of section.fields || []) {
        if (!f.required || f.readonly || f.isBoolean) continue
        if (restrict && !restrict.has(f.fieldId)) continue
        const value = Object.prototype.hasOwnProperty.call(d, f.fieldId) ? d[f.fieldId] : f.value
        if (isBlank(plainValueOf(value)) && out.indexOf(f.fieldId) < 0) out.push(f.fieldId)
      }
    }
    return out
  }

  const SELECT_PLACEHOLDERS = {
    en: 'Select a value', es: 'Seleccione un valor', ca: 'Seleccioneu un valor', fr: 'Sélectionnez une valeur',
    de: 'Wert auswählen', it: 'Selezionare un valore', pt: 'Selecione um valor', nl: 'Selecteer een waarde',
  }

  /**
   * El placeholder de los desplegables en el idioma `lang` (el del navegador; inglés si no se
   * conoce). Hace falta uno: un oj-select-one SIN placeholder elige la primera opción por su
   * cuenta, y un obligatorio vacío pasaba la validación con un valor que nadie había elegido.
   */
  function selectPlaceholder(lang) {
    const base = String(lang || '').toLowerCase().split(/[-_]/)[0]
    return SELECT_PLACEHOLDERS[base] || SELECT_PLACEHOLDERS.en
  }

  /**
   * Los lookups REMOTOS de un contexto cuyas opciones no se han cargado todavía → [{ fieldId,
   * actionId }]: los campos editables del formulario (una página, un paso de wizard, un
   * formulario nuevo) y los filtros del listado. Un lookup de una página se pintaba como texto
   * sin opciones — vacío en un alta — porque sólo el editor de fila lanzaba su búsqueda. La
   * opción suelta que el server manda con el valor (su etiqueta) no cuenta como cargadas: con
   * ella sola no se puede elegir otra. Los de sólo lectura no la necesitan.
   */
  function formLookupsOf(ctx) {
    if (!ctx || !ctx.tree) return []
    const data = ctx.data || {}
    const seen = {}
    const out = []
    for (const f of collectFields(ctx.tree)) {
      const actionId = f.type === 'FormField' && f.remoteCoordinates && f.remoteCoordinates.action
      if (!actionId || f.readOnly || f.dataType === 'array' || (f.columns || []).length) continue
      if (seen[f.fieldId] || (data[f.fieldId] && data[f.fieldId][LOOKUP_LOADED])) continue
      seen[f.fieldId] = true
      out.push({ fieldId: f.fieldId, actionId })
    }
    return out
  }

  /** Marca de las opciones de un lookup ya buscadas (en ctx.data[campo]): no se repite la búsqueda. */
  const LOOKUP_LOADED = '_mateuLoaded'

  /** El registro con las opciones de esos lookups del contexto marcadas como cargadas. */
  function markLookupsLoaded(reg, ctxId, fieldIds) {
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    if (!ctx) return reg
    const data = { ...(ctx.data || {}) }
    for (const fieldId of fieldIds || []) {
      const found = data[fieldId] && typeof data[fieldId] === 'object' ? data[fieldId] : { content: [] }
      data[fieldId] = { ...found, [LOOKUP_LOADED]: true }
    }
    return { ...reg, contexts: { ...reg.contexts, [ctxId]: { ...ctx, data } } }
  }

  /** Los lookups de la fila que aún no tienen opciones → [{ fieldId, actionId }]. */
  function pendingLookupsOf(ctx) {
    if (!ctx || !ctx.tree) return []
    return rowFieldsOf(ctx)
      .filter((f) => f.isLookup && !(ctx.data && ctx.data[f.fieldId]))
      .map((f) => ({ fieldId: f.fieldId, actionId: f.lookupActionId }))
  }

  /**
   * La request de la búsqueda de un lookup de la fila: la resuelve el ServerSide de la FILA
   * (su serverSideType, su id como initiator) con el estado de la fila; la ruta y el backend
   * son los del contenedor.
   */
  function lookupRequestOf(reg, rowCtxId, fieldId, opts = {}) {
    const row = reg && reg.contexts && reg.contexts[rowCtxId]
    if (!row || !row.tree) return null
    const field = collectFields(row.tree).find((f) => f.fieldId === fieldId)
    const actionId = field && field.remoteCoordinates && field.remoteCoordinates.action
    if (!actionId) return null
    const holder = reg.contexts[opts.holderId || HOST_ID] || {}
    return {
      actionId,
      componentState: { ...(row.state || {}), ...(opts.rowDraft || {}) },
      parameters: { searchText: opts.searchText || '', fieldId, size: 200, page: 0 },
      ctx: {
        id: row.id,
        tree: row.tree,
        state: row.state,
        outbound: { ...(holder.outbound || {}), serverSideType: row.tree.serverSideType },
      },
    }
  }

  /**
   * Proyección del EDITOR DE FILA abierto (el oj-dialog): null si ninguna lista modal del
   * contenedor tiene su detalle abierto (`_show_detail[campo]`) con el formulario ya recibido
   * en `<campo>-container`.
   */
  function rowEditorOf(reg, opts = {}) {
    const holder = reg && reg.contexts && reg.contexts[opts.holderId || HOST_ID]
    if (!holder || !holder.tree) return null
    const state = holder.state || {}
    const show = state._show_detail || {}
    const lists = modalListsOf(holder.tree)
    for (const fieldId of Object.keys(lists)) {
      if (!(show[fieldId] === true || state[fieldId + '_show_detail'] === true)) continue
      const id = fieldId + '-container'
      const ctx = reg.contexts[id]
      if (!ctx || !ctx.tree) continue
      const form = findByType(ctx.tree, 'Form')
      const md = (form && form.metadata) || {}
      const rowState = { ...(ctx.state || {}), ...(opts.rowDraft || {}) }
      const header = (md.header || [])
        .map((h) => (h && h.metadata && h.metadata.type === 'Text') ? interpolate(h.metadata.text, rowState) : '')
        .filter(Boolean)
      const buttons = (md.buttons || []).filter((b) => b && b.actionId).map(rowButtonOf)
      return {
        id,
        fieldId,
        formPosition: lists[fieldId].formPosition,
        title: interpolate(md.title || lists[fieldId].label || '', rowState),
        subtitle: header.join(' · '),
        toolbar: (md.toolbar || []).filter((b) => b && b.actionId).map(rowButtonOf),
        // pie Redwood: la primaria a la DERECHA del todo — el wire la manda primera
        buttons: buttons.slice().reverse(),
        fields: rowFieldsOf(ctx, opts.rowDraft, opts.errors),
      }
    }
    return null
  }


  // ── PlanningBoard (Room Diary) sobre oj-gantt ─────────────────────────────────────────────────
  //
  // oj-gantt es el tape chart de JET: filas con tareas, arrastrar para mover (dnd.move) y bordes para
  // redimensionar (task-defaults.resizable), tooltip propio (shortDesc). Mateu manda los bloques con
  // el fin INCLUSIVO (la última noche); el gantt pinta [start, end) en tiempo, así que el fin se
  // pinta como el día siguiente y se devuelve restando uno.

  const DAY_MS = 86400000
  const isoDay = (d) => {
    const pad = (n) => String(n).padStart(2, '0')
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate())
  }
  const plusDays = (iso, n) => isoDay(new Date(Date.parse(iso + 'T00:00:00Z') + n * DAY_MS))

  function planningAtomOf(m, id) {
    const columns = m.attributeColumns || []
    const blocks = m.blocks || []
    const from = m.from || (blocks.length ? blocks.map((b) => b.start).sort()[0] : isoDay(new Date()))
    const to = m.to || (blocks.length ? blocks.map((b) => b.end).sort().slice(-1)[0] : from)
    const rows = (m.resources || []).map((r, i) => {
      const attrs = columns.map((c, k) => ({ label: c, value: (r.attributes || [])[k] || '' }))
      return {
        _rowNumber: i,
        id: r.id,
        // la etiqueta de la fila lleva los atributos: el eje de filas de oj-gantt sólo pinta texto
        label: [r.label].concat(attrs.map((a) => a.value).filter(Boolean)).join(' · '),
        group: r.group || '',
        iconClass: r.icon ? ojIconOrGenericOf(r.icon) : '',
        tasks: blocks.filter((b) => b.resourceId === r.id && b.start && b.end).map((b) => ({
          id: b.id,
          start: b.start + 'T00:00:00',
          end: plusDays(b.end, 1) + 'T00:00:00',
          label: (b.icon ? '★ ' : '') + (b.label || ''),
          shortDesc: b.summary || ((b.label || '') + ' · ' + b.start + ' → ' + b.end + (b.status ? ' · ' + b.status : '')),
          svgStyle: b.color ? { fill: b.color, stroke: b.color } : undefined,
          // dentro de la barra o nada: fuera, el texto blanco sobre el fondo no se lee (y el resumen
          // completo sigue en el tooltip)
          labelPosition: ['innerCenter', 'innerStart', 'none'],
          labelStyle: { fill: '#ffffff' },
        })),
      }
    })
    return {
      isPlanning: true,
      planningId: id || 'planning',
      attributeColumns: columns,
      start: from + 'T00:00:00',
      end: plusDays(to, 1) + 'T00:00:00',
      rows,
      rowsProvider: dataProviderFactory ? dataProviderFactory(rows) : null,
      movable: !!m.moveActionId,
      resizable: !!m.resizeActionId,
      moveActionId: m.moveActionId || '',
      resizeActionId: m.resizeActionId || '',
      openActionId: m.openActionId || '',
      selectActionId: m.selectActionId || '',
      rangeSelectActionId: m.rangeSelectActionId || '',
      // para la selección de rango (poc/planning.mjs lee estos data-* del oj-gantt)
      rangeAction: m.rangeSelectActionId || '',
      startDay: from,
      endDay: plusDays(to, 1),
      rowIds: rows.map((r) => r.id).join('\u001f'),
      rowLabels: rows.map((r) => r.label).join('\u001f'),
      dndMove: m.moveActionId ? 'enabled' : 'disabled',
      taskResizable: m.resizeActionId ? 'enabled' : 'disabled',
    }
  }

  /**
   * Un evento del oj-gantt → { actionId, parameters } de Mateu, o null si no hay acción. Fechas a
   * días (fin inclusivo). `kind`: 'move' | 'resize' | 'open' | 'select' | 'range'.
   */
  function planningActionOf(atom, kind, detail) {
    if (!atom) return null
    // el gantt devuelve instantes (el punto exacto donde se soltó, en UTC): se redondean al día
    // LOCAL más cercano — una estancia empieza y acaba en días, no a las 09:38
    const day = (v) => {
      if (!v) return null
      const text = String(v)
      if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text
      const d = new Date(text)
      return isoDay(new Date(Math.round((d.getTime() - d.getTimezoneOffset() * 60000) / DAY_MS) * DAY_MS))
    }
    const lastNight = (v) => (v ? plusDays(day(v), -1) : null)
    const task = detail && detail.taskContexts && detail.taskContexts[0]
    const taskId = (task && (task.data ? task.data.id : task.id)) || (detail && detail.taskId)
    if (kind === 'move' && atom.moveActionId && taskId) {
      const rowId = detail.rowContext && detail.rowContext.rowData ? detail.rowContext.rowData.id
        : (detail.rowContext && detail.rowContext.data && detail.rowContext.data.id) || detail.rowId
      return { actionId: atom.moveActionId, parameters: {
        // start/end: los nuevos límites de la barra (value es el instante bajo el puntero)
        _blockId: taskId, _resourceId: rowId, _start: day(detail.start || detail.value), _end: lastNight(detail.end) } }
    }
    if (kind === 'resize' && atom.resizeActionId && taskId) {
      const rowId = detail.rowId || (task && task.rowData && task.rowData.id)
        || (task && task.rowContext && task.rowContext.rowData && task.rowContext.rowData.id)
      return { actionId: atom.resizeActionId, parameters: {
        _blockId: taskId, _resourceId: rowId, _start: day(detail.start), _end: lastNight(detail.end) } }
    }
    if (kind === 'open' && atom.openActionId && taskId) return { actionId: atom.openActionId, parameters: { _blockId: taskId } }
    if (kind === 'select' && atom.selectActionId && taskId) return { actionId: atom.selectActionId, parameters: { _blockId: taskId } }
    if (kind === 'range' && atom.rangeSelectActionId && detail && detail.rowId && detail.start && detail.end) {
      const [a, b] = [day(detail.start), day(detail.end)].sort()
      return { actionId: atom.rangeSelectActionId, parameters: { _resourceId: detail.rowId, _start: a, _end: b } }
    }
    return null
  }


  // ── listados: tonos de fila (@RowStatus) y grupos/totales (@GroupBy/@Aggregate) ───────────────
  // Mismo contrato que libs/mateu listingGroups.ts / rowTone.ts (el renderer web): el crud trae
  // groupBy y rowStatusField; las columnas, `aggregate`; la búsqueda (data.crud), `aggregates` (del
  // conjunto filtrado) y `groups` (por grupo, en orden).

  const ROW_TONES = { success: 'success', warning: 'warning', danger: 'danger', error: 'danger', info: 'info', neutral: 'neutral', none: 'neutral' }

  function rowToneOf(row, field) {
    if (!row || !field) return null
    let v = row[field]
    if (v && typeof v === 'object') v = v.type != null ? v.type : v.value
    return v == null ? null : (ROW_TONES[String(v).toLowerCase()] || null)
  }

  function toneRows(rows, field) {
    if (!field) return rows
    return rows.map((r) => {
      const tone = rowToneOf(r, field)
      return tone ? { ...r, _tone: tone } : r
    })
  }

  function formatAggregate(value, col) {
    if (value == null) return ''
    if (col.dataType === 'money' || col.stereotype === 'money')
      return new Intl.NumberFormat('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
    if (col.aggregate === 'count') return new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Math.round(value))
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(value)
  }

  function aggregatableColumns(md) {
    return (md.columns || []).map((c) => c.metadata || c).filter((c) => c && c.id)
  }

  /** Los totales por columna (texto) o null si no hay nada que totalizar. */
  function aggregateFootersOf(md, listing) {
    const aggregates = listing && listing.aggregates
    const cols = aggregatableColumns(md)
    if (!aggregates || !cols.some((c) => c.aggregate)) return null
    const out = {}
    for (const c of cols) if (c.aggregate && aggregates[c.id] != null) out[c.id] = formatAggregate(aggregates[c.id], c)
    const first = cols[0]
    if (first && out[first.id] == null) {
      const total = listing.page && listing.page.totalElements
      out[first.id] = md.groupBy && first.id === md.groupBy && total != null ? 'Total (' + total + ')' : 'Total'
    }
    return out
  }

  /** Filas de GRUPO intercaladas donde cambia el valor de groupBy (las filas llegan ordenadas). */
  function groupedRows(rows, md, listing) {
    const groupBy = md.groupBy
    const groups = (listing && listing.groups) || []
    if (!groupBy || !groups.length) return rows
    const cols = aggregatableColumns(md)
    const labelCol = cols.some((c) => c.id === groupBy) ? groupBy : (cols[0] && cols[0].id)
    const out = []
    let last
    rows.forEach((row, i) => {
      const key = String(row[groupBy] == null ? '' : row[groupBy])
      if (i === 0 || key !== last) {
        const g = groups.find((x) => String(x.value) === key)
          || { value: key, count: rows.filter((r) => String(r[groupBy]) === key).length, aggregates: {} }
        const groupRow = { _rowNumber: '__mateuGroup:' + i + ':' + key, _group: true, _tone: 'group' }
        for (const c of cols) {
          groupRow[c.id] = c.id === labelCol ? g.value + ' (' + g.count + ')'
            : c.aggregate ? formatAggregate((g.aggregates || {})[c.id], c) : ''
        }
        out.push(groupRow)
        last = key
      }
      out.push(row)
    })
    return out
  }


  // El rastro automático de una pantalla — la MISMA regla que el renderer web
  // (libs/mateu/.../breadcrumbTrail.ts): el camino de menús hasta la ruta (grupos y la entrada que
  // la muestra, secciones de un pod incluidas) y, pasada la entrada, el nivel del CRUD — el registro
  // (con el título de su propia página) y «Editar» / «Nuevo».
  //
  // Redwood no tiene migas: Spectra no trae componente de breadcrumbs y su cabecera ofrece, en su
  // lugar, la afordancia «ir al padre» (displayOptions.goToParent). De este rastro sale ese padre:
  // la última miga con ruta antes de la actual.

  const crumbRoute = (r) => {
    let s = String(r == null ? '' : r).trim()
    const q = s.search(/[?#]/)
    if (q >= 0) s = s.slice(0, q)
    if (s && s[0] !== '/') s = '/' + s
    while (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
    return s
  }

  // el título como texto: fuera el marcado (repetidamente, para que nada se recomponga con los
  // trozos) y después cualquier corchete que quede
  const crumbText = (text) => {
    let s = String(text == null ? '' : text)
    let previous
    do {
      previous = s
      s = s.replace(/<[^<>]*>/g, '')
    } while (s !== previous)
    return s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim()
  }

  // las rutas que abren las ENTRADAS del menú (no los grupos): a donde una miga puede llevar
  function crumbLeafRoutes(menu) {
    const out = new Set()
    const walk = (options) => {
      for (const option of options || []) {
        if (!option || option.separator || isMount(option)) continue
        const children = option.submenus || option.submenu || []
        if (children.length > 0) { walk(children); continue }
        const route = crumbRoute(option.route || option.path)
        if (route && route !== '/') out.add(route)
      }
    }
    walk(menu)
    return out
  }

  // Las entradas OCULTAS cuentan: no se pintan, pero una página bajo una sigue estando en algún sitio
  // (la bandeja a la que se llega desde un widget sigue siendo Bandeja › Tareas). Una sección remota
  // que no ha contestado cuenta por su prefijo (navTree.mjs), como la sección sola — `pending`, porque
  // lo que hay debajo aún no se sabe.
  function menuTrail(menu, path) {
    const current = crumbRoute(path)
    let best = null
    // un grupo es un encabezado, no una página: su ruta (el prefijo de una sección federada,
    // "/admin") no suele llevar a ningún sitio. Su miga sólo navega si una ENTRADA tiene esa ruta.
    const pages = crumbLeafRoutes(menu)
    const consider = (route, crumbs, pending) => {
      // una entrada de verdad gana a un prefijo de sección de la misma longitud: dice más
      if (!best || route.length > best.route.length || (route.length === best.route.length && best.pending && !pending)) {
        best = { crumbs, route, pending }
      }
    }
    const walk = (options, above) => {
      for (const option of options || []) {
        if (!option || option.separator) continue
        if (isMount(option)) {
          const prefix = mountPrefix(option)
          if (routeCovers(prefix, current)) consider(prefix, [...above, { text: crumbText(option.caption || option.label) }], true)
          continue
        }
        const route = crumbRoute(option.route || option.path)
        const label = crumbText(option.caption || option.label)
        const children = option.submenus || option.submenu || []
        if (children.length > 0) {
          walk(children, [...above, route && route !== '/' && pages.has(route) ? { text: label, route } : { text: label }])
          continue
        }
        if (routeCovers(route, current)) consider(route, [...above, { text: label, route }], false)
      }
    }
    walk(menu, [])
    if (!best) return { crumbs: [] }
    return best.pending ? { crumbs: best.crumbs, matched: best.route, pending: true } : { crumbs: best.crumbs, matched: best.route }
  }

  const recordTitles = new Map()

  function autoTrail(menu, path, page = {}) {
    const { crumbs, matched, pending } = menuTrail(menu, path)
    if (!matched) return []
    const trail = [...crumbs]
    if (pending) {
      // una sección remota que no ha contestado: la sección se sabe (la nombró la shell) y lo de
      // debajo no. La sección, y después el título de la propia página.
      const title = crumbText(page.title)
      if (title && title !== trail[trail.length - 1].text) trail.push({ text: title })
      return trail.length < 2 ? [] : trail
    }
    const rest = crumbRoute(path).slice(matched.length).split('/').filter(Boolean)
    const lang = page.lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
      || (typeof navigator !== 'undefined' && navigator.language) || ''
    const es = String(lang).toLowerCase().startsWith('es')
    if (rest.length > 0) {
      const id = decodeURIComponent(rest[0])
      if (id === 'new' || id === 'create') {
        trail.push({ text: es ? 'Nuevo' : 'New' })
      } else {
        const recordRoute = matched + '/' + rest[0]
        const title = crumbText(page.title)
        if (rest.length === 1 && title) recordTitles.set(recordRoute, title)
        trail.push({ text: recordTitles.get(recordRoute) || id, route: recordRoute })
        if (rest[1] === 'edit') trail.push({ text: es ? 'Editar' : 'Edit' })
        else if (rest.length > 1) trail.push({ text: title || decodeURIComponent(rest[rest.length - 1]) })
      }
    }
    if (trail.length < 2) return []
    trail[trail.length - 1] = { text: trail[trail.length - 1].text }
    return trail
  }

  function parentCrumb(trail) {
    for (let i = (trail || []).length - 2; i >= 0; i--) {
      if (trail[i].route) return trail[i]
    }
    return undefined
  }


  // Errores del cliente → log del servidor: lo que este renderer enseña o sufre (un fallo de
  // transporte clasificado, un error de JS sin capturar, una promesa rechazada sin catch) viaja a
  // POST <base>/mateu/v3/client-log, que escribe UNA línea `client-error {...}` por informe en el
  // logger "mateu.client". Mismo contrato que el renderer de Vaadin (libs/mateu clientErrorReporter.ts).
  //
  // Por qué: un «Tu sesión ya no es válida» que vio el usuario no dejaba rastro en el servidor — el
  // ingress no mostraba ningún 401/403 para él. Ahora queda una línea que buscar en Loki.
  //
  // Reglas:
  //   - nunca informa de sus propios fallos (la llamada al endpoint no pasa por fetchWithPolicy, sus
  //     errores se tragan, y un error cuyo url es el endpoint se descarta): sin bucles;
  //   - 'cancelled' no es un error;
  //   - el mismo error repetido dentro de la ventana es UNA línea con `count` + firstAt/lastAt: la
  //     primera aparición sale enseguida y las repeticiones van en una línea resumen al cerrar la
  //     ventana (o al salir de la página);
  //   - como mucho `maxPerMinute` líneas por minuto y página; las que no caben se cuentan en `dropped`
  //     de la siguiente;
  //   - una respuesta que dice que no hay endpoint (404/405, o un backend sin él que se lo traga como
  //     acción) lo apaga para la página — ver endpointIsMissing.
  //
  // El envío principal es fetch keepalive CON el Authorization (el gateway exige el Bearer en
  // /mateu/v3); sendBeacon no puede llevar cabeceras, así que sólo se usa al ocultar la página y sin
  // token.
  //
  // Puro salvo installClientErrorReporting (que toca window): test.mjs lo ejercita con reloj,
  // temporizador y envío inyectados.

  const CLIENT_LOG_PATH = '/mateu/v3/client-log'

  const MAX = { message: 1000, detail: 1000, stack: 4000, url: 1000, pageUrl: 1000, source: 500, route: 500, actionId: 200, userAgent: 300 }
  const MAX_BATCH_CHARS = 14000
  // Valores de query que nunca deben acabar en un log: el código/estado del login de Keycloak, tokens.
  const SECRET_PARAMS = /^(code|state|session_state|token|access_token|id_token|refresh_token|auth|password)$/i

  const clipText = (s, max) => {
    if (s === undefined || s === null) return undefined
    const text = String(s)
    return text.length > max ? text.slice(0, max) + '…' : text
  }

  /** La URL sin fragmento y con los parámetros sensibles enmascarados. */
  function redactUrl(url) {
    if (!url) return url
    const text = String(url)
    const noHash = text.split('#')[0]
    const q = noHash.indexOf('?')
    if (q < 0) return noHash
    const params = noHash.slice(q + 1).split('&').map((pair) => {
      const eq = pair.indexOf('=')
      const key = eq < 0 ? pair : pair.slice(0, eq)
      return SECRET_PARAMS.test(decodeURIComponentSafe(key)) ? `${key}=***` : pair
    })
    return noHash.slice(0, q + 1) + params.join('&')
  }

  function decodeURIComponentSafe(s) {
    try { return decodeURIComponent(s) } catch (e) { return s }
  }

  /** La ruta Mateu de una URL de transporte (/mateu/v3/sync/<ruta>), o undefined. */
  function routeOfRequestUrl(url) {
    if (!url) return undefined
    const m = /\/mateu\/v3\/(?:sync|sse)\/([^?#]*)/.exec(String(url))
    if (!m) return undefined
    return m[1] === '_no_route' ? '' : '/' + m[1]
  }

  /**
   * Si la respuesta dice que aquí no hay endpoint: un 404/405 (backend antiguo o
   * mateu.client-log.enabled=false), o un backend cuyo controlador genérico /mateu/v3/** se tragó el
   * informe como si fuera una acción (un 2xx que no es 204, un 400, un 500). Lo pasajero — sin
   * respuesta, 401/403 de un token caducado, 413, 429, 502-504 del gateway — no lo apaga.
   */
  function endpointIsMissing(status) {
    if (status === undefined || status === null || status === 0 || status === 204) return false
    if (status === 401 || status === 403 || status === 413 || status === 429 || status >= 502) return false
    return true
  }

  /** Ruido conocido que no es un error de la aplicación. */
  function isNoise(entry) {
    const msg = entry.message || ''
    return /ResizeObserver loop/i.test(msg)
  }

  /**
   * Un informador. `deps`: { renderer, endpoint() → url o null, send(url, body, {final}) → Promise
   * de un status (o undefined), now() → ms, schedule(fn, ms) → handle, cancel(handle), userAgent,
   * pageUrl() }. Todo opcional salvo `send` para los tests.
   */
  function createClientErrorReporter(deps = {}) {
    const renderer = deps.renderer || 'redwood'
    const now = deps.now || (() => Date.now())
    const schedule = deps.schedule || ((fn, ms) => setTimeout(fn, ms))
    const cancel = deps.cancel || ((h) => clearTimeout(h))
    const windowMs = deps.dedupeWindowMs || 60000
    const batchDelayMs = deps.batchDelayMs !== undefined ? deps.batchDelayMs : 2000
    const maxPerMinute = deps.maxPerMinute || 20
    const endpoint = deps.endpoint || (() => CLIENT_LOG_PATH)

    const entries = new Map()   // clave → { report, windowStart, pending, pendingFirstAt, lastAt }
    let sentAt = []             // instantes de las líneas enviadas en el último minuto
    let dropped = 0
    let disabled = false
    let timer = null
    let dueAt = Infinity

    const keyOf = (r) => [r.kind, r.status, r.message, r.url, r.actionId, (r.stack || '').split('\n')[0]].join('|')

    function report(input) {
      try {
        if (disabled || !input) return
        if (input.kind === 'cancelled') return
        const url = input.url ? String(input.url) : undefined
        if (url && url.indexOf(CLIENT_LOG_PATH) >= 0) return   // nunca informar del propio informe
        if (isNoise(input)) return
        const t = now()
        const r = {
          level: 'error',
          kind: input.kind || 'unknown',
          message: clipText(input.message, MAX.message),
          detail: clipText(input.detail, MAX.detail),
          status: typeof input.status === 'number' ? input.status : undefined,
          url: clipText(redactUrl(url), MAX.url),
          route: clipText(input.route !== undefined ? input.route : routeOfRequestUrl(url), MAX.route),
          actionId: clipText(input.actionId, MAX.actionId),
          source: clipText(input.source, MAX.source),
          traceparent: input.traceparent,
          stack: clipText(input.stack, MAX.stack),
        }
        const key = keyOf(r)
        const existing = entries.get(key)
        if (existing && t - existing.windowStart < windowMs) {
          if (existing.pending === 0) existing.pendingFirstAt = t
          existing.pending++
          existing.lastAt = t
          // las repeticiones esperan al cierre de la ventana: una línea resumen, no una por vez
          plan(existing.windowStart + windowMs - t)
          return
        }
        entries.set(key, { report: r, windowStart: t, pending: 1, pendingFirstAt: t, lastAt: t, sent: false })
        plan(batchDelayMs)
      } catch (e) { /* informar nunca puede romper la página */ }
    }

    function plan(ms) {
      const at = now() + Math.max(0, ms)
      if (timer !== null && at >= dueAt) return
      if (timer !== null) cancel(timer)
      dueAt = at
      timer = schedule(() => { timer = null; dueAt = Infinity; flush(false) }, Math.max(0, ms))
    }

    /** Las líneas que tocan ya; `final` = la página se va, sale todo lo pendiente. */
    function takeDue(final) {
      const t = now()
      const lines = []
      for (const [key, e] of entries) {
        const expired = t - e.windowStart >= windowMs
        if (e.pending > 0 && (!e.sent || expired || final)) {
          lines.push({
            ...e.report,
            count: e.pending,
            firstAt: new Date(e.pendingFirstAt).toISOString(),
            lastAt: new Date(e.lastAt).toISOString(),
          })
          e.pending = 0
          e.sent = true
        }
        if (expired && e.pending === 0) entries.delete(key)
      }
      return lines
    }

    function admit(lines) {
      const t = now()
      sentAt = sentAt.filter((s) => t - s < 60000)
      // `dropped` en una línea = las que se perdieron ANTES de ella, en envíos anteriores
      const before = dropped
      const out = []
      for (const line of lines) {
        if (sentAt.length >= maxPerMinute) { dropped++; continue }
        sentAt.push(t)
        out.push(line)
      }
      if (out.length && before) { out[0].dropped = before; dropped -= before }
      return out
    }

    function batches(lines) {
      const out = []
      let current = []
      let size = 2
      for (const line of lines) {
        const json = JSON.stringify(line)
        if (current.length && size + json.length + 1 > MAX_BATCH_CHARS) {
          out.push(current); current = []; size = 2
        }
        current.push(line); size += json.length + 1
      }
      if (current.length) out.push(current)
      return out
    }

    function flush(final = false) {
      try {
        if (disabled) return
        const url = endpoint()
        if (!url) return
        const common = { renderer, userAgent: clipText(deps.userAgent, MAX.userAgent), pageUrl: clipText(redactUrl(deps.pageUrl ? deps.pageUrl() : undefined), MAX.pageUrl) }
        const lines = admit(takeDue(final)).map((l) => JSON.parse(JSON.stringify({ ...common, ...l })))
        for (const batch of batches(lines)) {
          let sent
          try { sent = deps.send(url, JSON.stringify(batch), { final }) } catch (e) { sent = null }
          Promise.resolve(sent).then((status) => {
            if (endpointIsMissing(status)) disabled = true
          }, () => { /* un informe perdido no se informa */ })
        }
        // quedan repeticiones esperando el cierre de su ventana
        let next = Infinity
        for (const e of entries.values()) {
          if (e.pending > 0) next = Math.min(next, e.windowStart + windowMs)
        }
        if (next !== Infinity && !final) plan(next - now())
      } catch (e) { /* idem */ }
    }

    return {
      report,
      flush,
      isDisabled: () => disabled,
      _pendingCount: () => entries.size,
    }
  }

  /**
   * El envío real: fetch keepalive con el token (el gateway lo exige); al ocultar la página y sin
   * token, sendBeacon como último recurso. Resuelve con el status, o undefined.
   */
  function clientLogSender(headers = () => ({})) {
    return (url, body, { final } = {}) => {
      const auth = headers() || {}
      const hasAuth = Object.keys(auth).length > 0
      if (final && !hasAuth && typeof navigator !== 'undefined' && navigator.sendBeacon) {
        try {
          navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }))
          return Promise.resolve(undefined)
        } catch (e) { /* sigue por fetch */ }
      }
      if (typeof fetch === 'undefined') return Promise.resolve(undefined)
      return fetch(url, {
        method: 'POST',
        keepalive: true,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', ...auth },
        body,
      }).then((res) => res.status, () => undefined)
    }
  }

  /** El informador de la página (null hasta installClientErrorReporting). */
  const clientErrors = {
    _reporter: null,
    report(entry) { if (this._reporter) this._reporter.report(entry) },
  }

  /** El endpoint para una base: sólo mismo origen (otro origen no lleva nuestro token ni CORS). */
  function clientLogEndpointOf(base, origin) {
    const b = base || ''
    if (/^https?:\/\//i.test(b)) {
      if (!origin || b.indexOf(origin) !== 0) return null
    }
    return b.replace(/\/+$/, '') + CLIENT_LOG_PATH
  }

  /**
   * Lo engancha a la página: los errores sin capturar y las promesas rechazadas sin catch, y el
   * vaciado al ocultarla. Idempotente.
   */
  function installClientErrorReporting(base, options = {}) {
    if (clientErrors._reporter || typeof window === 'undefined') return clientErrors._reporter
    const origin = window.location && window.location.origin
    const reporter = createClientErrorReporter({
      renderer: options.renderer || 'redwood',
      endpoint: () => clientLogEndpointOf(base, origin),
      send: options.send || clientLogSender(options.headers || (() => ({}))),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      pageUrl: () => window.location && window.location.href,
    })
    clientErrors._reporter = reporter
    window.addEventListener('error', (event) => {
      // un recurso que no carga (img/script) llega aquí sin `error`; no es un error de JS
      if (!event || (!event.error && !event.message)) return
      const err = event.error
      reporter.report({
        kind: 'js-error',
        message: event.message || (err && err.message),
        stack: err && err.stack,
        source: event.filename ? `${event.filename}:${event.lineno || 0}:${event.colno || 0}` : undefined,
      })
    })
    window.addEventListener('unhandledrejection', (event) => {
      const reason = event && event.reason
      // un fallo de transporte ya clasificado (y ya informado por fetchWithPolicy) no se duplica
      if (reason && reason.failure) return
      if (reason && (reason.name === 'AbortError')) return
      reporter.report({
        kind: 'unhandled-rejection',
        message: reason && reason.message ? reason.message : clipText(safeString(reason), MAX.message),
        stack: reason && reason.stack,
      })
    })
    window.addEventListener('pagehide', () => reporter.flush(true))
    return reporter
  }

  function safeString(v) {
    try { return typeof v === 'string' ? v : JSON.stringify(v) } catch (e) { return String(v) }
  }


  // REFRESCO PERIÓDICO (triggers con espera): el patrón del web — un OnLoad con timeoutMillis
  // arranca la primera vuelta y un OnSuccess(actionId = la misma, calledActionId = la misma,
  // timeoutMillis) cierra el bucle: cada refresco que termina bien programa el siguiente. Antes
  // la shell VB disparaba todos los OnLoad al momento, sin espera, y no conocía OnSuccess.
  //
  // Una GENERACIÓN por pantalla: navegar arranca una nueva y todo lo programado para la anterior
  // se descarta al vencer (como el callbackToken del web) — un panel de pisos que se deja de ver
  // deja de preguntar.

  let runner = null
  /** Quién ejecuta la acción programada (la shell: el mismo camino que los Element). */
  function setPollingRunner(fn) { runner = typeof fn === 'function' ? fn : null }

  let generation = 0
  let screenTree = null
  const timers = new Set()

  const triggersOf = (ctx) => (ctx && ctx.tree && ctx.tree.triggers) || []

  /** Los OnLoad CON espera (los inmediatos siguen el camino de siempre: onLoadTriggers). */
  function timedOnLoadTriggers(ctx) {
    return triggersOf(ctx).filter((t) => t.type === 'OnLoad' && t.actionId && t.timeoutMillis > 0)
  }

  /** Los OnSuccess que siguen a `actionId`. */
  function onSuccessTriggers(ctx, actionId) {
    return triggersOf(ctx).filter((t) => t.type === 'OnSuccess' && t.actionId && t.calledActionId === actionId)
  }

  const schedule = (trigger, gen, timer = setTimeout) => {
    const fire = () => {
      if (gen !== generation || !runner) return
      runner(trigger.actionId, {}, { background: !!trigger.background, polling: true })
    }
    if (!(trigger.timeoutMillis > 0)) { fire(); return }
    const handle = timer(() => { timers.delete(handle); fire() }, trigger.timeoutMillis)
    timers.add(handle)
  }

  /** Pantalla nueva: descarta lo programado y arma sus OnLoad con espera. */
  function startPolling(hostCtx, timer = setTimeout) {
    generation++
    for (const h of timers) clearTimeout(h)
    timers.clear()
    screenTree = hostCtx && hostCtx.tree
    for (const t of timedOnLoadTriggers(hostCtx)) schedule(t, generation, timer)
    return generation
  }

  /** Una acción terminó bien (hook del transporte): sus OnSuccess, si son de la pantalla en curso. */
  function actionSucceeded(ctx, actionId, timer = setTimeout) {
    if (!ctx || !ctx.tree) return 0
    // sólo la pantalla en curso (misma clase servidora que la que se armó al navegar): la isla de
    // otro ServerSide o una respuesta de la pantalla anterior no reprograman nada
    if (!screenTree || ctx.tree.serverSideType !== screenTree.serverSideType) return 0
    const next = onSuccessTriggers(ctx, actionId)
    for (const t of next) schedule(t, generation, timer)
    return next.length
  }

  const pollingGeneration = () => generation


  // Resiliencia del transporte — el mismo contrato que los renderers web (libs/mateu:
  // requestPolicy + retryPolicy + connectivity + pendingActions), reescrito para ESTE core,
  // que no comparte nada con aquéllos: aquí el transporte es `fetch` pelado, no axios.
  //
  // Las diferencias que obliga fetch, y que son la razón de que esto no sea un copy-paste:
  //   - fetch NO tiene timeout. Sin AbortController una petición puede quedarse colgada para
  //     siempre; el usuario ve la pantalla congelada sin error ni fin.
  //   - fetch NO rechaza ante un 4xx/5xx: resuelve con `res.ok === false`. El estado hay que
  //     leerlo y adjuntarlo al error a mano, o abajo no hay forma de distinguir un 500 de un
  //     cable desenchufado.
  //   - un fallo de red es un `TypeError` genérico ("Failed to fetch"), y un abort es un
  //     `DOMException` con `name === 'AbortError'`. Ninguno trae código propio.
  //
  // Todo lo de aquí es puro salvo `fetchWithPolicy`, para que test.mjs lo pueda ejercitar en
  // Node sin navegador ni backend.


  // ── clasificación ────────────────────────────────────────────────────────────────────────

  /** Ceiling por defecto de una petición, en ms. Lo pisa `@Action(timeoutMillis = …)`. */
  const DEFAULT_TIMEOUT_MS = 60000

  const MESSAGES = {
    offline: () => 'Sin conexión. Tus cambios no se han enviado — revisa la red e inténtalo de nuevo.',
    timeout: () => 'El servidor tarda demasiado en responder. Puede que tus cambios no se hayan guardado.',
    server: (s) => `El servidor no ha podido completar la petición${s ? ` (error ${s})` : ''}. Inténtalo de nuevo.`,
    unauthorized: () => 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
    // Un 403 NO es la sesión: el servidor sabe quién eres y dice que no a ESTO (una acción que la
    // vista no declara, un rol que falta). Decir "vuelve a iniciar sesión" mandaba a un login que
    // no arregla nada.
    forbidden: () => 'No tienes permiso para hacer esto.',
    notFound: () => 'Esto ya no está disponible. Puede que se haya movido o borrado.',
    client: (s) => `La petición ha sido rechazada${s ? ` (error ${s})` : ''}.`,
    cancelled: () => '',
    unknown: () => 'Algo ha ido mal. Inténtalo de nuevo.',
  }

  /** Tipos que merece la pena reintentar: o no llegó, o el servidor tuvo un mal momento. */
  const RETRYABLE = new Set(['offline', 'timeout', 'server'])

  /**
   * Traduce un fallo de transporte a `{ kind, message, retryable, status }`.
   *
   * `online` se inyecta para poder testearlo y porque el llamante tiene una señal mejor que
   * `navigator.onLine` (que miente en portales cautivos).
   */
  function classifyRequestFailure(error, options = {}) {
    const err = error || {}
    const status = err.status != null ? err.status : (err.response && err.response.status)
    const name = err.name || ''
    const message = err.message || ''
    const online = options.online !== undefined
      ? options.online
      : (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true)

    const failure = (kind) => ({
      kind,
      message: MESSAGES[kind](status),
      retryable: RETRYABLE.has(kind),
      status,
    })

    // Un abort es una decisión NUESTRA (navegación, timeout propio): nunca es noticia para el
    // usuario… salvo cuando lo disparó el timeout, que sí lo es. Los distingue la marca.
    if (name === 'AbortError' || err.code === 'ERR_CANCELED') {
      return failure(err.__mateuTimedOut ? 'timeout' : 'cancelled')
    }
    if (err.__mateuTimedOut || /timeout/i.test(message)) return failure('timeout')

    if (status == null) {
      // Sin respuesta: o sabemos que no hay red, o la petición murió antes de llegar.
      if (!online) return failure('offline')
      // fetch resuelve un fallo de red como un TypeError sin más señas.
      if (name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(message)) {
        return failure('offline')
      }
      return failure('unknown')
    }
    if (status === 401) return failure('unauthorized')
    if (status === 403) return failure('forbidden')
    if (status === 404 || status === 410) return failure('notFound')
    if (status === 408 || status === 429) return failure('timeout')
    if (status >= 500) return failure('server')
    if (status >= 400) return failure('client')
    return failure('unknown')
  }

  // ── política de reintento ────────────────────────────────────────────────────────────────

  /** Ids de acción del framework que sólo LEEN. '' es la carga de ruta. */
  const ALWAYS_SAFE = new Set(['', '__load__', 'search', '_globalsearch', '_notifications-list'])
  const SAFE_PREFIXES = ['_appcontext-search-', 'search-']

  /**
   * Si repetir `actionId` no puede aplicar el mismo cambio dos veces.
   *
   * Por defecto NO: cuando una petición expira no sabemos si el servidor la procesó, así que
   * repetir un `create` arriesga un duplicado silencioso. `declared` es el opt-in del wire
   * (`@Action(idempotent = true)`), que nunca saca a una lectura conocida de la lista.
   */
  function isIdempotentAction(actionId, declared) {
    if (declared === true) return true
    // Un id AUSENTE es trabajo desconocido; uno VACÍO es la carga de ruta. No son lo mismo.
    if (actionId === undefined || actionId === null) return false
    if (ALWAYS_SAFE.has(actionId)) return true
    return SAFE_PREFIXES.some((p) => actionId.startsWith(p))
  }

  /** Intentos ADEMÁS del primero. */
  const MAX_RETRIES = 2

  /** Espera antes del reintento `attempt` (1-based): exponencial con ±25% de jitter. */
  function retryDelayMs(attempt, random = Math.random) {
    const base = 300 * Math.pow(3, Math.max(0, attempt - 1))
    return Math.round(base * (0.75 + random() * 0.5))
  }

  /**
   * La decisión. `offline` queda deliberadamente fuera: reenviar a los 300 ms con la red caída
   * sólo quema el presupuesto de intentos — de la reconexión se encarga `connectivity`.
   */
  function shouldRetry(failure, attempt, options = {}) {
    if (!options.idempotent) return false
    if (attempt > MAX_RETRIES) return false
    if (!failure.retryable) return false
    return failure.kind === 'timeout' || failure.kind === 'server'
  }

  // ── conectividad ─────────────────────────────────────────────────────────────────────────

  /**
   * Una respuesta honesta a "¿llegamos?".
   *
   * `navigator.onLine` informa del enlace, no del camino: dice true en un portal cautivo y con
   * una VPN que perdió la ruta. Sirve como negativo duro; el positivo lo da nuestro propio
   * tráfico volviendo.
   */
  const connectivity = {
    _linkUp: true,
    _reachable: undefined,
    _listeners: new Set(),
    _started: false,

    start() {
      if (this._started || typeof window === 'undefined') return
      this._started = true
      this._linkUp = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
        ? navigator.onLine : true
      window.addEventListener('online', () => {
        this._linkUp = true
        this._reachable = undefined   // el enlace vuelve, el camino está por demostrar
        this._emit()
      })
      window.addEventListener('offline', () => { this._linkUp = false; this._emit() })
    },

    isOnline() {
      if (!this._linkUp) return false
      return this._reachable !== false
    },

    noteReachable() {
      const was = this.isOnline()
      this._reachable = true
      if (!was) this._emit()
    },

    noteUnreachable() {
      const was = this.isOnline()
      this._reachable = false
      if (was) this._emit()
    },

    subscribe(listener) {
      this._listeners.add(listener)
      return () => this._listeners.delete(listener)
    },

    reset() { this._linkUp = true; this._reachable = undefined },

    _emit() {
      const online = this.isOnline()
      this._listeners.forEach((l) => l(online))
    },
  }

  // ── guard de doble envío ─────────────────────────────────────────────────────────────────

  /** Válvula de seguridad: pasado este tiempo una entrada se da por muerta y se libera. */
  const STALE_MS = 120000

  const pendingActions = {
    _started: new Map(),

    key(componentId, actionId) { return `${componentId || '_'}::${actionId}` },

    /** Reclama el hueco. false = ya hay una idéntica en vuelo y ésta es un duplicado. */
    begin(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      if (startedAt !== undefined && now - startedAt < STALE_MS) return false
      this._started.set(key, now)
      return true
    },

    end(key) { this._started.delete(key) },

    isPending(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      return startedAt !== undefined && now - startedAt < STALE_MS
    },

    reset() { this._started.clear() },
  }

  // ── ganchos de ciclo de vida ─────────────────────────────────────────────────────────────

  /**
   * Cómo la app (VB) se entera de que hay trabajo en vuelo, sin que el core sepa nada de VB.
   * `onStart` recibe {actionId}; `onSettle` recibe {actionId, failure} (failure null si fue bien).
   */
  /**
   * Peticiones que un componente hace PARA SÍ y que ya enseñan su propia carga: nunca encienden la
   * barra de ocupado de la página (la misma regla que el renderer web, localRequests.ts).
   * `search-<campo>`: la búsqueda de opciones de un lookup (y la vacía que llena un select);
   * `code-<campo>`: el rótulo de un código tecleado; `__restfetch__`: un @RestOptions por el servidor.
   */
  function isLocalRequest(actionId) {
    return !!actionId && (actionId.indexOf('search-') === 0 || actionId.indexOf('code-') === 0 || actionId === '__restfetch__')
  }

  const transportHooks = { onStart: null, onSettle: null }

  function setTransportHooks(hooks) {
    transportHooks.onStart = (hooks && hooks.onStart) || null
    transportHooks.onSettle = (hooks && hooks.onSettle) || null
  }

  const notify = (which, payload) => {
    const fn = transportHooks[which]
    if (!fn) return
    try { fn(payload) } catch (e) { /* la UI no puede tumbar el transporte */ }
  }

  // ── la pantalla en curso ─────────────────────────────────────────────────────────────────

  /**
   * Qué pantalla hay: un contador que la navegación sube al empezar a cargar otra (beginView). Una
   * petición de la pantalla (callMateu la estampa sola; no las de fondo: widgets de cabecera, menús
   * remotos, el chat) recuerda la pantalla para la que salió, y su respuesta — buena o mala — que
   * llega cuando ya hay otra muere en silencio: no se pinta, no pone banda de error ni pide
   * reautenticar; sólo libera el ocupado (onSettle sin fallo). Es la misma regla que el renderer web
   * (staleViewGuard.ts): una petición que salió con la pantalla A y vuelve con la B no es de nadie.
   */
  const viewGuard = { generation: 0 }

  /** Empieza otra pantalla: lo que siga en vuelo de la anterior ya no se aplicará. */
  function beginView() { return ++viewGuard.generation }

  /** La pantalla en curso (para estampar una petición al salir). */
  function currentView() { return viewGuard.generation }

  /** ¿Ya no está en pantalla la vista para la que salió una petición? (undefined: no atada a ninguna) */
  function isViewStale(view) { return view != null && view !== viewGuard.generation }

  /** El rechazo de una respuesta que llegó para una pantalla que ya no está. */
  function staleResponseError(actionId) {
    const error = new Error(`respuesta a '${actionId || ''}' para una pantalla que ya no está`)
    error.stale = true
    error.code = 'ERR_CANCELED'
    error.failure = { kind: 'cancelled', message: '', retryable: false, status: undefined }
    return error
  }

  function isStaleResponse(error) { return !!(error && error.stale === true) }

  // ── fetch con política ───────────────────────────────────────────────────────────────────

  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  /** La cabecera traceparent de una petición, si la llevaba. */
  function traceparentOf(init) {
    const h = init && init.headers
    if (!h) return undefined
    if (typeof h.get === 'function') return h.get('traceparent') || undefined
    return h.traceparent || h.Traceparent || undefined
  }

  /**
   * Un envío: aplica el timeout (fetch no trae ninguno) y convierte un 4xx/5xx en un error que
   * LLEVA el status, porque fetch resuelve esos como éxito y abajo no habría forma de saberlo.
   */
  async function sendOnce(url, init, timeoutMillis) {
    // Negativo = SIN ceiling, para un stream que dura lo que dure (LongTask). Distinto de 0 /
    // ausente, que significa "usa el de por defecto".
    const noCeiling = timeoutMillis != null && timeoutMillis < 0
    const ms = timeoutMillis && timeoutMillis > 0 ? timeoutMillis : DEFAULT_TIMEOUT_MS
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    let timedOut = false
    const timer = noCeiling ? null : setTimeout(() => {
      timedOut = true
      if (controller) controller.abort()
    }, ms)
    try {
      const res = await fetch(url, controller ? { ...init, signal: controller.signal } : init)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const error = new Error(`Mateu → HTTP ${res.status}${text ? `: ${text}` : ''}`)
        error.status = res.status
        throw error
      }
      return res
    } catch (e) {
      // Un abort disparado por NUESTRO timeout debe leerse como timeout, no como cancelación:
      // el usuario sí tiene que enterarse.
      if (timedOut && e) e.__mateuTimedOut = true
      throw e
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  /**
   * La cabecera con el token, si el bootstrap dejó uno.
   *
   * La página de bootstrap autentica contra Keycloak y guarda el token en
   * `localStorage.__mateu_auth_token`, refrescándolo al caducar. Hasta que esto existió, NADA lo
   * leía: el bridge hacía cada llamada sin cabecera, el gateway respondía 401 y el clasificador de
   * abajo lo traducía a "Tu sesión ya no es válida" — un mensaje cierto sobre el 401 y engañoso
   * sobre la causa, porque la sesión estaba perfectamente viva y la petición sencillamente no la
   * presentaba. La consola cargaba, se quedaba sin un solo menú, y el panel de chat tampoco
   * respondía.
   *
   * Va aquí y no en los tres sitios que construyen cabeceras en transport.mjs, por lo mismo que en
   * el otro renderer es un interceptor de axios y no un parámetro de cada llamada: un punto único
   * que un cuarto sitio no puede olvidar.
   *
   * `localStorage` no existe en Node, donde corre test.mjs, así que se consulta con guarda; y un
   * `Authorization` que el llamante ya haya puesto manda sobre este, que es lo que permite probar
   * el camino sin tocar el almacenamiento.
   */
  function authHeaders(init) {
    const already = init && init.headers &&
      (init.headers.Authorization || init.headers.authorization)
    if (already) return null
    const token = storedToken()
    return token ? { Authorization: 'Bearer ' + token } : null
  }

  /** El token que dejó el bootstrap, o null (sin localStorage, bloqueado o vacío). */
  function storedToken() {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem('__mateu_auth_token') : null
    } catch (e) {
      // Un navegador con el almacenamiento bloqueado. Sin token se sigue: el backend dirá que no,
      // que es mejor que no llamar.
      return null
    }
  }

  /**
   * La cabecera con el token para una llamada que NO pasa por fetchWithPolicy: el stream del chat
   * del agente (SSE, un fetch propio que lee el cuerpo por trozos). Sin ella el agente contesta
   * 401 y el panel enseña "Servidor respondió 401". {} si no hay token.
   */
  function authHeadersOf() {
    return authHeaders(null) || {}
  }

  /** El refresco en marcha, si lo hay: los 401 que llegan mientras tanto esperan a éste. */
  let reauthInFlight = null

  /**
   * Pide a la página que reautentique tras un 401, con el mismo contrato que el renderer de Vaadin
   * (sessionGuard.ts): el evento cancelable 'mateu-session-expired' en document, con
   * {retry, giveUp} en el detail. El bootstrap de Mateu lo atiende — fuerza el refresco del token
   * de Keycloak y llama a retry, o manda al login si la sesión ya no existe. Resuelve true si hay
   * que reenviar la petición; false si nadie lo reclamó o la página desistió.
   *
   * UN refresco para todos: la pestaña vuelve del fondo con el token caducado y el badge del inbox,
   * la sincronización del banner y la acción del usuario vuelven 401 a la vez. Cada una lanzando su
   * evento eran N refrescos forzados en paralelo (y N keycloak.login() si fallaba); ahora los 401
   * que llegan mientras hay uno en marcha esperan a ése y comparten su respuesta.
   *
   * `sentToken` (opcional): el token con el que salió la petición rechazada. Si el que hay ahora es
   * otro, el refresco ya ocurrió mientras la petición volaba — el del visibilitychange, típicamente
   * — y basta con reenviar: forzar otro sería tirar uno recién emitido.
   */
  function askForReauthentication(sentToken) {
    if (sentToken !== undefined) {
      const current = storedToken()
      if (current && current !== sentToken) return Promise.resolve(true)
    }
    if (!reauthInFlight) {
      reauthInFlight = raiseSessionExpired().finally(() => { reauthInFlight = null })
    }
    return reauthInFlight
  }

  function raiseSessionExpired() {
    return new Promise((resolve) => {
      if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') {
        resolve(false)
        return
      }
      let settled = false
      const settle = (value) => {
        if (settled) return
        settled = true
        resolve(value)
      }
      const detail = { retry: () => settle(true), giveUp: () => settle(false) }
      const claimed = !document.dispatchEvent(
        new CustomEvent('mateu-session-expired', { detail, cancelable: true, bubbles: false }))
      if (!claimed) settle(false)
    })
  }

  /**
   * El punto único por el que pasa TODO el tráfico de este renderer.
   *
   * Y por eso es donde se adjunta el token: es el cliente de Mateu de este renderer, igual que
   * AxiosMateuApiClient lo es del otro.
   *
   * Reenvía mientras el fallo sea transitorio Y la acción sea segura de repetir; cada intento
   * resuelto enseña al rastreador de conectividad si el backend responde — una respuesta
   * demuestra el camino mejor que cualquier bandera del navegador. Los N intentos son UN solo
   * resultado de cara a la UI: un estado de carga, un mensaje.
   */
  async function fetchWithPolicy(url, init, options = {}) {
    // El token se lee en CADA envío, no una vez: tras un 401 el bootstrap deja uno nuevo en
    // localStorage y el reintento tiene que llevar ese, no el caducado.
    // El token con el que salió el ÚLTIMO envío (undefined si no llevaba el nuestro): ante un 401
    // dice si el refresco ya llegó mientras la petición volaba.
    let sentToken
    const withAuth = () => {
      const auth = authHeaders(init)
      sentToken = auth ? auth.Authorization.slice('Bearer '.length) : undefined
      return auth ? { ...(init || {}), headers: { ...((init && init.headers) || {}), ...auth } } : init
    }
    const actionId = options.actionId
    const idempotent = isIdempotentAction(actionId, options.idempotent)
    // `quiet`: una petición de FONDO (el refresco de un widget de cabecera cada pocos segundos) no
    // avisa a los ganchos — la barra de ocupado y la banda de error hablan de lo que hace el usuario.
    // Tampoco la de un componente que ya enseña su propia carga (isLocalRequest): el combo que busca
    // sus opciones gira su propio indicador, y la barra encima eran dos esperas para una tecla
    const quiet = options.quiet || isLocalRequest(actionId)
    const notifyUnlessQuiet = (hook, payload) => { if (!quiet) notify(hook, payload) }
    // `isolated`: lo que pase con esta petición no dice nada de la conexión — el menú de un pod
    // federado, a menudo de otro origen: un pod caído es SU sección no disponible, no "sin conexión"
    const isolated = !!options.isolated
    notifyUnlessQuiet('onStart', { actionId })
    // `view`: la pantalla para la que sale (currentView); su respuesta muere si ya hay otra
    const view = options.view
    const dropStale = () => {
      // el ocupado se apaga (lo encendió esta petición), sin fallo que enseñar
      notifyUnlessQuiet('onSettle', { actionId, failure: null })
      if (typeof console !== 'undefined' && console.debug) {
        console.debug('mateu: respuesta descartada — su pantalla ya no está', actionId, url)
      }
      throw staleResponseError(actionId)
    }
    let attempt = 0
    let reauthenticated = false
    for (;;) {
      try {
        const res = await sendOnce(url, withAuth(), options.timeoutMillis)
        if (!isolated) connectivity.noteReachable()
        if (isViewStale(view)) dropStale()
        notifyUnlessQuiet('onSettle', { actionId, failure: null })
        return res
      } catch (error) {
        if (isStaleResponse(error)) throw error
        // su pantalla ya no está: ni reautenticar, ni reintentar, ni banda
        if (isViewStale(view)) dropStale()
        // Un 401 es, casi siempre, el token caducado entre dos refrescos. Se pide a la página que
        // reautentique y se reenvía UNA vez: el servidor rechazó la petición sin ejecutarla, así
        // que repetirla es seguro también para una escritura. Sin nadie que reautentique, o si el
        // reintento vuelve a dar 401, falla como siempre.
        if (error && error.status === 401 && !reauthenticated) {
          reauthenticated = true
          if (await askForReauthentication(sentToken)) continue
        }
        const failure = classifyRequestFailure(error, { online: connectivity.isOnline() })
        if (failure.kind === 'offline' && !isolated) connectivity.noteUnreachable()
        attempt++
        if (!shouldRetry(failure, attempt, { idempotent })) {
          // El error viaja CLASIFICADO: la UI enseña `failure.message` en vez de "Failed to
          // fetch", y decide si ofrecer reintentar.
          error.failure = failure
          notifyUnlessQuiet('onSettle', { actionId, failure })
          // al log del servidor (clientLog.mjs): lo que el usuario vio y lo que hubo debajo. Un
          // 'cancelled' no se informa, y la llamada al propio endpoint no pasa por aquí.
          clientErrors.report({
            kind: failure.kind,
            message: failure.message,
            status: failure.status,
            detail: error && error.message,
            url,
            actionId,
            traceparent: traceparentOf(init),
          })
          throw error
        }
        await delay(retryDelayMs(attempt))
      }
    }
  }


  // Accesibilidad del renderer VB — la parte que NO traen los componentes oj-*.
  //
  // Medido antes de escribir nada (axe-core sobre la app servida): la composición de oj-sp-*
  // sale prácticamente limpia, igual que pasaba con Vaadin, porque esos componentes traen su
  // propia accesibilidad. Los huecos reales son los de una SPA, que axe no puede evaluar:
  // al cambiar de ruta no cambia la página, así que un lector de pantalla no tiene NADA que
  // anunciar y el foco se queda donde estaba — normalmente en el enlace del menú que se acaba
  // de pulsar, obligando a tabular por toda la shell para llegar al contenido pedido.
  //
  // Vive en poc/ (fuente única) para que make-amd.mjs lo empaquete en el bridge y la app lo
  // use desde las chains, igual que el resto del core.

  // ── región viva ──────────────────────────────────────────────────────────────────────────

  const REGION_STYLE = [
    'position:absolute', 'width:1px', 'height:1px', 'margin:-1px', 'padding:0',
    'overflow:hidden',
    // clip, NO display:none ni visibility:hidden: esas dos sacan el nodo del árbol de
    // accesibilidad, que es justo lo contrario de lo que hace falta aquí.
    'clip:rect(0 0 0 0)', 'clip-path:inset(50%)', 'white-space:nowrap', 'border:0',
  ].join(';')

  const regions = {}

  function regionFor(politeness) {
    if (typeof document === 'undefined' || !document.body) return null
    const existing = regions[politeness]
    if (existing && existing.isConnected) return existing
    const region = document.createElement('div')
    region.setAttribute('aria-live', politeness)
    region.setAttribute('aria-atomic', 'true')
    region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
    region.setAttribute('data-mateu-live-region', politeness)
    region.style.cssText = REGION_STYLE
    document.body.appendChild(region)
    regions[politeness] = region
    return region
  }

  /**
   * Crea las regiones por adelantado.
   *
   * No es opcional: una región creada y rellenada en el mismo tick a menudo NO se anuncia,
   * porque la tecnología asistiva vigila mutaciones de regiones que ya conocía.
   */
  function installAnnouncer() {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', installAnnouncer, { once: true })
      return
    }
    regionFor('polite')
    regionFor('assertive')
  }

  /**
   * Dice `message` a la tecnología asistiva. No pinta nada.
   *
   * `assertive` interrumpe y es para lo que el usuario no puede perderse (un guardado que
   * falló); `polite` espera una pausa y es para lo rutinario (dónde acaba de aterrizar). Usar
   * assertive para todo hace la app inusable, así que es opt-in.
   */
  function announce(message, options = {}) {
    const text = (message == null ? '' : String(message)).trim()
    if (!text) return
    const region = regionFor(options.politeness || 'polite')
    if (!region) return
    if (region.textContent === text) {
      // Repetir el mismo mensaje es un caso real (dos guardados fallidos seguidos) y una
      // región cuyo texto no cambia no anuncia nada: se limpia y se repone.
      region.textContent = ''
      setTimeout(() => { region.textContent = text }, 60)
      return
    }
    region.textContent = text
  }

  // ── foco tras navegar ────────────────────────────────────────────────────────────────────

  /**
   * Lleva el foco al contenido recién cargado.
   *
   * Se busca el primer encabezado del área de contenido; si no hay, el propio contenedor, al
   * que se le da `tabindex="-1"` para que pueda recibir foco por programa sin añadir una
   * parada de tabulación propia.
   */
  function focusContent() {
    if (typeof document === 'undefined') return false
    const root = document.querySelector('#vbRouterContent') || document.querySelector('.oj-web-applayout-content-nopad')
    if (!root) return false

    // Candidatos en orden de preferencia. El encabezado tiene que llevar TEXTO: la shell pinta
    // un <h1> vacío hasta que llega el título, y un encabezado vacío no es focusable (ni sería
    // útil anunciarlo) — el intento fallaba en silencio y el foco se quedaba donde estaba.
    const headings = [...root.querySelectorAll('h1, h2, [role="heading"]')]
      .filter((h) => (h.textContent || '').trim().length > 0)
    const candidates = [...headings, root]

    for (const target of candidates) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      try { target.focus({ preventScroll: true }) } catch (e) { target.focus() }
      // Comprobar que PRENDIÓ: focus() sobre un elemento sin caja no hace nada y no avisa.
      if (document.activeElement === target || (document.activeElement && target.contains(document.activeElement))) {
        return true
      }
    }
    return false
  }

  let hasNavigated = false

  /**
   * Anuncia la llegada a una pantalla y deja el foco en ella.
   *
   * Dos límites deliberados, y los dos importan:
   *
   *  - Sólo en navegaciones REALES. Un re-render no debe tocar el foco: se lo arrancaría al
   *    usuario del campo que está editando.
   *  - NUNCA en la primera carga. Ahí el documento ya empieza arriba, y llevar el foco al
   *    contenido deja el enlace de salto por DETRÁS del punto de partida: el primer tabulador
   *    del usuario ya no lo alcanza y el menú queda sólo a base de Shift+Tab. Se anuncia el
   *    título igualmente, que es lo que aporta valor en esa primera pantalla.
   */
  function announceNavigation(title) {
    announce(title)
    if (hasNavigated && !focusIsInChat(typeof document === 'undefined' ? null : document.activeElement)) focusContentSoon()
    hasNavigated = true
  }

  /**
   * Whether the focus is in the AI chat panel. A screen the assistant opened (its answer navigates)
   * must not take the focus from the chat: the person is still talking to it, and moving the focus to
   * the new screen's heading left them clicking back into the message box after every answer. The
   * title is still announced.
   */
  function focusIsInChat(activeElement) {
    return !!(activeElement && typeof activeElement.closest === 'function' && activeElement.closest('#mateuChatPanel'))
  }

  /**
   * Intenta llevar el foco al contenido durante unos cuantos frames.
   *
   * VB actualiza los bindings de forma asíncrona: en el momento en que la chain de navegación
   * termina, el contenido nuevo AÚN NO está en el DOM. Enfocar ahí prende sobre el contenido
   * viejo y se pierde en cuanto se reemplaza — que es exactamente lo que pasaba. Se reintenta
   * hasta que prenda, o se abandona: mejor no mover el foco que dejarlo en un sitio raro.
   */
  function focusContentSoon(framesLeft = 12) {
    if (typeof requestAnimationFrame === 'undefined') { focusContent(); return }
    requestAnimationFrame(() => {
      if (focusContent()) return
      if (framesLeft > 0) focusContentSoon(framesLeft - 1)
    })
  }

  /** Test seam: olvida que ya se navegó. */
  function resetNavigationState() { hasNavigated = false }

  // ── salto al contenido ───────────────────────────────────────────────────────────────────

  /**
   * Monta el enlace "saltar al contenido" como PRIMER elemento del body (WCAG 2.4.1).
   *
   * Cada pantalla empieza por el mismo menú. Sin una vía para saltarlo, quien navega con
   * teclado paga ese menú entero en cada pantalla antes de llegar a lo que venía a hacer.
   *
   * Oculto por transform y no por display:none, porque un elemento con display:none no puede
   * recibir foco — y entonces el enlace sería inalcanzable, que es justo lo contrario.
   */
  function mountSkipLink(label = 'Saltar al contenido') {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => mountSkipLink(label), { once: true })
      return
    }
    if (document.querySelector('.mateu-skip-link')) return
    const link = document.createElement('button')
    link.className = 'mateu-skip-link'
    link.textContent = label
    link.addEventListener('click', focusContent)
    document.body.insertBefore(link, document.body.firstChild)
  }

  // ── estado de ocupado en el control pulsado ──────────────────────────────────────────────

  /**
   * Marca ocupado el control que el usuario pulsó, mientras su acción está en vuelo.
   *
   * La barra global responde a "¿está ocupada la app?", pero la pregunta que se hace quien está
   * en una conexión lenta es "¿se ha enterado de mi clic?". Sin esto pulsa Guardar, no cambia
   * nada, y vuelve a pulsar.
   *
   * Anima la OPACIDAD del propio elemento y no dibuja un spinner en ::after: sobre un shadow
   * host el pseudo-elemento no se pinta (comprobado en los renderers web con un
   * `inset:0;background:red` sobre un vaadin-button vivo), y no hay garantía de que los
   * componentes de JET no lo sean.
   */
  function markPending(element) {
    if (!element || !element.setAttribute) return
    if (element.hasAttribute('data-mateu-pending')) return
    element.setAttribute('data-mateu-pending', '')
    element.setAttribute('aria-busy', 'true')
  }

  function clearPending(element) {
    if (!element || !element.removeAttribute) return
    element.removeAttribute('data-mateu-pending')
    element.removeAttribute('aria-busy')
  }

  /**
   * El control realmente pulsado a partir del evento, o null si no lo hay.
   *
   * Sólo se decora una lista CERRADA de cosas con pinta de botón: atenuar un contenedor (una
   * tabla, un formulario entero) sería peor que no mostrar nada, y una acción puede dispararse
   * desde cualquier sitio — un trigger, un atajo, el clic de una fila.
   */
  const INTERACTIVE = 'oj-button, oj-menu-button, oj-c-button, button, [role="button"], a[href]'

  function pressedControl(event) {
    const target = event && (event.target || event.currentTarget)
    if (!target || !target.closest) return null
    return target.closest(INTERACTIVE)
  }

  /**
   * Sigue el control pulsado a nivel de DOCUMENTO y lo marca mientras haya trabajo en vuelo.
   *
   * Enhebrar el evento por cada chain no vale: los botones de la app pasan por chains
   * distintas (toolbar, listado, wizard, isla…) y cualquiera nueva se olvidaría de hacerlo. En
   * cambio el clic siempre pasa por el documento, y el transporte siempre avisa de cuándo
   * empieza y acaba — así que emparejar las dos señales cubre todos los caminos, incluidos los
   * que aún no existen.
   *
   * La ventana de gracia evita marcar un control por trabajo que no desencadenó él (un trigger
   * OnLoad, un autosave): sólo cuenta si la petición sale justo detrás del clic.
   */
  const PRESS_GRACE_MS = 400
  let lastPress = { control: null, at: 0 }
  let markedControl = null

  function trackPressedControls() {
    if (typeof document === 'undefined') return
    document.addEventListener('click', (e) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : []
      const origin = path[0] || e.target
      const control = origin && origin.closest ? origin.closest(INTERACTIVE) : null
      lastPress = { control, at: Date.now() }
    }, true)
  }

  /** Llamar desde el hook onStart del transporte. */
  function markPressedControlBusy() {
    if (!lastPress.control) return
    if (Date.now() - lastPress.at > PRESS_GRACE_MS) return
    markedControl = lastPress.control
    markPending(markedControl)
  }

  /** Llamar desde el hook onSettle. */
  function clearPressedControlBusy() {
    clearPending(markedControl)
    markedControl = null
  }

  // ── reintento a nivel de chain ───────────────────────────────────────────────────────────

  /**
   * Qué hay que rehacer tras un fallo.
   *
   * Se guarda un DESCRIPTOR, no un cierre. Un cierre atrapa el `context` de VB de la ejecución
   * que falló, y ese contexto ya no sirve cuando el usuario pulsa Reintentar un segundo después:
   * la llamada no hace nada y falla en silencio (me pasó). Con un descriptor, quien reintenta
   * usa SU contexto, que está vivo.
   *
   * Reenviar sólo la petición tampoco valdría: una respuesta que nadie procesa no cambia nada en
   * pantalla — la misma lección que en los renderers web. Por eso lo que se rehace es la acción
   * o la navegación ENTERA.
   */
  let lastRetry = null

  /** `{ kind: 'navigate', route }` o `{ kind: 'action', actionId, parameters }`. */
  function setLastRetry(descriptor) {
    lastRetry = descriptor && descriptor.kind ? descriptor : null
  }

  function hasLastRetry() { return !!lastRetry }

  /** Devuelve el descriptor y lo olvida: un reintento se ofrece una vez. */
  function takeLastRetry() {
    const descriptor = lastRetry
    lastRetry = null
    return descriptor
  }

  // ── campos obligatorios ───────────────────────────────────────────────────────────────────

  /** Los widgets de un campo del formulario de la página (no los de un diálogo o un drawer). */
  function fieldElementsOf(fieldId) {
    if (typeof document === 'undefined') return []
    // comparando el atributo, sin montar un selector con el id: nada que escapar
    return [...document.querySelectorAll('[data-field-id]')]
      .filter((el) => el.getAttribute('data-field-id') === String(fieldId))
      .filter((el) => !el.closest('oj-dialog, oj-drawer-popup, oj-sp-general-drawer-template, oj-sp-create-edit-drawer-template'))
  }

  /**
   * Marca los obligatorios vacíos como lo hace un formulario Redwood y lleva el foco al primero.
   *
   * El mensaje es el del propio componente: `validate()` corre su validador de obligatorio (el
   * `required` que ya pinta «Obligatorio» bajo el campo) y enseña su texto — «Introduzca un
   * valor.», en el idioma de JET —, igual que al salir de un campo vacío. Si un componente no se
   * da por inválido (su valor no ha llegado aún al widget), el mensaje va por `messagesCustom`.
   * Devuelve cuántos campos marcó.
   */
  async function showFieldErrors(fieldIds, fallbackMessage) {
    let first = null
    let marked = 0
    for (const fieldId of fieldIds || []) {
      for (const el of fieldElementsOf(fieldId)) {
        let invalid = false
        if (typeof el.validate === 'function') {
          try { invalid = (await el.validate()) === 'invalid' } catch (ignored) { invalid = false }
        }
        if (!invalid) {
          if ('messagesCustom' in el || typeof el.validate === 'function') {
            try {
              el.messagesCustom = [{ severity: 'error', summary: fallbackMessage || 'Enter a value.', detail: '' }]
            } catch (ignored) { /* no es un componente JET */ }
          } else {
            // un campo que no es un componente JET (los chips de un @Searchable): el mensaje lo
            // pinta su CSS (.mateu-field-error + data-error) hasta que se vuelva a tocar
            el.setAttribute('data-error', fallbackMessage || 'Enter a value.')
            el.classList.add('mateu-field-error')
          }
        }
        marked++
        if (!first) first = el
      }
    }
    if (first) {
      try { first.scrollIntoView({ block: 'center' }) } catch (ignored) { /* jsdom */ }
      const input = first.querySelector && first.querySelector('input, textarea, [tabindex="0"]')
      try { (input || first).focus() } catch (ignored) { /* sin caja */ }
    }
    return marked
  }

  /** Quita las marcas de error de los campos que no son componentes JET (ver showFieldErrors). */
  function clearFieldErrorMarks(fieldId) {
    if (typeof document === 'undefined') return
    for (const el of document.querySelectorAll('.mateu-field-error')) {
      if (fieldId == null || el.getAttribute('data-field-id') === String(fieldId)) {
        el.classList.remove('mateu-field-error')
        el.removeAttribute('data-error')
      }
    }
  }

  /** Al editar un campo marcado, su mensaje propio se va (el del validador lo gestiona JET). */
  function clearFieldError(element) {
    if (element && Array.isArray(element.messagesCustom) && element.messagesCustom.length) {
      element.messagesCustom = []
    }
  }

  let guidedProcessGuarded = false

  /**
   * El guided process (oj-sp-guided-process) avanza SOLO al pulsar Continue o un paso del rail,
   * antes de saber si Mateu deja salir del paso: sus eventos spBeforeNext/spBeforeStepNavigate se
   * pueden cancelar, pero sólo en el momento, y las chains de VB corren después. Aquí se cancelan
   * siempre, en captura (no burbujean: la captura los ve igual), y el paso que se enseña lo manda
   * el servidor (current-step ← el paso del wire tras cada acción): si el paso no valida, el
   * proceso no se mueve. Las chains siguen recibiendo el evento y lanzan la acción.
   */
  function guardGuidedProcess() {
    if (guidedProcessGuarded || typeof document === 'undefined') return
    guidedProcessGuarded = true
    const cancel = (event) => {
      const target = event.target
      if (target && target.id === 'mateuWizardEl') event.preventDefault()
    }
    document.addEventListener('spBeforeNext', cancel, true)
    document.addEventListener('spBeforeStepNavigate', cancel, true)
    relaxGuidedProcessOverview()
  }

  /**
   * La consulta con la que oj-sp-guided-process decide si su OVERVIEW (la portada con un panel por
   * paso) va en columna: «(max-width: 767px), (max-height: 767px)». Pensada para un guided process a
   * pantalla completa, apila los paneles en cuanto la ventana es estrecha O baja — un portátil con la
   * ventana a menos de 768px de alto ya ve los pasos uno debajo de otro. Con app.css los paneles se
   * reparten el ancho del contenido (una fila; otra sólo si de verdad no caben), así que la columna
   * se reserva al teléfono (RDS: < 600px). Cualquier otra consulta pasa intacta.
   */
  const GUIDED_PROCESS_VERTICAL_QUERY = '(max-width: 767px), (max-height: 767px)'
  const GUIDED_PROCESS_PHONE_QUERY = '(max-width: 599px)'

  function guidedProcessMediaQuery(query) {
    const normalized = String(query == null ? '' : query).replace(/\s+/g, ' ').trim()
    return normalized === GUIDED_PROCESS_VERTICAL_QUERY ? GUIDED_PROCESS_PHONE_QUERY : query
  }

  /**
   * La rueda del ratón sobre el overview: el componente la convierte SIEMPRE en scroll horizontal
   * (preventDefault), porque en su diseño los paneles desbordan a lo ancho. Repartidos a lo ancho ya
   * no desbordan, y robarle la rueda a la página sólo impediría bajar (p.ej. a la 2ª fila). Se le
   * deja el gesto al componente sólo si su contenedor de pasos aún desborda a lo ancho.
   */
  function guidedProcessWheelIsNative(stepContainer) {
    if (!stepContainer) return false
    return stepContainer.scrollWidth <= stepContainer.clientWidth + 1
  }

  let guidedProcessOverviewRelaxed = false

  function relaxGuidedProcessOverview() {
    if (guidedProcessOverviewRelaxed || typeof window === 'undefined' || typeof document === 'undefined') return
    guidedProcessOverviewRelaxed = true
    if (typeof window.matchMedia === 'function') {
      const original = window.matchMedia.bind(window)
      window.matchMedia = (query) => original(guidedProcessMediaQuery(query))
    }
    document.addEventListener('wheel', (event) => {
      const target = event.target
      const wizard = target && target.closest ? target.closest('#mateuWizardEl') : null
      if (!wizard) return
      const steps = wizard.querySelector('.oj-sp-guided-process-step-container')
      if (steps && steps.contains(target) && guidedProcessWheelIsNative(steps)) event.stopPropagation()
    }, { capture: true, passive: true })
  }


  // Montaje de COMPONENTES WEB de terceros (átomo isElement): el wire trae la etiqueta, sus
  // atributos y la URL del módulo que la define. Vive fuera del reducer porque toca el DOM.
  //
  // Por qué no se puede pintar en la plantilla: VB no sabe escribir `<{name}>`. Y por qué no se
  // recrea en cada render: un componente web guarda estado que el servidor no conoce —el zoom y la
  // selección de un grafo, un layout ya calculado—, así que se crea UNA vez por hueco y en los
  // renders siguientes solo se le reescriben los atributos. Mismo criterio que el renderer web
  // compartido (libs/mateu elementRenderer).

  const loaded = {}

  // ── eventos del componente → acción en el servidor ─────────────────────────────────────────────
  // `Element.on` = { nombreDeEvento: actionId }. Es la vía de escape oficial (un grafo, un editor,
  // un plano de planta de terceros), así que su ida y vuelta tiene que funcionar entera: el evento
  // viaja como parámetro `event` de la acción, igual que en el renderer web compartido —el
  // `detail` de un CustomEvent, o las propiedades primitivas de cualquier otro evento—. La app
  // registra un sumidero (setElementEventSink) que sabe en qué superficie se ejecuta la acción;
  // sin sumidero (Node, tests) los eventos se ignoran.

  let sink = null
  let moduleBase = ''

  /** Base del backend Mateu (la constante mateuBaseUrl): un `import` RELATIVO lo sirve el backend,
   *  no la app VB — en VB alojado en Oracle o en vb-serve son orígenes distintos. '' = mismo origen. */
  function setElementModuleBase(base) {
    moduleBase = String(base || '').replace(/\/$/, '')
  }

  /** La URL de la que se carga el módulo de un Element. */
  function elementModuleUrl(importUrl, base = moduleBase) {
    if (!importUrl) return ''
    if (/^[a-z][a-z0-9+.-]*:/i.test(importUrl) || importUrl.startsWith('//')) return importUrl
    const root = String(base || '').replace(/\/+$/, '')
    return root ? root + (importUrl.startsWith('/') ? '' : '/') + importUrl : importUrl
  }

  /** La app VB registra aquí quién ejecuta la acción de un evento: (actionId, parameters, atom). */
  function setElementEventSink(fn) {
    sink = typeof fn === 'function' ? fn : null
  }

  /** El evento tal como viaja al servidor (mismo criterio que libs/mateu elementRenderer). */
  function serializeElementEvent(e) {
    if (e == null) return null
    if (typeof CustomEvent !== 'undefined' && e instanceof CustomEvent) return e.detail
    if (e.detail !== undefined && e.constructor && e.constructor.name === 'CustomEvent') return e.detail
    const out = {}
    for (const k in e) {
      const v = e[k]
      if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v
    }
    return out
  }

  /** Engancha UNA vez cada evento declarado; la acción se lee al dispararse (la del último render),
   *  así un re-render que cambia `on` no duplica listeners ni deja el actionId viejo. */
  function wireElementEvents(element, atom) {
    element.__mateuAtom = atom
    const wired = element.__mateuWired || (element.__mateuWired = {})
    for (const eventName of Object.keys(atom.on || {})) {
      if (wired[eventName]) continue
      wired[eventName] = true
      element.addEventListener(eventName, (e) => {
        const current = element.__mateuAtom || {}
        const actionId = (current.on || {})[eventName]
        if (!actionId || !sink) return
        sink(actionId, { event: serializeElementEvent(e) }, current)
      })
    }
  }

  // ── HTML con DATOS: saneado ────────────────────────────────────────────────────────────────────
  // El contenido escrito en la definición se confía tal cual; en cuanto `${…}` ha metido datos en
  // él se sanea (sin scripts, sin manejadores on…, sin URLs javascript:) — XSS almacenado. El
  // renderer web lo hace con DOMPurify; aquí no hay dependencias, así que un saneado por DOM con
  // las mismas reglas.
  const DROP_TAGS = /^(script|iframe|object|embed|link|meta|base|frame|frameset|noscript)$/i
  const URL_ATTRS = /^(href|src|xlink:href|action|formaction|background|poster)$/i

  function sanitizeHtml(html, doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || html == null) return html == null ? '' : String(html)
    const tpl = doc.createElement('template')
    tpl.innerHTML = String(html)
    const walk = (root) => {
      for (const el of [...root.querySelectorAll('*')]) {
        if (DROP_TAGS.test(el.tagName)) { el.remove(); continue }
        for (const attr of [...el.attributes]) {
          const name = attr.name
          const value = String(attr.value || '').replace(/[\s\u0000-\u001f]/g, '').toLowerCase()
          if (/^on/i.test(name)
            || (URL_ATTRS.test(name) && (value.startsWith('javascript:') || value.startsWith('vbscript:')
              || (value.startsWith('data:') && !value.startsWith('data:image/'))))
            || (name === 'srcdoc')) el.removeAttribute(name)
        }
      }
    }
    walk(tpl.content)
    return tpl.innerHTML
  }

  /**
   * Carga el módulo que define la etiqueta, una sola vez. El elemento se puede crear antes: los
   * componentes web se "actualizan" solos en cuanto su definición llega.
   *
   * Se inyecta un `<script type="module">` en vez de usar `import(url)` porque el build de VB
   * transpila el import dinámico a un `require()` de AMD, y requirejs se pone a resolver la URL
   * como si fuera un id de módulo suyo: la petición no llega a salir y el hueco se queda vacío
   * sin un solo error. Un script de módulo no lo puede reescribir nadie.
   */
  function ensureDefined(name, importUrl) {
    if (!importUrl || !name || name.indexOf('-') < 0) return
    if (loaded[importUrl]) return
    if (typeof customElements !== 'undefined' && customElements.get(name)) return
    if (typeof document === 'undefined') return
    loaded[importUrl] = true
    const script = document.createElement('script')
    script.type = 'module'
    script.src = importUrl
    // que un componente de terceros no cargue no puede tumbar la pantalla: el hueco se queda
    // vacío y el resto del contenido sigue ahí
    script.addEventListener('error', () => { loaded[importUrl] = false })
    document.head.appendChild(script)
  }

  function hydrate(element, atom) {
    for (const key of Object.keys(atom.attributes || {})) {
      // setAttribute sobre el que YA está, nunca sobre uno nuevo: el componente lo convierte en
      // cambio de propiedad y se repinta conservando lo suyo
      element.setAttribute(key, atom.attributes[key])
    }
    if (atom.style) element.setAttribute('style', atom.style)
    if (atom.cssClasses) element.setAttribute('class', atom.cssClasses)
    if (atom.content) {
      if (atom.asHtml) element.innerHTML = atom.dataInContent ? sanitizeHtml(atom.content) : atom.content
      else element.textContent = atom.content
    }
    wireElementEvents(element, atom)
  }

  /** Hidrata los huecos `.mateu-element` que haya en el documento. Devuelve cuántos quedaron
   *  montados, para que quien reintenta sepa si ya está. */
  function mountElements(atoms) {
    const byId = {}
    for (const atom of atoms || []) byId[atom.elementId] = atom
    let mounted = 0
    const holes = typeof document === 'undefined'
      ? [] : document.querySelectorAll('.mateu-element[data-element-id]')
    for (const hole of holes) {
      const atom = byId[hole.getAttribute('data-element-id')]
      if (!atom) continue
      ensureDefined(atom.name, elementModuleUrl(atom.importUrl))
      let element = hole.firstElementChild
      if (!element || element.tagName.toLowerCase() !== atom.name.toLowerCase()) {
        hole.textContent = ''
        element = document.createElement(atom.name)
        hole.appendChild(element)
      }
      hydrate(element, atom)
      mounted += 1
    }
    return mounted
  }

  /** Igual, pero esperando a que VB pinte: sus bindings se actualizan de forma ASÍNCRONA, así que
   *  al terminar la chain el hueco todavía no está en el DOM (la misma trampa que costó el foco
   *  del contenido en la accesibilidad). */
  function mountElementsSoon(atoms, frames = 12) {
    const pending = (atoms || []).filter((a) => a && a.isElement)
    if (!pending.length || typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => {
      if (mountElements(pending) >= pending.length) return
      left -= 1
      if (left > 0) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  /** Los átomos isElement de una proyección de bloques (los que hay que montar). */
  function elementAtomsOf(blocks) {
    const out = []
    for (const block of blocks || []) {
      for (const atom of block.items || []) if (atom && atom.isElement) out.push(atom)
    }
    return out
  }

  /** Los átomos isElement del CONTENIDO de un foldout (overview + cada panel): un Element en un
   *  panel (p.ej. la tabla «In other systems» de una reserva, HTML del servidor) se quedaba sin
   *  montar — el panel salía en blanco — porque sólo se montaban los del contenido del host. */
  function foldoutElementAtomsOf(content) {
    if (!content) return []
    const out = elementAtomsOf((content.overview || {}).blocks)
    for (const panel of content.panels || []) out.push(...elementAtomsOf(panel && panel.blocks))
    return out
  }


  // BANDEJA DE NOTIFICACIONES y TOASTS CON DESHACER en la shell VB.
  //
  // Bandeja (NotificationsSupplier del App): la campana de la cabecera con el número de no leídas
  // abre un oj-popup con un oj-list-view; activar una entrada la marca leída y navega a su ruta, y
  // «Mark all read» las marca todas. Habla con las acciones app-level de siempre
  // (_notifications-list / _notifications-read, route '' + serverSideType del App).
  //
  // Deshacer (Message.undoable → MessageDto.undo*): oj-sp-messages-toast no admite acciones, así que
  // esos mensajes salen por el oj-messages de JET (display="notification") con un oj-message cuyo
  // slot «detail» — el que JET reserva para enlaces y botones — lleva el oj-button «Undo». Se monta
  // desde applyDomEffects (fuera de Knockout: data-oj-binding-provider="none") y se quita de la
  // lista de toasts normales, así que ninguna chain lo pinta dos veces.

  /** La lista _notifications de la respuesta (Data del servidor), o null. */
  function notificationListOf(increment) {
    for (const fr of (increment && increment.fragments) || []) {
      if (fr && fr.data && Array.isArray(fr.data._notifications)) return fr.data._notifications
    }
    return null
  }

  let notificationsProviderFactory = null
  function setNotificationsProviderFactory(f) { notificationsProviderFactory = f }

  /** El modelo de la campana: no leídas (y su insignia), y las entradas listas para la lista. */
  function notificationsOf(list) {
    const items = (list || []).map((n, i) => ({
      _rowNumber: i,
      id: String(n.id),
      title: n.title || '',
      text: n.text || '',
      when: n.when || '',
      route: n.route || '',
      unread: n.unread !== false,
      titleClass: 'oj-typography-body-md' + (n.unread !== false ? ' oj-typography-bold' : ''),
    }))
    const unread = items.filter((n) => n.unread).length
    return {
      enabled: true,
      unread,
      badge: unread > 9 ? '9+' : String(unread),
      hasUnread: unread > 0,
      label: unread ? 'Notifications, ' + unread + ' unread' : 'Notifications',
      empty: items.length === 0,
      items,
      provider: notificationsProviderFactory ? notificationsProviderFactory(items) : null,
    }
  }

  /** Pide la lista (o marca leídas `ids` — una lista, o 'all' — y pide la lista). */
  async function fetchNotifications(base, serverSideType, appState, ids) {
    const increment = await callMateu(base, {
      route: '',
      actionId: ids ? '_notifications-read' : '_notifications-list',
      componentState: {},
      parameters: ids ? { ids } : {},
      serverSideType: serverSideType || undefined,
      appState: appState || {},
    })
    return notificationsOf(notificationListOf(increment) || [])
  }

  // ── toasts con «Undo» ─────────────────────────────────────────────────────────────────────────
  let undoSink = null
  function setUndoSink(fn) { undoSink = typeof fn === 'function' ? fn : null }

  /** Separa de los toasts los que se pueden deshacer (in situ: las chains leen la misma lista). */
  function takeUndoToasts(effects) {
    if (!effects || !Array.isArray(effects.toasts)) return []
    const undo = effects.toasts.filter((t) => t && t.undoActionId)
    if (undo.length) {
      const rest = effects.toasts.filter((t) => !(t && t.undoActionId))
      effects.toasts.splice(0, effects.toasts.length, ...rest)
    }
    return undo
  }

  /** El objeto message de oj-message para un toast con deshacer. */
  function undoMessageOf(toast) {
    return {
      severity: toast.variant === 'error' ? 'error' : toast.variant === 'warning' ? 'warning' : 'confirmation',
      summary: toast.text || '',
      autoTimeout: 10000,
      closeAffordance: 'defaults',
    }
  }

  function showUndoToasts(toasts, doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || !toasts || !toasts.length) return
    let host = doc.getElementById('mateuUndoMessages')
    if (!host) {
      const wrap = doc.createElement('div')
      wrap.setAttribute('data-oj-binding-provider', 'none')
      host = doc.createElement('oj-messages')
      host.id = 'mateuUndoMessages'
      host.setAttribute('display', 'notification')
      host.setAttribute('position', '{"my": {"vertical": "bottom", "horizontal": "center"}, "at": {"vertical": "bottom", "horizontal": "center"}, "of": "window"}')
      wrap.appendChild(host)
      doc.body.appendChild(wrap)
    }
    for (const toast of toasts) {
      const msg = doc.createElement('oj-message')
      msg.message = undoMessageOf(toast)
      const detail = doc.createElement('div')
      detail.setAttribute('slot', 'detail')
      const button = doc.createElement('oj-button')
      button.setAttribute('chroming', 'borderless')
      button.className = 'mateu-undo-button'
      button.textContent = toast.undoLabel || 'Undo'
      button.addEventListener('ojAction', () => {
        if (undoSink) undoSink(toast.undoActionId, toast.undoParameters || {}, {})
        if (typeof msg.close === 'function') msg.close()
      })
      detail.appendChild(button)
      msg.appendChild(detail)
      // cerrado (por el usuario o por tiempo), fuera del DOM
      msg.addEventListener('ojClose', () => { if (msg.parentNode) msg.parentNode.removeChild(msg) })
      host.appendChild(msg)
    }
  }


  // Efectos de DOM que el reducer (puro) solo DESCRIBE: descargar un fichero y abrir una URL en
  // otra pestaña. Antes `effects.download` se calculaba y nadie lo leía — el CSV de un listado o
  // el PDF de un folio llegaban al navegador y se perdían. Cada chain que reduce un increment
  // llama a applyDomEffects(reg.effects) justo después: es el ÚNICO sitio donde estos efectos
  // tocan el documento.
  //
  // `env` (window por defecto) se inyecta para poder probarlo en Node sin DOM.

  /** DownloadFile del wire → { filename, mimeType, base64Content } o null si no hay contenido. */
  function fileDownloadOf(data) {
    if (!data || typeof data !== 'object' || !data.base64Content) return null
    return {
      filename: data.filename || 'export',
      mimeType: data.mimeType || 'application/octet-stream',
      base64Content: String(data.base64Content),
    }
  }

  function base64ToBytes(b64, atobFn = globalThis.atob) {
    const bin = atobFn(b64)
    const bytes = new Uint8Array(bin.length)
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
    return bytes
  }

  /** Descarga un DownloadFile: Blob + <a download> anclado al body (Safari/Firefox ignoran el
   *  click de un enlace suelto) y el object URL se libera DESPUÉS (revocarlo en el mismo tick
   *  cancela la descarga en Firefox). */
  function triggerDownload(data, env = globalThis) {
    const file = fileDownloadOf(data)
    if (!file || !env.document) return false
    const blob = new env.Blob([base64ToBytes(file.base64Content, env.atob)], { type: file.mimeType })
    const url = env.URL.createObjectURL(blob)
    const a = env.document.createElement('a')
    a.href = url
    a.download = file.filename
    a.rel = 'noopener'
    a.style.display = 'none'
    env.document.body.appendChild(a)
    a.click()
    a.remove()
    env.setTimeout(() => env.URL.revokeObjectURL(url), 1000)
    return true
  }

  // lo que la app quiere hacer con el registro recién reducido (las reglas del cliente toman de ahí
  // su contexto: reglas + estado del host)
  let afterReduce = null
  function setAfterReduceHook(fn) { afterReduce = typeof fn === 'function' ? fn : null }

  /** Aplica los efectos de DOM de una reducción. Devuelve cuántas descargas ha lanzado. */
  function applyDomEffects(effects, reg, env = globalThis) {
    if (reg && reg.contexts && afterReduce) afterReduce(reg)
    if (!effects) return 0
    let n = 0
    for (const d of effects.downloads || (effects.download ? [effects.download] : []))
      if (triggerDownload(d, env)) n++
    // los toasts con «Undo» salen por el oj-message de JET (notify.mjs), no por el toast normal
    const undo = takeUndoToasts(effects)
    if (undo.length && env && env.document) showUndoToasts(undo, env.document)
    return n
  }


  // Campos de CAPTURA de un formulario (fichero, imagen, firma, cámara) para los que JET/Redwood no
  // trae componente: no hay pad de firma ni cámara en oj-*/oj-sp-*, y oj-file-picker sólo entrega
  // File (el valor de Mateu es un data URI que viaja en el estado, sin endpoint de subida — el mismo
  // contrato que el renderer web). Así que un elemento PROPIO y mínimo, `<mateu-capture-field>`:
  // los botones son oj-button de verdad, el lienzo/vídeo/imagen van con los tokens de Redwood, y el
  // valor sale como `valueChanged` con { value, updatedFrom: 'internal' } — la forma del evento de
  // un componente JET, así que las chains de cambio de campo (hostInputChanged, mateuFieldEdited…)
  // lo tratan como uno más.
  //
  //   <mateu-capture-field mode="signature|camera|file|image" accept="…" readonly value="data:…">
  //
  // Lo puro (cómo se lee un fichero, qué texto enseña) está exportado y probado en Node; lo de DOM
  // se define una vez por documento (defineCaptureField).

  const CAPTURE_TEXTS = {
    en: { clear: 'Clear', accept: 'Accept', signAgain: 'Sign again', remove: 'Remove', take: 'Take photo',
      retake: 'Retake', upload: 'Upload', replace: 'Replace', noCamera: 'Camera unavailable — choose a file',
      empty: 'No file', start: 'Open camera', signHere: 'Sign here' },
    es: { clear: 'Borrar', accept: 'Aceptar', signAgain: 'Volver a firmar', remove: 'Quitar', take: 'Hacer foto',
      retake: 'Repetir', upload: 'Subir', replace: 'Sustituir', noCamera: 'Cámara no disponible — elige un fichero',
      empty: 'Sin fichero', start: 'Abrir cámara', signHere: 'Firme aquí' },
  }

  function captureTexts(lang) {
    return String(lang || '').toLowerCase().startsWith('es') ? CAPTURE_TEXTS.es : CAPTURE_TEXTS.en
  }

  /** ¿El valor es una imagen que se puede enseñar? (data URI de imagen o URL corriente) */
  function isImageValue(value) {
    const v = String(value || '')
    return /^data:image\//i.test(v) || /^(https?:)?\/\/|^\//.test(v)
  }

  /** Un nombre legible para un data URI de fichero (no lo lleva: se enseña el tipo y el tamaño). */
  function describeFileValue(value) {
    const v = String(value || '')
    const m = v.match(/^data:([^;,]+)?(;base64)?,(.*)$/i)
    if (!m) return v ? v.split('/').pop() : ''
    const bytes = m[2] ? Math.floor((m[3].length * 3) / 4) : decodeURIComponent(m[3]).length
    const kb = bytes < 1024 ? bytes + ' B' : (bytes / 1024).toFixed(bytes < 10240 ? 1 : 0) + ' KB'
    return (m[1] || 'file') + ' · ' + kb
  }

  /** Define `<mateu-capture-field>` en `win` (una vez). */
  function defineCaptureField(win = typeof window !== 'undefined' ? window : null) {
    if (!win || !win.customElements || win.customElements.get('mateu-capture-field')) return
    const doc = win.document
    const lang = (doc.documentElement.getAttribute('lang') || win.navigator.language || 'en')
    const t = captureTexts(lang)

    const button = (label, chroming, onAction) => {
      const b = doc.createElement('oj-button')
      // un componente JET creado fuera de Knockout espera un «binding provider» que nunca llega y
      // se queda oculto (visibility:hidden hasta oj-complete): `none` le dice que no lo hay
      b.setAttribute('data-oj-binding-provider', 'none')
      b.setAttribute('chroming', chroming || 'outlined')
      b.className = 'oj-button-sm oj-sm-margin-2x-end'
      b.textContent = label
      b.addEventListener('ojAction', (e) => { e.stopPropagation(); onAction() })
      return b
    }
    const readFile = (file) => new Promise((resolve, reject) => {
      const reader = new win.FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })

    class MateuCaptureField extends win.HTMLElement {
      static get observedAttributes() { return ['value', 'readonly', 'mode', 'accept'] }
      connectedCallback() { this.render() }
      disconnectedCallback() { this.stopCamera() }
      attributeChangedCallback() { if (this.isConnected && !this.busy) this.render() }
      get value() { return this.getAttribute('value') || '' }
      set value(v) { if (v == null || v === '') this.removeAttribute('value'); else this.setAttribute('value', String(v)) }

      emit(value) {
        this.busy = true
        this.value = value
        this.busy = false
        this.dispatchEvent(new win.CustomEvent('valueChanged', {
          detail: { value: value || null, previousValue: null, updatedFrom: 'internal' }, bubbles: true }))
        this.render()
      }

      stopCamera() {
        if (this.stream) { this.stream.getTracks().forEach((track) => track.stop()); this.stream = null }
      }

      pickFile(capture) {
        const input = doc.createElement('input')
        input.type = 'file'
        const mode = this.getAttribute('mode')
        input.accept = this.getAttribute('accept') || (mode === 'file' ? '' : 'image/*')
        if (capture) input.setAttribute('capture', 'environment')
        input.addEventListener('change', async () => {
          const file = input.files && input.files[0]
          if (file) this.emit(await readFile(file))
        })
        input.click()
      }

      render() {
        const mode = this.getAttribute('mode') || 'file'
        const readonly = this.hasAttribute('readonly') && this.getAttribute('readonly') !== 'false'
        const value = this.value
        this.stopCamera()
        this.textContent = ''
        this.classList.add('mateu-capture-field')
        const box = doc.createElement('div')
        box.className = 'mateu-capture-box'
        const actions = doc.createElement('div')
        actions.className = 'oj-sm-margin-2x-top'

        if (value && (mode !== 'file' || isImageValue(value))) {
          const img = doc.createElement('img')
          img.src = value
          img.alt = ''
          img.className = 'mateu-capture-preview' + (mode === 'signature' ? ' mateu-capture-signature' : '')
          box.appendChild(img)
        } else if (value) {
          const span = doc.createElement('span')
          span.className = 'oj-typography-body-md'
          span.textContent = describeFileValue(value)
          box.appendChild(span)
        }

        if (!readonly) {
          if (mode === 'signature' && !value) {
            this.renderPad(box, actions)
          } else if (mode === 'camera' && !value) {
            actions.appendChild(button(t.start, 'callToAction', () => this.openCamera(box, actions)))
            actions.appendChild(button(t.upload, 'outlined', () => this.pickFile(true)))
          } else if (!value) {
            const empty = doc.createElement('span')
            empty.className = 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-end'
            empty.textContent = t.empty
            box.appendChild(empty)
            actions.appendChild(button(t.upload, 'outlined', () => this.pickFile(false)))
          } else {
            const again = mode === 'signature' ? t.signAgain : mode === 'camera' ? t.retake : t.replace
            actions.appendChild(button(again, 'outlined', () => {
              if (mode === 'signature' || mode === 'camera') this.emit(null)
              else this.pickFile(false)
            }))
            actions.appendChild(button(t.remove, 'borderless', () => this.emit(null)))
          }
        } else if (!value) {
          const dash = doc.createElement('span')
          dash.textContent = '—'
          box.appendChild(dash)
        }
        this.appendChild(box)
        if (actions.childNodes.length) this.appendChild(actions)
      }

      renderPad(box, actions) {
        const canvas = doc.createElement('canvas')
        canvas.className = 'mateu-capture-pad'
        canvas.width = 560
        canvas.height = 180
        canvas.setAttribute('aria-label', t.signHere)
        canvas.setAttribute('role', 'img')
        const ctx = canvas.getContext('2d')
        ctx.lineWidth = 2.2
        ctx.lineCap = 'round'
        ctx.strokeStyle = '#161513'
        let drawing = false
        let inked = false
        const at = (e) => {
          const r = canvas.getBoundingClientRect()
          return [(e.clientX - r.left) * (canvas.width / r.width), (e.clientY - r.top) * (canvas.height / r.height)]
        }
        canvas.addEventListener('pointerdown', (e) => {
          drawing = true; inked = true
          canvas.setPointerCapture(e.pointerId)
          const [x, y] = at(e); ctx.beginPath(); ctx.moveTo(x, y)
        })
        canvas.addEventListener('pointermove', (e) => {
          if (!drawing) return
          const [x, y] = at(e); ctx.lineTo(x, y); ctx.stroke()
        })
        const stop = () => { drawing = false }
        canvas.addEventListener('pointerup', stop)
        canvas.addEventListener('pointercancel', stop)
        box.appendChild(canvas)
        actions.appendChild(button(t.accept, 'callToAction', () => { if (inked) this.emit(canvas.toDataURL('image/png')) }))
        actions.appendChild(button(t.clear, 'outlined', () => { ctx.clearRect(0, 0, canvas.width, canvas.height); inked = false }))
      }

      async openCamera(box, actions) {
        const media = win.navigator.mediaDevices
        if (!media || !media.getUserMedia) { this.pickFile(true); return }
        try {
          this.stream = await media.getUserMedia({ video: { facingMode: 'environment' } })
        } catch (e) {
          box.textContent = t.noCamera
          return
        }
        const video = doc.createElement('video')
        video.className = 'mateu-capture-preview'
        video.autoplay = true
        video.playsInline = true
        video.muted = true
        video.srcObject = this.stream
        box.textContent = ''
        box.appendChild(video)
        actions.textContent = ''
        actions.appendChild(button(t.take, 'callToAction', () => {
          const canvas = doc.createElement('canvas')
          canvas.width = video.videoWidth || 640
          canvas.height = video.videoHeight || 480
          canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
          this.stopCamera()
          this.emit(canvas.toDataURL('image/jpeg', 0.85))
        }))
      }
    }
    win.customElements.define('mateu-capture-field', MateuCaptureField)
  }


  // REGLAS DEL CLIENTE (@Hidden(expr), @Disabled(expr), RuleSupplier, @Rule) y campos dependientes
  // en el navegador: sin ida y vuelta al servidor, un campo se oculta, se deshabilita o cambia de
  // valor según otro. Mismo contrato que el renderer web (libs/mateu mateu-component.applyRules):
  // cada regla tiene un `filter` (expresión); si se cumple, su acción escribe en el estado
  // (SetStateValue) o en data (SetDataValue: `campo.hidden`, `campo.disabled`, `campo.required`…),
  // lanza una acción (RunAction) o para (result Stop).
  //
  // Por qué un evaluador propio: el web usa `new Function`, y VB alojado en Oracle corre con una CSP
  // sin 'unsafe-eval' (es la razón de que todo el bridge precalcule flags). Así que un parser de
  // expresiones de JS pequeño y SIN eval: literales, state/data/appState/appData, acceso a
  // propiedad, ! - + * / % < <= > >= == != === !== && || ?: y unos pocos métodos de string/array.
  // Lo que no entiende devuelve undefined (la regla no se cumple) en vez de romper la pantalla.

  const METHODS = {
    includes: (t, a) => (t != null && t.includes ? t.includes(a[0]) : false),
    startsWith: (t, a) => String(t == null ? '' : t).startsWith(a[0]),
    endsWith: (t, a) => String(t == null ? '' : t).endsWith(a[0]),
    indexOf: (t, a) => (t != null && t.indexOf ? t.indexOf(a[0]) : -1),
    toLowerCase: (t) => String(t == null ? '' : t).toLowerCase(),
    toUpperCase: (t) => String(t == null ? '' : t).toUpperCase(),
    trim: (t) => String(t == null ? '' : t).trim(),
    toString: (t) => String(t),
  }

  function tokenize(src) {
    const tokens = []
    let i = 0
    while (i < src.length) {
      const c = src[i]
      if (/\s/.test(c)) { i++; continue }
      if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) {
        let j = i
        while (j < src.length && /[0-9.]/.test(src[j])) j++
        tokens.push({ t: 'num', v: Number(src.slice(i, j)) }); i = j; continue
      }
      if (c === '"' || c === "'") {
        let j = i + 1; let s = ''
        while (j < src.length && src[j] !== c) { if (src[j] === '\\') { s += src[j + 1]; j += 2 } else s += src[j++] }
        tokens.push({ t: 'str', v: s }); i = j + 1; continue
      }
      if (/[A-Za-z_$]/.test(c)) {
        let j = i
        while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++
        tokens.push({ t: 'id', v: src.slice(i, j) }); i = j; continue
      }
      const three = src.slice(i, i + 3); const two = src.slice(i, i + 2)
      if (three === '===' || three === '!==') { tokens.push({ t: 'op', v: three }); i += 3; continue }
      if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) { tokens.push({ t: 'op', v: two }); i += 2; continue }
      if ('+-*/%<>!?:.,()[]'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue }
      throw new Error('carácter inesperado ' + c)
    }
    return tokens
  }

  /** Evalúa una expresión de regla contra `scope` ({ state, data, appState, appData, component }). */
  function evaluateExpression(expr, scope = {}) {
    if (expr == null) return undefined
    const src = String(expr).trim()
    if (src === '') return undefined
    let tokens
    try { tokens = tokenize(src) } catch (e) { return undefined }
    let p = 0
    const peek = (v) => tokens[p] && tokens[p].v === v && tokens[p].t === 'op'
    const take = (v) => { if (peek(v)) { p++; return true } return false }
    const ternary = () => {
      const c = or()
      if (take('?')) { const a = ternary(); take(':'); const b = ternary(); return c ? a : b }
      return c
    }
    const or = () => { let l = and(); while (take('||')) { const r = and(); l = l || r } return l }
    const and = () => { let l = eq(); while (take('&&')) { const r = eq(); l = l && r } return l }
    const eq = () => {
      let l = rel()
      for (;;) {
        // eslint-disable-next-line eqeqeq
        if (take('===')) l = l === rel(); else if (take('!==')) l = l !== rel()
        // eslint-disable-next-line eqeqeq
        else if (take('==')) l = l == rel(); else if (take('!=')) l = l != rel()
        else return l
      }
    }
    const rel = () => {
      let l = add()
      for (;;) {
        if (take('<=')) l = l <= add(); else if (take('>=')) l = l >= add()
        else if (take('<')) l = l < add(); else if (take('>')) l = l > add()
        else return l
      }
    }
    const add = () => {
      let l = mul()
      for (;;) { if (take('+')) l = l + mul(); else if (take('-')) l = l - mul(); else return l }
    }
    const mul = () => {
      let l = unary()
      for (;;) {
        if (take('*')) l = l * unary(); else if (take('/')) l = l / unary(); else if (take('%')) l = l % unary()
        else return l
      }
    }
    const unary = () => {
      if (take('!')) return !unary()
      if (take('-')) return -unary()
      if (take('+')) return +unary()
      return postfix()
    }
    const postfix = () => {
      let v = primary()
      for (;;) {
        if (take('.')) {
          const tok = tokens[p++]
          const name = tok && tok.v
          if (peek('(')) {
            take('(')
            const args = []
            while (!peek(')') && p < tokens.length) { args.push(ternary()); take(',') }
            take(')')
            // sólo métodos conocidos de string/array: nada de llamar a lo que traiga el estado
            v = Object.prototype.hasOwnProperty.call(METHODS, name) ? METHODS[name](v, args) : undefined
          } else {
            v = v == null ? undefined : v[name]
          }
        } else if (take('[')) {
          const k = ternary(); take(']'); v = v == null ? undefined : v[k]
        } else return v
      }
    }
    const primary = () => {
      const tok = tokens[p++]
      if (!tok) return undefined
      if (tok.t === 'num' || tok.t === 'str') return tok.v
      if (tok.t === 'op' && tok.v === '(') { const v = ternary(); take(')'); return v }
      if (tok.t === 'op' && tok.v === '[') {
        const arr = []
        while (!peek(']') && p < tokens.length) { arr.push(ternary()); take(',') }
        take(']'); return arr
      }
      if (tok.t === 'id') {
        if (tok.v === 'true') return true
        if (tok.v === 'false') return false
        if (tok.v === 'null') return null
        if (tok.v === 'undefined') return undefined
        return scope[tok.v]
      }
      return undefined
    }
    try {
      const v = ternary()
      return p === tokens.length ? v : undefined
    } catch (e) {
      return undefined
    }
  }

  /** Una plantilla `${…}`: si es UNA expresión entera devuelve su valor con tipo; si mezcla texto,
   *  el texto con cada `${…}` sustituido; sin `${` es una expresión. */
  function evaluateTemplate(tmpl, scope = {}) {
    const s = String(tmpl == null ? '' : tmpl)
    if (s.indexOf('${') < 0) return evaluateExpression(s, scope)
    const whole = s.match(/^\$\{([^}]*)\}$/)
    if (whole) return evaluateExpression(whole[1], scope)
    return s.replace(/\$\{([^}]*)\}/g, (_, e) => { const v = evaluateExpression(e, scope); return v == null ? '' : String(v) })
  }

  /**
   * Ejecuta las reglas sobre `scope` → { state, data, actions }: los VALORES que cada regla deja en
   * el estado / en data (`campo` o `campo.atributo`) y las acciones a lanzar. Puro: no toca nada.
   */
  function computeRules(rules, scope = {}) {
    const state = {}
    const data = {}
    const actions = []
    const view = () => ({ ...scope, state: { ...(scope.state || {}), ...state }, data: { ...(scope.data || {}), ...data } })
    for (const rule of rules || []) {
      if (!rule) continue
      const filter = rule.filter == null || rule.filter === '' ? true : evaluateExpression(rule.filter, view())
      if (!filter) continue
      const action = rule.action
      if (action === 'SetStateValue' || action === 'SetDataValue') {
        const target = action === 'SetStateValue' ? state : data
        const value = rule.expression ? evaluateTemplate(rule.expression, view()) : rule.value
        for (const name of String(rule.fieldName || '').split(',').map((x) => x.trim()).filter(Boolean)) {
          const attr = rule.fieldAttribute && rule.fieldAttribute !== 'none' ? rule.fieldAttribute : null
          target[attr ? name + '.' + attr : name] = value
        }
      } else if (action === 'RunAction' && rule.actionId) {
        actions.push(rule.actionId)
      }
      if (rule.result === 'Stop') break
    }
    return { state, data, actions }
  }

  /** Los atributos de campo que la plantilla tiene que reflejar: { fieldId: { hidden, disabled… } }. */
  function fieldFlagsOf(data) {
    const out = {}
    for (const key of Object.keys(data || {})) {
      const m = key.match(/^(.+)\.(hidden|disabled|required|readonly|readOnly)$/)
      if (!m) continue
      const attr = m[2] === 'readOnly' ? 'readonly' : m[2]
      out[m[1]] = { ...(out[m[1]] || {}), [attr]: !!data[key] }
    }
    return out
  }

  /** La acción que dispara cambiar `fieldId` (@Trigger OnValueChange con su condición), o null. */
  function valueChangeActionOf(ctx, fieldId, state) {
    const triggers = (ctx && ctx.tree && ctx.tree.triggers) || []
    const t = triggers.find((x) => x && x.type === 'OnValueChange' && x.actionId
      && (!x.propertyName || x.propertyName === fieldId))
    if (!t) return null
    if (t.condition && !evaluateExpression(t.condition, { state: state || {}, data: (ctx && ctx.data) || {} })) return null
    return t.actionId
  }

  // ── en el navegador: aplicar las reglas a los campos pintados ────────────────────────────────
  //
  // Los campos se pintan desde 22 copias de plantilla (átomos, formulario genérico, drawer, isla…):
  // en vez de un flag más en cada una, las reglas actúan sobre el DOM por `data-field-id`, que
  // todas llevan. El contexto (reglas + estado) lo fija cada reducción (setRulesContext); los
  // cambios de campo (`valueChanged` de JET, interno) actualizan el estado vivo y re-evalúan; y,
  // como VB re-pinta de forma asíncrona, se re-aplica unos frames después de cada render.

  let rulesCtx = null
  let liveState = {}
  let runActionSink = null

  /** Quién ejecuta una RunAction de regla (la shell reusa el sumidero de los Element). */
  function setRuleActionSink(fn) { runActionSink = typeof fn === 'function' ? fn : null }

  function setRulesContext(ctx, appState) {
    rulesCtx = ctx && ctx.tree && (ctx.tree.rules || []).length ? { ctx, appState: appState || {} } : null
    liveState = { ...((ctx && ctx.state) || {}) }
    applyRulesSoon()
  }

  // Lo que se oculta de un campo: el control mismo — en Redwood su etiqueta va DENTRO (label-edge
  // inside) — o, para los que la llevan fuera (captura, @Searchable), su oj-label-value. Subir hasta
  // el hijo del oj-form-layout no vale: JET envuelve los campos en sus propios contenedores y se
  // ocultaba la sección entera.
  function formItemOf(el) {
    return (el.closest && el.closest('oj-label-value')) || el
  }

  function applyRulesNow(doc = typeof document !== 'undefined' ? document : null) {
    if (!rulesCtx || !doc) return 0
    const { ctx, appState } = rulesCtx
    const result = computeRules(ctx.tree.rules, { state: liveState, data: ctx.data || {}, appState, appData: {}, component: ctx.tree })
    let touched = 0
    const flags = fieldFlagsOf(result.data)
    for (const fieldId of Object.keys(flags)) {
      for (const el of doc.querySelectorAll('[data-field-id="' + String(fieldId).replace(/"/g, '\\"') + '"]')) {
        const f = flags[fieldId]
        if ('hidden' in f) {
          const item = formItemOf(el)
          item.style.display = f.hidden ? 'none' : ''
        }
        if ('disabled' in f && el.disabled !== f.disabled) el.disabled = f.disabled
        if ('required' in f && el.required !== f.required) el.required = f.required
        if ('readonly' in f && el.readonly !== f.readonly) el.readonly = f.readonly
        touched++
      }
    }
    // un SetStateValue cambia el valor de otro campo: se le pone al control y se emite el mismo
    // valueChanged INTERNO que si lo hubiese tecleado el usuario (así entra en el borrador que
    // viaja con la siguiente acción)
    for (const fieldId of Object.keys(result.state)) {
      if (fieldId.indexOf('.') >= 0) continue
      const value = result.state[fieldId]
      if (liveState[fieldId] === value) continue
      liveState[fieldId] = value
      for (const el of doc.querySelectorAll('[data-field-id="' + fieldId + '"]')) {
        el.value = value
        el.dispatchEvent(new CustomEvent('valueChanged', { detail: { value, updatedFrom: 'internal' }, bubbles: true }))
      }
    }
    for (const actionId of result.actions) if (runActionSink) runActionSink(actionId, {}, {})
    return touched
  }

  function applyRulesSoon(frames = 12) {
    if (typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => { applyRulesNow(); left -= 1; if (left > 0) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }

  /** Escucha los cambios de campo del documento (una vez): actualiza el estado vivo y re-evalúa. */
  function installRules(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuRulesInstalled) return
    doc.__mateuRulesInstalled = true
    doc.addEventListener('valueChanged', (e) => {
      const el = e.target
      const fieldId = el && el.getAttribute && el.getAttribute('data-field-id')
      const detail = e.detail || {}
      if (!fieldId || (detail.updatedFrom && detail.updatedFrom !== 'internal')) return
      liveState[fieldId] = detail.value
      applyRulesNow(doc)
    }, true)
  }

  /** Para diagnosticar desde la consola: las reglas en vigor y el estado vivo. */
  function rulesDebug() {
    return { rules: rulesCtx ? (rulesCtx.ctx.tree.rules || []).length : 0, state: { ...liveState } }
  }


  // Selección de RANGO en el tape chart (PlanningBoard → oj-gantt): arrastrar por celdas VACÍAS de
  // una fila lanza rangeSelectActionId con { _resourceId, _start, _end } (el «clic en la celda de
  // inicio y en la de fin» del Room Diary de OPERA → I Want To: reserva, walk-in, fuera de servicio).
  // oj-gantt no lo trae: mueve y redimensiona tareas, pero no selecciona tiempo vacío. Así que una
  // capa fina por encima, sin sustituir al componente:
  //   - la fila, del propio gantt (getContextByNode → rowIndex);
  //   - el día, de las posiciones REALES de las etiquetas del eje de días (respeta zoom y scroll);
  //   - mientras se arrastra, una banda translúcida; al soltar, la acción por el canal de la página.
  // Lo puro (x → día) está exportado y probado en Node.

  /** Día (índice) bajo `x` a partir de los centros de las etiquetas del eje de días. */
  function dayIndexAtX(x, centers) {
    if (!centers || !centers.length) return null
    if (centers.length === 1) return centers[0].index
    const sorted = [...centers].sort((a, b) => a.x - b.x)
    const width = (sorted[sorted.length - 1].x - sorted[0].x) / (sorted[sorted.length - 1].index - sorted[0].index)
    if (!(width > 0)) return sorted[0].index
    // el día i ocupa [centro_i - w/2, centro_i + w/2)
    return Math.round((x - sorted[0].x) / width) + sorted[0].index
  }

  const DAY = 86400000
  const isoUtc = (ms) => new Date(ms).toISOString().slice(0, 10)

  let rangeSink = null
  /** Quién ejecuta la acción (la shell reutiliza el sumidero de los Element). */
  function setPlanningRangeSink(fn) { rangeSink = typeof fn === "function" ? fn : null }

  /** Los centros (x en pantalla) de las etiquetas de días del eje menor de un gantt. */
  function dayCenters(gantt, startIso, days) {
    const labels = [...gantt.querySelectorAll('text')]
    const out = []
    // las etiquetas del eje menor tienen el formato del locale ("10/14", "14/10"…): se casan por
    // orden con los días de la ventana, quedándose con la fila de etiquetas más baja del eje
    const rows = {}
    for (const t of labels) {
      const r = t.getBoundingClientRect()
      if (!/\d/.test(t.textContent || '')) continue
      const key = Math.round(r.top)
      ;(rows[key] = rows[key] || []).push({ t, r })
    }
    const axisRows = Object.keys(rows).map(Number).sort((a, b) => a - b)
    // el eje menor: la fila con más etiquetas entre las primeras (la cabecera), no las barras
    const minor = axisRows.slice(0, 3).map((k) => rows[k]).sort((a, b) => b.length - a.length)[0] || []
    minor.sort((a, b) => a.r.left - b.r.left).forEach((e, i) => {
      if (i < days) out.push({ x: e.r.left + e.r.width / 2, index: i })
    })
    return out
  }

  /** Instala (una vez) el arrastre de rango sobre cualquier oj-gantt.mateu-planning del documento. */
  function installPlanningRange(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuPlanningRange) return
    doc.__mateuPlanningRange = true
    let drag = null
    const band = () => {
      let el = doc.getElementById('mateuPlanningRangeBand')
      if (!el) {
        el = doc.createElement('div')
        el.id = 'mateuPlanningRangeBand'
        el.className = 'mateu-planning-range'
        doc.body.appendChild(el)
      }
      return el
    }
    doc.addEventListener('pointerdown', (e) => {
      const gantt = e.target && e.target.closest && e.target.closest('oj-gantt.mateu-planning')
      if (!gantt || !gantt.dataset.rangeAction || e.button > 0) return
      // sólo tiempo VACÍO de una fila (el fondo de la fila, rect.oj-gantt-row): una tarea se mueve y
      // redimensiona como siempre. getContextByNode no da contexto para ese fondo, así que la fila
      // sale de la etiqueta del eje de filas más cercana en vertical (vale también con scroll)
      const cls = (e.target.getAttribute && e.target.getAttribute('class')) || ''
      if (!/(^|\s)oj-gantt-row(\s|$)/.test(cls)) return
      const labels = (gantt.dataset.rowLabels || '').split('\u001f')
      let best = null
      for (const t of gantt.querySelectorAll('text')) {
        const i = labels.indexOf(t.textContent)
        if (i < 0) continue
        const r = t.getBoundingClientRect()
        const dist = Math.abs(r.top + r.height / 2 - e.clientY)
        if (!best || dist < best.dist) best = { i, dist }
      }
      if (!best) return
      const ctx = { rowIndex: best.i }
      const start = gantt.dataset.start
      const days = Math.round((Date.parse(gantt.dataset.end + 'Z') - Date.parse(start + 'Z')) / DAY)
      const centers = dayCenters(gantt, start, days)
      const anchor = dayIndexAtX(e.clientX, centers)
      if (anchor == null) return
      const rowRect = e.target.getBoundingClientRect()
      drag = { gantt, ctx, centers, anchor, current: anchor, start, top: rowRect.top, height: rowRect.height }
    }, true)
    doc.addEventListener('pointermove', (e) => {
      if (!drag) return
      const i = dayIndexAtX(e.clientX, drag.centers)
      if (i == null) return
      drag.current = i
      const [a, b] = [Math.min(drag.anchor, i), Math.max(drag.anchor, i)]
      const w = drag.centers.length > 1 ? Math.abs(drag.centers[1].x - drag.centers[0].x) : 40
      const el = band()
      const left = drag.centers[0].x + (a - drag.centers[0].index) * w - w / 2
      Object.assign(el.style, { display: 'block', left: left + window.scrollX + 'px', width: (b - a + 1) * w + 'px',
        top: drag.top + window.scrollY + 'px', height: drag.height + 'px' })
    }, true)
    doc.addEventListener('pointerup', () => {
      const d = drag
      drag = null
      const el = doc.getElementById('mateuPlanningRangeBand')
      if (el) el.style.display = 'none'
      if (!d || !rangeSink) return
      const ids = (d.gantt.dataset.rowIds || '').split('\u001f')
      const rowId = ids[d.ctx.rowIndex]
      if (!rowId) return
      const [a, b] = [Math.min(d.anchor, d.current), Math.max(d.anchor, d.current)]
      const base = Date.parse(d.start + 'Z')
      rangeSink(d.gantt.dataset.rangeAction, { _resourceId: rowId, _start: isoUtc(base + a * DAY), _end: isoUtc(base + b * DAY) }, {})
    }, true)
  }


  // PANEL DE ACCIONES por categorías («I want to…», ActionPanel): el disparador es un oj-button y la
  // capa un oj-dialog de JET; el estado de la capa (abierta, «mostrar más» de una columna, ocultar
  // las acciones sin datos) vive en el DOM — clases sobre el diálogo y sus columnas —, así que nada
  // pregunta al servidor ni re-proyecta. Elegir una acción cierra el diálogo y la acción sale por el
  // canal normal de los botones (blockAction). Un listener por documento, instalado una vez.

  /** «ctrl+shift+i» → { ctrl, alt, shift, meta, key } */
  function parseShortcut(shortcut) {
    const parts = String(shortcut || '').toLowerCase().split('+').map((p) => p.trim()).filter(Boolean)
    if (!parts.length) return null
    const mods = { ctrl: false, alt: false, shift: false, meta: false }
    let key = ''
    for (const p of parts) {
      if (p === 'ctrl' || p === 'control') mods.ctrl = true
      else if (p === 'alt' || p === 'option') mods.alt = true
      else if (p === 'shift') mods.shift = true
      else if (p === 'meta' || p === 'cmd') mods.meta = true
      else key = p
    }
    return key ? { ...mods, key } : null
  }

  /** ¿La tecla pulsada es el atajo? Por e.key o por e.code (KeyI / Digit1 / Numpad1), como los
   *  atajos del renderer web: independiente de la distribución del teclado. */
  function shortcutMatches(shortcut, e) {
    const s = typeof shortcut === 'string' ? parseShortcut(shortcut) : shortcut
    if (!s || !e) return false
    if (!!e.ctrlKey !== s.ctrl || !!e.altKey !== s.alt || !!e.shiftKey !== s.shift || !!e.metaKey !== s.meta) return false
    const k = s.key
    const key = String(e.key || '').toLowerCase()
    const code = String(e.code || '')
    return key === k || code === 'Key' + k.toUpperCase() || code === 'Digit' + k || code === 'Numpad' + k
  }

  const visible = (el) => !!(el && (el.offsetParent || (el.getClientRects && el.getClientRects().length)))

  /** Instala (una vez) el comportamiento de los paneles de acciones del documento. */
  function installActionPanels(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuActionPanels) return
    doc.__mateuActionPanels = true
    const dialogOf = (id) => (id ? doc.getElementById(id) : null)
    const open = (id) => {
      const d = dialogOf(id)
      if (d && typeof d.open === 'function' && !(d.isOpen && d.isOpen())) d.open()
    }
    doc.addEventListener('click', (e) => {
      const t = e.target && e.target.closest ? e.target : null
      if (!t) return
      const trigger = t.closest('[data-ap-open]')
      if (trigger) { open(trigger.getAttribute('data-ap-open')); return }
      const more = t.closest('[data-ap-more]')
      if (more) {
        const col = more.closest('.mateu-ap-column')
        if (col) col.classList.add('mateu-ap-showall')
        return
      }
    }, true)
    // elegir una acción cierra la capa; el oj-button sigue y su blockAction lanza la acción
    doc.addEventListener('ojAction', (e) => {
      const item = e.target && e.target.closest && e.target.closest('.mateu-ap-item')
      const dialog = item && item.closest('oj-dialog')
      if (dialog && typeof dialog.close === 'function') dialog.close()
    }, true)
    // ocultar las vacías: el oj-switch NO burbujea valueChanged, pero la fase de captura sí lo ve
    doc.addEventListener('valueChanged', (e) => {
      const sw = e.target
      if (!sw || !sw.hasAttribute || !sw.hasAttribute('data-ap-hide')) return
      const dialog = sw.closest('oj-dialog')
      if (dialog) dialog.classList.toggle('mateu-ap-hide-unpopulated', !!(e.detail && e.detail.value))
    }, true)
    doc.addEventListener('keydown', (e) => {
      if (!e.ctrlKey && !e.altKey && !e.metaKey) return
      for (const trigger of doc.querySelectorAll('[data-ap-shortcut]')) {
        const sc = trigger.getAttribute('data-ap-shortcut')
        if (sc && visible(trigger) && shortcutMatches(sc, e)) {
          e.preventDefault()
          e.stopPropagation()
          open(trigger.getAttribute('data-ap-open'))
          return
        }
      }
    }, true)
  }


  // TECLADO de la shell VB: los atajos declarados y las TECLAS DE ACCESO.
  //  - @Action(shortcut) de la pantalla en curso: el atajo lanza la acción (por el canal de los
  //    Element), como en el renderer web; sólo combinaciones con Ctrl/Alt/Meta — una tecla suelta
  //    es del campo donde se escribe.
  //  - @Tab(shortcut): selecciona la pestaña (el li del oj-tab-bar lleva data-shortcut).
  //  - @App(accessKeys): mantener Alt enseña una tecla junto a cada botón y pestaña visibles — su
  //    atajo si lo declara, si no una letra de su etiqueta asignada sin repetir — y Alt+letra lo
  //    pulsa. Lo de OPERA con su tecla de acceso. Lo puro (qué letra toca a quién) se prueba en Node.

  /** Las letras de acceso para unas etiquetas: primero las iniciales de sus palabras, luego cualquier
   *  letra de la etiqueta, luego cifras; sin repetir y saltando las reservadas. '' si no queda. */
  function assignAccessKeys(labels, reserved = []) {
    const used = new Set(reserved.map((k) => String(k).toLowerCase()))
    return labels.map((label) => {
      const text = String(label || '').toLowerCase()
      const initials = text.split(/[^a-z0-9áéíóúñ]+/i).map((w) => w.charAt(0))
      const letters = [...text]
      for (const c of [...initials, ...letters, ...'1234567890']) {
        if (/^[a-z0-9]$/.test(c) && !used.has(c)) { used.add(c); return c }
      }
      return ''
    })
  }

  /** Etiqueta legible de un atajo: «ctrl+shift+s» → «Ctrl+Shift+S». */
  const keyHint = (shortcut) => String(shortcut || '').split('+').filter(Boolean)
    .map((k) => (k.length === 1 ? k.toUpperCase() : k.charAt(0).toUpperCase() + k.slice(1))).join('+')

  // ── atajos de acción de la pantalla en curso ──────────────────────────────────────────────────
  let shortcutActions = []
  /** La pantalla en curso (afterReduce): sus acciones con atajo con modificador. */
  function setShortcutContext(hostCtx) {
    const actions = (hostCtx && hostCtx.tree && hostCtx.tree.actions) || []
    shortcutActions = actions
      .filter((a) => a && a.id && a.shortcut && /(^|\+)(ctrl|control|alt|meta|cmd)(\+|$)/i.test(a.shortcut))
      .map((a) => ({ id: a.id, shortcut: String(a.shortcut).toLowerCase() }))
  }
  const currentShortcutActions = () => shortcutActions

  let keysSink = null
  function setKeysActionSink(fn) { keysSink = typeof fn === 'function' ? fn : null }

  let accessKeysOn = false
  function setAccessKeysEnabled(on) { accessKeysOn = !!on }

  // ── DOM ────────────────────────────────────────────────────────────────────────────────────────
  const keyTargetVisible = (el) => {
    if (!el || !el.getClientRects || !el.getClientRects().length) return false
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < (el.ownerDocument.defaultView.innerHeight || 1e6)
  }
  const labelOf = (el) => (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim()

  /** Lo que se puede pulsar con una tecla de acceso: botones (no deshabilitados) y pestañas. */
  function accessCandidates(doc) {
    const out = []
    for (const el of doc.querySelectorAll('oj-button, oj-menu-button, oj-tab-bar li')) {
      if (!keyTargetVisible(el) || el.hasAttribute('disabled') || el.closest('[aria-hidden="true"], .mateu-access-keys')) continue
      const label = labelOf(el)
      if (!label) continue
      const actionId = el.getAttribute('data-action-id')
      const declared = el.getAttribute('data-shortcut')
        || (actionId && (shortcutActions.find((a) => a.id === actionId) || {}).shortcut) || ''
      out.push({ el, label, declared })
    }
    return out
  }

  const activate = (el) => {
    const inner = el.querySelector && el.querySelector('button')
    if (inner) inner.click()
    else el.click()
  }

  const reservedAltLetters = () => shortcutActions
    .map((a) => /^alt\+([a-z0-9])$/.exec(a.shortcut)).filter(Boolean).map((m) => m[1])

  function showAccessKeys(doc) {
    hideAccessKeys(doc)
    const candidates = accessCandidates(doc)
    const free = candidates.filter((c) => !c.declared)
    const letters = assignAccessKeys(free.map((c) => c.label), reservedAltLetters())
    free.forEach((c, i) => { c.letter = letters[i] })
    const layer = doc.createElement('div')
    layer.className = 'mateu-access-keys'
    layer.setAttribute('aria-hidden', 'true')
    for (const c of candidates) {
      const text = c.declared ? keyHint(c.declared) : (c.letter ? c.letter.toUpperCase() : '')
      if (!text) continue
      const r = c.el.getBoundingClientRect()
      const badge = doc.createElement('span')
      badge.className = 'mateu-access-key'
      badge.textContent = text
      badge.style.left = Math.max(0, r.left - 4) + 'px'
      badge.style.top = Math.max(0, r.top - 8) + 'px'
      layer.appendChild(badge)
    }
    doc.body.appendChild(layer)
    doc.__mateuAccessMap = candidates.filter((c) => c.letter).map((c) => ({ letter: c.letter, el: c.el }))
  }

  function hideAccessKeys(doc) {
    for (const l of doc.querySelectorAll('.mateu-access-keys')) l.remove()
  }

  const matches = (shortcut, e) => (typeof shortcutMatches === 'function' ? shortcutMatches(shortcut, e) : false)

  function installKeys(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuKeys) return
    doc.__mateuKeys = true
    let holdTimer = null
    doc.addEventListener('keydown', (e) => {
      // mantener Alt (sola): aparecen las teclas
      if (e.key === 'Alt' && accessKeysOn && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        if (!holdTimer) holdTimer = setTimeout(() => showAccessKeys(doc), 250)
        return
      }
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
      if (!e.ctrlKey && !e.altKey && !e.metaKey) return
      // 1. una acción de la pantalla
      const action = shortcutActions.find((a) => matches(a.shortcut, e))
      if (action && keysSink) {
        e.preventDefault(); e.stopPropagation()
        keysSink(action.id, {}, {})
        return
      }
      // 2. una pestaña
      for (const li of doc.querySelectorAll('oj-tab-bar li[data-shortcut]')) {
        const sc = li.getAttribute('data-shortcut')
        if (sc && keyTargetVisible(li) && matches(sc, e)) { e.preventDefault(); e.stopPropagation(); activate(li); return }
      }
      // 3. una tecla de acceso (Alt+letra, por el código físico: en Mac Alt cambia e.key)
      if (accessKeysOn && e.altKey && !e.ctrlKey && !e.metaKey) {
        const m = /^(Key([A-Z])|Digit([0-9]))$/.exec(e.code || '')
        const letter = m ? (m[2] || m[3]).toLowerCase() : ''
        if (!letter) return
        if (!doc.querySelector('.mateu-access-keys')) showAccessKeys(doc)
        const hit = (doc.__mateuAccessMap || []).find((x) => x.letter === letter)
        if (hit) { e.preventDefault(); e.stopPropagation(); hideAccessKeys(doc); activate(hit.el) }
      }
    }, true)
    doc.addEventListener('keyup', (e) => {
      if (e.key === 'Alt') {
        if (holdTimer) { clearTimeout(holdTimer); holdTimer = null }
        hideAccessKeys(doc)
      }
    }, true)
    const view = doc.defaultView
    if (view) view.addEventListener('blur', () => hideAccessKeys(doc))
  }


  // VENTANAS FLOTANTES al pasar el ratón (y al enfocar con el teclado): el resumen de una tarifa, el
  // detalle de una celda. UNA oj-popup de JET compartida, creada fuera de Knockout, a la que se
  // le cambia el contenido: cualquier elemento con data-mateu-hover (texto, líneas con \n) la abre
  // al pasar o enfocar y la cierra al salir; uno con data-mateu-pop-click, al pulsar. Las celdas
  // de un listado con @Tooltip(otro campo) y los Popover (trigger hover/click) pasan por aquí.

  /** Las líneas del contenido (puro). */
  const hoverLinesOf = (text) => String(text || '').split('\n').map((l) => l.trim()).filter(Boolean)

  function installHover(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuHover) return
    doc.__mateuHover = true
    let popup = null
    let body = null
    let anchor = null
    let openTimer = null
    let closeTimer = null
    const ensure = () => {
      if (popup) return popup
      const wrap = doc.createElement('div')
      wrap.setAttribute('data-oj-binding-provider', 'none')
      popup = doc.createElement('oj-popup')
      popup.id = 'mateuHoverPopup'
      popup.className = 'mateu-hover-popup'
      popup.setAttribute('modality', 'modeless')
      popup.setAttribute('auto-dismiss', 'none')
      popup.setAttribute('tail', 'simple')
      popup.setAttribute('initial-focus', 'none')
      popup.setAttribute('position', '{"my":{"horizontal":"start","vertical":"top"},"at":{"horizontal":"start","vertical":"bottom"},"collision":"flipfit"}')
      body = doc.createElement('div')
      body.className = 'mateu-hover-content'
      body.setAttribute('role', 'tooltip')
      popup.appendChild(body)
      popup.addEventListener('mouseenter', () => { if (closeTimer) { clearTimeout(closeTimer); closeTimer = null } })
      popup.addEventListener('mouseleave', () => scheduleClose())
      wrap.appendChild(popup)
      doc.body.appendChild(wrap)
      return popup
    }
    const open = (el, text) => {
      const p = ensure()
      body.textContent = ''
      for (const line of hoverLinesOf(text)) {
        const div = doc.createElement('div')
        div.textContent = line
        body.appendChild(div)
      }
      if (!el.id) el.id = 'mateuHover-' + Math.random().toString(36).slice(2, 9)
      anchor = el
      el.setAttribute('aria-describedby', 'mateuHoverPopup')
      // un oj-popup recién creado tarda en «actualizarse» (JET lo hace de forma asíncrona): hasta
      // entonces sus métodos lanzan — se reintenta unos frames
      const tryOpen = (left) => {
        if (anchor !== el) return
        try {
          if (p.isOpen()) p.close()
          p.open('#' + el.id)
        } catch (err) {
          if (left > 0) requestAnimationFrame(() => tryOpen(left - 1))
        }
      }
      tryOpen(30)
    }
    const close = () => {
      if (openTimer) { clearTimeout(openTimer); openTimer = null }
      if (anchor) anchor.removeAttribute('aria-describedby')
      anchor = null
      try { if (popup && popup.isOpen()) popup.close() } catch (err) { /* aún sin actualizar */ }
    }
    const scheduleClose = () => {
      if (closeTimer) clearTimeout(closeTimer)
      closeTimer = setTimeout(() => { closeTimer = null; close() }, 200)
    }
    const hoverTarget = (node) => {
      const el = node && node.closest ? node.closest('[data-mateu-hover]') : null
      return el && el.getAttribute('data-mateu-hover') ? el : null
    }
    const show = (el) => {
      if (closeTimer) { clearTimeout(closeTimer); closeTimer = null }
      if (anchor === el) return
      if (openTimer) clearTimeout(openTimer)
      openTimer = setTimeout(() => { openTimer = null; open(el, el.getAttribute('data-mateu-hover')) }, 300)
    }
    // se crea ya: cuando llegue el primer hover JET habrá tenido tiempo de actualizarlo
    if (doc.body) ensure()
    doc.addEventListener('mouseover', (e) => { const el = hoverTarget(e.target); if (el) show(el) }, true)
    doc.addEventListener('mouseout', (e) => {
      const el = hoverTarget(e.target)
      if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) {
        if (openTimer && anchor !== el) { clearTimeout(openTimer); openTimer = null }
        scheduleClose()
      }
    }, true)
    doc.addEventListener('focusin', (e) => { const el = hoverTarget(e.target); if (el) show(el) }, true)
    doc.addEventListener('focusout', (e) => { if (hoverTarget(e.target)) scheduleClose() }, true)
    doc.addEventListener('click', (e) => {
      const el = e.target && e.target.closest ? e.target.closest('[data-mateu-pop-click]') : null
      if (!el || !el.getAttribute('data-mateu-pop-click')) return
      if (anchor === el) close()
      else open(el, el.getAttribute('data-mateu-pop-click'))
    }, true)
    doc.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && anchor) { close(); return }
      if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.getAttribute && e.target.getAttribute('data-mateu-pop-click')) {
        e.preventDefault()
        e.target.click()
      }
    }, true)
  }


  // MatrixGrid sobre oj-data-grid: el comportamiento que JET deja a la aplicación, instalado una
  // vez por documento (como el rango del tape chart o los paneles de acciones):
  //   - plegar/desplegar una sección: el grid pide (ojExpandRequest/ojCollapseRequest) y aquí se
  //     cambia el KeySet del FlattenedTreeDataProviderView; el estado se guarda en el almacén de
  //     paneles para que sobreviva a una re-proyección;
  //   - editar: qué celdas se editan lo dice cell.editable (matrixAtomOf); al terminar
  //     (ojBeforeEditEnd) el valor nuevo, si cambió, sale por editActionId;
  //   - una celda que enlaza: clic → cellActionId. Ambas con { _rowId, _columnId, _value }.

  let matrixSink = null
  /** Quién ejecuta la acción (la shell reutiliza el sumidero de los Element). */
  function setMatrixActionSink(fn) { matrixSink = typeof fn === 'function' ? fn : null }

  /** Los parámetros de la acción de una celda. */
  const matrixCellParams = (rowId, columnId, value) => ({ _rowId: rowId, _columnId: columnId, _value: value })

  /** ¿Hay que lanzar la edición? Sólo si cambió (un Enter sin tocar nada no es una edición). */
  const matrixEditChanged = (before, after) => String(before ?? '') !== String(after ?? '')

  const gridOf = (el) => (el && el.closest ? el.closest('oj-data-grid.mateu-matrix') : null)
  const rowKeyOf = (detail) => detail && detail.item && detail.item.metadata && detail.item.metadata.rowItem
    && detail.item.metadata.rowItem.metadata && detail.item.metadata.rowItem.metadata.key

  function installMatrixGrids(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuMatrixGrids) return
    doc.__mateuMatrixGrids = true
    const toggle = (expand) => (e) => {
      const grid = gridOf(e.target)
      const state = grid && grid.data && grid.data.__mateu
      const key = rowKeyOf(e.detail)
      if (!state || key == null) return
      state.expanded = expand ? state.expanded.add([key]) : state.expanded.delete([key])
      state.flat.setExpanded(state.expanded)
      if (String(key).startsWith('§')) setPanelExpanded(matrixSectionKey(grid.dataset.matrixId, String(key).slice(1)), expand)
    }
    doc.addEventListener('ojExpandRequest', toggle(true), true)
    doc.addEventListener('ojCollapseRequest', toggle(false), true)
    doc.addEventListener('ojBeforeEditEnd', (e) => {
      const grid = gridOf(e.target)
      if (!grid || (e.detail && e.detail.cancelEdit)) return
      const input = grid.querySelector('oj-input-text[data-mx-row]')
      if (!input || !matrixSink || !grid.dataset.editAction) return
      const before = input.getAttribute('data-mx-value')
      const after = input.value
      if (!matrixEditChanged(before, after)) return
      matrixSink(grid.dataset.editAction, matrixCellParams(input.getAttribute('data-mx-row'), input.getAttribute('data-mx-col'), after), {})
    }, true)
    doc.addEventListener('click', (e) => {
      const link = e.target && e.target.closest ? e.target.closest('[data-mx-link="true"]') : null
      const grid = gridOf(link)
      if (!link || !grid || !matrixSink || !grid.dataset.cellAction) return
      matrixSink(grid.dataset.cellAction, matrixCellParams(link.getAttribute('data-mx-row'), link.getAttribute('data-mx-col'), link.textContent), {})
    }, true)
  }

  void panelExpanded


  // TONOS DE FILA del listado (@RowStatus) y filas de GRUPO (@GroupBy) sobre el oj-table de JET.
  // oj-table no tiene clase por fila (sólo plantillas de celda o una plantilla de fila entera que
  // obligaría a repintar todas las columnas a mano), así que una pasada mínima por el DOM: cada `tr`
  // del cuerpo de #mateuTable recibe la clase de su fila (misma posición: la página se pinta entera,
  // sin virtualizar). Un MutationObserver la repite cuando JET repinta (orden, página, refresco).

  let tones = []

  /** Los tonos de las filas en pantalla, en orden (de listingOf(...).rows: _tone de cada una). */
  function setListingTones(rows) {
    tones = (rows || []).map((r) => (r && r._tone) || '')
    applyRowTonesSoon()
  }

  const toneClassOf = (tone) => (tone ? 'mateu-row-tone-' + tone : '')

  function applyRowTones(doc) {
    const table = doc.getElementById('mateuTable')
    if (!table) return 0
    const trs = table.querySelectorAll('tbody tr')
    let n = 0
    trs.forEach((tr, i) => {
      const want = toneClassOf(tones[i])
      for (const c of [...tr.classList]) if (c.startsWith('mateu-row-tone-') && c !== want) tr.classList.remove(c)
      if (want && !tr.classList.contains(want)) { tr.classList.add(want); n++ }
    })
    return n
  }

  function applyRowTonesSoon(frames = 10) {
    if (typeof requestAnimationFrame === 'undefined' || typeof document === 'undefined') return
    let left = frames
    const tick = () => { applyRowTones(document); if (--left > 0) requestAnimationFrame(tick) }
    requestAnimationFrame(tick)
  }

  /** Vigila (una vez) los repintados del oj-table para volver a poner los tonos. */
  function installRowTones(doc = typeof document !== 'undefined' ? document : null) {
    if (!doc || doc.__mateuRowTones || typeof MutationObserver === 'undefined') return
    doc.__mateuRowTones = true
    let pending = false
    new MutationObserver(() => {
      if (pending || !tones.some(Boolean)) return
      pending = true
      requestAnimationFrame(() => { pending = false; applyRowTones(doc) })
    }).observe(doc.body, { childList: true, subtree: true })
  }

  // ── cabecera de ficha FIJA y compacta al hacer scroll (la «business card» de OPERA) ─────────────
  /** Marca el body con mateu-scrolled en cuanto la página deja la cabecera atrás: app.css pinta la
   *  banda .mateu-sticky-header compacta (menos aire, sin tira, con sombra). */
  function installStickyHeader(win = typeof window !== 'undefined' ? window : null) {
    if (!win || win.__mateuStickyHeader) return
    win.__mateuStickyHeader = true
    let on = false
    win.addEventListener('scroll', () => {
      const now = win.scrollY > 48
      if (now !== on) { on = now; win.document.body.classList.toggle('mateu-scrolled', now) }
    }, { passive: true })
  }


  // Static-bundle "no backend" mode for the VB/Redwood renderer — the same contract as the web
  // renderers' libs/mateu (bundleStore.ts), rewritten for THIS core (which shares nothing with them:
  // here the transport is `fetch` in transport.mjs, not axios). A build-time exporter (Mateu's
  // `mateu:bundle` goal) OR the runtime endpoint (GET /mateu/v3/bundle) renders each declared route's
  // initial load (actionId '') to wire JSON and writes a manifest.json; when a bundle is present we
  // answer route LOADS from it instead of POSTing to the server, so the VB app runs from static
  // assets with no backend. Live data still comes from external endpoints; ACTIONS still need a
  // backend (they fall through to the normal transport).
  //
  // Pure except loadBundleManifest, so test.mjs can exercise it in Node with a fetch double.

  // syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
  let increments
  // :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure.
  let templates = []
  // The in-flight manifest load (if any), so a route load can await it before hitting the backend.
  let pending
  // The mount's authored route registry, as shipped in the manifest: a statically deployed mount has
  // no server left to ask what a URL means, so the parameters a route pins or seeds travel as data.
  let routeEntries = []

  /** The `:name` segments of a route pattern, in order. */
  const paramNamesOf = (route) =>
    route.split('/').filter((s) => s.startsWith(':') && s.length > 1).map((s) => s.substring(1))

  const normRoute = (s) => (s || '').replace(/^\/+/, '').replace(/\/+$/, '')

  /** The registry entry answering a concrete path, plus the path params read off it. Static routes
   *  before parameterised ones (so `orders/new` is never swallowed by `orders/:id`) and, among
   *  parameterised matches, the most specific — matching must not depend on declaration order.
   *  Mirrors the server's RouteTable.match and the web's bundleStore. */
  function matchRouteEntry(path) {
    const target = normRoute(path === '_no_route' ? '' : path)
    const targetSegments = target === '' ? [] : target.split('/')
    let best
    for (const entry of routeEntries) {
      const pattern = normRoute(entry.route)
      const patternSegments = pattern === '' ? [] : pattern.split('/')
      if (patternSegments.length !== targetSegments.length) continue
      const pathParams = {}
      let matches = true
      for (let i = 0; i < patternSegments.length; i++) {
        const seg = patternSegments[i]
        if (seg.startsWith(':') && seg.length > 1) pathParams[seg.substring(1)] = targetSegments[i]
        else if (seg !== targetSegments[i]) { matches = false; break }
      }
      if (!matches) continue
      if (!best || paramNamesOf(pattern).length < paramNamesOf(normRoute(best.entry.route)).length) {
        best = { entry, pathParams }
      }
    }
    return best
  }

  /** Applies the registry's parameters to a pre-rendered increment, in the SAME order the server and
   *  the web renderers use — otherwise one route would behave differently depending on which renderer
   *  and whether a backend happens to be present:
   *
   *    fixed  >  path  >  what the increment already carries  >  defaults
   *
   *  Untouched (same reference) when no entry answers the path. */
  function applyRouteParams(syncPath, increment) {
    const match = matchRouteEntry(syncPath)
    if (!match) return increment
    const defaults = match.entry.defaultParams || {}
    const fixed = match.entry.fixedParams || {}
    const pathParams = match.pathParams
    if (!Object.keys(defaults).length && !Object.keys(fixed).length && !Object.keys(pathParams).length) {
      return increment
    }
    return {
      ...increment,
      fragments: (increment.fragments || []).map((f) => ({
        ...f,
        state: { ...defaults, ...(f.state || {}), ...pathParams, ...fixed },
        data: { ...defaults, ...(f.data || {}), ...pathParams, ...fixed },
      })),
    }
  }

  /** The registry entry answering a path, for callers that need its definition or view model. */
  const getRouteEntry = (syncPath) => {
    const m = matchRouteEntry(syncPath)
    return m ? m.entry : undefined
  }

  /** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors transport.callMateu and the web:
   *  leading slash stripped, blank/root → `_no_route`. */
  function toSyncPath(route) {
    const r = route && route.startsWith('/') ? route.substring(1) : (route || '')
    return r === '' ? '_no_route' : r
  }

  /** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode OFF (the
   *  app falls back to the backend at baseUrl). */
  function loadBundleManifest(url, fetchImpl) {
    const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
    pending = (async () => {
      try {
        if (!f) return
        const res = await f(url)
        if (!res || !res.ok) return
        const manifest = await res.json()
        const map = new Map()
        const tpls = []
        for (const e of (manifest.entries || [])) {
          if (!e.ok || !e.json) continue
          try {
            const inc = JSON.parse(e.json)
            if (e.routePattern) {
              tpls.push({ regex: new RegExp(e.routePattern), paramNames: e.paramNames || [], increment: inc })
            } else {
              map.set(e.syncPath, inc)
            }
          } catch (err) {
            // skip a malformed entry, keep the rest
          }
        }
        increments = map
        templates = tpls
        routeEntries = (manifest.routes && manifest.routes.routes) || []
      } catch (e) {
        // leave bundle mode off
      }
    })()
    return pending
  }

  /** Await the in-flight manifest load (if any) — so a route load doesn't race the fetch and hit the
   *  backend before the bundle is ready. Resolves immediately when nothing is loading. */
  const awaitBundle = () => pending || Promise.resolve()

  /** True once a non-empty bundle has been loaded (exact routes or :param templates). */
  const hasBundle = () =>
    (increments !== undefined && increments.size > 0) || templates.length > 0

  /** The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend).
   *  The registry's parameters are applied on the way out, so a statically served route behaves like
   *  the same route served by the backend. */
  const getBundledIncrement = (syncPath) => {
    const inc = increments ? increments.get(syncPath) : undefined
    return inc === undefined ? undefined : applyRouteParams(syncPath, inc)
  }

  /** Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES; on a hit, return the
   *  pre-rendered structure with the extracted params INJECTED into every fragment's state and data —
   *  so a `${state.<param>}` in a client-side data URL resolves to the real value. undefined = no hit. */
  function matchBundledTemplate(syncPath) {
    for (const t of templates) {
      const m = t.regex.exec(syncPath)
      if (!m) continue
      const params = {}
      t.paramNames.forEach((name, i) => { params[name] = m[i + 1] })
      const withPathParams = {
        ...t.increment,
        // params LAST so the real value wins over the render-time placeholder
        fragments: (t.increment.fragments || []).map((f) => ({
          ...f,
          state: { ...(f.state || {}), ...params },
          data: { ...(f.data || {}), ...params },
        })),
      }
      // …and then the registry's own, so a pinned parameter still outranks the path.
      return applyRouteParams(syncPath, withPathParams)
    }
    return undefined
  }

  /** The bundled increment for a route (exact match then :param template), re-targeted so its
   *  fragments land on the loading surface: the exporter had no initiator, so a fragment's
   *  targetComponentId is null — reduceContexts routes null → HOST, but a load INTO an island must
   *  target that island, so stamp the initiator (matches the web intercept). undefined = not bundled. */
  function bundledIncrementFor(route, initiator) {
    const syncPath = toSyncPath(route)
    const inc = getBundledIncrement(syncPath) || matchBundledTemplate(syncPath)
    if (!inc) return undefined
    return {
      ...inc,
      fragments: (inc.fragments || []).map((f) =>
        f.targetComponentId ? f : { ...f, targetComponentId: initiator || '' }),
    }
  }

  /** Test hook: seed/clear the in-memory bundle directly. */
  function __setBundleForTests(m, t, r) {
    increments = m
    templates = t || []
    routeEntries = r || []
    pending = undefined
  }


  // Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
  // "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
  // sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
  // testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).


  /** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction).
   *  Sale ATADA a la pantalla en curso (resilience.currentView): si cuando contesta ya hay otra, la
   *  respuesta se descarta en silencio. Las de fondo (quiet/isolated: widgets, menús remotos) no
   *  son de ninguna pantalla; `options.view` la fija a mano (null: de ninguna). */
  async function callMateu(base, body, options = {}) {
    const view = options.view !== undefined ? options.view
      : (options.quiet || options.isolated) ? null : currentView()
    const bare = (body.route || '').replace(/^\//, '')
    const res = await fetchWithPolicy(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appState: {},
        componentState: {},
        parameters: {},
        initiatorComponentId: '',
        consumedRoute: '',
        serverSideType: undefined,
        ...body,
        route: bare ? `/${bare}` : '',
      }),
    }, { actionId: body.actionId, timeoutMillis: options.timeoutMillis, idempotent: options.idempotent, quiet: options.quiet, isolated: options.isolated, view })
    const increment = await res.json()
    // el cuerpo también tarda: lo que llegue después de cambiar de pantalla tampoco se aplica
    if (isViewStale(view)) throw staleResponseError(body.actionId)
    return increment
  }

  /** Bootstrap de la shell: el App raíz solo resuelve por el endpoint genérico.
   *  Static-bundle: la shell NO se exporta (el bundle guarda cargas de ruta, no el __load__ del App),
   *  así que en modo híbrido (bundle + backend) el menú sale del backend como siempre; pero si el
   *  backend NO está (despliegue estático puro) y el bundle trae la ruta raíz, se cae a ella para que
   *  la app arranque igual. Sólo en el fallo — el camino feliz no cambia. */
  async function bootstrapShell(base, initiator = 'shell') {
    await awaitBundle()
    try {
      const res = await fetchWithPolicy(`${base}/mateu/v3/components/_/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
      }, { actionId: '__load__' })
      return res.json()
    } catch (e) {
      if (hasBundle()) {
        const bundled = bundledIncrementFor('', initiator)
        if (bundled) return bundled
      }
      throw e
    }
  }

  /** Ruta INTERNA de un mediador/isla tras un flip de state._route: base del outbound +
   *  flip + marcadores query (los ?_embeddedMediator=1&_inline=1 deben seguir viajando). */
  function composeInnerRoute(outboundRoute, flip) {
    if (!flip || flip === '/' ) return outboundRoute
    const queryIndex = outboundRoute.indexOf('?')
    const base = queryIndex >= 0 ? outboundRoute.slice(0, queryIndex) : outboundRoute
    const query = queryIndex >= 0 ? outboundRoute.slice(queryIndex) : ''
    return base + flip + query
  }

  /**
   * La base de un crud de PÁGINA a la que se pegan sus rutas internas (`/QN29HB`, `/QN29HB/edit`,
   * `/new`): su `consumedRoute`, no la ruta con la que se cargó. Entrando desde el listado las dos
   * coinciden (`/booking/bookings`), pero un detalle abierto por enlace directo se carga con
   * `/booking/bookings/QN29HB` y lo consumido es `/booking/bookings`: pegar ahí el `/QN29HB/edit`
   * del Edit daba `/booking/bookings/QN29HB/QN29HB/edit`. Solo cuando lo consumido es un prefijo de
   * la ruta; un mediador embebido (sin consumedRoute) conserva su ruta y sus marcadores de query.
   */
  function mediatorBaseOf(outbound, fallbackRoute = '') {
    const o = outbound || {}
    const own = o.route && o.route !== 'null' && o.route !== 'undefined' ? o.route : ''
    const route = own || (fallbackRoute && fallbackRoute !== 'null' ? fallbackRoute : '')
    const consumed = o.consumedRoute
    if (!consumed || consumed === '_empty' || !consumed.startsWith('/')) return route
    const queryIndex = route.indexOf('?')
    const path = queryIndex >= 0 ? route.slice(0, queryIndex) : route
    const query = queryIndex >= 0 ? route.slice(queryIndex) : ''
    if (path !== consumed && path.startsWith(consumed + '/')) return consumed + query
    return route
  }

  /**
   * ¿La respuesta a una acción pide recargar la ruta interna del mediador? Devuelve esa ruta, o
   * null si no hay flip.
   *
   * Un crud de PÁGINA no contesta el detalle: contesta un fragmento SOLO-ESTADO cuyo `_route`
   * apunta a él (clic de fila → `/2CSXZN`, New → `/new`), que significa "recarga mi ruta interna
   * con este estado". Quien no sigue el flip se queda mirando el listado: la petición sale, el
   * servidor contesta 200, y no pasa nada — el fallo más difícil de ver de todos.
   *
   * El criterio es SEMÁNTICO (comparar el valor de `_route` antes y después), no por identidad:
   * los objetos de VB son proxies y las referencias no dicen nada.
   */
  function routeFlipOf(previousState, nextCtx, increment, fallbackRoute = '') {
    const stateOnly = increment && (increment.fragments || []).length > 0
      && (increment.fragments || []).every((f) => !f.component)
    if (!stateOnly || !nextCtx || !nextCtx.state) return null
    const flip = nextCtx.state._route
    const previous = previousState ? previousState._route : undefined
    if (flip == null || flip === previous) return null
    const outbound = nextCtx.outbound || {}
    return composeInnerRoute(mediatorBaseOf(outbound, fallbackRoute), flip)
  }

  /** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…).
   *  Static-bundle: si hay manifest cargado, la carga se responde DESDE el bundle (sin backend);
   *  se espera al fetch del manifest en vuelo (la primera carga puede adelantarlo) y, si la ruta no
   *  está en el bundle, se cae al backend — así un despliegue híbrido (bundle + backend) sigue yendo. */
  const loadRoute = async (base, route, initiator = '', extra = {}) => {
    await awaitBundle()
    if (hasBundle()) {
      const bundled = bundledIncrementFor(route, initiator)
      if (bundled) return bundled
    }
    return callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })
  }

  /** Acción saliente: arma la request desde el CONTEXTO — "manda el estado que ya tienes".
   *  Los 4 campos de ruta salen del `outbound` que loadRouteInto estampó al cargar el
   *  contexto (un mediador necesita consumedRoute + serverSideType también en las acciones). */
  function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
    // los OnSuccess (refresco periódico) se leen del contexto que LANZA la acción
    const source = ctx
    // la acción va al ServerSide que la DECLARA (la vista, no el mediador que la cargó): también
    // los triggers — el OnLoad «actualizar» de una vista cargada por un crud —, no sólo los botones
    ctx = actionTransportOf(ctx, actionId)
    const outbound = (ctx && ctx.outbound) || {}
    // Una superficie cargada de otro pod sigue hablando con ESE pod. La base viaja en el
    // outbound por la misma razón que los 4 campos de ruta: quien dispara una acción (el
    // trigger `search` de un listado, un botón del toolbar) sabe de qué contexto sale, pero
    // no de qué backend vino — y mandarla a la shell la contesta vacía, sin error.
    base = outbound.baseUrl != null ? outbound.baseUrl : base
    const initiator = (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || ''
    // Guard de doble envío. Una lectura queda EXENTA de la exclusividad: el guard existe porque
    // un segundo POST de una escritura significa una segunda fila, mientras que una segunda
    // lectura sólo significa datos más frescos — y bloquearlas rompería el type-ahead, donde la
    // búsqueda de "mad" se descartaría por estar en vuelo la de "ma".
    const exclusive = !isIdempotentAction(actionId, extra && extra.idempotent)
    const key = pendingActions.key(initiator, actionId)
    if (exclusive && !pendingActions.begin(key)) {
      // Duplicado: se descarta ANTES de construir la petición.
      return Promise.resolve(null)
    }
    const release = () => { if (exclusive) pendingActions.end(key) }
    return callMateu(base, {
      route: outbound.route || route,
      consumedRoute: outbound.consumedRoute || '',
      actionId,
      componentState: componentState || (ctx && ctx.state) || {},
      serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
      initiatorComponentId: initiator,
      ...extra,
    }, { timeoutMillis: extra && extra.timeoutMillis, idempotent: extra && extra.idempotent })
      .then((inc) => {
        release()
        if (inc) actionSucceeded(source, actionId)
        return inc
      }, (e) => { release(); throw e })
  }

  /**
   * Carga las opciones de los lookups REMOTOS de un contexto que aún no las tienen (los campos
   * editables de su formulario y los filtros de su listado; formLookupsOf): una búsqueda vacía
   * por lookup (`search-<campo>`, hasta 200), en paralelo, contra el ServerSide que la declara
   * — o el mediador, que la resuelve con la clase de sus filtros —, con el estado del contexto.
   * Cada respuesta deja sus opciones en ctx.data[campo]; se marcan como cargadas también las que
   * fallan, para no repetirlas en cada acción. Devuelve el registro nuevo.
   */
  async function loadLookups(base, reg, ctxId = HOST_ID, opts = {}) {
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    const pending = formLookupsOf(ctx)
    if (!pending.length) return reg
    const state = { ...(ctx.state || {}), ...(opts.draft || {}) }
    const found = await Promise.all(pending.map((lookup) =>
      runMateuAction(base, actionTransportOf(ctx, lookup.actionId), opts.route || '', lookup.actionId, state, {
        parameters: { searchText: '', fieldId: lookup.fieldId, size: 200, page: 0 },
        appState: opts.appState || {},
        idempotent: true,
      }).catch(() => null)))
    let out = reg
    for (const inc of found) {
      // sólo los DATOS: un lookup que falla no debe pintar su error encima de la pantalla
      if (inc) out = reduceContexts(out, { fragments: (inc.fragments || []).filter((f) => !f.component) })
    }
    return markLookupsLoaded(out, ctxId, pending.map((lookup) => lookup.fieldId))
  }

  /** Acción SSE (Action.sse(true), p.ej. LongTask): POST {base}/mateu/v3/sse/{route} con
   *  Accept text/event-stream — la respuesta es un STREAM de UIIncrements (data: …\n\n).
   *  Los increments se ENTREGAN EN VIVO vía `extra.onIncrement(inc)` (async; el diálogo de
   *  progreso del LongTask se pinta mientras el stream avanza); si el callback devuelve
   *  true, el increment se considera CONSUMIDO y se excluye de la lista devuelta. Sin
   *  callback, comportamiento clásico: lista completa al acabar. */
  async function runMateuActionSse(base, ctx, route, actionId, componentState, extra = {}) {
    const { onIncrement, ...bodyExtra } = extra || {}
    // atada a la pantalla en curso, como callMateu: cada increment se comprueba al llegar
    const view = currentView()
    ctx = actionTransportOf(ctx, actionId)
    const outbound = (ctx && ctx.outbound) || {}
    base = outbound.baseUrl != null ? outbound.baseUrl : base
    const effectiveRoute = outbound.route || route || ''
    const bare = effectiveRoute.replace(/^\//, '')
    // Sin timeout: un LongTask mantiene el stream abierto por diseño, así que un ceiling lo
    // mataría a mitad. Pasa igualmente por la política para que el fallo llegue clasificado.
    const res = await fetchWithPolicy(`${base}/mateu/v3/sse/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        appState: {},
        componentState: componentState || (ctx && ctx.state) || {},
        parameters: {},
        initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
        consumedRoute: outbound.consumedRoute || '',
        serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
        ...bodyExtra,
        route: bare ? `/${bare}` : '',
        actionId,
      }),
    }, { actionId, timeoutMillis: -1, view })
    const increments = []
    let reader
    const handle = async (raw) => {
      const line = raw.trim()
      if (!line.startsWith('data:')) return
      if (isViewStale(view)) {
        if (reader && reader.cancel) reader.cancel().catch(() => undefined)
        throw staleResponseError(actionId)
      }
      const inc = JSON.parse(line.slice(5).trim())
      const consumed = onIncrement ? await onIncrement(inc) : false
      if (!consumed) increments.push(inc)
    }
    if (res.body && res.body.getReader) {
      reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let cut
        while ((cut = buffer.indexOf('\n\n')) >= 0) {
          await handle(buffer.slice(0, cut))
          buffer = buffer.slice(cut + 2)
        }
      }
      if (buffer.trim()) await handle(buffer)
    } else {
      for (const chunk of (await res.text()).split('\n\n')) await handle(chunk)
    }
    return increments
  }

  /**
   * Un mediador cuyo WRAPPER llega como App de chrome (ClientSide type App) en vez de envuelto en un
   * ServerSide. Es la forma que hoy manda el backend al abrir una opción de menú: el mismo App que en
   * el bootstrap, pero pedido para una SUB-ruta (route por debajo de rootRoute). reduceContexts lo
   * absorbe como shell y el contexto queda vacío, así que mediatorOf(host) no lo detecta y la 2ª carga
   * —la del contenido real: search form + listado del crud— nunca se dispara. Se lee entonces del
   * incremento: si trae un App cuyo rootRoute es prefijo de la ruta pedida, hay contenido que buscar.
   *
   * La raíz del app (route === rootRoute) es la shell/home y NO pasa por aquí: la resuelve el
   * bootstrap. Sólo una navegación por debajo de la raíz necesita el segundo salto.
   */
  function mediatorFromShellApp(increment, route) {
    for (const fr of increment?.fragments || []) {
      const c = fr.component
      const md = c?.metadata
      if (c?.type !== 'ClientSide' || md?.type !== 'App') continue
      const rootRoute = md.rootRoute || ''
      if (rootRoute && route && route.startsWith(`${rootRoute}/`)) {
        return {
          rootRoute: md.homeConsumedRoute || rootRoute,
          serverSideType: md.homeServerSideType ?? md.serverSideType,
        }
      }
    }
    return null
  }

  /** ¿La carga contestó el «Not found.» del servidor (un Text suelto, sin ServerSide)? */
  function isServerNotFound(ctx) {
    const t = ctx && ctx.tree
    return !!(t && t.type === 'ClientSide' && t.metadata && t.metadata.type === 'Text'
      && /^not found\.?$/i.test(String(t.metadata.text || '').trim()))
  }

  /** La ruta TERMINAL de una entrada de menú dentro de un grupo (/gestion/island-host → /island-host),
   *  o null si no cuelga de ningún grupo. */
  function terminalMenuRouteOf(menu, route) {
    const path = String(route || '').split('?')[0]
    const query = String(route || '').slice(path.length)
    let found = null
    const visit = (options, parent) => {
      for (const o of options || []) {
        const r = o && (o.route || o.path)
        if (!r) continue
        if (parent && r === path && r.indexOf(parent + '/') === 0) found = r.slice(parent.length) + query
        visit(o.submenus || o.submenu, r)
      }
    }
    visit(menu, '')
    return found
  }

  /**
   * Carga una ruta del MENÚ LOCAL: la compuesta con el serverSideType del app que la declara (lo
   * que hace Vaadin al elegir la opción); si el servidor no la reconoce —un RouteLink metido en un
   * grupo apunta a una ruta absoluta que no es camino de menú— se reintenta por la terminal.
   * Una ruta que no es del menú se carga tal cual.
   */
  async function loadMenuRouteInto(base, reg, route, targetId = '', extra = {}) {
    const shell = (reg && reg.shell) || {}
    const option = localMenuOptionOf(shell.menu, route)
    if (!option) return loadRouteInto(base, reg, route, targetId, extra)
    const next = await loadRouteInto(base, reg, route, targetId,
      { ...extra, serverSideType: option.serverSideType || shell.serverSideType })
    const terminal = terminalMenuRouteOf(shell.menu, route)
    if (terminal && isServerNotFound(next.contexts[targetId === '' ? HOST_ID : targetId]))
      return loadRouteInto(base, reg, terminal, targetId, extra)
    return next
  }

  /**
   * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
   * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
   * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
   */
  async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
    // el INCREMENTO crudo se conserva: la 1ª carga de una opción de menú llega como App de mediador
    // (ClientSide type App), que reduceContexts encamina al CHROME (shell) y no al contexto —
    // mediatorOf(host) no lo ve, así que hay que sacar el mediador del incremento mismo.
    let firstIncrement = await loadRoute(base, route, targetId, extra)
    const ctxId = targetId === '' ? HOST_ID : targetId
    let outbound = { route, consumedRoute: '', serverSideType: undefined, baseUrl: base }
    // La CADENA de rutas (P1): un registro con pestañas que son páginas llega como uno o varios Apps
    // ANIDADOS (el maestro) antes de la pantalla de su hueco. Cada uno es un NIVEL (título +
    // pestañas), no la shell; se sigue su home hasta llegar al contenido.
    const shellType = reg && reg.shell ? reg.shell.serverSideType : undefined
    const appLevels = []
    // la ruta que de verdad se carga: un maestro alcanzado solo (/customers/7) abre su pestaña
    // por defecto (/customers/7/orders)
    let effectiveRoute = route
    for (let hop = 0; hop < 4; hop++) {
      const split = splitNestedApps(firstIncrement, shellType, route)
      if (!split.levels.length) break
      appLevels.push(...split.levels)
      const home = split.levels[split.levels.length - 1].home
      effectiveRoute = home.route || effectiveRoute
      outbound = { route: effectiveRoute, consumedRoute: home.consumedRoute || '', serverSideType: home.serverSideType, baseUrl: base }
      firstIncrement = await loadRoute(base, effectiveRoute, targetId, {
        ...extra,
        consumedRoute: outbound.consumedRoute,
        serverSideType: outbound.serverSideType,
      })
    }
    let next = reduceContexts(reg, firstIncrement)
    // las ACTIONS del componente (con su flag sse) viajan en el WRAPPER del mediador —
    // la carga de contenido las pierde, así que se conservan aquí
    const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
    const wrapperActions = (wrapperTree && wrapperTree.actions) || []
    const info = mediatorOf(next.contexts[ctxId]) || mediatorFromShellApp(firstIncrement, effectiveRoute)
    if (info) {
      outbound = {
        route: effectiveRoute,
        consumedRoute: info.rootRoute || effectiveRoute,
        serverSideType: info.serverSideType,
        baseUrl: base,
      }
      next = reduceContexts(
        next,
        await loadRoute(base, effectiveRoute, targetId, {
          ...extra,
          consumedRoute: outbound.consumedRoute,
          serverSideType: outbound.serverSideType,
        }),
      )
    }
    // el contexto RECUERDA cómo se cargó: las acciones salientes reconstruyen los campos
    // de ruta desde aquí (structural sharing: solo cambia la ref de esta entrada).
    // sseActionIds: acciones anunciadas Action.sse(true) — van por el endpoint /sse
    next = {
      ...next,
      contexts: {
        ...next.contexts,
        [ctxId]: {
          ...next.contexts[ctxId],
          outbound,
          sseActionIds: wrapperActions.filter((a) => a && a.sse).map((a) => a.id),
        },
      },
    }
    // los niveles de app (maestros) de la pantalla del HOST: una barra de pestañas por nivel
    if (targetId === '') next = { ...next, appLevels, loadedRoute: effectiveRoute }
    return next
  }

  /**
   * Carga un @Subresource (subresourceIslandOf) en SU contexto: la carga por su tipo — sin el baile
   * del mediador: el App que lo envuelve ya dice qué clase es — con el estado que le siembra el padre,
   * y su búsqueda OnLoad (las filas). Devuelve el registro nuevo.
   */
  async function loadSubresource(base, reg, sub, extra = {}) {
    const outbound = { route: sub.route, consumedRoute: sub.consumedRoute, serverSideType: sub.serverSideType, baseUrl: base }
    let next = reduceContexts(reg, await loadRoute(base, sub.route, sub.id, {
      ...extra,
      consumedRoute: sub.consumedRoute,
      serverSideType: sub.serverSideType,
      componentState: sub.componentState || {},
    }))
    next = { ...next, contexts: { ...next.contexts, [sub.id]: { ...next.contexts[sub.id], outbound } } }
    for (const triggerActionId of onLoadTriggers(next.contexts[sub.id])) {
      const ctx = next.contexts[sub.id]
      const listing = listingOf(ctx)
      const componentState = { ...(sub.componentState || {}), ...(ctx.state || {}), page: 0, size: (listing && listing.pageSize) || 10 }
      const increment = await runMateuAction(base, ctx, sub.route, triggerActionId, componentState, extra)
      if (increment) next = reduceContexts(next, increment)
    }
    return next
  }

  /**
   * Carga los @Subresource que el contenido deja a la vista y aún no están cargados (los de la
   * pestaña activa: lo que está en otra pestaña espera a que se abra). Uno que falla se queda como
   * hueco: no tumba la pantalla.
   */
  async function loadSubresources(base, reg, blocks, extra = {}) {
    let next = reg
    for (const sub of pendingSubresourcesOf(blocks, next.contexts)) {
      try {
        next = await loadSubresource(base, next, sub, extra)
      } catch (ignored) { /* la banda de error ya lo cuenta (onSettle) */ }
    }
    return next
  }

  /**
   * De qué backend se cargó una superficie, o undefined si aún no se sabe.
   *
   * Una isla se carga con `loadRouteInto`, que recibe la base como argumento: la cadena que la
   * dispara conoce el id del contexto, no el pod. Preguntándoselo al HOST (el valor por defecto)
   * la isla se carga de donde vino la pantalla que la contiene, que es lo que siempre quiere.
   */
  function baseOf(reg, ctxId = HOST_ID) {
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    return ctx && ctx.outbound ? ctx.outbound.baseUrl : undefined
  }

  // ── menús federados ────────────────────────────────────────────────────────────────────────
  //
  // Una shell declara secciones que sirve OTRO pod: `RemoteMenu("/_workflow")`. El árbol que llega
  // en el bootstrap trae esas opciones marcadas `remote` y SIN hijos — los hijos son del pod, y hay
  // que ir a buscarlos. Hasta ahora este renderer no lo hacía: pintaba el rótulo que la shell había
  // escrito y nada debajo, que se lee como "ese servicio no tiene pantallas" en vez de como "nadie
  // se lo ha preguntado".
  //
  // Lo que sigue es la mitad fácil. La otra está en la navegación: una entrada traída de otro pod
  // solo se puede cargar llamando a ESE pod, y este bridge llamaba siempre al base de la shell. Por
  // eso cada opción adoptada queda registrada en `remoteRoutes`, y la cadena de navegación consulta
  // ahí a dónde tiene que ir. Sin esa segunda mitad, expandir el menú es peor que no expandirlo:
  // aparecen entradas que al pulsarlas no llevan a ninguna parte.

  /** Ruta de menú → dónde vive de verdad. La llena expandRemoteMenus; la lee la navegación. */
  const remoteRoutes = new Map()

  /**
   * Dónde vive una ruta, o undefined si la sirve la propia shell.
   *
   * Casa también por PREFIJO, con el registro más largo que encaje: al registro solo llegan las
   * rutas del MENÚ (`/workflow/processes`), y todo lo que cuelga de ellas —el detalle de un
   * proceso, `/new`, `/{id}/edit`— vive en el mismo pod. Sin esto, un deep-link a
   * `/workflow/processes/<id>` salía al backend de la shell, que contesta "Not found.".
   */
  function remoteRouteOf(route) {
    if (route == null) return undefined
    const bare = String(route).replace(/^\//, '')
    const exact = remoteRoutes.get(route) || remoteRoutes.get(bare)
    if (exact) return exact
    let best = null
    let bestLength = -1
    for (const [registered, descriptor] of remoteRoutes) {
      const prefix = String(registered).replace(/^\//, '')
      if (!prefix || prefix.length <= bestLength) continue
      if (bare === prefix || bare.indexOf(prefix + '/') === 0) {
        best = descriptor
        bestLength = prefix.length
      }
    }
    return best || undefined
  }

  /**
   * Registra a qué pod va una ruta que NO vino del menú: la navegación que pide un widget remoto
   * (el enlace del badge de la bandeja emite navigation-requested con su baseUrl y su
   * serverSideType). Una ruta que el menú ya registró se queda como está — el menú manda.
   */
  function registerRemoteRoute(route, descriptor) {
    if (!route || !descriptor || !descriptor.baseUrl || remoteRouteOf(route)) return false
    const entry = {
      baseUrl: descriptor.baseUrl,
      consumedRoute: descriptor.consumedRoute || '',
      serverSideType: descriptor.serverSideType,
      uriPrefix: descriptor.uriPrefix || '',
    }
    remoteRoutes.set(route, entry)
    remoteRoutes.set(String(route).replace(/^\//, ''), entry)
    return true
  }

  const childrenOf = (option) => option.submenus || option.submenu || []

  /** Las opciones remotas del árbol, a cualquier profundidad.
   *  No se baja DENTRO de una remota: lo que cuelgue de ella es del pod, y aún no ha contestado. */
  function collectRemoteMenus(menu, found = []) {
    for (const option of menu || []) {
      if (option.remote) found.push(option)
      else if (childrenOf(option).length) collectRemoteMenus(childrenOf(option), found)
    }
    return found
  }

  /** El menú del App que contesta un pod, o null si no contestó con uno. */
  function appMenuOf(increment) {
    for (const fragment of (increment && increment.fragments) || []) {
      const md = (fragment.component && fragment.component.metadata) || {}
      if (fragment.component && fragment.component.type === 'ClientSide' && md.type === 'App') {
        return { menu: md.menu || [], route: md.route || '', serverSideType: md.serverSideType }
      }
    }
    return null
  }

  /**
   * Marca las hojas traídas de un pod con dónde vive ese pod.
   *
   * Solo las que no traen `baseUrl` propio: un pod puede a su vez federar, y su respuesta ya viene
   * resuelta. Un grupo no se marca, se recorre — lo que navega es la hoja.
   */
  function adoptRemote(menu, option, app) {
    const serverSideType = option.serverSideType ? option.serverSideType : app.serverSideType
    for (const child of menu || []) {
      if (child.baseUrl) continue
      if (childrenOf(child).length) {
        adoptRemote(childrenOf(child), option, app)
        // El grupo también es del pod: lo que cuelga de su ruta y no es ninguna de sus hojas —la
        // página de UNA tarea, /forms/task/<id>, bajo el grupo /forms cuyas hojas son /forms/tasks
        // y /forms/executions— vive en el mismo pod. Es lo que reclama el servidor de la shell
        // (RemoteMenuHandler.claimLength cuenta todas las rutas del menú, grupos incluidos); sin
        // esto ese deep-link salía al backend de la shell, que contesta "Not found.". Solo como
        // prefijo de respaldo: remoteRouteOf se queda con el registro más largo, así que una hoja
        // sigue ganándole al grupo que la contiene. El grupo no se marca: lo que navega es la hoja.
        registerGroupRoute(child.route || child.path || '', option, app, serverSideType)
        continue
      }
      child.baseUrl = option.baseUrl
      child.consumedRoute = app.route || ''
      child.serverSideType = serverSideType
      child.uriPrefix = option.route
      const descriptor = {
        baseUrl: option.baseUrl,
        consumedRoute: app.route || '',
        serverSideType,
        uriPrefix: option.route,
      }
      // Por la ruta tal cual, y por la que verá la navegación cuando shellNavOf le quite el
      // prefijo del padre. Dos claves para la misma entrada es más barato que reconstruir
      // aquí el cálculo que hace el nav, y que se desincronicen luego.
      const route = child.route || child.path || ''
      remoteRoutes.set(route, descriptor)
      remoteRoutes.set(String(route).replace(/^\//, ''), descriptor)
    }
  }

  /** La ruta de un grupo de un pod, registrada como prefijo; la de una hoja ya registrada no se pisa. */
  function registerGroupRoute(route, option, app, serverSideType) {
    const bare = String(route || '').replace(/^\//, '')
    if (!bare || remoteRoutes.has(bare)) return
    const descriptor = {
      baseUrl: option.baseUrl,
      consumedRoute: app.route || '',
      serverSideType,
      uriPrefix: option.route,
    }
    remoteRoutes.set('/' + bare, descriptor)
    remoteRoutes.set(bare, descriptor)
  }

  function spliceRemote(menu, answers, sections = false, depth = 0) {
    const out = []
    for (const option of menu || []) {
      if (option.remote) {
        const app = answers.get(option)
        // Remota OCULTA (`@Menu @Hidden RemoteMenu`, visible:false en el wire): sus rutas se
        // registran igual —un deep-link o una recarga bajo ellas tiene que ir a su pod— pero no
        // aporta nada al menú, ni siquiera el rótulo si el pod no contestó.
        // Remota OCULTA (`@Menu @Hidden RemoteMenu`, visible:false en el wire): sus rutas se
        // registran igual —un deep-link o una recarga bajo ellas tiene que ir a su pod— y sus
        // entradas se quedan en el árbol, ocultas: no se pintan (shellNavOf), pero una página bajo
        // ellas tiene sus migas. Si el pod no contestó, se queda el marcador, también oculto.
        if (option.visible === false) {
          if (app) {
            adoptRemote(app.menu, option, app)
            out.push(...markHidden(app.menu))
          } else {
            out.push(option)
          }
          continue
        }
        if (app) {
          adoptRemote(app.menu, option, app)
          // HAMBURGER_SECTIONS: un pod montado en el primer nivel es UNA sección conteste lo que
          // conteste (asSection, navTree.mjs); si no, el rótulo que la shell declaró manda sobre el
          // del pod
          const entries = sections && depth === 0 ? asSection(app.menu, option) : app.menu
          out.push(...labelledByShell(entries, option))
        } else {
          // El pod no contestó. Se queda la sección, deshabilitada y diciendo por qué: una sección
          // vacía se entiende, una que desaparece parece que nunca existió.
          out.push(unavailableMount(option))
        }
      } else if (childrenOf(option).length) {
        out.push({ ...option, submenus: spliceRemote(childrenOf(option), answers, sections, depth + 1) })
      } else {
        out.push(option)
      }
    }
    return out
  }

  /**
   * Pide a cada pod su menú y lo pone donde estaba su opción.
   *
   * En paralelo, y un pod que falle no tumba al resto: su sección se queda como estaba en vez de
   * llevarse por delante las que sí contestaron. Con `sections` (HAMBURGER_SECTIONS) cada pod
   * montado en el primer nivel queda como una sola sección (asSection).
   */
  async function expandRemoteMenus(menu, { sections = false } = {}) {
    const remotes = collectRemoteMenus(menu)
    if (!remotes.length) return menu
    const answers = new Map()
    await Promise.all(remotes.map(async (option) => {
      try {
        const increment = await callMateu(option.baseUrl || '', {
          route: option.route || '',
          actionId: '',
          consumedRoute: '_empty',
          initiatorComponentId: (option.baseUrl || '') + '#' + (option.route || ''),
          parameters: option.params || {},
          // su fallo es el de SU sección: sin banda de error ni "sin conexión" para toda la app
        }, { quiet: true, isolated: true, timeoutMillis: 20000 })
        const app = appMenuOf(increment)
        if (app) answers.set(option, app)
      } catch (e) {
        // Silencioso a propósito (quiet/isolated): la sección se queda no disponible (spliceRemote).
      }
    }))
    return spliceRemote(menu, answers, sections)
  }


  // Widgets de CABECERA del App (WidgetSupplier.widgets / @Widget): llegan como hijos del App con
  // slot "widgets" — un layout con, típicamente, un MicroFrontend (el badge de la bandeja, otro pod
  // que se refresca solo) y un Popover sobre un Text (el saludo al usuario, que abre su email y el
  // Logout). El renderer Vaadin los pinta tal cual en su barra; aquí se reparten entre las DOS zonas
  // que declara oj-sp-global-header:
  //
  //  - slot `usermenu`: el área de perfil de la cabecera global de Redwood (FA pone ahí el avatar del
  //    usuario, y al pulsarlo su menú). Un Popover cuyo disparador es un TEXT es el idioma Mateu de
  //    "quién soy + un menú": un texto no es un control, así que lo único que puede estar diciendo es
  //    un rótulo — y en la cabecera, el del usuario. El PRIMERO de esos va al área de perfil como
  //    avatar con iniciales + nombre, y su contenido a un oj-popup anclado. Es un reconocimiento de
  //    FORMA, no de valores: no se mira qué dice el texto.
  //  - slot `end` (zona de acciones): todo lo demás, en orden — HTML de un Text, el HTML vivo de un
  //    MicroFrontend, y cualquier otro Popover como botón + oj-popup.
  //
  // El HTML se pinta como HTML (lo es en el wire: un <a> con su onclick que emite
  // navigation-requested), con una sola traducción: <vaadin-icon> no existe en Redwood y se cambia
  // por el icono de fuente oj-ux-ico equivalente. La navegación que emite la escucha la shell.


  const CONTAINERS = new Set([
    'HorizontalLayout', 'VerticalLayout', 'FormLayout', 'Container', 'Div', 'Scroller',
    'SplitLayout', 'FlexLayout',
  ])

  const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }

  /** El texto visible de un fragmento HTML: sin etiquetas, entidades resueltas, blancos plegados. */
  function plainTextOf(html) {
    return String(html == null ? '' : html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (all, name) => ENTITIES[name])
      .replace(/\s+/g, ' ')
      .trim()
  }

  /** Iniciales para el avatar: del nombre que sigue al saludo ("Hola, Demo User" → "DU"). */
  function initialsOf(label) {
    const text = plainTextOf(label)
    const who = text.indexOf(',') >= 0 ? text.slice(text.lastIndexOf(',') + 1) : text
    const words = who.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
    if (!words.length) return ''
    const first = words[0][0]
    const last = words.length > 1 ? words[words.length - 1][0] : (words[0][1] || '')
    return (first + last).toUpperCase()
  }

  const attrOf = (attrs, name) => {
    const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(attrs || '')
    return m ? (m[2] != null ? m[2] : m[3]) : null
  }

  /**
   * El HTML de un widget, apto para Redwood: cada <vaadin-icon icon="vaadin:x"> pasa a un
   * <span class="oj-ux-ico-…"> (fuente de iconos de Redwood) conservando su style — su tamaño, su
   * alineación y su color (p.ej. el rojo del badge cuando hay algo urgente). Un icono sin
   * equivalente se quita: un elemento desconocido no pinta nada y ocupa su sitio igual.
   */
  function redwoodHtmlOf(html) {
    const swap = (all, attrs) => {
      const cls = ojIconOf(attrOf(attrs, 'icon'))
      if (!cls) return ''
      const style = attrOf(attrs, 'style')
      return `<span class="${cls} mateu-widget-icon" aria-hidden="true"${style ? ` style="${style}"` : ''}></span>`
    }
    return String(html == null ? '' : html)
      .replace(/<vaadin-icon\b([^>]*?)\/>/gi, swap)
      .replace(/<vaadin-icon\b([^>]*)>\s*<\/vaadin-icon>/gi, swap)
  }

  /** El contenido de un Popover → filas del popup (texto, enlace), en orden. */
  function popoverContentOf(node) {
    const out = []
    const visit = (n) => {
      if (!n) return
      if (Array.isArray(n)) { n.forEach(visit); return }
      const md = n.metadata || {}
      if (md.type === 'Text') {
        const text = plainTextOf(md.text)
        if (text) out.push({ id: 'r' + out.length, isText: true, text })
        return
      }
      if (md.type === 'Anchor') {
        out.push({ id: 'r' + out.length, isLink: true, label: md.text || md.url || '', href: md.url || '#', target: md.target || '' })
        return
      }
      if (md.type === 'Button') {
        // un botón en el popup de un widget solo puede navegar o ejecutar JS del cliente: sin
        // contexto propio no tiene a quién mandar una acción de servidor
        const label = md.label || md.text || ''
        if (label) out.push({ id: 'r' + out.length, isText: true, text: label })
        return
      }
      for (const child of n.children || []) visit(child)
      if (md.content) visit(md.content)
    }
    visit(node)
    return out
  }

  /**
   * La proyección de los widgets de cabecera del registro: `user` (el área de perfil) o null, e
   * `items` (la zona de acciones), cada uno con un id estable por POSICIÓN — el mismo en cada
   * bootstrap, que es lo que deja al DOM y al refresco reencontrar su hueco.
   */
  function headerWidgetsOf(reg) {
    const nodes = (reg && reg.shell && reg.shell.widgets) || []
    let user = null
    const items = []
    const visit = (node, path) => {
      if (!node) return
      const md = node.metadata || {}
      const id = 'mateu-widget-' + path
      if (CONTAINERS.has(md.type)) {
        (node.children || []).forEach((child, i) => visit(child, path + '-' + i))
        if (md.content) (Array.isArray(md.content) ? md.content : [md.content]).forEach((c, i) => visit(c, path + '-c' + i))
        return
      }
      if (md.type === 'Popover') {
        const wrapped = md.wrapped || {}
        const wmd = wrapped.metadata || {}
        const label = wmd.type === 'Text' ? plainTextOf(wmd.text) : plainTextOf(wmd.label || wmd.text || '')
        const rows = popoverContentOf(md.content)
        if (!user && wmd.type === 'Text' && label) {
          user = { id, label, initials: initialsOf(label), rows }
        } else {
          items.push({ id, isPopover: true, label: label || '…', rows, buttonId: id + '-button', popupId: id + '-popup' })
        }
        return
      }
      if (md.type === 'MicroFrontend') {
        items.push({
          id,
          isRemote: true,
          baseUrl: md.baseUrl || '',
          route: md.route || '',
          consumedRoute: md.consumedRoute || '',
          serverSideType: md.serverSideType || undefined,
          appState: md.appState || null,
        })
        return
      }
      if (md.type === 'Text') {
        const html = redwoodHtmlOf(md.text)
        if (plainTextOf(html) || /<span class="oj-ux-ico-/.test(html)) items.push({ id, isHtml: true, html })
        return
      }
      if (md.type === 'Anchor') {
        items.push({ id, isHtml: true, html: `<a href="${String(md.url || '#').replace(/"/g, '&quot;')}"${md.target ? ` target="${md.target}"` : ''}>${md.text || ''}</a>` })
      }
    }
    nodes.forEach((node, i) => visit(node, String(i)))
    return { user, items }
  }

  /** El HTML de un widget remoto ya cargado: sus Text, interpolados contra su state. */
  function remoteWidgetHtmlOf(tree, state) {
    const parts = []
    const visit = (n) => {
      if (!n) return
      const md = n.metadata || {}
      if (md.type === 'Text') parts.push(redwoodHtmlOf(interpolate(md.text, state)))
      for (const child of n.children || []) visit(child)
    }
    visit(tree)
    return parts.join('')
  }

  const widgetRuntimes = new Map()

  /**
   * Carga un MicroFrontend de cabecera y lo mantiene vivo con SUS triggers: OnLoad al cargar y
   * OnSuccess tras cada acción que los nombre (el badge: `refresh` cada 10 s, encadenado). Es el
   * mismo contrato que el renderer web — si un refresco falla, no se reprograma (OnSuccess).
   *
   * Las peticiones van en modo `quiet`: un refresco de fondo cada pocos segundos no debe encender la
   * barra de ocupado ni la banda de error de la pantalla, que hablan de lo que el usuario hace.
   *
   * `deps` existe para los tests (call/schedule/cancel); `onHtml(html)` recibe cada repintado.
   * Arrancar de nuevo el mismo id para el anterior: un rebootstrap no deja dos bucles.
   */
  function startRemoteWidget(item, onHtml, deps = {}) {
    const call = deps.call || callMateu
    const schedule = deps.schedule || ((fn, ms) => setTimeout(fn, ms))
    const cancel = deps.cancel || ((h) => clearTimeout(h))
    const appState = deps.appState || (() => ({}))
    stopRemoteWidget(item.id, cancel)
    const rt = { stopped: false, timers: new Set(), ctx: null, outbound: {} }
    widgetRuntimes.set(item.id, rt)

    const request = (actionId, extra = {}) => call(item.baseUrl || '', {
      route: item.route || '',
      consumedRoute: rt.outbound.consumedRoute != null ? rt.outbound.consumedRoute : (item.consumedRoute || ''),
      serverSideType: rt.outbound.serverSideType || (rt.ctx && rt.ctx.tree && rt.ctx.tree.serverSideType) || item.serverSideType,
      actionId,
      initiatorComponentId: item.id,
      componentState: (rt.ctx && rt.ctx.state) || {},
      appState: Object.assign({}, appState(), item.appState || {}),
      ...extra,
    }, { quiet: true, idempotent: true })

    const apply = (increment) => {
      for (const fr of (increment && increment.fragments) || []) {
        if (fr.component) {
          rt.ctx = { tree: fr.component, state: fr.state || fr.component.initialData || {} }
        } else if (fr.state && rt.ctx) {
          rt.ctx = { tree: rt.ctx.tree, state: Object.assign({}, rt.ctx.state, fr.state) }
        }
      }
      if (!rt.stopped && rt.ctx) onHtml(remoteWidgetHtmlOf(rt.ctx.tree, rt.ctx.state))
    }

    const plan = (trigger) => {
      if (rt.stopped) return
      const handle = schedule(() => { rt.timers.delete(handle); run(trigger.actionId) }, trigger.timeoutMillis || 0)
      rt.timers.add(handle)
    }
    const triggers = () => (rt.ctx && rt.ctx.tree && rt.ctx.tree.triggers) || []

    const run = async (actionId) => {
      if (rt.stopped) return
      try {
        apply(await request(actionId))
      } catch (e) {
        return
      }
      for (const t of triggers()) if (t.type === 'OnSuccess' && t.calledActionId === actionId) plan(t)
    }

    const load = (async () => {
      try {
        apply(await request(''))
        // un remoto que conteste con un mediador (App chromeless) trae el contenido en un 2º salto
        const info = rt.ctx && mediatorOf(rt.ctx)
        if (info) {
          rt.outbound = { consumedRoute: info.rootRoute || item.route || '', serverSideType: info.serverSideType }
          apply(await request('', { consumedRoute: rt.outbound.consumedRoute, serverSideType: info.serverSideType }))
        }
      } catch (e) {
        return
      }
      for (const t of triggers()) if (t.type === 'OnLoad' && t.actionId) plan(t)
    })()

    return {
      loaded: load,
      stop: () => stopRemoteWidget(item.id, cancel),
      // para los tests: cuántos refrescos hay programados
      pending: () => rt.timers.size,
    }
  }

  function stopRemoteWidget(id, cancel = (h) => clearTimeout(h)) {
    const previous = widgetRuntimes.get(id)
    if (!previous) return
    previous.stopped = true
    for (const h of previous.timers) cancel(h)
    previous.timers.clear()
    widgetRuntimes.delete(id)
  }

  function stopRemoteWidgets() {
    for (const [id, rt] of widgetRuntimes) {
      rt.stopped = true
      for (const h of rt.timers) clearTimeout(h)
      widgetRuntimes.delete(id)
    }
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────────────────────
  // VB no sabe estampar HTML crudo desde un binding: el hueco (<span class="mateu-header-widget"
  // data-widget-id>) lo pinta la plantilla y el HTML lo pone el bridge, como con los componentes web
  // de terceros (elements.mjs). Se recuerda el último HTML de cada hueco: si VB lo re-estampa, el
  // siguiente montaje lo rellena otra vez; si no cambió, no se toca (un clic en curso sobre el
  // enlace no pierde su elemento cada 10 s).

  const lastHtml = {}

  function mountHeaderHtml(id, html) {
    if (html != null) lastHtml[id] = html
    if (typeof document === 'undefined') return false
    const hole = document.querySelector(`.mateu-header-widget[data-widget-id="${id}"]`)
    if (!hole) return false
    const next = lastHtml[id] || ''
    if (hole.__mateuHtml !== next) {
      hole.innerHTML = next
      hole.__mateuHtml = next
    }
    return true
  }

  /** Igual, esperando a que VB pinte el hueco (sus bindings son asíncronos). */
  function mountHeaderHtmlSoon(id, html, frames = 30) {
    if (html != null) lastHtml[id] = html
    if (typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => {
      if (mountHeaderHtml(id)) return
      left -= 1
      if (left > 0) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  // ── FAB de "ask" del shell ──────────────────────────────────────────────────────────────────
  // oj-sp-simple-ui-shell estampa su propio FAB (evento ojSpChatAction) con `oj-ux-ico-oracle-chat`:
  // el bocadillo de conversación del asistente DIGITAL de Oracle. Aquí ese FAB abre Ask Oracle — el
  // buscador de destinos —, y el chat del agente tiene su propio FAB con `oj-ux-ico-chat`: dos
  // bocadillos para dos cosas distintas. Así que el del shell lleva la marca de Ask Oracle, el glifo
  // que usa el propio oj-sp-ask-oracle en la cabecera de Fusion (`oj-ux-ico-oracle-o`, la "O" de
  // Oracle), y su rótulo. Un App que no quiera la marca Oracle pone la suya con @App(askLabel,
  // askIcon): una inicial, una imagen (su logo) o un icono.

  const ASK_FAB_LABEL = 'Ask Oracle'
  const ASK_FAB_GLYPH = 'oj-ux-ico-oracle-o'
  /** El glifo con el que lo estampa el shell (el que se quita). */
  const SHELL_CHAT_GLYPH = 'oj-ux-ico-oracle-chat'

  const isImageRef = (value) => /^(data:|https?:|\/\/)/i.test(value) || /[/.]/.test(value)

  /**
   * Qué lleva el FAB de "ask" del shell: `{ label, kind, glyph?, text?, src? }`.
   *  - sin @App(askIcon): el glifo de Ask Oracle de Redwood (kind 'glyph');
   *  - una o dos letras ("R"): la inicial (kind 'initial');
   *  - una ruta o url ("/images/riu.svg"): la imagen (kind 'image'), relativa al backend como el logo;
   *  - `oj-ux-ico-…` o un nombre Mateu (`vaadin:…`) con equivalente: ese icono (kind 'glyph').
   * Un askIcon que no es nada de eso (un icono sin equivalente, una palabra) no deja el FAB vacío:
   * vuelve al glifo de Ask Oracle.
   */
  function askFabOf(shell, base = '') {
    const label = String((shell && shell.askLabel) || '').trim() || ASK_FAB_LABEL
    const raw = String((shell && shell.askIcon) || '').trim()
    const glyph = (cls) => ({ label, kind: 'glyph', glyph: cls })
    if (!raw) return glyph(ASK_FAB_GLYPH)
    if (isImageRef(raw)) {
      const absolute = /^(data:|https?:|\/\/)/i.test(raw)
      return { label, kind: 'image', src: absolute ? raw : base + raw }
    }
    if (raw.startsWith('oj-ux-') || raw.includes(':')) return glyph(ojIconOf(raw) || ASK_FAB_GLYPH)
    const letters = Array.from(raw)
    if (letters.length <= 2) return { label, kind: 'initial', text: raw.toUpperCase() }
    return glyph(ASK_FAB_GLYPH)
  }

  const MARK_CLASS = 'mateu-ask-fab-mark'
  const BRANDED_CLASS = 'mateu-ask-fab-branded'

  /**
   * Pone la marca y el nombre al FAB del shell (`fab`, el `<a>`; dentro, el `div role=img` del
   * glifo). Idempotente: se puede volver a aplicar con otra marca. Además le da lo que el shell no le
   * da: sin href ni rol, no se alcanzaba con el tabulador y sólo decía "Ask".
   */
  function brandAskFab(fab, spec) {
    if (!fab || !spec) return false
    const icon = fab.querySelector('.oj-sp-rw-chat-icon-image')
    if (!icon) return false
    fab.setAttribute('role', 'button')
    fab.setAttribute('tabindex', '0')
    fab.setAttribute('aria-label', spec.label)
    fab.setAttribute('title', spec.label)
    if (!fab.__mateuKeys) {
      fab.__mateuKeys = true
      fab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          fab.click()
        }
      })
    }
    icon.setAttribute('aria-label', spec.label)
    icon.classList.remove(SHELL_CHAT_GLYPH, BRANDED_CLASS)
    if (icon.__mateuGlyph) icon.classList.remove(icon.__mateuGlyph)
    icon.__mateuGlyph = null
    const old = icon.querySelector(`.${MARK_CLASS}`)
    if (old) old.remove()
    if (spec.kind === 'glyph') {
      icon.classList.add(spec.glyph)
      icon.__mateuGlyph = spec.glyph
      return true
    }
    const mark = icon.ownerDocument.createElement(spec.kind === 'image' ? 'img' : 'span')
    mark.className = `${MARK_CLASS} ${MARK_CLASS}-${spec.kind}`
    mark.setAttribute('aria-hidden', 'true')
    if (spec.kind === 'image') {
      mark.setAttribute('alt', '')
      mark.setAttribute('src', spec.src)
    } else {
      mark.textContent = spec.text
    }
    icon.classList.add(BRANDED_CLASS)
    icon.appendChild(mark)
    return true
  }


  // poc/chat.mjs — núcleo de transporte del CHAT de IA, renderer-neutral (paridad Redwood/VB).
  //
  // El chat compartido (libs/mateu/.../mateu-chat.ts, ~939 líneas) mezcla transporte y UI de Lit. Para
  // llevarlo a VB "apoyándonos en VB al máximo" (la UI la pone un componente de conversación de JET, no
  // dibujada a mano), lo que se comparte es SOLO la lógica de transporte: construir el body, elegir la
  // URL (agente local vs sseUrl), aplanar el menú como contexto, discriminar cada payload `data:` y
  // acumular el texto del asistente. Ese núcleo va aquí — probado en Node (poc/test.mjs) — y el bucle
  // de streaming acepta un `fetchImpl` inyectable para no tocar globals. Es la capa "lógica" del
  // roadmap; el panel VB (gate visual) la consume. Sin imports: se concatena en el bundle AMD.

  /** Discrimina un payload `data:` que es un objeto de uso de tokens ({inputTokens|outputTokens|totalTokens}). */
  function tryParseTokenUsage(payload) {
    const trimmed = (payload || '').trim()
    if (!trimmed.startsWith('{')) return null
    try {
      const obj = JSON.parse(trimmed)
      if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) return obj
    } catch {
      // no es JSON válido
    }
    return null
  }

  /** Discrimina un payload `data:` que es un evento personalizado del agente ({event, detail}). */
  function tryParseCustomEvent(payload) {
    const trimmed = (payload || '').trim()
    if (!trimmed.startsWith('{')) return null
    try {
      const obj = JSON.parse(trimmed)
      if (typeof obj.event === 'string') return { event: obj.event, detail: obj.detail ?? {} }
    } catch {
      // no es JSON válido
    }
    return null
  }

  /** Aplana el menú al contexto que recibe el LLM (solo en el primer mensaje). Misma forma que
   *  `MenuContextEntry` del chat compartido: breadcrumb `path` + objeto `navigation`. Salta
   *  separadores y entradas remotas aún sin resolver (su ruta apunta al loader, no a una pantalla). */
  function buildChatMenuContext(options, parentPath = []) {
    const result = []
    for (const opt of options || []) {
      if (opt.separator) continue
      if (opt.remote) continue
      const path = [...parentPath, opt.label]
      if (opt.submenus && opt.submenus.length > 0) {
        result.push(...buildChatMenuContext(opt.submenus, path))
      } else {
        const entry = {
          path,
          navigation: {
            route: opt.route,
            consumedRoute: opt.consumedRoute,
            actionId: opt.actionId ?? '',
            baseUrl: opt.baseUrl,
            serverSideType: opt.serverSideType,
            uriPrefix: opt.uriPrefix,
          },
        }
        if (opt.description) entry.description = opt.description
        // lo que el agente necesita para ENSEÑAR filas en este listado: sus filtros por URL, el campo
        // id de la fila y el parámetro de la selección (?ids=…). Lo publica el server en el menú.
        if (opt.listing) entry.listing = opt.listing
        result.push(entry)
      }
    }
    return result
  }

  /** La URL efectiva del stream: el agente local si respondió a /health, si no el `sseUrl` del wire. */
  function effectiveChatUrl({ localAgentAlive, localAgentUrl, sseUrl }) {
    return localAgentAlive && localAgentUrl ? localAgentUrl + '/mateu/agent/stream' : sseUrl
  }

  /** El body del POST del chat. `menuContext` solo viaja en el primer mensaje (lo decide el llamante). */
  function buildChatBody({ message, sessionId, attachments, context, mcpUrl, menuContext, currentRoute }) {
    return {
      message: message ?? '',
      sessionId,
      // la ruta de la pantalla desde la que se pregunta: las reglas de enrutado del plano de control
      // eligen el agente por ella
      ...(currentRoute ? { currentRoute } : {}),
      ...(attachments && attachments.length ? { attachments } : {}),
      ...(context !== undefined && context !== null ? { context } : {}),
      ...(mcpUrl ? { mcpUrl } : {}),
      ...(menuContext && menuContext.length ? { menuContext } : {}),
    }
  }

  /** Sube ficheros al endpoint de `@AI(upload=…)` como multipart; devuelve los `{name, path}` guardados. */
  async function uploadChatFiles({ uploadUrl, files, sessionId, headers = {}, fetchImpl = globalThis.fetch, FormDataImpl = globalThis.FormData }) {
    const form = new FormDataImpl()
    for (const f of files || []) form.append('files', f)
    if (sessionId) form.append('sessionId', sessionId)
    const response = await fetchImpl(uploadUrl, { method: 'POST', headers, body: form })
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
    const result = await response.json()
    return ((result && result.files) || []).filter((f) => f && f.path)
  }

  // ── El stream SSE, leído como SSE ──────────────────────────────────────────────────────────────
  // Por EVENTO, no por línea: las líneas `data:` de un evento se unen con '\n' y una línea en blanco lo
  // cierra; de `data:` sólo se quita el espacio opcional (la sangría del markdown sobrevive); los
  // comentarios (`:keep-alive`) y los demás campos se ignoran. Misma lógica que el chat compartido
  // (libs/mateu/.../chatStream.ts) — mantener las dos a la par.

  /** Un lector SSE incremental: `push(texto)` devuelve los `data` de los eventos que se han cerrado;
   *  `end()` el que el stream dejó sin línea en blanco detrás. */
  function createSseParser() {
    let buffer = ''
    let data = []
    let hasData = false
    const dispatch = (out) => {
      if (hasData) out.push(data.join('\n'))
      data = []
      hasData = false
    }
    const line = (l, out) => {
      if (l === '') { dispatch(out); return }
      if (l.startsWith(':')) return
      const colon = l.indexOf(':')
      const field = colon < 0 ? l : l.slice(0, colon)
      if (field !== 'data') return
      let value = colon < 0 ? '' : l.slice(colon + 1)
      if (value.startsWith(' ')) value = value.slice(1)
      data.push(value)
      hasData = true
    }
    return {
      push(text) {
        buffer += text
        const out = []
        for (;;) {
          const m = /\r\n|\r|\n/.exec(buffer)
          if (!m) break
          // un '\r' al final puede ser la primera mitad de un '\r\n' partido entre trozos
          if (m[0] === '\r' && m.index === buffer.length - 1) break
          const l = buffer.slice(0, m.index)
          buffer = buffer.slice(m.index + m[0].length)
          line(l, out)
        }
        return out
      },
      end() {
        const out = []
        if (buffer) { line(buffer.replace(/\r$/, ''), out); buffer = '' }
        dispatch(out)
        return out
      },
    }
  }

  /**
   * Qué es el `data` de un evento: uso de tokens, un trozo de la respuesta (agent-delta), una fase
   * (agent-status), una herramienta (agent-tool), un error (agent-error), otro evento de UI, o texto.
   */
  function classifyChatPayload(payload) {
    const usage = tryParseTokenUsage(payload)
    if (usage) return { kind: 'usage', usage }
    const ev = tryParseCustomEvent(payload)
    if (ev) {
      const detail = ev.detail || {}
      if (ev.event === 'agent-delta') return { kind: 'delta', text: typeof detail.text === 'string' ? detail.text : '' }
      if (ev.event === 'agent-status') return { kind: 'status', detail }
      if (ev.event === 'agent-tool') return { kind: 'tool', detail }
      if (ev.event === 'agent-error') return { kind: 'error', message: String(detail.message || 'Error desconocido del agente') }
      return { kind: 'event', event: ev.event, detail: ev.detail }
    }
    return { kind: 'text', text: payload ?? '' }
  }

  /** Un uso que no dice nada: todos sus contadores a cero (los marcadores de agentes anteriores). */
  function isEmptyUsage(usage) {
    if (!usage) return true
    const values = ['inputTokens', 'outputTokens', 'totalTokens'].map((k) => usage[k]).filter((v) => typeof v === 'number' && Number.isFinite(v))
    return values.length === 0 || values.every((v) => v === 0)
  }

  /**
   * Lo que el agente dice que está haciendo en esta respuesta: la fase, las herramientas (la que corre
   * y las ya hechas, con su duración o su error) y si ya está escribiendo. `line(now)` es la fila de
   * estado: «Llamando a booking_findBookings… 3 s», «Respondiendo…», «Conectando con 2 servidores MCP…»;
   * null si el agente no ha informado de nada (agentes anteriores: el panel sigue con «Pensando… N s»).
   */
  function createChatProgress(now = Date.now()) {
    const p = {
      phase: undefined, statusText: undefined, since: now, steps: [], answering: false, reported: false,
      status(detail, at) {
        p.reported = true
        const text = typeof (detail && detail.text) === 'string' ? detail.text : undefined
        if ((detail && detail.phase) !== p.phase || text !== p.statusText || p.answering) p.since = at
        p.phase = detail && detail.phase
        p.statusText = text
        p.answering = false
      },
      tool(detail, at) {
        p.reported = true
        const d = detail || {}
        const name = d.name || 'herramienta'
        if (d.phase === 'start') {
          p.steps = [...p.steps, { name, server: d.server, kind: d.kind, running: true }]
          p.since = at
          p.answering = false
          return
        }
        const steps = p.steps.slice()
        let i = steps.length - 1
        while (i >= 0 && !(steps[i].running && steps[i].name === name)) i--
        const done = { name, server: d.server, kind: d.kind, ms: d.ms, error: d.error, running: false }
        if (i >= 0) steps[i] = done; else steps.push(done)
        p.steps = steps
        p.since = at
      },
      text(at) {
        if (!p.answering) p.since = at
        p.answering = true
      },
      runningTool() {
        for (let i = p.steps.length - 1; i >= 0; i--) if (p.steps[i].running) return p.steps[i]
        return undefined
      },
      line(at) {
        const secs = Math.max(0, Math.floor((at - p.since) / 1000))
        const withSecs = (s) => (secs > 0 ? `${s} ${secs} s` : s)
        const running = p.runningTool()
        if (running) return withSecs(`Llamando a ${running.name}…`)
        if (p.answering) return 'Respondiendo…'
        if (!p.reported) return null
        return withSecs(p.statusText || 'Pensando…')
      },
    }
    return p
  }

  /**
   * Postea un mensaje al stream del chat y consume la respuesta SSE, por eventos (ver
   * createSseParser). Cada `data` es uso de tokens, un evento personalizado, progreso del agente, un
   * trozo de la respuesta (agent-delta: se AÑADE), o texto: tras trozos, el primero es la respuesta
   * entera y LOS SUSTITUYE (el agente la manda limpia al final); sin trozos, cada texto es una línea
   * — el contrato de siempre de los agentes que mandan la respuesta línea a línea. `agent-error` se
   * muestra como el texto del asistente. Devuelve el texto final. `fetchImpl` es inyectable para tests.
   *
   * Un 401 se recupera como en el resto del tráfico (fetchWithPolicy): `reauthenticate` pide a la
   * página que reautentique y, si lo hace, el mensaje se reenvía UNA vez. Por eso `headers` puede ser
   * una función: se evalúa en cada envío, y el reenvío lleva el token NUEVO, no el que acaba de ser
   * rechazado — o el que faltaba: en ec1 el chat llegó a salir sin token porque en ese instante no
   * había ninguno en localStorage, y enseñaba "Servidor respondió 401" mientras las pantallas, que sí
   * reautentican, seguían funcionando. Sin nadie que reautentique, o si el reenvío vuelve a dar 401,
   * falla como siempre.
   *
   * @param headers         objeto de cabeceras, o () => objeto (leído en cada envío)
   * @param reauthenticate  async () => boolean — true si hay que reenviar (askForReauthentication)
   *
   * @param onText     (accumulatedText) => void   — en cada cambio del texto (para repintar el mensaje)
   * @param onDelta    (piece, accumulatedText) => void — en cada trozo que llega en streaming
   * @param onProgress (progress) => void          — en cada fase/herramienta (createChatProgress)
   * @param onEvent    ({event, detail}) => void   — evento personalizado del agente (≠ agent-*)
   * @param onUsage    (usage) => void             — objeto de uso de tokens (los todo-cero no llegan)
   */
  async function streamChat({ url, body, headers = {}, reauthenticate, fetchImpl = globalThis.fetch, onText, onDelta, onProgress, onEvent, onUsage, now = () => Date.now() }) {
    const payload = typeof body === 'string' ? body : JSON.stringify(body)
    const send = () => fetchImpl(url, {
      method: 'POST',
      headers: {
        Accept: 'text/event-stream', 'Content-Type': 'application/json',
        ...((typeof headers === 'function' ? headers() : headers) || {}),
      },
      body: payload,
    })
    let response = await send()
    if (response.status === 401 && reauthenticate && await reauthenticate()) {
      response = await send()
    }
    if (!response.ok) {
      const errorText = response.text ? await response.text() : ''
      throw new Error(`Servidor respondió ${response.status}: ${errorText}`)
    }
    const reader = response.body && response.body.getReader ? response.body.getReader() : null
    if (!reader) throw new Error('No se pudo obtener el reader del stream.')

    const decoder = new TextDecoder()
    const parser = createSseParser()
    const progress = createChatProgress(now())
    let accumulated = ''
    // hubo trozos desde el último texto entero: el siguiente texto los sustituye
    let streamed = false

    const handlePayload = (data) => {
      const msg = classifyChatPayload(data)
      switch (msg.kind) {
        case 'usage':
          if (!isEmptyUsage(msg.usage) && onUsage) onUsage(msg.usage)
          return
        case 'delta':
          accumulated += msg.text
          streamed = true
          progress.text(now())
          if (onDelta) onDelta(msg.text, accumulated)
          if (onText) onText(accumulated)
          if (onProgress) onProgress(progress)
          return
        case 'text':
          if (streamed) { accumulated = msg.text; streamed = false } else accumulated = accumulated ? accumulated + '\n' + msg.text : msg.text
          progress.text(now())
          if (onText) onText(accumulated)
          if (onProgress) onProgress(progress)
          return
        case 'error':
          accumulated = '⚠️ ' + msg.message
          streamed = false
          if (onText) onText(accumulated)
          return
        case 'status':
          progress.status(msg.detail, now())
          if (onProgress) onProgress(progress)
          return
        case 'tool':
          progress.tool(msg.detail, now())
          if (onProgress) onProgress(progress)
          return
        default:
          if (onEvent) onEvent({ event: msg.event, detail: msg.detail })
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        parser.push(decoder.decode())
        parser.end().forEach(handlePayload)
        break
      }
      parser.push(decoder.decode(value, { stream: true })).forEach(handlePayload)
    }
    return accumulated
  }

  // ---- El estado del panel mientras el asistente trabaja, los tokens y el dictado ------------------

  /**
   * El uso de UNA respuesta: el stream puede mandar más de un objeto de uso; dentro de una respuesta
   * manda el último valor de cada contador, como en el chat compartido (merge, no suma).
   */
  function mergeTurnUsage(turn, usage) {
    return { ...(turn || {}), ...(usage || {}) }
  }

  /**
   * El uso que enseña el panel tras una respuesta: el de ESA respuesta, que es lo que el agente manda
   * como total de la conversación (el ia-agent de ec-demo1 manda el acumulado de la sesión; sumarlo
   * contaba cada respuesta otra vez en cada respuesta siguiente). Una respuesta sin uso deja el que
   * había. Mismo criterio que el chat compartido: se sustituye, no se suma.
   */
  function latestUsage(previous, turn) {
    const keys = ['inputTokens', 'outputTokens', 'totalTokens']
    const has = turn && keys.some((k) => typeof turn[k] === 'number' && Number.isFinite(turn[k]))
    if (!has) return previous || null
    const out = {}
    for (const k of keys) if (typeof turn[k] === 'number' && Number.isFinite(turn[k])) out[k] = turn[k]
    return out
  }

  /**
   * Los totales de la conversación: se suma el uso de cada respuesta ya terminada — para un agente que
   * manda el uso de cada respuesta suelta. El panel ya no la usa (ver latestUsage). Solo los
   * contadores numéricos; null si todavía no hay ninguno (el panel no enseña una fila vacía).
   */
  function addUsage(total, turn) {
    const keys = ['inputTokens', 'outputTokens', 'totalTokens']
    const out = { ...(total || {}) }
    let any = total ? keys.some((k) => typeof total[k] === 'number') : false
    for (const k of keys) {
      const v = turn && turn[k]
      if (typeof v === 'number' && Number.isFinite(v)) {
        out[k] = (typeof out[k] === 'number' ? out[k] : 0) + v
        any = true
      }
    }
    return any ? out : null
  }

  /**
   * Qué dice la fila de estado bajo la conversación: nada si el asistente no trabaja; lo que el agente
   * dice que hace, si lo dice (`progress`, de createChatProgress: la herramienta que llama con sus
   * segundos, la fase, «Respondiendo…»); si no — agentes que no informan —, «Pensando…» con los
   * segundos mientras no ha llegado nada (la espera larga es la que inquieta) y «Respondiendo…» en
   * cuanto llega el primer texto.
   */
  function chatStatusText({ busy, hasText, elapsedSeconds, progress, now }) {
    if (!busy) return ''
    const line = progress && progress.line ? progress.line(typeof now === 'number' ? now : Date.now()) : null
    if (line) return line
    if (hasText) return 'Respondiendo…'
    const s = Math.max(0, Math.floor(elapsedSeconds || 0))
    return s > 0 ? `Pensando… ${s} s` : 'Pensando…'
  }

  /** El constructor del reconocimiento de voz del navegador, o null donde no existe (Firefox). */
  function speechRecognitionCtor(win = globalThis) {
    return (win && (win.SpeechRecognition || win.webkitSpeechRecognition)) || null
  }

  /** El texto dictado: el último resultado reconocido (mismo criterio que el chat compartido). */
  function transcriptOf(event) {
    const results = event && event.results
    if (!results || !results.length) return ''
    const last = results[results.length - 1]
    return (last && last[0] && last[0].transcript ? String(last[0].transcript) : '').trim()
  }

  /**
   * El atajo del micrófono del chat: Ctrl+Shift+M en todas las plataformas (en macOS también Ctrl, no
   * Cmd — Cmd+Shift+M cambia de perfil en Chrome y Opción+M escribe «µ»). Exactamente Ctrl y Shift,
   * sin Alt ni Cmd, y no la autorrepetición de la tecla mantenida. La tecla se reconoce por su carácter
   * (AZERTY incluido) o, en un teclado cuya M no escribe una letra latina, por su posición (KeyM).
   */
  const CHAT_MIC_SHORTCUT = 'Ctrl+Shift+M'
  const CHAT_MIC_ARIA_KEYSHORTCUTS = 'Control+Shift+M'

  function isChatMicShortcut(event) {
    if (!event || !event.ctrlKey || !event.shiftKey || event.altKey || event.metaKey || event.repeat) return false
    const key = typeof event.key === 'string' ? event.key : ''
    if (/^[a-z]$/i.test(key)) return key.toLowerCase() === 'm'
    return event.code === 'KeyM'
  }

  // ── Markdown de las respuestas ──────────────────────────────────────────────────────────────────
  // El agente contesta en markdown (negritas, listas, tablas, código). El chat compartido lo pinta con
  // marked + DOMPurify; aquí no hay npm en el bundle AMD, así que el subconjunto que usan los agentes se
  // convierte a mano, ESCAPANDO PRIMERO: todo el HTML del texto sale como texto, y las únicas etiquetas
  // del resultado son las que pone esta función (sin atributos salvo href/target/rel de los enlaces
  // http(s)). Seguro por construcción, sin sanitizador. Tolera el markdown a medias del streaming: un
  // bloque de código sin cerrar es código hasta el final, y un ** sin pareja se queda como texto.

  const MD_ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }
  const mdEscape = (s) => String(s).replace(/[&<>"']/g, (c) => MD_ESC[c])

  /** El markdown en línea de un texto YA escapado: código, enlaces, negrita, cursiva. */
  function mdInline(escaped) {
    const codes = []
    // la etiqueta de apertura de cada enlace se aparta hasta el final: su href puede llevar `_` o `*`
    // (ids=A_B) y la negrita/cursiva de abajo lo romperían
    const opens = []
    const open = (tag) => { opens.push(tag); return `\u0001${opens.length - 1}\u0001` }
    let s = escaped.replace(/`([^`\n]+)`/g, (_, c) => { codes.push(c); return `\u0000${codes.length - 1}\u0000` })
    // enlaces: solo http(s); la URL ya viene escapada (las comillas no pueden cerrar el atributo)
    s = s.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_, text, url) => `${open(`<a href="${url}" target="_blank" rel="noopener noreferrer">`)}${text}</a>`)
    // y las rutas de la propia app (`[4MBZS7](/booking/bookings/4MBZS7)`): un enlace que navega DENTRO
    // de la consola (la burbuja lo engancha, chatRouteOfLink) — sin recargar ni abrir pestaña. Solo
    // una ruta que empieza por UNA barra: `//host` sería otro sitio.
    s = s.replace(/\[([^\]\n]+)\]\((\/(?!\/)[^\s)]*)\)/g,
      (_, text, route) => `${open(`<a href="${route}" class="mateu-chat-route" data-mateu-route="${route}">`)}${text}</a>`)
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>').replace(/__([^_\n]+?)__/g, '<strong>$1</strong>')
    s = s.replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\w)/g, '$1<em>$2</em>')
      .replace(/(^|[^_\w])_([^_\s][^_\n]*?)_(?!\w)/g, '$1<em>$2</em>')
    return s.replace(/\u0000(\d+)\u0000/g, (_, i) => `<code>${codes[+i]}</code>`)
      .replace(/\u0001(\d+)\u0001/g, (_, i) => opens[+i])
  }

  /**
   * La ruta a la que navega un clic en un enlace del chat, o null si el clic no es nuestro: sólo los
   * enlaces a rutas de la app (mateu-chat-route) y un clic normal — con Ctrl/Cmd/Mayús o el botón del
   * medio el navegador hace lo suyo (abrirlo en otra pestaña sigue funcionando: el href es la URL).
   */
  function chatRouteOfLink(anchor, event) {
    if (!anchor || !anchor.getAttribute) return null
    const route = anchor.getAttribute('data-mateu-route')
    if (!route || route.charAt(0) !== '/' || route.charAt(1) === '/') return null
    if (event && (event.button > 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)) return null
    return route
  }

  const MD_TABLE_SEP = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/
  const mdCells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => mdInline(mdEscape(c.trim())))

  /**
   * El markdown de una respuesta del asistente como HTML seguro para su burbuja: párrafos con saltos
   * de línea, títulos, listas (con y sin número), citas, reglas, bloques y trozos de código, tablas,
   * enlaces http(s) (en otra pestaña), negrita y cursiva.
   */
  function chatMarkdownToHtml(text) {
    const lines = String(text ?? '').replace(/\r\n?/g, '\n').split('\n')
    const out = []
    let i = 0
    while (i < lines.length) {
      const line = lines[i]
      // bloque de código (``` … ```); sin cerrar —el stream a medias— llega hasta el final
      const fence = line.match(/^\s*```/)
      if (fence) {
        const body = []
        i++
        while (i < lines.length && !/^\s*```/.test(lines[i])) body.push(lines[i++])
        i++
        out.push(`<pre><code>${mdEscape(body.join('\n'))}</code></pre>`)
        continue
      }
      if (/^\s*$/.test(line)) { i++; continue }
      const heading = line.match(/^\s*(#{1,6})\s+(.*)$/)
      if (heading) {
        const level = Math.min(6, heading[1].length + 2)   // h3…h6: dentro de una burbuja, no de una página
        out.push(`<h${level}>${mdInline(mdEscape(heading[2].replace(/\s*#+\s*$/, '')))}</h${level}>`)
        i++
        continue
      }
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue }
      // tabla: cabecera | a | b | seguida de |---|---|
      if (line.includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1])) {
        const head = mdCells(line)
        i += 2
        const rows = []
        while (i < lines.length && lines[i].includes('|') && !/^\s*$/.test(lines[i])) rows.push(mdCells(lines[i++]))
        out.push('<table><thead><tr>' + head.map((c) => `<th>${c}</th>`).join('') + '</tr></thead><tbody>'
          + rows.map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>')
        continue
      }
      if (/^\s*>/.test(line)) {
        const quote = []
        while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''))
        out.push(`<blockquote>${chatMarkdownToHtml(quote.join('\n'))}</blockquote>`)
        continue
      }
      const item = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
      if (item) {
        out.push(mdList(lines, i, (next) => { i = next }))
        continue
      }
      // párrafo: líneas seguidas hasta una en blanco o un bloque; cada salto, un <br>
      const para = []
      while (i < lines.length && !/^\s*$/.test(lines[i]) && !/^\s*(```|#{1,6}\s|>|([-*+]|\d+[.)])\s)/.test(lines[i])
        && !(lines[i].includes('|') && i + 1 < lines.length && MD_TABLE_SEP.test(lines[i + 1]))) {
        para.push(mdInline(mdEscape(lines[i++].trim())))
      }
      if (para.length) out.push(`<p>${para.join('<br>')}</p>`)
      else i++
    }
    return out.join('')
  }

  /** Una lista (y sus sublistas, por sangría) desde la línea `start`; devuelve su HTML y avanza. */
  function mdList(lines, start, advance) {
    const first = lines[start].match(/^(\s*)([-*+]|\d+[.)])\s+/)
    const indent = first[1].length
    const ordered = /\d/.test(first[2])
    const items = []
    let i = start
    while (i < lines.length) {
      const m = lines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.*)$/)
      if (m && m[1].length === indent && /\d/.test(m[2]) === ordered) {
        items.push({ text: mdInline(mdEscape(m[3])), sub: '' })
        i++
        continue
      }
      if (m && m[1].length > indent && items.length) {
        items[items.length - 1].sub += mdList(lines, i, (next) => { i = next })
        continue
      }
      // continuación de un elemento: una línea sangrada que no es otro elemento
      if (!m && items.length && /^\s{2,}\S/.test(lines[i])) {
        items[items.length - 1].text += '<br>' + mdInline(mdEscape(lines[i].trim()))
        i++
        continue
      }
      break
    }
    advance(i)
    const tag = ordered ? 'ol' : 'ul'
    return `<${tag}>` + items.map((it) => `<li>${it.text}${it.sub}</li>`).join('') + `</${tag}>`
  }

  /**
   * Keeps a chat's message list scrolled to its last message while it grows: a new message, or an
   * answer streaming in chunk by chunk. Nothing scrolled it, so the answer kept arriving below the
   * fold. It follows the end only while the reader is at it (within `slack` px): someone who scrolled
   * up to reread is left there, and is followed again once back at the end or after sending. Returns
   * a function that stops it. `el` is the scrolling element (overflow-y: auto).
   */
  function stickChatToBottom(el, { slack = 48, isUserMessage = (node) => !!(node && node.querySelector && node.querySelector('.mateu-chat-user-text')) } = {}) {
    if (!el || typeof MutationObserver === 'undefined') return () => {}
    let stick = true
    const atEnd = () => el.scrollHeight - el.scrollTop - el.clientHeight <= slack
    const toEnd = () => { el.scrollTop = el.scrollHeight }
    const onScroll = () => { stick = atEnd() }
    el.addEventListener('scroll', onScroll, { passive: true })
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes || []) {
          if (node.nodeType === 1 && (isUserMessage(node) || (node.classList && node.classList.contains('mateu-chat-user-text')))) stick = true
        }
      }
      if (stick) toEnd()
    })
    observer.observe(el, { childList: true, subtree: true, characterData: true })
    toEnd()
    return () => { observer.disconnect(); el.removeEventListener('scroll', onScroll) }
  }

  // el importe de un campo money: IntlNumberConverter con estilo moneda (un objeto JSON ya no vale)
  setConverterFactory((spec) => new NumberConverter.IntlNumberConverter(spec.options));
  // reglas del cliente: cada reducción fija su contexto (las del host, con su estado)
  // el selector de columnas: listingOf aplica las preferencias de la ruta en pantalla
  setColumnPrefsReader(() => readColumnPrefs(listingScope()));
  setAfterReduceHook((reg) => {
    setRulesContext(reg.contexts[HOST_ID]);
    // los @Action(shortcut) de la pantalla en curso (keys.mjs)
    setShortcutContext(reg.contexts[HOST_ID]);
    // los tonos de fila (@RowStatus) y las filas de grupo del listado del host
    const listing = listingOf(reg.contexts[HOST_ID]);
    setListingTones(listing ? listing.rows : []);
  });
  // MatrixGrid: oj-data-grid sobre un RowDataGridProvider de una vista aplanada del árbol (las
  // secciones plegables las pinta JET); __mateu guarda lo que installMatrixGrids necesita
  setMatrixProviderFactory((spec) => {
    const tree = new ArrayTreeDataProvider(spec.data, { keyAttributes: 'id', childrenAttribute: 'children' });
    const expanded = new KeySet.KeySetImpl(spec.expanded);
    const flat = new FlattenedTreeDataProviderView(tree, { expanded });
    const provider = new RowDataGridProvider.RowDataGridProvider(flat, {
      columns: { rowHeader: ['label'], databody: spec.columnKeys },
      columnHeaders: { column: spec.columnHeaders },
      headerLabels: spec.rowHeaderLabel ? { row: [spec.rowHeaderLabel] } : undefined,
      expandedObservable: flat.getExpandedObservable(),
    });
    provider.__mateu = { flat, expanded };
    return provider;
  });
  // la lista de la campana: un ArrayDataProvider para el oj-list-view del popup
  setNotificationsProviderFactory((items) => new ArrayDataProvider(items || [], { keyAttributes: 'id' }));
  // campos de captura (fichero, imagen, firma, cámara): JET no los trae
  defineCaptureField();
  // los grids embebidos necesitan un data provider de JET; el core es agnóstico y lo recibe
  setDataProviderFactory((rows) => new ArrayDataProvider(rows || [], { keyAttributes: '_rowNumber' }));
  // el editor de cada filtro del buscador (smartFilters.filtersMetadata): oj-dynamic se carga
  // sólo cuando un listado declara filtros
  setMetadataProviderFactory((data) => new Promise((resolve, reject) => {
    require(['oj-dynamic/providers/JsonMetadataProvider'], (JsonMetadataProvider) => {
      resolve(new JsonMetadataProvider({ data }));
    }, reject);
  }));

  return {
    HOST_ID,
    mountElements,
    setElementEventSink,
    setElementModuleBase,
    mountElementsSoon,
    elementAtomsOf,
    foldoutElementAtomsOf,
    reduceContexts,
    planningActionOf,
    applyDomEffects,
    installRules,
    setPanelExpanded,
    panelExpanded,
    setColumnPrefsReader,
    readColumnPrefs,
    writeColumnPrefs,
    columnChooserOf,
    prefsFromChooser,
    moveChooserItem,
    listSavedViews,
    saveView,
    deleteView,
    defaultView,
    viewRouteOf,
    currentViewValues,
    viewsMenuOf,
    listingScope,
    installRowTones,
    installStickyHeader,
    installPlanningRange,
    installActionPanels,
    installMatrixGrids,
    installCalendars,
    installKeys,
    installHover,
    setKeysActionSink,
    setAccessKeysEnabled,
    startPolling,
    setPollingRunner,
    fetchNotifications,
    notificationsOf,
    setUndoSink,
    setCalendarActionSink,
    setMatrixActionSink,
    actionPanelAtomOf,
    shortcutMatches,
    setPlanningRangeSink,
    rulesDebug,
    setRulesContext,
    setRuleActionSink,
    valueChangeActionOf,
    triggerDownload,
    autoTrail,
    parentCrumb,
    collectFields,
    collectActions,
    collectIslands,
    mediatorOf,
    buildOverlay,
    dynFormMetadataOf,
    actionsOf,
    summarizeHost,
    findByType,
    // pestañas del contenido: activa POR BARRA (barras anidadas) y refresco de cada oj-tab-bar
    tabStripOf,
    withActiveTab,
    tabBarIdsOf,
    // P1: la URL de una pestaña con clave (@Tab(key)) y los niveles de app (maestros)
    tabRoutePath,
    hostContentShown,
    withSubresources,
    loadSubresources,
    appLevelOf,
    rowRouteOf,
    listingOf,
    // paginación y orden del listing (pie de la tabla, cabecera → server)
    listingPagingOf,
    targetPageOf,
    listingSearchStateOf,
    listingSortOf,
    // selección de filas del listing → crud_selected_items de las acciones del host
    selectionOfKeySet,
    selectedRowsOf,
    withListingSelection,
    onLoadTriggers,
    // filtros del listado: descriptores ya resueltos a widget, y la config smartFilters de la
    // cabecera del buscador (sugerencias, aplicados y editores) con su vuelta a estado Mateu
    filterChipsOf,
    multiValuesOf,
    queryFiltersOf,
    navTargetOf,
    IDS_PARAM,
    idsChipLabelOf,
    splitListingQuery,
    listingQueryOf,
    listingUrlOf,
    smartFiltersOf,
    filterStateOfSmartFilters,
    fieldListOf,
    secondaryActionOf,
    formSectionsOf,
    // el paso de un wizard: contenido + campos (cada uno una vez) + el pie Back/Next
    wizardStepViewOf,
    isRichAtom,
    // editor de filas modal de una lista del formulario (@DetailFormCustomisation modal)
    listActionOf,
    listActionRequestOf,
    rowEditorOf,
    rowFieldsOf,
    validateRow,
    // validationRequired de las acciones del host (el next de un wizard): obligatorios vacíos
    validationOf,
    formErrorsOf,
    // a qué ServerSide va una acción del host (el que la declara) y su confirmación previa
    declaredActionOf,
    actionTransportOf,
    overlayTransportOf,
    confirmationOf,
    awaitConfirmation,
    answerConfirmation,
    selectPlaceholder,
    pendingLookupsOf,
    lookupRequestOf,
    // las opciones de los lookups de un formulario de página y de los filtros de un listado
    formLookupsOf,
    loadLookups,
    ROW_VALIDATING_VERBS,
    overlayOf,
    eventTriggersOf,
    dismissOverlay,
    // @Searchable: el selector en su diálogo, y los chips del campo
    searchPickerOf,
    pickerSearchStateOf,
    withContextState,
    withSearchableIds,
    shellNavOf,
    // la subcabecera MENU_ON_TOP: la sección en pantalla y el acento de marca del App
    activeSectionOf,
    localMenuOptionOf,
    isSentinelHome,
    sectionOf,
    sectionHomeOf,
    ojIconOf,
    ojIconOrGenericOf,
    longTaskWatcher,
    findAllByType,
    cardOf,
    welcomeOf,
    welcomeKeyOf,
    welcomeLookOf,
    generalOverviewOf,
    itemOverviewOf,
    itemOverviewPageOf,
    autoSaveOf,
    taskQueueOf,
    emptyStateOf,
    notFoundOf,
    interpolate,
    islandContentOf,
    mergeNestedContent,
    hostContentOf,
    wizardForwardOf,
    bannersOf,
    pageStyleOf,
    pageToolbarOf,
    primaryToolbarButton,
    backToolbarButton,
    entityHeaderOf,
    pageKpisOf,
    pageSubtitleOf,
    collectTexts,
    foldoutOf,
    wizardOf,
    callMateu,
    bootstrapShell,
    loadRoute,
    loadRouteInto,
    loadMenuRouteInto,
    composeInnerRoute,
    mediatorBaseOf,
    routeFlipOf,
    // menús federados: la shell los expande al arrancar, la navegación consulta a qué pod ir
    expandRemoteMenus,
    remoteRouteOf,
    registerRemoteRoute,
    baseOf,
    // widgets de cabecera del App: área de perfil (usermenu) + zona de acciones, remotos vivos
    headerWidgetsOf,
    // el FAB de "ask" del shell: su marca (Ask Oracle por defecto, o la del @App) y su nombre
    askFabOf,
    brandAskFab,
    startRemoteWidget,
    stopRemoteWidgets,
    mountHeaderHtml,
    mountHeaderHtmlSoon,
    redwoodHtmlOf,
    runMateuAction,
    runMateuActionSse,
    // resiliencia: la app las usa para pintar el estado de carga, la banda de sin-conexión
    // y el mensaje de error ya traducido
    classifyRequestFailure,
    isIdempotentAction,
    connectivity,
    pendingActions,
    setTransportHooks,
    authHeadersOf,
    // errores del cliente → log del servidor (POST <base>/mateu/v3/client-log)
    installClientErrorReporting,
    clientErrors,
    askForReauthentication,
    // la pantalla en curso: la navegación la empieza; lo que conteste para otra muere en silencio
    beginView,
    currentView,
    isViewStale,
    isStaleResponse,
    DEFAULT_TIMEOUT_MS,
    // static bundle: la shell carga el manifest al arrancar; loadRoute responde desde él sin backend
    loadBundleManifest,
    hasBundle,
    awaitBundle,
    // accesibilidad: lo que los componentes oj-* no traen (una SPA no cambia de página, así
    // que no hay nada que un lector de pantalla anuncie por su cuenta)
    installAnnouncer,
    announce,
    announceNavigation,
    focusIsInChat,
    focusContent,
    focusContentSoon,
    mountSkipLink,
    resetNavigationState,
    markPending,
    clearPending,
    pressedControl,
    trackPressedControls,
    markPressedControlBusy,
    clearPressedControlBusy,
    setLastRetry,
    hasLastRetry,
    takeLastRetry,
    // obligatorios marcados como un formulario Redwood + el guided process que manda el servidor
    showFieldErrors,
    clearFieldError,
    clearFieldErrorMarks,
    guardGuidedProcess,
    // chat de IA: el panel de conversación (sseUrl) usa estas para POSTear y consumir el stream
    effectiveChatUrl,
    buildChatBody,
    buildChatMenuContext,
    streamChat,
    stickChatToBottom,
    uploadChatFiles,
    // el panel mientras el asistente trabaja, los contadores de tokens y el dictado
    mergeTurnUsage,
    addUsage,
    latestUsage,
    chatStatusText,
    createChatProgress,
    speechRecognitionCtor,
    chatMarkdownToHtml,
    chatRouteOfLink,
    // un <a href="/ruta"> del contenido navega dentro de la shell (links.mjs)
    inAppRouteOfLink,
    transcriptOf,
    isChatMicShortcut,
    CHAT_MIC_ARIA_KEYSHORTCUTS,
  };
});
