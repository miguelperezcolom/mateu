import { HOST_ID, collectFields } from './tree.mjs'
import { findByType } from './listing.mjs'
import { applyOverlayEvent } from './rowEditor.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the reducer: increments → contexts/stack/shell, mediators, overlays.

/** Triggers OnLoad del contexto (p.ej. el listing dispara 'search' al cargar). */
export function onLoadTriggers(ctx) {
  return ((ctx && ctx.tree && ctx.tree.triggers) || [])
    // los que llevan espera (refresco periódico) los programa polling.mjs, no se lanzan ya
    .filter((t) => t.type === 'OnLoad' && t.actionId && !(t.timeoutMillis > 0))
    .map((t) => t.actionId)
}

/**
 * La URL de una pestaña con clave de ruta (@Tab(key)): la ruta de la página con la clave de la
 * pestaña de su barra que ya nombre (si la hay) sustituida — /vcns/7/subnets → /vcns/7/gateways.
 */
export function tabRoutePath(pathname, keys, key) {
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
export function appLevelOf(fragment, shellServerSideType, requestedRoute = '') {
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
export function splitNestedApps(increment, shellServerSideType, requestedRoute) {
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
export function mediatorOf(ctx) {
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

export const metaOf = (fr) => fr.component?.metadata || {}

/** El estado de una superficie con los VALORES INICIALES de sus campos (FormField.initialValue) que
 *  aún no tienen valor: el renderer web cae a ese valor cuando el estado no trae la clave, y aquí
 *  se siembra en el estado para que se pinte Y viaje en la siguiente acción. */
export function withInitialValues(tree, state) {
  const out = { ...(state || {}) }
  if (!tree) return out
  for (const f of collectFields(tree)) {
    if (f.initialValue != null && !(f.fieldId in out)) out[f.fieldId] = f.initialValue
  }
  return out
}

export let overlaySeq = 0
/** Construye un contexto de overlay (drawer/dialog) a partir de un fragmento Add. */
export function buildOverlay(fr, opener) {
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
    state: withInitialValues(surface || fr.component, filled(md.initialData) || filled(fr.state) || (surface && filled(surface.initialData)) || {}),
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
export const resolveTarget = (contexts, t) => {
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
export function reduceContexts(reg, increment, opts = {}) {
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
    // UICommand.announce / announceAssertive: what assistive tech is told (a11y.mjs live regions);
    // nothing is drawn — [{ text, assertive }]
    announcements: [],
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
        // the shell's FLOWS (AppShell.actions): a menu RuleLink whose RunAction names one runs
        // its lowered commands client-side (shellFlows.mjs)
        actions: md.actions || [],
        // the app's ACTION catalogue (App.actionCatalogue): an id the shell or the page does not
        // declare runs the catalogue's lowered flow client-side, owner first (shellFlows.mjs)
        actionCatalogue: md.actionCatalogue || [],
        themeToggle: md.themeToggle,
        // @App(accessKeys): mantener Alt enseña las teclas de acceso (keys.mjs)
        accessKeys: !!md.accessKeys,
        // NotificationsSupplier del App → la campana de la cabecera (notify.mjs)
        notificationsEnabled: !!md.notificationsEnabled,
        // GlobalSearchSupplier del App → la paleta Ask busca también entidades (globalSearch.mjs)
        globalSearchEnabled: !!md.globalSearchEnabled,
        // @Fab del App: botones flotantes globales (fabs.mjs)
        fabs: md.fabs || [],
        // el logo del @App (@Logo, p.ej. /images/riu.svg — relativo al backend)
        logo: md.logo || '',
        // la HOME del app (@HomeRoute) — el boot de la shell la prefiere sobre la
        // primera opción del menú
        homeRoute: md.homeRoute || '',
        // chat de IA (@AI → App.sseUrl): si viene, la shell pinta el botón del chat del agente en la cabecera
        sseUrl: md.sseUrl || '',
        // @AI(upload) → el botón de adjuntar del chat; @AI(mcp) → el mcpUrl que el agente usa para operar la app
        uploadUrl: md.uploadUrl || '',
        mcpUrl: md.mcpUrl || '',
        // el FAB de "ask" del shell (@App(askLabel, askIcon)): vacíos = el FAB neutro (Search)
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
      // the SAME overlay re-sent while it is open (a Drawer with the same id: the crud's edit
      // drawer after «Save and next», or with its error banner) REFRESHES IN PLACE — it takes the
      // open one's place in the stack instead of stacking a second drawer on top. It gets a new
      // context id on purpose: the chains reset the drawer's draft when the overlay id changes, and
      // the refreshed drawer carries new values (the next row, or what the server kept).
      const sameId = fr.component && fr.component.id
      const open = sameId ? stack.find((k) => contexts[k] && contexts[k].tree && contexts[k].tree.id === sameId) : null
      if (open) {
        contexts[ctx.id] = { ...ctx, opener: contexts[open].opener || ctx.opener }
        delete contexts[open]
        stack[stack.indexOf(open)] = ctx.id
        continue
      }
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
        : withInitialValues(fr.component, fr.action === 'ReplaceKeepData'
          ? { ...prev.state, ...(fr.state || md.initialData || {}) }
          : (fr.state ?? md.initialData ?? prev.state)),
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
      case 'Announce': {
        // the Redwood `announcement` slot: polite by default, assertive when the server says so
        const d = c.data && typeof c.data === 'object' ? c.data : { text: c.data }
        const text = d.text == null ? '' : String(d.text).trim()
        if (text) effects.announcements.push({ text, assertive: !!d.assertive })
        break
      }
    }
  }

  // los niveles de app (P1) son de la PANTALLA, no de un incremento: una acción sobre la pestaña
  // (la búsqueda OnLoad del listado) no los borra
  const kept = {}
  if (reg.appLevels) kept.appLevels = reg.appLevels
  if (reg.loadedRoute) kept.loadedRoute = reg.loadedRoute
  return { ...kept, contexts, stack, shell, effects }
}
