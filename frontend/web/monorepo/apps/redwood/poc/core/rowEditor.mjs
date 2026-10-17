import { HOST_ID, collectFields } from './tree.mjs'
import { RICH_TEXT_STEREOTYPES } from './atoms.mjs'
import { converterOf, interpolate } from './content.mjs'
import { ROW_LINES_FIELD, findByType, isBlank, listingOf } from './listing.mjs'
import { chromeText, chromeLanguage } from '../i18n.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): forms: list actions, the modal row editor, field widgets, validation, confirmation, lookups.

// ── ROW EDITOR of a form list (@DetailFormCustomisation position = modal) ──
//
// Wire contract (fixtures/real/rowedit-*.json, captured against the ec-demo1 booking):
//  - `<campo>_add` / `<campo>_select` (with parameters._rowNumber) answer TWO fragments: the
//    container's State (with `_show_detail[campo] = true`) and a ServerSide with the row's form
//    targeted at `<campo>-container` (title "New room"/"Edit room", `buttons` in the footer:
//    Save —primary—, "Save and add another" when creating, Cancel —tertiary—; Prev/Next in
//    `toolbar` when editing, and the position "1/3" as a `header` Text).
//  - Save/Create/Cancel/Prev/Next travel with the CONTAINER's state (the form or the
//    wizard) and the row in parameters.initiatorState — like Vaadin since 367
//    (libs/mateu … common.ts resolveComponentState/isOwnListAction). Sending the row as
//    componentState rebuilt the container from a room: the wizard went back empty to
//    its first step.
//  - The container answers a State with the new list and `_show_detail[campo] = false`
//    (closes); `_create-and-stay` also answers a new row in `<campo>-container`.
//  - Prev/Next answer a State-only to `<campo>-container` (the neighbouring row).
//  - The row's lookups (`search-<campo>`) are resolved by the ROW's ServerSide with the
//    row's state: its response is a data-only fragment to its id.

/** The actions a row editor sends to the list's container: `rooms_create`… */
export const LIST_ACTION = /^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/

/** Verbs that carry the dialog's row in parameters.initiatorState. */
export const ROW_EDITOR_VERBS = { create: true, 'create-and-stay': true, save: true, cancel: true, prev: true, next: true }

/** Verbs that validate the row before leaving (the empty required fields). */
export const ROW_VALIDATING_VERBS = { create: true, 'create-and-stay': true, save: true }

/** Is the FormField a list whose row editor opens in a dialog? */
export function isModalRowEditor(field) {
  return !!(field && !field.readOnly && !field.inlineEditing
    && (field.columns || []).length && /^modal/.test(field.formPosition || ''))
}

/** The lists of a tree with a modal editor (without crossing islands): fieldId → FormField. */
export function modalListsOf(tree) {
  const out = {}
  for (const f of collectFields(tree)) if (isModalRowEditor(f)) out[f.fieldId] = f
  return out
}

/**
 * Is `actionId` an action of one of the container's lists? → { fieldId, verb } or null. The list
 * is recognised as in Vaadin (the `<campo>_rowClass` its state carries for each list) or, if
 * the state doesn't bring it, by a list FormField with that id in the container's tree.
 */
export function listActionOf(state, actionId, tree) {
  const match = actionId ? LIST_ACTION.exec(actionId) : null
  if (!match) return null
  const fieldId = match[1]
  const known = (state && (fieldId + '_rowClass') in state)
    || collectFields(tree || {}).some((f) => f.fieldId === fieldId && (f.dataType === 'array' || (f.columns || []).length))
  return known ? { fieldId, verb: match[2] } : null
}

/** The container's transport context: its lists' actions go to ITS ServerSide
 *  (the form, the wizard), not to the mediator the screen was loaded through — the crud
 *  orchestrator doesn't know what `rooms_add` is ("component() … DtoSupplier"). */
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

/** The REAL _rowNumber (number or uuid) of the row whose text is `key` — the DOM only gives text,
 *  and the server compares with equals: "0" is not 0. */
export function rowOf(rows, key) {
  return (rows || []).find((row) => row && String(row._rowNumber) === String(key)) || null
}

/**
 * The request of a list action: componentState = the CONTAINER's state (+ its draft),
 * and the dialog's row (+ its draft) in parameters.initiatorState for the editor's
 * verbs. `_select` carries the real _rowNumber; a row's `_remove`, the row in
 * `<campo>_selected_items` (the server removes the equal rows). null if it is not a list's.
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

/** Options of a select/lookup: the field's static ones or those its search brought. */
export function optionsOf(field, data) {
  const found = data && data[field.fieldId] && data[field.fieldId].content
  const raw = (field.options && field.options.length) ? field.options : (found || [])
  if (field.stereotype === 'treeSelect') return treeOptionsOf(raw, !!field.treeLeavesOnly)
  return raw.map((o) => ({ value: o.value, label: o.label == null ? String(o.value) : o.label }))
}

/**
 * A @TreeSelect's options flattened for the select, nested ones indented under their parent (a
 * leaves-only tree offers its leaves only). Only the top level used to be offered: a nested value
 * could not be picked, and a stored one (Mallorca) showed as the first option (Spain).
 */
export function treeOptionsOf(options, leavesOnly, depth = 0) {
  const out = []
  for (const o of options || []) {
    const children = o.children || []
    const label = (depth ? '\u2003'.repeat(depth) : '') + (o.label == null ? String(o.value) : o.label)
    if (!(leavesOnly && children.length)) out.push({ value: o.value, label })
    out.push(...treeOptionsOf(children, leavesOnly, depth + 1))
  }
  return out
}

/** A field's value as its widget edits it: a lookup may arrive as {value,label}. */
export function plainValueOf(value) {
  if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) return value.value
  return value
}

export const NUMERIC_TYPES = { integer: true, int: true, long: true, number: true, double: true, float: true, money: true }

/**
 * The fields of the row's form, each resolved to the widget it gets (flags
 * PRECOMPUTED: VB's CSP does not evaluate expressions) with its value, its options and its
 * errors (JET messagesCustom). Nested lists (e.g. the children's ages) are not
 * edited here.
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
    // a READ-ONLY field that is still empty (the «Line» and «Total» of a new room, which
    // the server sets) is painted as its label and «—», text that does not take focus: a readonly
    // oj-input-number with no value is a 20px dotted box that looks like a broken control (and, as the first
    // in the dialog, it kept the focus)
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

/** What is painted instead of a value that doesn't exist yet (read-only). */
export const EMPTY_VALUE = '—'

/** A password is never shown, not even read-only: a fixed mask (one length, so it does not tell
 *  how long the secret is); empty stays empty. Same rule as libs/mateu passwordMask.ts. */
export const PASSWORD_MASK = '••••••••'
export function shownReadOnlyValueOf(md, value) {
  if (!md || md.stereotype !== 'password') return value
  return value == null || value === '' ? '' : PASSWORD_MASK
}
export const EMPTY_READONLY_WIDGET = { isText: false, isEmptyReadonly: true, isTextArea: false, isNumber: false, isDate: false, isDateTime: false,
  isSelect: false, isLookup: false, lookupActionId: '', options: [] }

/** Field types the form layout knows how to paint with a JET widget. */
export const LAYOUT_TYPES = { string: true, integer: true, int: true, long: true, number: true, double: true,
  float: true, date: true, dateTime: true, bool: true, boolean: true,
  // a LocalTime field ("10:30") is edited as text: before, it was not drawn at all
  time: true }

/**
 * A SCALAR field of a FormLayout, ready for the oj-form-layout: its widget (fieldWidgetOf),
 * its value and its colspan. The value comes from the state or, if absent, from data — that's where the server sends
 * the label of a read-only lookup (hotelCode-label), which used to come out empty. null if
 * it is not a field the layout paints (a grid, a property row, a type without a widget).
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
  // an Amount travels as {currency, value, locale}: the money input shows its value (it was blank)
  if (widget.isMoney && value != null && typeof value === 'object') value = value.value
  if (widget.isBoolean) value = !!raw
  else if (widget.isSelect) value = value == null ? null : plainValueOf(value)
  else if (widget.isNumber || widget.isMoney || widget.isSlider || widget.isStars) value = value == null || Number.isNaN(Number(value)) ? null : Number(value)
  else if (widget.isMultiSelect || widget.isCheckboxSet) value = Array.isArray(raw) ? raw.map(plainValueOf) : (raw == null || raw === '' ? [] : String(raw).split(','))
  else if (value != null && typeof value === 'object') value = plainValueOf(value)
  if (widget.readonly && value != null) value = shownReadOnlyValueOf(md, value)
  return {
    ...widget,
    value,
    // the wire's, clamped to the layout's columns. The template (classic oj-form-layout, with
    // the labels inside) doesn't apply it yet: that needs oj-c-form-layout and its column-span
    colspan: Math.max(1, Math.min(Math.floor(Number(md.colspan) || 1), columns)),
    messagesCustom: [],
  }
}

// ── @Searchable: the selector in a dialog ─────────────────────────────────────────────────
//
// A @Searchable (one id, or a List/Set/array of ids) is painted as chips — one per id, with its
// label from data `<campo>-labels` ({id → label}; in a single one, `<campo>-label`) — and a button
// that opens its selector (`codesearch-<campo>`): a listing in a Dialog. Picking a row
// (`action-on-row-select`) or «Add selected» (`action-on-row-select-selected`, with the
// checked rows in crud_selected_items) answers value-changed / data-changed / close-modal-requested,
// which here are applied to the context that opened the dialog. The server merges: a multi-valued
// field ADDS to the ones it had. Removing a chip is client-only. Vaadin does the same
// (libs/mateu searchableMulti.ts).

/** Is it a @Searchable editable as such? (the detail view sends it as `<campo>-label`:
 *  its text, painted like any read-only value) */
export function isSearchableField(f) {
  return !!f && f.stereotype === 'searchable' && !/-label$/.test(String(f.fieldId || ''))
}

/** A field's ids, however they arrive (list, a single id, nothing). */
export function searchableIdsOf(value) {
  if (value == null || value === '') return []
  const list = Array.isArray(value) ? value : [value]
  return list.filter((id) => id != null && id !== '')
}

/**
 * The chips of a @Searchable: one per id, labelled (or the id itself if there is no label). Each chip
 * carries what remains when removing it (`remaining`: in a single one, null) — precomputed (VB's CSP).
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

/** The widget of a @Searchable: its chips and the button that opens the selector. */
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
    // the button dispatches like any host block (hostBlockAction: actionId + parameters)
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

/** Is the overlay a selector's dialog (a listing whose ServerSide handles the pick)? */
export function isPickerOverlay(ctx) {
  const surface = ctx && ctx.surface
  if (!surface || !findByType(surface, 'Crud')) return false
  return ((surface.actions || []).some((a) => a && a.id === SEARCHABLE_PICK_ACTION))
}

export const SEARCHABLE_PICK_ACTION = 'action-on-row-select'
export const SEARCHABLE_ADD_ACTION = 'action-on-row-select-selected'

/**
 * Is the overlay a LISTING (a Listing embedded — EmbeddedView — in a Drawer or a Dialog: its
 * surface is a Crud), without being a @Searchable's selector? It is painted as a real
 * listing — search, columns, pages, row click —, not as the generic form.
 */
export function isListingOverlay(ctx) {
  const surface = ctx && ctx.surface
  return !!(surface && findByType(surface, 'Crud')) && !isPickerOverlay(ctx)
}

/**
 * The SELECTOR of an open @Searchable (the top overlay, if it is one), ready for the selector's
 * oj-dialog: title, columns (without the «Select» button column: picking is clicking the row),
 * rows, search, paging and — in a multi-valued field — multiple selection and the
 * «Add selected» button. Also a LISTING in an overlay (isListingOverlay), with the same
 * machinery: in a Drawer it is painted INSIDE the drawer (`inDrawer`), in a Dialog in the selector's
 * dialog; its row click is the listing's `view` with the row, as on a page
 * (`pickWithRow`), and `loaded` says whether its first search has answered. null if the top
 * overlay is neither of the two.
 */
export function searchPickerOf(reg) {
  const id = reg && reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
  const ctx = id && reg.contexts ? reg.contexts[id] : null
  if (isListingOverlay(ctx)) return listingOverlayOf(id, ctx)
  if (!isPickerOverlay(ctx)) return null
  const listing = listingOf({ tree: ctx.surface, data: ctx.data }) || {}
  const state = ctx.state || {}
  const multi = state._searchableMulti === true || state._searchableMulti === 'true'
    || !!listing.rowsSelectionEnabled
  const addButton = (listing.toolbar || []).find((b) => b.actionId === SEARCHABLE_ADD_ACTION)
  // without its own title, that of the field that opened it (its label)
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

/** A listing embedded in an overlay, with the selector's shape (searchPickerOf). */
function listingOverlayOf(id, ctx) {
  const listing = listingOf({ tree: ctx.surface, data: ctx.data }) || {}
  const isDialog = !!(ctx.tree && ctx.tree.metadata && ctx.tree.metadata.type === 'Dialog')
  return {
    id,
    title: ctx.title || '',
    multi: false,
    inDrawer: !isDialog,
    loaded: !!(ctx.data && ctx.data.crud && ctx.data.crud.page),
    searchable: !!listing.searchable,
    searchText: (ctx.state || {}).searchText || '',
    // the row's own action column is the click itself: no «View» button column
    columns: (listing.columns || []).filter((c) => c.id !== 'select' && c.id !== ROW_LINES_FIELD),
    rows: listing.rows || [],
    isEmpty: !!listing.isEmpty,
    emptyText: listing.emptyStateMessage || 'No data.',
    selectionMode: { row: 'none' },
    pageSize: listing.pageSize || 20,
    paging: listing.paging,
    pickActionId: 'view',
    pickWithRow: true,
    addActionId: '',
    addLabel: '',
  }
}

/** The selector's search state: what its `search` carries in componentState. */
export function pickerSearchStateOf(picker, opts = {}) {
  const size = (picker && picker.pageSize) || 20
  return {
    searchText: opts.searchText != null ? opts.searchText : ((picker && picker.searchText) || ''),
    page: opts.page != null ? opts.page : 0,
    size,
  }
}

/**
 * Applies to the context that opened the top overlay the events with which an overlay component
 * returns a value to it — value-changed {fieldId, value}, data-changed {key, value} — and
 * close-modal-requested (closes the overlay). It is what, in Vaadin, the dialog's mateu-event-interceptor
 * does when forwarding them to its owner. true if the event was applied; without an overlay, false (the
 * event goes on to the bus, as always).
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

/** The registry with `values` merged into the state of context `id` (e.g. the form's draft
 *  when opening a selector: what was typed is not lost when the dialog closes). */
export function withContextState(reg, id, values) {
  const ctx = reg && reg.contexts && reg.contexts[id]
  if (!ctx || !values || !Object.keys(values).length) return reg
  return { ...reg, contexts: { ...reg.contexts, [id]: { ...ctx, state: { ...(ctx.state || {}), ...values } } } }
}

/**
 * A projection (form sections, host blocks…) with the chips of @Searchable
 * `fieldId` rebuilt for `ids` — when removing a chip, without going back to the server. The labels come
 * from the chips that were already there.
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
 * The WIDGET a FormField gets (flags PRECOMPUTED: VB's CSP does not evaluate
 * expressions), shared by the row editor and the page/drawer/island forms:
 * select if it brings options (static, or those its search brought) — or, with lookups, if it is a
 * remote lookup —, date, date-time, number, boolean, text area or text.
 */
// Field stereotypes with their own widget beyond text/number/date/boolean/select (PMS
// challenge): radio, multiple selection, amount and the capture ones. Each family is an is* flag of the
// template (see poc/templates/fields-extra.html).
export const MULTI_SELECT_STEREOTYPES = { multiSelect: true, combobox: true, listBox: true }
export const CHECKBOX_SET_STEREOTYPES = { checkbox: true, choice: true }
export const CAPTURE_MODES = { fileUpload: 'file', uploadableImage: 'image', image: 'image', signature: 'signature', camera: 'camera' }

/** The widget of an «extra» stereotype, or null if the field is one of the usual ones. */
export function extraWidgetOf(f, options) {
  const st = f.stereotype
  // an editable password is typed into a masked input (oj-input-password): as plain text it
  // showed the secret in clear. A read-only one stays a text value — the fixed mask above.
  if (st === 'password' && !f.readOnly) return { isPassword: true }
  if (st === 'radio' && options.length) return { isRadio: true }
  if (f.dataType === 'array' && options.length && MULTI_SELECT_STEREOTYPES[st]) return { isMultiSelect: true }
  if (f.dataType === 'array' && options.length && (CHECKBOX_SET_STEREOTYPES[st] || !st || st === 'regular'))
    return { isCheckboxSet: true }
  if (st === 'money' || f.dataType === 'money') {
    const currency = (f.attributes || []).find && ((f.attributes || []).find((a) => a && a.key === 'currency') || {}).value
    return {
      isMoney: true,
      // JET converter (oj-input-number): number with 2 decimals and its currency symbol
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
  // five stars, as on Vaadin: the wire's sliderMax defaults to 100 on EVERY field, and a gauge of
  // a hundred stars drew as a hairline — the rating was invisible. A small explicit max is kept.
  if (st === 'stars') {
    const max = Number(f.sliderMax)
    return { isStars: true, max: max > 0 && max <= 10 ? max : 5 }
  }
  if (st === 'color') return { isColor: true }
  if (st === 'richText' && !f.readOnly) return { isRichEditor: true }
  // an editable markdown / html: the source + a Preview toggle (mateu-markup-field)
  if ((st === 'markdown' || st === 'html') && !f.readOnly) return { isMarkupEditor: true, markupKind: st }
  return null
}

/**
 * What an edited field commits: the edited value, EXCEPT when the field held an Amount
 * ({currency, value, locale}) — then the same Amount with the new value. The money input edits the
 * NUMBER, and committing it bare lost the currency: the server could not pour a bare number into
 * an Amount and kept the old one (the forms walkthrough).
 */
export function committedValueOf(previous, value) {
  if (previous != null && typeof previous === 'object' && !Array.isArray(previous)
      && 'currency' in previous && 'value' in previous
      && (value == null || typeof value === 'number' || (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))))) {
    return value == null ? null : { ...previous, value: Number(value) }
  }
  return value
}

/** Does the oj-form-layout paint it? (besides the usual LAYOUT_TYPES) */
export function isExtraLayoutField(md) {
  return !!(md.stereotype === 'radio' || md.stereotype === 'money' || md.dataType === 'money'
    || md.stereotype === 'slider' || md.stereotype === 'stars' || md.stereotype === 'color'
    || (md.stereotype === 'richText' && !md.readOnly)
    || ((md.stereotype === 'markdown' || md.stereotype === 'html') && !md.readOnly)
    || CAPTURE_MODES[md.stereotype]
    || (md.dataType === 'array' && (md.options || []).length
      && (MULTI_SELECT_STEREOTYPES[md.stereotype] || CHECKBOX_SET_STEREOTYPES[md.stereotype])))
}

/** Stereotypes that PRESENT a value and take no input (@PlainText, @Badge): drawn read-only.
 *  They were drawn as editable inputs (a badge as a switch), so the user could change what the
 *  server shows as a fact — and send it back. */
export const DISPLAY_ONLY_STEREOTYPES = { plainText: true, badge: true }

export function fieldWidgetOf(f, data, { lookups, value, textWhenEmpty }) {
  if (f && DISPLAY_ONLY_STEREOTYPES[f.stereotype] && !f.readOnly) f = { ...f, readOnly: true }
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
      isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false, isPassword: false,
      isSlider: false, isStars: false, isColor: false, isRichEditor: false, isMarkupEditor: false, markupKind: '', min: 0, max: 0, step: 1,
      converter: null, captureMode: '', accept: '',
      ...extra,
    }
  }
  const lookupActionId = (f.remoteCoordinates && f.remoteCoordinates.action) || ''
  let options = optionsOf(f, data)
  // A lookup with a value that is not yet among its options (they haven't arrived, or only the
  // value's one arrived) carries it as an option of its own, with its label if the server sent it: an
  // oj-select-one with a value that is not among its options is painted EMPTY.
  const current = plainValueOf(value)
  if (lookups && lookupActionId && current != null && current !== ''
      && !options.some((o) => String(o.value) === String(current))) {
    const label = (value && typeof value === 'object' && value.label) || (data && data[f.fieldId + '-label'])
    options = [{ value: current, label: label != null && label !== '' ? String(label) : String(current) }].concat(options)
  }
  // on a page, a lookup whose search brought nothing stays as text: an empty
  // dropdown doesn't even let you type the code (the row editor always paints it as a select)
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
    isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false, isPassword: false,
    isSlider: false, isStars: false, isColor: false, isRichEditor: false, min: 0, max: 0, step: 1,
    converter: null, captureMode: '', accept: '',
  }
}

/** The row's empty required fields → { fieldId: message }; {} if it is fine. */
export function validateRow(ctx, values) {
  const errors = {}
  for (const f of rowFieldsOf(ctx, values)) {
    if (f.required && !f.readonly && !f.isBoolean && isBlank(f.value)) errors[f.fieldId] = 'Required'
  }
  return errors
}

/**
 * The action `actionId` as the context's ServerSide DECLARES it (`tree.actions`), or null.
 * The exact one beats a wildcard ('*', 'prefix*'), as in Vaadin: a flag of the declared one
 * (confirmation, validation) cannot be hidden by a catch-all listed earlier.
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
 * The TRANSPORT context of a host action: which ServerSide it goes to.
 *
 * A screen loaded through a mediator (the crud orchestrator, the home of a remote pod)
 * keeps the mediator's in `outbound.serverSideType`, and the host tree is the component it
 * painted — the booking view, `BookingViewModel`. The actions that component DECLARES
 * (its `@Toolbar`s: «Ver recorrido», «Cancel booking», «Activate») are its own: the mediator doesn't
 * know them and answered «verRecorrido not supported by BookingCrudOrchestrator». Those it doesn't
 * declare (edit, new, cancel-view: the crud's) and those marked `bubble` keep going up to the
 * mediator. It is Vaadin's rule (mateu-component: the action is handled by the ServerSide that
 * advertises it; otherwise it bubbles).
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
 * The transport of a TOP-overlay action when its embedded form declares it
 * (EmbeddedView: its own ServerSide inside the Dialog/Drawer): it goes to THAT component — its
 * serverSideType, its id as initiator, its state — with no route, as in Vaadin. null if there is no
 * overlay or its form doesn't declare the action (then it goes to the host, as always: the crud's
 * drawer carries no ServerSide of its own).
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

// The generic texts of the confirmation dialog, in the interface language (the document's
// lang, which copy.mjs sets to the browser's — like pagingLangOf): a console in Spanish doesn't
// ask «Yes / No».
export function confirmationDefaultsOf(lang) {
  const l = chromeLanguage(lang)
  return { title: chromeText('confirmTitle', null, l), message: chromeText('confirmMessage', null, l),
    confirmText: chromeText('confirmYes', null, l), denyText: chromeText('confirmNo', null, l) }
}

/**
 * The confirmation dialog the action asks for before leaving (`confirmationRequired`), or null
 * if it asks for none. Each text falls back to the generic one on its own — as in Vaadin
 * (confirmationTexts.ts): an action that only declares the message brings the rest empty.
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

// The pending answer of the confirmation dialog: the chain that launches the action awaits the
// promise; the dialog's buttons (and its ✕ / Esc) resolve it. Only one at a time: opening another
// before answering the first counts it as denied.
export let pendingConfirmation = null

/** Waits for the confirmation dialog's answer (true = confirm). */
export function awaitConfirmation() {
  if (pendingConfirmation) pendingConfirmation(false)
  return new Promise((resolve) => { pendingConfirmation = resolve })
}

/** Answers the open confirmation dialog; with none waiting, it does nothing. */
export function answerConfirmation(confirmed) {
  const resolve = pendingConfirmation
  pendingConfirmation = null
  if (resolve) resolve(!!confirmed)
}

/**
 * Does the context's action `actionId` ask to validate the form before leaving? It is the
 * validationRequired of the ServerSide's actions (e.g. a wizard's `next`, a form's
 * `save`): what Vaadin checks in the browser before calling the server.
 * → { fields } (the action's fieldsToValidate; [] = all) or null if it doesn't ask to validate.
 * The EXACT action beats a wildcard ('*', 'prefix*'), as in Vaadin.
 */
export function validationOf(ctx, actionId) {
  const action = declaredActionOf(ctx, actionId)
  if (!action || !action.validationRequired) return null
  return { fields: Array.isArray(action.fieldsToValidate) ? action.fieldsToValidate : [] }
}

/**
 * The empty required fields of the page's form (its sections, as they are painted) with
 * what the user has typed (the draft beats the state) → [fieldId] in form
 * order: the first is the one that receives focus. `only` restricts to those fields.
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

/**
 * The dropdowns' placeholder in language `lang` (the browser's; English if it is not
 * known). One is needed: an oj-select-one WITHOUT a placeholder picks the first option on its
 * own, and an empty required field passed validation with a value nobody had chosen.
 */
export function selectPlaceholder(lang) {
  return chromeText('selectValue', null, String(lang || '').split(/[-_]/)[0] || 'en')
}

/**
 * The REMOTE lookups of a context whose options have not been loaded yet → [{ fieldId,
 * actionId }]: the form's editable fields (a page, a wizard step, a
 * new form) and the listing's filters. A page lookup was painted as text
 * without options — empty on a create — because only the row editor launched its search. The
 * single option the server sends with the value (its label) doesn't count as loaded: with
 * it alone you cannot pick another. Read-only ones don't need it.
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

/** Mark of a lookup's options already searched (in ctx.data[campo]): the search is not repeated. */
export const LOOKUP_LOADED = '_mateuLoaded'

/** The registry with the options of those lookups of the context marked as loaded. */
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

/** The row's lookups that don't have options yet → [{ fieldId, actionId }]. */
export function pendingLookupsOf(ctx) {
  if (!ctx || !ctx.tree) return []
  return rowFieldsOf(ctx)
    .filter((f) => f.isLookup && !(ctx.data && ctx.data[f.fieldId]))
    .map((f) => ({ fieldId: f.fieldId, actionId: f.lookupActionId }))
}

/**
 * The request for a row lookup's search: the ROW's ServerSide resolves it
 * (its serverSideType, its id as initiator) with the row's state; the route and the backend
 * are the container's.
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
 * Projection of the open ROW EDITOR (the oj-dialog): null if no modal list of the
 * container has its detail open (`_show_detail[campo]`) with the form already received
 * in `<campo>-container`.
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
      // Redwood footer: the primary at the far RIGHT — the wire sends it first
      buttons: buttons.slice().reverse(),
      fields: rowFieldsOf(ctx, opts.rowDraft, opts.errors),
    }
  }
  return null
}
