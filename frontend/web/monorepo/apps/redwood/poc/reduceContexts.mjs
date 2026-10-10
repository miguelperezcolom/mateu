import { autoTrail } from './breadcrumbs.mjs'
import { sectionHomeOf, sectionRoutes, isSentinelHome } from './navTree.mjs'
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
export function dynFormMetadataOf(tree) {
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
export function wizardOf(ctx) {
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

/** ¿Es un átomo RICO (display de verdad, no un campo suelto)? Cuando el contenido de una pantalla
 *  los trae, el formulario genérico sobra: sus campos ya se ven en ellos. */
export const RICH_ATOM_FLAGS = [
  'isEntityHeader', 'isTaskProgress', 'isMeter', 'isStatusList', 'isLedger', 'isPayment',
  'isResourceGrid', 'isAddOns', 'isStat', 'isNotice', 'isPropertyRow',
  // reto PMS: cualquier átomo NUEVO tiene que estar aquí — si no, en una página que también
  // lleva campos gana el formulario genérico (que solo pinta campos) y el átomo desaparece
  'isAnchor', 'isQueue',
]
export function isRichAtom(a) {
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
/** Los pares color + ilustración del hero de la welcome: las 5 parejas bg+fg de la galería OFICIAL
 *  (fnd/gallery illust-welcome-banner-*-01..05), cada una con su tono de la paleta oscura RDS. */
export const WELCOME_LOOKS = [
  ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
  ['dark-sienna', '04'], ['dark-teal', '05'],
]
const WELCOME_GALLERY = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/'

/** Qué welcome es la que se pinta: su clase de servidor (o, sin ella, el id del árbol). */
export function welcomeKeyOf(ctx) {
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
export function welcomeLookOf(key, previous, random = Math.random) {
  if (previous && previous.theme && previous.key === key) return previous
  const [theme, n] = WELCOME_LOOKS[Math.floor(random() * WELCOME_LOOKS.length) % WELCOME_LOOKS.length]
  return {
    key,
    theme,
    illuBg: WELCOME_GALLERY + 'illust-welcome-banner-bg-' + n + '.png',
    illu: WELCOME_GALLERY + 'illust-welcome-banner-fg-' + n + '.png',
  }
}

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

/** Clave de una barra de pestañas del contenido: '' para la primera de primer nivel (la de
 *  siempre, así una página con una sola barra no cambia); dentro de una pestaña, el id de esa
 *  pestaña; las hermanas siguientes llevan '/tabs-N'. */
export function tabStripKeyOf(scope, ordinal) {
  return [scope || '', ordinal ? 'tabs-' + ordinal : ''].filter(Boolean).join('/')
}

/** Id de la pestaña i de una barra: 'tab-i' en la de primer nivel, '<clave>/tab-i' en el resto. */
export function tabIdOf(stripKey, index) {
  return (stripKey ? stripKey + '/' : '') + 'tab-' + index
}

/** La barra a la que pertenece una pestaña (inversa de tabIdOf). */
export function tabStripOf(tabId) {
  const s = String(tabId || '')
  const cut = s.lastIndexOf('/')
  return cut < 0 ? '' : s.slice(0, cut)
}

/** Anota la pestaña elegida en el mapa de activas (una por barra), sin tocar las demás barras. */
export function withActiveTab(activeTabs, tabId) {
  return { ...(activeTabs || {}), [tabStripOf(tabId)]: tabId }
}

/** Ids de las barras de pestañas (átomos isTabs) de unos bloques: las chains las refrescan. */
export function tabBarIdsOf(blocks) {
  const ids = []
  const walk = (items) => (items || []).forEach((a) => {
    if (a && a.isTabs && a.barId) ids.push(a.barId)
    if (a && a.items) walk(a.items)
  })
  ;(blocks || []).forEach((b) => walk(b.items))
  return ids
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
export function ojIconOf(icon) {
  if (!icon) return undefined
  if (icon.indexOf('oj-ux-') === 0) return icon
  return OJ_ICONS[icon] || undefined
}

/** El icono genérico para un icono DECLARADO que no tiene traducción a Redwood. */
export const GENERIC_ICON = 'oj-ux-ico-arrow-circle-right'

/**
 * Como ojIconOf, pero un icono declarado sin traducción cae en uno genérico: una entrada de menú
 * o un botón de sólo icono nunca se queda en blanco («Llegadas» con vaadin:sign-in salía sin
 * icono junto a sus hermanas). ojIconOf sigue estricto: el HTML de los widgets quita los que no
 * conoce y el FAB de Ask cae en su propio glifo.
 */
export function ojIconOrGenericOf(icon) {
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
export function taskQueueOf(tree) {
  // una cola DENTRO de un panel de consola es la lista de esa consola (átomo isQueue del
  // dispatcher), no el modo «cola de trabajo + isla» de página completa
  const node = findOutsidePanes(tree, 'TaskQueue')
  if (!node) return null
  return queueProjectionOf(node.metadata)
}

/** Los grupos de tarjetas de una TaskQueue, listos para pintar (modo página y átomo isQueue). */
export function queueProjectionOf(md) {
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
export function notFoundOf(tree, lang) {
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
export function rowRouteOf(template, row) {
  if (!template) return ''
  let unresolved = false
  const route = String(template).replace(/\$\{\s*row\.([A-Za-z0-9_]+)\s*\}/g, (all, field) => {
    const value = row ? row[field] : undefined
    if (value == null || value === '') { unresolved = true; return '' }
    return encodeURIComponent(typeof value === 'object' ? (value.value ?? value.message ?? '') : String(value))
  })
  return unresolved || route.includes('${') ? '' : route
}

export function interpolate(text, state) {
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
export function setDataProviderFactory(factory) { dataProviderFactory = factory }

/** Fábrica de conversores de JET (oj-input-number de un importe): JET 18 ya no acepta el
 *  conversor como JSON, quiere una instancia de IntlNumberConverter. En Node se queda la
 *  especificación, que es lo que los tests comprueban. */
let converterFactory = null
export function setConverterFactory(factory) { converterFactory = factory }
function converterOf(spec) {
  return converterFactory ? converterFactory(spec) : spec
}

export function islandContentOf(ctx, opts = {}) {
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
export function hostContentShown(blocks, summary) {
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
export function subresourceIslandOf(node) {
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
export function pendingSubresourcesOf(blocks, contexts) {
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
export function withSubresources(blocks, contexts) {
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
export function mergeNestedContent(islandBlocks, nestedBlocks) {
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
// Paneles cuyo contenido es de UN elemento de una colección (el detalle de una consola): un
// EntityHeader ahí dentro es la ficha del elegido, no la entidad de la PÁGINA — subirlo a la
// cabecera vaciaba el panel de detalle y ponía el nombre del huésped como título de la pantalla.
const PANE_TYPES = { MasterDetailLayout: true, SplitLayout: true }
function pageEntityHeaderNode(tree) {
  return findOutsidePanes(tree, 'EntityHeader')
}
/** findByType, pero sin entrar en los paneles de una consola (MasterDetailLayout/SplitLayout): lo
 *  que hay dentro es contenido de un panel, no una pieza de la PÁGINA (su cabecera, su cola). */
export function findOutsidePanes(tree, type) {
  let found = null
  const walk = (n) => {
    if (found || !n || typeof n !== 'object') return
    const t = n.metadata && n.metadata.type
    if (t === type) { found = n; return }
    if (t && PANE_TYPES[t]) return
    for (const c of n.children || []) walk(c)
    const inner = n.metadata && n.metadata.content
    if (Array.isArray(inner)) inner.forEach(walk)
    else if (inner && typeof inner === 'object') walk(inner)
  }
  walk(tree)
  return found
}

export function entityHeaderOf(ctx) {
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
export function pageKpisOf(ctx) {
  const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
  if (!page) return []
  const state = ctx.state || {}
  return ((page.metadata || {}).kpis || [])
    .filter((k) => k && (k.title || k.text))
    .map((k) => ({ label: k.title || '', value: interpolate(k.text == null ? '' : String(k.text), state) }))
}

/** El subtítulo de la Page (SubtitleSupplier/@Subtitle: p.ej. los importes de una reserva) para
 *  el header de pantalla cuando no hay EntityHeader. Interpolado como el título. */
export function pageSubtitleOf(ctx) {
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
const BACK_ACTIONS = { back: true, 'back-to-list': true, close: true, cancel: true }
// `cancel` y los `cancel-<modo>` del crud (cancel-view, cancel-edit, cancel-new) son la vuelta;
// una acción del dominio que EMPIEZA por cancel no lo es: el «Cancel booking» de una reserva
// (`cancelBooking`) acababa convertido en el enlace de vuelta de la cabecera.
const isBackButton = (button) => !!button && (
  BACK_ACTIONS[button.actionId] || /^cancel-/.test(String(button.actionId || '')))

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

/** Primer nodo de la SUPERFICIE (sin cruzar islas) que cumple `test`; null si ninguno. */
function findFirst(tree, test) {
  let found = null
  walkWithinSurface(tree, (n) => { if (!found && test(n)) found = n })
  return found
}

/** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
 *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
 *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
export function listingOf(ctx, opts = {}) {
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
    rows: rowLinesRows(clipCellRows(primaryCellRows(uuidCellRows(statusBadgeRows(page.content || [], md.columns || []), md.columns || []), md.columns || []), md.columns || []), lines.extra),
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
export function listingPagingOf(page, fallbackSize, lang) {
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
export function targetPageOf(paging, which) {
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
export function listingSearchStateOf(hostState, opts = {}) {
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
export function listingSortOf(detail, sortFields) {
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

const PRIMARY_CELL_SUFFIX = '__primary'

/** La celda (de la columna técnica ROW_LINES_COLUMN) que pinta las líneas extra de cada fila. */
export const ROW_LINES_FIELD = '__rowLines'

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
export function lineOfColumn(c) {
  const line = c && typeof c.line === 'number' ? c.line : 0
  return line > 1 ? Math.floor(line) : 1
}

/** Reparte las columnas del wire por línea: {first: las de la línea 1, extra: [[línea 2], [línea 3]…]}
 *  en el orden del wire (las líneas vacías no cuentan). Sin @Line, extra = [] y nada cambia. */
export function rowLinesSplit(columns) {
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
export function columnWidthOf(c) {
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
      const tip = c.tooltipPath ? text(row[c.tooltipPath]) : ''
      // solo la columna de ancho fijo se corta; con tooltipPath y sin ancho, el texto sigue entero
      out[c.id + CLIP_CELL_SUFFIX] = { text: shown, title: tip || shown, cls: columnWidthOf(c).maxWidth ? 'mateu-cell-clip' : '' }
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
export function filtersOf(ctx) {
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

export function filterDescriptorOf(f, data) {
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
export function filterChipsOf(filters, values) {
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
export function navTargetOf(requested, currentFull) {
  const raw = String(requested || '')
  const q = raw.indexOf('?')
  const route = q >= 0 ? raw.slice(0, q) : raw
  const query = q >= 0 ? raw.slice(q + 1) : ''
  const full = query ? route + '?' + query : route
  return { route, full, filters: queryFiltersOf(query), same: full === (currentFull || '') }
}

export function queryFiltersOf(query) {
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
export const IDS_PARAM = 'ids'

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
export function idsChipLabelOf(ids, lang) {
  const list = multiValuesOf(ids)
  const texts = idsTextsOf(lang)
  return list.length <= 3 ? texts.few + list.join(', ') : texts.many(list.length)
}

/**
 * Los filtros de una query (queryFiltersOf) separados en el texto libre y el resto: `searchText`
 * (o su alias `q`, si no viene searchText) es lo que se busca, no un filtro — va al chip keyword.
 */
export function splitListingQuery(filters) {
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
export function listingQueryOf(values, searchText) {
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
export function listingUrlOf(route, values, searchText) {
  const bare = String(route || '').split('?')[0]
  const query = listingQueryOf(values, searchText)
  return query ? bare + '?' + query : bare
}

const declaresIds = (filters) => (filters || []).some((f) => f && f.fieldId === IDS_PARAM)

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

/**
 * Las filas del DESPLEGABLE del buscador (la propiedad `suggestions` de oj-sp-smart-filters, un
 * SmartSuggestionChipsDataProvider): una por filtro declarado, cada una con su chip. Al entrar en
 * el campo el componente las abre en su popup bajo la caja; elegir una aplica ese filtro y, como
 * es un chip complejo, abre su editor (oj-dynamic, filtersMetadata) — el mismo editor que los chips.
 * `category: 'suggestion'` es el icono de caja del componente (los otros son historial y texto).
 */
export function smartFilterDropdownRowsOf(filters) {
  return smartFilterSuggestionsOf(filters).map((chip) => ({ id: chip.filter, category: 'suggestion', chips: [chip] }))
}

/** Las filas del desplegable que tocan: fuera los filtros ya aplicados y, si hay texto, las que no lo contienen. */
export function dropdownRowsFor(rows, criterion) {
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
export function suggestionsProviderOf(rows) {
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
export function setMetadataProviderFactory(factory) { metadataProviderFactory = factory }

/**
 * La configuración ENTERA de `smart-filters` para un listado: el desplegable de filtros, los
 * aplicados y el editor de cada filtro. Sin filtros declarados, sólo el buscador de texto.
 *
 * Los filtros sin aplicar se ofrecen en el DESPLEGABLE que abre el buscador al entrar en él
 * (`suggestions`), no como una fila de botones bajo la caja (`suggestionFilters`, lo que hubo
 * desde 8af850e63): el buscador del listado vuelve a ser una caja con su menú de filtros.
 */
export async function smartFiltersOf(filters, values, searchText) {
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
export function onLoadTriggers(ctx) {
  return ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .filter((t) => t.type === 'OnLoad' && t.actionId)
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

const metaOf = (fr) => fr.component?.metadata || {}

let overlaySeq = 0
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
export const EMPTY_VALUE = '—'
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
export function layoutFieldOf(md, state, data, columns = 1) {
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
export function searchableIdsOf(value) {
  if (value == null || value === '') return []
  const list = Array.isArray(value) ? value : [value]
  return list.filter((id) => id != null && id !== '')
}

/**
 * Los chips de un @Searchable: uno por id, rotulado (o el propio id si no hay rótulo). Cada chip
 * lleva lo que queda al quitarlo (`remaining`: en uno simple, null) — precomputado (CSP de VB).
 */
export function searchableChipsOf(fieldId, ids, labels, opts = {}) {
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
export function searchPickerOf(reg) {
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
export function pickerSearchStateOf(picker, opts = {}) {
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
export function withContextState(reg, id, values) {
  const ctx = reg && reg.contexts && reg.contexts[id]
  if (!ctx || !values || !Object.keys(values).length) return reg
  return { ...reg, contexts: { ...reg.contexts, [id]: { ...ctx, state: { ...(ctx.state || {}), ...values } } } }
}

/**
 * Una proyección (secciones del formulario, bloques del host…) con los chips del @Searchable
 * `fieldId` rehechos para `ids` — al quitar un chip, sin volver al servidor. Los rótulos salen
 * de los chips que ya había.
 */
export function withSearchableIds(projection, fieldId, ids) {
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
export function extraWidgetOf(f, options) {
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
export function validateRow(ctx, values) {
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
export function declaredActionOf(ctx, actionId) {
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
export function actionTransportOf(ctx, actionId) {
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
export function overlayTransportOf(reg, actionId) {
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
export function confirmationDefaultsOf(lang) {
  const raw = lang || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang)
    || (typeof navigator !== 'undefined' && navigator.language) || ''
  return CONFIRMATION_DEFAULTS[String(raw).toLowerCase().split(/[-_]/)[0]] || CONFIRMATION_DEFAULTS.en
}

/**
 * El diálogo de confirmación que pide la acción antes de salir (`confirmationRequired`), o null
 * si no pide ninguno. Cada texto cae por su cuenta al genérico — como en Vaadin
 * (confirmationTexts.ts): una acción que sólo declara el mensaje los trae vacíos al resto.
 */
export function confirmationOf(ctx, actionId, lang) {
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
export function awaitConfirmation() {
  if (pendingConfirmation) pendingConfirmation(false)
  return new Promise((resolve) => { pendingConfirmation = resolve })
}

/** Contesta el diálogo de confirmación abierto; sin ninguno esperando, no hace nada. */
export function answerConfirmation(confirmed) {
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
export function validationOf(ctx, actionId) {
  const action = declaredActionOf(ctx, actionId)
  if (!action || !action.validationRequired) return null
  return { fields: Array.isArray(action.fieldsToValidate) ? action.fieldsToValidate : [] }
}

/**
 * Los obligatorios vacíos del formulario de la página (sus secciones, tal como se pintan) con
 * lo que el usuario ha escrito (el borrador gana al estado) → [fieldId] en el orden del
 * formulario: el primero es el que recibe el foco. `only` restringe a esos campos.
 */
export function formErrorsOf(sections, draft, only) {
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
export function selectPlaceholder(lang) {
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
export function formLookupsOf(ctx) {
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
export const LOOKUP_LOADED = '_mateuLoaded'

/** El registro con las opciones de esos lookups del contexto marcadas como cargadas. */
export function markLookupsLoaded(reg, ctxId, fieldIds) {
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
