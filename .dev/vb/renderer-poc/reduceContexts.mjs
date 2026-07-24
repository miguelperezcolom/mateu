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

/** Helper de RENDER: recorre un subárbol y recolecta todo nodo con fieldId (un FormField). */
export function collectFields(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.fieldId) out.push(node)
  for (const k of Object.keys(node)) {
    const v = node[k]
    if (Array.isArray(v)) v.forEach((x) => collectFields(x, out))
    else if (v && typeof v === 'object') collectFields(v, out)
  }
  return out
}

/** Helper de RENDER: recolecta botones/acciones (actionId + label, sin fieldId). */
export function collectActions(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.actionId && node.label && !node.fieldId) out.push(node)
  for (const k of Object.keys(node)) {
    const v = node[k]
    if (Array.isArray(v)) v.forEach((x) => collectActions(x, out))
    else if (v && typeof v === 'object') collectActions(v, out)
  }
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
  // lista de campos para el switch widgetFor (isNumber/isBoolean/isText PRECOMPUTADOS:
  // los bindings VB deben ser paths simples, sin ternarios ni comparaciones)
  const fields = formMetadata
    ? Object.keys(formMetadata).map((fieldId) => {
        const f = formMetadata[fieldId]
        return {
          fieldId,
          label: f.displayName,
          required: f.required,
          readonly: f.readonly,
          isNumber: f.type === 'number',
          isBoolean: f.type === 'boolean',
          isText: f.type !== 'number' && f.type !== 'boolean',
          value: state[fieldId] == null ? null : state[fieldId],
        }
      })
    : []
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
    const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {} }
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
