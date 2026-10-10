import { islandContentOf, subresourceIslandOf, editorNodeIds } from './content.mjs'
import { fieldWidgetOf, isExtraLayoutField, plainValueOf } from './rowEditor.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the component tree: walks, fields, actions, islands, overlays, texts.

export const HOST_ID = '__root__'

/** Recorrido que NO cruza fronteras de isla: un ServerSide INTERIOR es otra superficie
 *  (sus campos/acciones pertenecen a su propio contexto, no al host). */
export function walkWithinSurface(node, visit) {
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

/** The node id of every metadata object of the tree (metadata → its node's id), for the visual
 *  editor's canvas: the fields and the buttons are collected as their METADATA, and what the
 *  editor selects is the node. Only asked for in editor mode (setEditorNodeIds). */
export function ownerIdsOf(tree) {
  const ids = new Map()
  walkWithinSurface(tree, (n) => { if (n.metadata && typeof n.metadata === 'object' && n.id) ids.set(n.metadata, String(n.id)) })
  return ids
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
  const ids = editorNodeIds ? ownerIdsOf(tree) : null
  for (const a of collectActions(tree)) {
    if (seen[a.actionId]) continue
    seen[a.actionId] = true
    out.push({
      actionId: a.actionId,
      label: a.label,
      style: a.buttonStyle || 'outlined',
      chroming: a.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      parameters: a.parameters || {},
      ...(ids && ids.get(a) ? { nodeId: ids.get(a) } : {}),
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
  const ids = editorNodeIds ? ownerIdsOf(tree) : null
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
      value = Array.isArray(raw) ? raw.map((v) => plainValueOf(v)) : (raw == null || raw === '' ? [] : String(raw).split(','))
    else if (widget.isMoney) value = raw == null || raw === '' || Number.isNaN(Number(raw)) ? null : Number(raw)
    out.push({ ...widget, value, ...(ids && ids.get(f) ? { nodeId: ids.get(f) } : {}) })
  }
  return out
}

/** ¿Es este nodo una SECCIÓN del formulario (@Section)? El wire la manda como una Card con la
 *  clase mateu-section, su título en un Text de cabecera (h3) y sus campos en un FormLayout. */
export function isSectionNode(n) {
  return !!(n && n.metadata && n.metadata.type === 'Card' && /(^|\s)mateu-section(\s|$)/.test(n.cssClasses || ''))
}

/** El título y las columnas de una sección: el primer Text de cabecera y el primer FormLayout
 *  de SU contenido (sin bajar a una sección anidada ni a otra isla). */
export function sectionHeadOf(card) {
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
export function wideColumnsOf(section) {
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
