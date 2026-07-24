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

export const HOST_ID = '__root__'

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
export function collectFields(node, out = []) {
  walkWithinSurface(node, (n) => { if (n.fieldId) out.push(n) })
  return out
}

/** Helper de RENDER: recolecta botones/acciones de la superficie (sin cruzar islas). */
export function collectActions(node, out = []) {
  walkWithinSurface(node, (n) => { if (n.actionId && n.label && !n.fieldId) out.push(n) })
  return out
}

/** Fronteras de isla embebida: nodos ServerSide INTERIORES (id propio, p.ej. '_guestNote'). */
export function collectIslands(tree, out = []) {
  const walk = (node, isRoot) => {
    if (!node || typeof node !== 'object') return
    if (!isRoot && node.type === 'ServerSide') {
      out.push(node)
      return // sus hijos pertenecen a la isla, no al host
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
export function dynFormMetadataOf(tree) {
  const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
  const metadata = {}
  for (const f of collectFields(tree)) {
    if (!f.dataType || metadata[f.fieldId]) continue // duplicados = referencias de FormRow
    metadata[f.fieldId] = {
      type: NUMERIC.indexOf(f.dataType) >= 0 ? 'number'
        : f.dataType === 'bool' || f.dataType === 'boolean' ? 'boolean' : 'string',
      displayName: f.label || f.fieldId,
      required: !!f.required,
      readonly: !!f.readOnly,
    }
  }
  return Object.keys(metadata).length ? metadata : null
}

/** Helper de RENDER: botones únicos del árbol. chroming viene PRECOMPUTADO (los bindings
 *  VB deben quedar como paths simples: un ternario en un atributo rompe la evaluación CSP
 *  de TODAS las propiedades del elemento). */
export function actionsOf(tree) {
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
    })
  }
  return out
}

/** Helper de RENDER: lista de campos para el switch widgetFor (isText/isNumber/isBoolean
 *  PRECOMPUTADOS — los bindings VB deben ser paths simples), con el valor sacado del state. */
export function fieldListOf(tree, state) {
  const metadata = dynFormMetadataOf(tree)
  if (!metadata) return []
  const s = state || {}
  return Object.keys(metadata).map((fieldId) => {
    const f = metadata[fieldId]
    return {
      fieldId,
      label: f.displayName,
      required: f.required,
      readonly: f.readonly,
      isNumber: f.type === 'number',
      isBoolean: f.type === 'boolean',
      isText: f.type !== 'number' && f.type !== 'boolean',
      value: s[fieldId] == null ? null : s[fieldId],
    }
  })
}

/** Proyección del OVERLAY superior del stack (drawer del crud): título + campos + acciones.
 *  null si no hay overlays. Sus acciones se postean contra el HOST (el drawer no lleva
 *  ServerSide propio — confirmado en el wire). */
export function overlayOf(reg) {
  const id = reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
  if (!id || !reg.contexts[id]) return null
  const ctx = reg.contexts[id]
  return {
    id,
    title: ctx.title || '',
    position: ctx.position || 'end',
    width: ctx.width,
    state: ctx.state || {},
    fields: fieldListOf(ctx.tree, ctx.state),
    actions: actionsOf(ctx.tree),
  }
}

/** Helper de RENDER: recolecta los textos (metadata.type Text) de un subárbol. */
export function collectTexts(node, out = []) {
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
 *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout. */
export function foldoutOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'FoldoutLayout') : null
  if (!node) return null
  const md = node.metadata
  const children = node.children || []
  const bySlot = {}
  for (const child of children) bySlot[child.slot || ''] = child
  return {
    overview: { texts: collectTexts(bySlot['overview']) },
    panels: (md.panels || []).map((panel, i) => ({
      title: panel.title || '',
      subtitle: panel.subtitle || '',
      open: panel.open !== false,
      texts: collectTexts(bySlot['panel-' + i]),
    })),
  }
}

/** Proyección del WIZARD (Fase 8): los ProgressSteps del wire → tren del guided-process
 *  ({id,label} + currentStep por id). null si la página no es un wizard. En la pantalla de
 *  resultado todos los pasos van 'done' → currentStep = el último. */
export function wizardOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
  if (!node) return null
  const md = node.metadata
  // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on';
  // el status de Mateu NO se emite (el indicador del rail espera otro enum)
  const steps = (md.steps || []).map((s) => ({
    id: s.id,
    label: s.title || s.id,
    title: s.title || s.id,
    display: 'on',
  }))
  const current = (md.steps || []).find((s) => s.status === 'current')
  return {
    steps,
    currentStep: current ? current.id : (steps.length ? steps[steps.length - 1].id : null),
  }
}

/** Puerta 1.3: banners de página (Page.metadata.banners) → items del
 *  oj-sp-messages-banner del starter (MessagesBannerType). */
export function bannersOf(ctx) {
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
 *  contenido aplica contexts[host].pageWidth: fixed = tope 1408px centrado con gutters
 *  24px; fullWidth = fluido con gutters 24px; edgeToEdge = 0 márgenes. */
export function pageStyleOf(ctx) {
  const width = (ctx && ctx.pageWidth) || 'fixed'
  if (width === 'edgeToEdge') return { maxWidth: 'none', margin: '0', padding: '0' }
  if (width === 'fullWidth') return { maxWidth: 'none', margin: '0', padding: '24px' }
  return { maxWidth: '1408px', margin: '0 auto', padding: '24px' }
}

/** Proyección de NAVEGACIÓN de la shell: items de primer nivel + grupos con sus hijos.
 *  Un grupo (submenus en el wire) NO resuelve por sync — sus hijos navegan por la ruta
 *  TERMINAL (la compuesta /gestion/person da "Not found."; se recorta el prefijo del padre).
 *  Selectores de contexto y acciones de cabecera salen listos para bindings simples. */
export function shellNavOf(reg) {
  const shell = reg.shell || {}
  const items = []
  const menuTree = []
  let hasGroups = false
  for (const option of shell.menu || []) {
    const route = option.route || option.path
    const label = option.caption || option.label || route
    const children = option.submenus || option.submenu || []
    items.push({ id: route, label, icon: option.icon || undefined })
    if (children.length) hasGroups = true
    menuTree.push({
      id: route,
      label,
      hasChildren: children.length > 0,
      children: children.map((child) => {
        const childRoute = child.route || child.path || ''
        const terminal = childRoute.indexOf(route + '/') === 0 ? childRoute.slice(route.length) : childRoute
        return { id: terminal, label: child.caption || child.label || terminal }
      }),
    })
  }
  // la VARIANTE del wire manda: TABS → in-app navigation; HAMBURGUER_MENU/TILES →
  // hamburguesa que abre un DRAWER izquierdo con oj-navigation-list (como el navigator
  // FA); MENU_ON_TOP (o TABS con grupos) → opciones de primer nivel VISIBLES en el
  // header, dropdown oj-menu solo para los grupos
  let mode = 'tabs'
  if (shell.variant === 'HAMBURGUER_MENU' || shell.variant === 'TILES') mode = 'drawer'
  else if (shell.variant === 'MENU_ON_TOP' || hasGroups) mode = 'topbar'
  return {
    mode,
    items,
    menuTree,
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
  }
}

/** Descartar el overlay superior SIN guardar (✕/Esc/backdrop — no emite evento alguno). */
export function dismissOverlay(reg) {
  if (!reg.stack || !reg.stack.length) return reg
  const id = reg.stack[reg.stack.length - 1]
  const contexts = { ...reg.contexts }
  delete contexts[id]
  return { ...reg, contexts, stack: reg.stack.slice(0, -1) }
}

/** Acciones suscritas a un evento del bus (@SubscribeTo): p.ej. el listing refresca con
 *  'search' cuando el CloseModal del drawer emite mateu-crud:saved-in-drawer. */
export function eventTriggersOf(ctx, eventName) {
  return ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .filter((t) => t.type === 'OnCustomEvent' && t.eventName === eventName && t.actionId)
    .map((t) => t.actionId)
}

/** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
export function summarizeHost(reg, route) {
  const host = reg.contexts[HOST_ID] || {}
  const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
  const menu = (reg.shell && reg.shell.menu) || []
  const option = menu.find((m) => m.route === route)
  // un listado (pageType collection) también lleva FormFields (columnas) — NO es un form
  const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
  const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
  const state = host.state || {}
  const fields = formMetadata ? fieldListOf(host.tree, state) : []
  return {
    // la Page de un listado no lleva título (viaja en la metadata del Crudl) → caption del menú
    title: pageMetadata.title || (option && (option.caption || option.label)) || '',
    text: formMetadata ? '' : String(state.message == null ? '' : state.message),
    formMetadata,
    fields,
    formValue: formMetadata ? { ...state } : null,
    actions: host.tree ? actionsOf(host.tree) : [],
  }
}

/** Helper de RENDER: primer nodo del árbol con metadata.type dado. */
export function findByType(tree, type) {
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

/** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
 *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
 *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
export function listingOf(ctx) {
  const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
  if (!crudNode) return null
  const md = crudNode.metadata
  const page = (((ctx.data || {}).crud || {}).page) || {}
  return {
    title: md.title || '',
    subtitle: md.subtitle || '',
    searchable: !!md.searchable,
    pageSize: md.pageSize || 20,
    emptyStateMessage: md.emptyStateMessage || 'No data.',
    columns: (md.columns || []).map((col) => {
      const c = col.metadata || col
      return { headerText: c.label || c.id, field: c.id }
    }),
    rows: page.content || [],
    total: page.totalElements == null ? null : page.totalElements,
    isEmpty: (page.content || []).length === 0,
    toolbar: (md.toolbar || []).map((b) => ({
      actionId: b.actionId,
      label: b.label,
      chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
    })),
  }
}

/** Triggers OnLoad del contexto (p.ej. el listing dispara 'search' al cargar). */
export function onLoadTriggers(ctx) {
  return ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .filter((t) => t.type === 'OnLoad' && t.actionId)
    .map((t) => t.actionId)
}

/** Si el contexto es un MEDIADOR (ServerSide → child App), la info para cargar su contenido. */
export function mediatorOf(ctx) {
  const tree = ctx?.tree
  if (tree?.type !== 'ServerSide') return null
  const child = (tree.children || [])[0]
  const md = child?.metadata
  if (md?.type !== 'App') return null
  return {
    rootRoute: md.rootRoute || ctx.state?._route || '',
    homeRoute: md.homeRoute ?? '',
    serverSideType: md.homeServerSideType ?? md.serverSideType,
    variant: md.variant,
  }
}

const metaOf = (fr) => fr.component?.metadata || {}

let overlaySeq = 0
/** Construye un contexto de overlay (drawer/dialog) a partir de un fragmento Add. */
export function buildOverlay(fr) {
  const md = metaOf(fr)
  const id = 'overlay-' + ++overlaySeq
  return {
    id,
    kind: 'drawer',
    tree: fr.component, // el árbol completo — md.content lleva el contenido (patrón Card)
    state: md.initialData || fr.state || {},
    title: md.headerTitle || md.title,
    subtitle: md.subtitle,
    position: md.position || 'end',
    width: md.width,
    size: md.size,
    dirty: false,
  }
}

/** Resuelve a qué clave del registro va un target: eco del initiator; ''/null → host. */
const resolveTarget = (contexts, t) => {
  if (t == null || t === '') return HOST_ID
  if (contexts[t]) return t
  // eco de un id de componente ya registrado (p.ej. SSE que responde al uuid del árbol)
  const byTreeId = Object.keys(contexts).find((k) => contexts[k].tree?.id === t)
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
    runActions: [],
    docTitle: null,
    events: [], // bus @SubscribeTo: [{ name, detail }]
  }

  for (const m of increment.messages || [])
    effects.toasts.push({ text: m.text || m.title, variant: m.variant || 'info' })

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
      }
      continue
    }

    if (fr.action === 'Add') {
      const ctx = buildOverlay(fr)
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
        break
      case 'RunAction':
        effects.runActions.push(c.data)
        break
    }
  }

  return { contexts, stack, shell, effects }
}
