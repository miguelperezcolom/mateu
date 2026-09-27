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

/** Fronteras de isla embebida — DOS sabores confirmados en wire real:
 *  (a) nodos ServerSide INTERIORES (id propio, p.ej. '_guestNote');
 *  (b) nodos ClientSide App variant=MEDIATOR con id estable (p.ej.
 *      'island_checkin_st_maria') cuya PROPIA metadata trae homeRoute
 *      (?_embeddedMediator=1) + homeConsumedRoute + homeServerSideType —
 *      el detalle del TaskQueue del front-office llega así. */
export function collectIslands(tree, out = []) {
  const walk = (node, isRoot) => {
    if (!node || typeof node !== 'object') return
    if (!isRoot && node.type === 'ServerSide') {
      out.push(node)
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
export function dynFormMetadataOf(tree) {
  const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
  const metadata = {}
  for (const f of collectFields(tree)) {
    if (!f.dataType || metadata[f.fieldId]) continue // duplicados = referencias de FormRow
    // una LISTA (grid de formulario) no es un campo de texto: la pinta el contenido como tabla
    if (f.dataType === 'array' || (f.columns || []).length) continue
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
export function fieldListOf(tree, state, data) {
  if (!dynFormMetadataOf(tree)) return []
  const s = state || {}
  const seen = {}
  const out = []
  for (const f of collectFields(tree)) {
    if (!f.dataType || seen[f.fieldId]) continue
    seen[f.fieldId] = true
    if (f.dataType === 'array' || (f.columns || []).length) continue
    const widget = fieldWidgetOf(f, data, { lookups: false })
    const raw = s[f.fieldId]
    out.push({
      ...widget,
      value: raw == null ? null : (widget.isSelect ? plainValueOf(raw) : raw),
    })
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
  return { title, columns: columns > 0 ? Math.min(columns, 4) : 1 }
}

/**
 * Helper de RENDER: los campos del formulario AGRUPADOS por sus secciones (@Section), en el
 * orden del wire → [{ key, title, hasTitle, columns, fields }]. Los campos fuera de toda
 * sección van a un grupo sin título; un formulario sin secciones es UN grupo sin título, así
 * que el template pinta siempre secciones → campos. [] si el árbol no tiene formulario.
 */
export function formSectionsOf(tree, state, data) {
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
          loose = { key: 's' + sections.length, title: '', columns: 1, fields: [] }
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
  return sections
    .filter((sec) => sec.fields.length)
    .map((sec) => ({ ...sec, hasTitle: !!sec.title }))
}

/** Proyección del OVERLAY superior del stack (drawer del crud): título + campos + acciones.
 *  null si no hay overlays. Sus acciones se postean contra el HOST (el drawer no lleva
 *  ServerSide propio — confirmado en el wire). */
export function overlayOf(reg) {
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
  const content = (islandContentOf(ctx) || [])
    .map((block) => ({
      ...block,
      items: block.items
        .filter((a) => !a.isInput)
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
    position: ctx.position || 'end',
    width: ctx.width,
    state: ctx.state || {},
    fields: fieldListOf(ctx.tree, ctx.state, ctx.data),
    sections: formSectionsOf(ctx.tree, ctx.state, ctx.data),
    actions: actionsOf(ctx.tree).filter((a) => !contentActionIds.has(a.actionId)),
    content: content,
    hasContent: !!content.length,
    // un overlay Dialog se pinta como MODAL (oj-dialog: decisión puntual), no como
    // drawer (tarea con formulario); texts = sus líneas de mensaje
    isDialog,
    texts: collectTexts(ctx.tree),
  }
}

/** Vigía del diálogo de progreso de un LongTask sobre el stream SSE: consume el Add del
 *  Dialog-con-ProgressBar y los state-only dirigidos a su id; devuelve eventos
 *  {kind: open|progress, title?, text?, value?, rest} para que el chain pinte el
 *  oj-dialog — `rest` lleva los commands/messages del increment (el último los trae:
 *  dispatchEvent del refresco) SIN el fragment del diálogo, listos para reducir. */
export function longTaskWatcher() {
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
 *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout.
 *  Cada slot proyecta además sus bloques RICOS (mismo pipeline que el host: tarjetas
 *  StatusList, botones, inputs, notices…) — el markup pinta blocks y deja texts solo
 *  como forma legada para tests/fixtures. */
export function foldoutOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'FoldoutLayout') : null
  if (!node) return null
  const md = node.metadata
  const children = node.children || []
  const bySlot = {}
  for (const child of children) bySlot[child.slot || ''] = child
  const blocksOf = (slotNode) => {
    const blocks = slotNode
      ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {} })
      : null
    // mismo contrato visual que hostContentOf: bloques-columna con su colClass,
    // el resto a fila completa
    return (blocks || []).map((block) => ({
      ...block,
      blockClass: block.colClass || 'oj-flex-item oj-sm-12',
    }))
  }
  return {
    headerTitle: md.headerTitle || '',
    overview: {
      texts: collectTexts(bySlot['overview']),
      blocks: blocksOf(bySlot['overview']),
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
export function wizardOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
  if (!node) return null
  const md = node.metadata
  const wire = md.steps || []
  // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on';
  // el status de Mateu NO se emite (el indicador del rail espera otro enum)
  const steps = wire.map((s) => ({
    id: s.id,
    label: s.title || s.id,
    title: s.title || s.id,
    display: 'on',
  }))
  const current = wire.find((s) => s.status === 'current')
  const currentStep = current ? current.id : (steps.length ? steps[steps.length - 1].id : null)
  const currentIndex = Math.max(0, steps.findIndex((s) => s.id === currentStep))
  const statusOf = (s, i) => s.status || (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming')
  return {
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

/** ¿Es un átomo RICO (display de verdad, no un campo suelto)? Cuando el contenido de una pantalla
 *  los trae, el formulario genérico sobra: sus campos ya se ven en ellos. */
export function isRichAtom(a) {
  return !!(a && (a.isEntityHeader || a.isTaskProgress || a.isMeter || a.isStatusList || a.isLedger
    || a.isPayment || a.isResourceGrid || a.isAddOns || a.isStat || a.isNotice || a.isPropertyRow))
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
export function wizardStepViewOf(ctx, islandBlocks, opts = {}) {
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
  content = content.map((block) => {
    let movedToForm = 0
    const items = block.items.filter((a) => {
      if (a.isInput && !a.fromNested && onForm.has(a.fieldId)) { movedToForm++; return false }
      if (wizard.horizontal) {
        if (!title && a.isText && a.isH2) { title = a.text; return false }
        if (isWizardNavAtom(a)) { nav = a.buttons; return false }
      }
      return true
    })
    // una tarjeta de @Section cuyos campos se fueron al form se queda en su título: el form
    // ya pinta esa sección con su encabezado — fuera la tarjeta vacía
    const onlyHeadings = items.every((a) => a.isText && a.isHeading)
    return { ...block, items: movedToForm && onlyHeadings ? [] : items }
  }).filter((block) => block.items.length)
  // la acción de AVANCE (Next, o la de completar) es la llamada a la acción del pie
  nav = nav.map((b) => ({
    ...b,
    chroming: b.actionId === 'back' ? 'outlined' : 'callToAction',
  }))
  return { wizard, title, content, sections, nav }
}

/** Helper de RENDER: todos los nodos de un tipo (sin cruzar fronteras de isla). */
export function findAllByType(tree, type) {
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
export function cardOf(node) {
  const md = (node && node.metadata) || {}
  return { title: collectTexts(md.title)[0] || '', texts: collectTexts(md.content) }
}

/** Arquetipo WELCOME: hero (título/subtítulo + CTAs) + tiles del DashboardLayout. */
export function welcomeOf(ctx) {
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
export function generalOverviewOf(ctx) {
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

/** Arquetipo ITEM OVERVIEW: panel de datos clave + tabs. */
export function itemOverviewOf(ctx) {
  const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
  if (!tabLayout) return null
  const keyCard = findAllByType(ctx.tree, 'Card').find((card) => !findByType(card, 'TabLayout'))
  // El arquetipo es panel de datos clave + pestañas: sin panel esto no es un item overview,
  // es un FORMULARIO que resulta que lleva pestañas dentro. Reclamarlo igual dejaba la página
  // sin sus campos (no hay tarjeta clave que pintar) y las pestañas reducidas a sus rótulos
  // (de su contenido solo se sacan textos sueltos). Le pasaba al detalle de un proceso.
  if (!keyCard) return null
  const tabs = findAllByType(ctx.tree, 'Tab').map((tab, i) => ({
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
 *  contenido aplica contexts[host].pageWidth: fixed = tope 1408px con gutters 24px;
 *  fullWidth = fluido con gutters 24px; edgeToEdge = 0 márgenes. En FIXED el borde
 *  DERECHO se ancla a la MISMA fórmula con la que oj-sp-simple-ui-shell coloca su
 *  chrome flotante (chat FAB: right = (100vw - 1536px)/2, medido) — el shell calcula
 *  su caja sobre el viewport COMPLETO e ignora el navigator drawer, así que centrar
 *  el contenido en el área restante lo desalineaba del FAB en viewports anchos;
 *  izquierda auto (absorbe el drawer), tope 1408. */
export function pageStyleOf(ctx) {
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
 *  Un grupo (submenus en el wire) NO resuelve por sync — sus hijos navegan por la ruta
 *  TERMINAL (la compuesta /gestion/person da "Not found."; se recorta el prefijo del padre).
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
}
export function ojIconOf(icon) {
  if (!icon) return undefined
  if (icon.indexOf('oj-ux-') === 0) return icon
  return OJ_ICONS[icon] || undefined
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
  const id = !option.baseUrl && parentRoute && raw.indexOf(parentRoute + '/') === 0
    ? raw.slice(parentRoute.length)
    : raw
  // una entrada OCULTA (@Menu @Hidden, visible:false) no se dibuja a ninguna profundidad: su ruta
  // sigue resolviendo (la registra el transporte), pero el menú no la enseña
  const children = (option.submenus || option.submenu || []).filter((child) => child.visible !== false)
  return {
    id,
    label: option.caption || option.label || id,
    icon: ojIconOf(option.icon),
    hasChildren: children.length > 0,
    // el padre de un nieto es la ruta CRUDA del hijo, no su id ya recortado
    children: children.map((child) => navNodeOf(child, raw)),
  }
}

export function shellNavOf(reg) {
  const shell = reg.shell || {}
  const items = []
  const menuTree = []
  let hasGroups = false
  for (const option of shell.menu || []) {
    // una opción que viaja sin pintarse (remota oculta): expandRemoteMenus ya la quita, pero un
    // menú que no pase por ahí tampoco debe dibujarla
    if (option.visible === false) continue
    const node = navNodeOf(option, '')
    items.push({ id: node.id, label: node.label, icon: node.icon })
    if (node.hasChildren) hasGroups = true
    menuTree.push(node)
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
    homeRoute: shell.homeRoute || '',
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
export function taskQueueOf(tree) {
  const node = findByType(tree, 'TaskQueue')
  if (!node) return null
  const md = node.metadata
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
export function emptyStateOf(tree) {
  const node = findByType(tree, 'EmptyState')
  if (!node) return null
  const md = node.metadata
  return {
    title: (md.icon ? md.icon + ' ' : '') + (md.title || ''),
    description: md.description || '',
  }
}

/** Interpolación del wire (labels con plantillas): ${state.clave} → valor del state. */
export function interpolate(text, state) {
  // `${state.x}` y también `${state['x']}` / `${state["x"]}` (la posición del editor de filas
  // llega como ${state['_position']})
  return String(text == null ? '' : text).replace(
    /\$\{state(?:\.([A-Za-z0-9_]+)|\[\s*['"]([^'"\]]+)['"]\s*\])\}/g,
    (all, dotted, quoted) => {
      const key = dotted || quoted
      return state && state[key] != null ? String(state[key]) : ''
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
export function setDataProviderFactory(factory) { dataProviderFactory = factory }

export function islandContentOf(ctx, opts = {}) {
  if (!ctx || !ctx.tree) return null
  const activeTab = opts.activeTab || ''
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
  const visit = (node, container) => {
    if (!node || typeof node !== 'object') return
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
        node.children.forEach((zoneChild, i) => {
          const pct = parseFloat(zoneMatches[i][1])
          const col = Math.min(11, Math.max(1, Math.round(pct * 12 / 100)))
          // las cssClasses del wire de la COLUMNA viajan al bloque (p.ej. la banda
          // neutra de la info secundaria del general overview: oj-panel + oj-bg-*)
          const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
            + (zoneChild.cssClasses ? ' ' + zoneChild.cssClasses : '')
          const before = blocks.length
          plain = null
          visit(zoneChild, null)
          plain = null
          const created = blocks.splice(before)
          if (created.length === 1) {
            created[0].colClass = colClass
            blocks.push(created[0])
          } else if (created.length > 1) {
            blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
          }
        })
        return
      }
    }
    if (t === 'App') {
      // isla ANIDADA (p.ej. el documento del check-in): marcador de posición — el
      // contenido vive en su propio contexto y lo pinta mateuNested en ese hueco
      atom({ isNested: true, islandId: node.id }, container)
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
        const shown = statusBadgeRows(rows, m.columns).map((row, i) => (rowEditable
          ? {
            ...row,
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
        const raw = state[fieldId] != null ? state[fieldId] : (m.value != null ? m.value : '')
        atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(raw)) }, container)
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
      const ids = tabs.map((tab, i) => 'tab-' + i)
      const wanted = ids.indexOf(activeTab)
      const selected = wanted >= 0 ? wanted : tabs.findIndex((tab) => tab.metadata.active)
      const current = selected >= 0 ? selected : 0
      atom({
        isTabs: true,
        selectedId: ids[current],
        tabs: tabs.map((tab, i) => ({
          id: ids[i],
          label: interp(tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1)),
        })),
      }, container)
      for (const child of tabs[current].children || []) visit(child, container)
      return
    }
    if (t === 'CustomField') {
      // envoltorio: lo que importa es lo que lleva dentro (metadata.content)
      const inner = m.content
      if (Array.isArray(inner)) inner.forEach((c) => visit(c, container))
      else if (inner && typeof inner === 'object') visit(inner, container)
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
        elementId: node.id || m.name,
        name: m.name,
        importUrl: (m.attributes || {}).import || '',
        attributes,
        style: node.style || '',
        cssClasses: node.cssClasses || '',
        content: interp(m.content || ''),
        asHtml: !!m.html,
        on: m.on || null,
      }, container)
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
      atom({
        isNotice: true,
        text: interp(m.text),
        noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
        buttons: collectButtons({ children: kidsOf(node) }, []),
      }, container)
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
              iconClass: ojIconOf(it.actionIcon) || '' })
          }
          if (it.actionLabel2 && it.actionId2) {
            rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
              iconClass: ojIconOf(it.actionIcon2) || '' })
          }
          if (it.actionLabel3 && it.actionId3) {
            rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
              iconClass: ojIconOf(it.actionIcon3) || '' })
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

/** Fusiona el contenido de la isla ANIDADA dentro de los bloques de la isla madre:
 *  el bloque isNestedBlock (la card que solo contenía la isla) pasa a ser una card
 *  normal cuyos items son los átomos de la anidada, MARCADOS fromNested (también sus
 *  botones) para que el dispatcher enrute sus acciones al contexto anidado. Motivo:
 *  leer $application.variables DENTRO de un template anidado no re-liga los contextos
 *  internos en el evaluador CSP de VB — los datos deben fluir por $current. */
export function mergeNestedContent(islandBlocks, nestedBlocks) {
  if (!islandBlocks) return islandBlocks
  const nestedAtoms = (nestedBlocks || []).reduce((out, block) => out.concat(block.items), [])
    .map((a) => {
      const marked = { ...a, fromNested: true }
      if (a.buttons) marked.buttons = a.buttons.map((btn) => ({ ...btn, fromNested: true }))
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

export function hostContentOf(ctx, islandBlocks, opts = {}) {
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
export function wizardForwardOf(ctx) {
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
export function entityHeaderOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
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

/** ITEM OVERVIEW nativo (oj-sp-item-overview-page): página de entidad con dos
 *  bloques-columna cuya PRIMERA zona es la ESTRECHA — la anatomía RDS del template
 *  (panel de datos clave a la izquierda + main ancho a la derecha), frente al general
 *  overview (main ancho primero + info estrecha después). El EntityHeader del host se
 *  convierte en el oj-sp-item-overview del slot overview (itemTitle/subtitle/badge +
 *  facts como filas clave en el body); un botón "Volver…" del toolbar pasa a la flecha
 *  goToParent del header de navegación del template y el resto a secondaryActions. */
export function itemOverviewPageOf(entity, blocks, toolbar) {
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
export function pageToolbarOf(ctx) {
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
const BACK_ACTIONS = { back: true, 'back-to-list': true, close: true }
const isBackButton = (button) => !!button && (
  BACK_ACTIONS[button.actionId] || String(button.actionId || '').indexOf('cancel') === 0)

/** El botón de VOLVER del toolbar, si lo hay: en RDS eso no es una acción más, es la
 *  afordancia `goToParent` de la cabecera — meterlo entre las secundarias lo esconde en el
 *  desbordamiento justo cuando es lo que más se pulsa. */
export function backToolbarButton(toolbar) {
  return (toolbar || []).find(isBackButton) || null
}

export function primaryToolbarButton(toolbar) {
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
export function secondaryActionOf(detail, toolbar) {
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

/** Trigger @AutoSave/AutoSaveTrigger del host (buscar-al-teclear, autoguardado):
 *  {actionId, debounceMillis} o null. El renderer lo honra re-lanzando la acción
 *  debounced en cada pulsación (raw-value de los inputs del host). */
export function autoSaveOf(ctx) {
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

export function summarizeHost(reg, route) {
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
    text: formMetadata ? '' : String(state.message == null ? '' : state.message),
    formMetadata,
    fields,
    sections,
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
      }
      // ESTADO como badge (@Status): el valor de la celda es {type, message} — la clase
      // JET del badge se precomputa en las filas (statusBadgeRows, CSP sin ternarios)
      if (c.dataType === 'status') {
        def.template = 'cellStatusBadge'
      }
      // UUID abreviado: una columna de texto cuyos valores son UUID se pinta "…-<último bloque>"
      // con el UUID entero en el tooltip. La fila NO cambia: la celda lee un campo aparte,
      // precomputado en uuidCellRows (CSP de VB: la plantilla no puede recortar el texto).
      if (!def.template && uuidColumnIds(page.content || [], md.columns || []).indexOf(c.id) >= 0) {
        def.field = c.id + UUID_CELL_SUFFIX
        def.template = 'cellUuid'
      }
      return def
    }),
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
    rows: uuidCellRows(statusBadgeRows(page.content || [], md.columns || []), md.columns || []),
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

/**
 * La selección de la tabla, en una forma que sobrevive a un refresco: el KeySet de oj-table
 * (`detail.value.row` de ojSelectedChanged) → { all, keys, except }. Un "seleccionar todo" es
 * un KeySet de tipo addAll: todas menos las desmarcadas, no una lista de claves.
 */
export function selectionOfKeySet(keySet) {
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
export function selectedRowsOf(rows, selection) {
  if (!selection) return []
  const picked = selection.all
    ? (rows || []).filter((r) => selection.except.indexOf(r._rowNumber) < 0)
    : (rows || []).filter((r) => selection.keys.indexOf(r._rowNumber) >= 0)
  return picked.map((row) => {
    const out = {}
    for (const key of Object.keys(row)) {
      const value = row[key]
      if (key.endsWith(UUID_CELL_SUFFIX)) {
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
export function withListingSelection(componentState, listing, rows, selection) {
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
export function abbreviateUuid(value) {
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
export function filtersOf(ctx) {
  const found = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    for (const f of ((node.metadata || {}).filters) || []) {
      found.push(filterDescriptorOf(f))
    }
    ;(node.children || []).forEach(walk)
  }
  walk(ctx && ctx.tree)
  return found
}

export function filterDescriptorOf(f) {
  const options = (f.options || []).map((o) => ({ value: o.value, label: o.label || o.value }))
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
export function filterChipsOf(filters, values) {
  const v = values || {}
  return (filters || []).map((f) => {
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
}

/** Los valores de un multi-select, que llegan como lista o como cadena separada por comas. */
export function multiValuesOf(value) {
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

export const KEYWORD_FILTER = 'keyword'
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
export function smartFiltersMetadataOf(filters) {
  const polymorphicTypes = {}
  for (const f of filters || []) {
    polymorphicTypes[f.fieldId] = { type: 'object', properties: { value: smartFilterValueMetadataOf(f) } }
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
export function smartFilterSuggestionsOf(filters) {
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
export function smartFilterValueOf(filters, values, searchText) {
  const v = values || {}
  const out = []
  const text = searchText == null ? '' : String(searchText).trim()
  if (text) out.push({ filter: KEYWORD_FILTER, label: text, value: text })
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
export function filterStateOfSmartFilters(filters, chips) {
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
export function suggestionRowsFor(rows, criterion) {
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
export function suggestionFiltersProviderOf(rows) {
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

// el JsonMetadataProvider de oj-dynamic: lo pone el módulo AMD (el core no depende de JET)
let metadataProviderFactory = null
export function setMetadataProviderFactory(factory) { metadataProviderFactory = factory }

/**
 * La configuración ENTERA de `smart-filters` para un listado: sugerencias, aplicados y el
 * editor de cada filtro. Sin filtros declarados, sólo el buscador de texto (como siempre).
 */
export async function smartFiltersOf(filters, values, searchText) {
  const config = { askHint: 'Buscar…', value: smartFilterValueOf(filters, values, searchText) }
  if (!filters || !filters.length) return config
  config.suggestionFilters = suggestionFiltersProviderOf(smartFilterSuggestionsOf(filters))
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
export const LIST_ACTION = /^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/

/** Verbos que llevan la fila del diálogo en parameters.initiatorState. */
const ROW_EDITOR_VERBS = { create: true, 'create-and-stay': true, save: true, cancel: true, prev: true, next: true }

/** Verbos que validan la fila antes de salir (los obligatorios vacíos). */
export const ROW_VALIDATING_VERBS = { create: true, 'create-and-stay': true, save: true }

/** ¿El FormField es una lista cuyo editor de fila se abre en un diálogo? */
export function isModalRowEditor(field) {
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
export function listActionOf(state, actionId, tree) {
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
export function listActionRequestOf(reg, actionId, opts = {}) {
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
export function rowFieldsOf(ctx, values, errors) {
  if (!ctx || !ctx.tree) return []
  const state = { ...(ctx.state || {}), ...(values || {}) }
  const seen = {}
  const out = []
  for (const f of collectFields(ctx.tree)) {
    if (!f.dataType || seen[f.fieldId]) continue
    seen[f.fieldId] = true
    if (f.dataType === 'array' || (f.columns || []).length) continue
    const widget = fieldWidgetOf(f, ctx.data, { lookups: true })
    const raw = plainValueOf(state[f.fieldId])
    const error = errors && errors[f.fieldId]
    out.push({
      ...widget,
      value: widget.isBoolean ? !!raw : (raw == null || raw === '' ? null : (widget.isNumber ? Number(raw) : raw)),
      messagesCustom: error ? [{ severity: 'error', summary: error, detail: '' }] : [],
    })
  }
  return out
}

/**
 * El WIDGET que le toca a un FormField (flags PRECOMPUTADOS: el CSP de VB no evalúa
 * expresiones), compartido por el editor de fila y los formularios de página/drawer/isla:
 * select si trae opciones (estáticas, o las que trajo su búsqueda) — o, con lookups, si es un
 * lookup remoto —, fecha, fecha-hora, número, booleano, área de texto o texto.
 */
function fieldWidgetOf(f, data, { lookups }) {
  const lookupActionId = (f.remoteCoordinates && f.remoteCoordinates.action) || ''
  const options = optionsOf(f, data)
  const isSelect = (lookups && !!lookupActionId) || options.length > 0
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
  }
}

/** Los obligatorios vacíos de la fila → { fieldId: mensaje }; {} si está bien. */
export function validateRow(ctx, values) {
  const errors = {}
  for (const f of rowFieldsOf(ctx, values)) {
    if (f.required && !f.readonly && !f.isBoolean && isBlank(f.value)) errors[f.fieldId] = 'Required'
  }
  return errors
}

/** Los lookups de la fila que aún no tienen opciones → [{ fieldId, actionId }]. */
export function pendingLookupsOf(ctx) {
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
export function lookupRequestOf(reg, rowCtxId, fieldId, opts = {}) {
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
export function rowEditorOf(reg, opts = {}) {
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
