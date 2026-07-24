/* GENERADO por renderer-poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: renderer-poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd renderer-poc && node test.mjs). */
define([], () => {
  'use strict';
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

  /** Helper de RENDER: recorre un subárbol y recolecta todo nodo con fieldId (un FormField). */
  function collectFields(node, out = []) {
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
  function collectActions(node, out = []) {
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
  function collectIslands(tree, out = []) {
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
  function dynFormMetadataOf(tree) {
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
      })
    }
    return out
  }

  /** Helper de RENDER: lista de campos para el switch widgetFor (isText/isNumber/isBoolean
   *  PRECOMPUTADOS — los bindings VB deben ser paths simples), con el valor sacado del state. */
  function fieldListOf(tree, state) {
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
  function overlayOf(reg) {
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

  /** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
  function summarizeHost(reg, route) {
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

  /** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
   *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
   *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
  function listingOf(ctx) {
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
  function onLoadTriggers(ctx) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .filter((t) => t.type === 'OnLoad' && t.actionId)
      .map((t) => t.actionId)
  }

  /** Si el contexto es un MEDIADOR (ServerSide → child App), la info para cargar su contenido. */
  function mediatorOf(ctx) {
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
  function buildOverlay(fr) {
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


  // Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
  // "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
  // sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
  // testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).


  /** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction). */
  async function callMateu(base, body) {
    const bare = (body.route || '').replace(/^\//, '')
    const res = await fetch(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
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
    })
    if (!res.ok) throw new Error(`Mateu ${body.route} ${body.actionId} → HTTP ${res.status}: ${await res.text()}`)
    return res.json()
  }

  /** Bootstrap de la shell: el App raíz solo resuelve por el endpoint genérico. */
  async function bootstrapShell(base, initiator = 'shell') {
    const res = await fetch(`${base}/mateu/v3/components/_/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
    })
    if (!res.ok) throw new Error(`Mateu bootstrap → HTTP ${res.status}`)
    return res.json()
  }

  /** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…). */
  const loadRoute = (base, route, initiator = '', extra = {}) =>
    callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })

  /** Acción saliente: arma la request desde el CONTEXTO — "manda el estado que ya tienes".
   *  Los 4 campos de ruta salen del `outbound` que loadRouteInto estampó al cargar el
   *  contexto (un mediador necesita consumedRoute + serverSideType también en las acciones). */
  function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
    const outbound = (ctx && ctx.outbound) || {}
    return callMateu(base, {
      route: outbound.route || route,
      consumedRoute: outbound.consumedRoute || '',
      actionId,
      componentState: componentState || (ctx && ctx.state) || {},
      serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
      initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
      ...extra,
    })
  }

  /**
   * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
   * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
   * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
   */
  async function loadRouteInto(base, reg, route, targetId = '') {
    let next = reduceContexts(reg, await loadRoute(base, route, targetId))
    const ctxId = targetId === '' ? HOST_ID : targetId
    let outbound = { route, consumedRoute: '', serverSideType: undefined }
    const info = mediatorOf(next.contexts[ctxId])
    if (info) {
      outbound = {
        route,
        consumedRoute: info.rootRoute || route,
        serverSideType: info.serverSideType,
      }
      next = reduceContexts(
        next,
        await loadRoute(base, route, targetId, {
          consumedRoute: outbound.consumedRoute,
          serverSideType: outbound.serverSideType,
        }),
      )
    }
    // el contexto RECUERDA cómo se cargó: las acciones salientes reconstruyen los campos
    // de ruta desde aquí (structural sharing: solo cambia la ref de esta entrada)
    next = {
      ...next,
      contexts: {
        ...next.contexts,
        [ctxId]: { ...next.contexts[ctxId], outbound },
      },
    }
    return next
  }

  return {
    HOST_ID,
    reduceContexts,
    collectFields,
    collectActions,
    collectIslands,
    mediatorOf,
    buildOverlay,
    dynFormMetadataOf,
    actionsOf,
    summarizeHost,
    findByType,
    listingOf,
    onLoadTriggers,
    fieldListOf,
    overlayOf,
    eventTriggersOf,
    dismissOverlay,
    callMateu,
    bootstrapShell,
    loadRoute,
    loadRouteInto,
    runMateuAction,
  };
});
