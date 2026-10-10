import { HOST_ID, collectFields } from './tree.mjs'
import { RICH_TEXT_STEREOTYPES } from './atoms.mjs'
import { converterOf, interpolate } from './content.mjs'
import { ROW_LINES_FIELD, findByType, isBlank, listingOf } from './listing.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): forms: list actions, the modal row editor, field widgets, validation, confirmation, lookups.

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
export const ROW_EDITOR_VERBS = { create: true, 'create-and-stay': true, save: true, cancel: true, prev: true, next: true }

/** Verbos que validan la fila antes de salir (los obligatorios vacíos). */
export const ROW_VALIDATING_VERBS = { create: true, 'create-and-stay': true, save: true }

/** ¿El FormField es una lista cuyo editor de fila se abre en un diálogo? */
export function isModalRowEditor(field) {
  return !!(field && !field.readOnly && !field.inlineEditing
    && (field.columns || []).length && /^modal/.test(field.formPosition || ''))
}

/** Las listas con editor modal de un árbol (sin cruzar islas): fieldId → FormField. */
export function modalListsOf(tree) {
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
export function holderTransportOf(holder) {
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
export function rowOf(rows, key) {
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

export const ROW_CHROMING = { primary: 'callToAction', tertiary: 'borderless' }

export function rowButtonOf(b) {
  return {
    actionId: b.actionId,
    label: b.label || b.actionId,
    chroming: ROW_CHROMING[b.buttonStyle] || 'outlined',
  }
}

/** Opciones de un select/lookup: las estáticas del campo o las que trajo su búsqueda. */
export function optionsOf(field, data) {
  const found = data && data[field.fieldId] && data[field.fieldId].content
  const raw = (field.options && field.options.length) ? field.options : (found || [])
  return raw.map((o) => ({ value: o.value, label: o.label == null ? String(o.value) : o.label }))
}

/** El valor de un campo tal como lo edita su widget: un lookup puede llegar como {value,label}. */
export function plainValueOf(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) return value.value
  return value
}

export const NUMERIC_TYPES = { integer: true, int: true, long: true, number: true, double: true, float: true, money: true }

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
export const EMPTY_READONLY_WIDGET = { isText: false, isEmptyReadonly: true, isTextArea: false, isNumber: false, isDate: false, isDateTime: false,
  isSelect: false, isLookup: false, lookupActionId: '', options: [] }

/** Tipos de campo que el form layout sabe pintar con un widget de JET. */
export const LAYOUT_TYPES = { string: true, integer: true, int: true, long: true, number: true, double: true,
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
    || (RICH_TEXT_STEREOTYPES[md.stereotype] && md.readOnly)
    || !(LAYOUT_TYPES[md.dataType] || md.stereotype === 'searchable' || isExtraLayoutField(md))) return null
  const s = state || {}
  const d = data || {}
  const raw = s[fieldId] != null ? s[fieldId] : d[fieldId]
  const widget = fieldWidgetOf(md, data, { lookups: !md.readOnly, value: raw, textWhenEmpty: true })
  let value = raw == null || raw === '' ? null : raw
  if (widget.isBoolean) value = !!raw
  else if (widget.isSelect) value = value == null ? null : plainValueOf(value)
  else if (widget.isNumber || widget.isMoney || widget.isSlider || widget.isStars) value = value == null || Number.isNaN(Number(value)) ? null : Number(value)
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
export function isSearchableField(f) {
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
export function searchableWidgetOf(f, data, value) {
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
export function isPickerOverlay(ctx) {
  const surface = ctx && ctx.surface
  if (!surface || !findByType(surface, 'Crud')) return false
  return ((surface.actions || []).some((a) => a && a.id === SEARCHABLE_PICK_ACTION))
}

export const SEARCHABLE_PICK_ACTION = 'action-on-row-select'
export const SEARCHABLE_ADD_ACTION = 'action-on-row-select-selected'

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
export function applyOverlayEvent(contexts, stack, data) {
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
export const MULTI_SELECT_STEREOTYPES = { multiSelect: true, combobox: true, listBox: true }
export const CHECKBOX_SET_STEREOTYPES = { checkbox: true, choice: true }
export const CAPTURE_MODES = { fileUpload: 'file', uploadableImage: 'image', image: 'image', signature: 'signature', camera: 'camera' }

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
  // slider → oj-slider; stars → oj-rating-gauge; color → mateu-color-field (a hex string: JET's
  // oj-color-spectrum works on oj.Color objects); richText → mateu-rich-text-field (HTML, Delta read)
  if (st === 'slider') {
    const min = Number(f.sliderMin) || 0
    const max = Number(f.sliderMax) > min ? Number(f.sliderMax) : 100
    return { isSlider: true, min, max, step: Number(f.step) > 0 ? Number(f.step) : 1 }
  }
  if (st === 'stars') return { isStars: true, max: Number(f.sliderMax) > 0 ? Number(f.sliderMax) : 5 }
  if (st === 'color') return { isColor: true }
  if (st === 'richText' && !f.readOnly) return { isRichEditor: true }
  return null
}

/** ¿Lo pinta el oj-form-layout? (además de los LAYOUT_TYPES de siempre) */
export function isExtraLayoutField(md) {
  return !!(md.stereotype === 'radio' || md.stereotype === 'money' || md.dataType === 'money'
    || md.stereotype === 'slider' || md.stereotype === 'stars' || md.stereotype === 'color'
    || (md.stereotype === 'richText' && !md.readOnly)
    || CAPTURE_MODES[md.stereotype]
    || (md.dataType === 'array' && (md.options || []).length
      && (MULTI_SELECT_STEREOTYPES[md.stereotype] || CHECKBOX_SET_STEREOTYPES[md.stereotype])))
}

export function fieldWidgetOf(f, data, { lookups, value, textWhenEmpty }) {
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
      isSlider: false, isStars: false, isColor: false, isRichEditor: false, min: 0, max: 0, step: 1,
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
  const isTextArea = !isSelect && (f.stereotype === 'textarea' || !!RICH_TEXT_STEREOTYPES[f.stereotype])
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
    isSlider: false, isStars: false, isColor: false, isRichEditor: false, min: 0, max: 0, step: 1,
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
export const CONFIRMATION_DEFAULTS = {
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
export let pendingConfirmation = null

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

export const SELECT_PLACEHOLDERS = {
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
