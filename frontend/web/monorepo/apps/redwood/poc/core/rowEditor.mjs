import { HOST_ID, collectFields } from './tree.mjs'
import { RICH_TEXT_STEREOTYPES } from './atoms.mjs'
import { converterOf, dateConverterOf, interpolate } from './content.mjs'
import { ROW_LINES_FIELD, STATUS_BADGE, findByType, humanizeConstant, isBlank, listingOf, statusTypeOfValue, withoutDefaultSizing } from './listing.mjs'
import { chromeText, chromeLanguage, moneyText } from '../i18n.mjs'
import { computeRules, evaluateExpression, evaluateTemplate, fieldFlagsOf, valueChangeActionOf } from '../rules.mjs'
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
//  - Prev/Next answer a State-only to `<campo>-container` (the neighbouring row) — or, for a row
//    whose fields show by its values (VisibilitySupplier), the neighbour's re-built ServerSide.
//  - `<campo>_refresh-detail` (the row's OnValueChange trigger, see rowValueChangeActionOf)
//    answers only the re-built ServerSide in `<campo>-container`, with the edited row as state.
//  - The row's lookups (`search-<campo>`) are resolved by the ROW's ServerSide with the
//    row's state: its response is a data-only fragment to its id.

/** The actions a row editor sends to the list's container: `rooms_create`… */
export const LIST_ACTION = /^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down|refresh-detail)$/

/** Verbs that carry the dialog's row in parameters.initiatorState. */
export const ROW_EDITOR_VERBS = { create: true, 'create-and-stay': true, save: true, cancel: true, prev: true, next: true, 'refresh-detail': true }

/** Verbs that validate the row before leaving (the empty required fields). */
export const ROW_VALIDATING_VERBS = { create: true, 'create-and-stay': true, save: true }

/**
 * Is the FormField an editable list, whose row editor opens in a dialog? Every editable list of a
 * form is: Redwood edits a row in a dialog whatever `formPosition` says. The wire's default is
 * `right` (Vaadin's side panel), and only `modal*` used to count, so a plain `List<Row>` field of
 * a record's edit page came out as a read-only table (no "+", no Edit/Remove). The server answers
 * the list actions the same way for every position — the position is the client's choice.
 */
export function isModalRowEditor(field) {
  return !!(field && !field.readOnly && !field.inlineEditing && (field.columns || []).length)
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

/** A field's label: the wire's, even when it is EMPTY (`@Label("")` — a field that wants none); its id
 *  only when the wire sends no label at all. `label || fieldId` drew the raw id ("warnings"). */
export function fieldLabelOf(f) {
  return f.label == null ? (f.fieldId || f.id || '') : String(f.label)
}

export const NUMERIC_TYPES = { integer: true, int: true, long: true, number: true, double: true, float: true, money: true }

/**
 * The fields of the row's form, each resolved to the widget it gets (flags
 * PRECOMPUTED: VB's CSP does not evaluate expressions) with its value, its options and its
 * errors (JET messagesCustom). A multiple choice (a List with options — the row's own
 * OptionsSupplier's, inline) is a select-many / checkbox set; a nested List<Child> (a grid field)
 * is a small editable table (nestedListWidgetOf). Both used to be dropped, so a block's links and
 * its audience could not be edited. A list with neither options nor columns (a List<Integer>) is
 * still not edited here.
 */
export function rowFieldsOf(ctx, values, errors) {
  if (!ctx || !ctx.tree) return []
  const state = { ...(ctx.state || {}), ...(values || {}) }
  const seen = {}
  const out = []
  for (const f of collectFields(ctx.tree)) {
    if (!f.dataType || seen[f.fieldId]) continue
    seen[f.fieldId] = true
    if ((f.columns || []).length) {
      const nested = nestedListWidgetOf(f, state[f.fieldId])
      if (nested) out.push(nested)
      continue
    }
    if (f.dataType === 'array' && !optionsOf(f, ctx.data).length && !hasOptionsSource(f)) continue
    const raw = f.dataType === 'array' ? state[f.fieldId] : plainValueOf(state[f.fieldId])
    const widget = fieldWidgetOf(f, ctx.data, { lookups: true, value: raw })
    const error = errors && errors[f.fieldId]
    if (widget.isMultiSelect || widget.isCheckboxSet) {
      out.push({
        ...widget,
        value: Array.isArray(raw) ? raw.map(plainValueOf) : (raw == null || raw === '' ? [] : String(raw).split(',')),
        messagesCustom: error ? [{ severity: 'error', summary: error, detail: '' }] : [],
      })
      continue
    }
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

// ── NESTED LIST inside the row editor (a block's List<Link>) ──────────────────────────────────
//
// The row's form carries a nested List<Child> as a grid FormField (columns, one per child field,
// plus the `_select` Edit button). In the dialog it is a small table edited ON THE CLIENT: each
// cell an input whose id is `<field>#<index>#<column>`, and add / remove / up / down buttons
// (data-nested-op). The edited list lives in the row's draft as an array of plain rows and travels
// with the row on Save (initiatorState) — the server pours it into the List<Child> like any other
// value. Vaadin opens a nested editor per row; a table of the child's simple fields covers the
// usual child (a link: label, url) without a dialog over the dialog.

/** The editable columns of a nested grid: its child's fields, not the `_select` Edit button. */
export function nestedColumnsOf(field) {
  return (field.columns || [])
    .map((c) => (c && c.metadata) || c || {})
    .filter((c) => c.id && !String(c.id).startsWith('_') && c.stereotype !== 'button')
    // the column's dataType is coarse (most types read `string`); an inline editor's type is finer
    .map((c) => ({ id: c.id, label: c.label || c.id, dataType: CELL_TYPES[c.editorType] || c.dataType || 'string' }))
}

const CELL_TYPES = { integer: 'integer', number: 'number', boolean: 'boolean' }

/** The rows of a nested list as the table edits them (an array of objects; anything else → []). */
export function nestedRowsOf(value) {
  return Array.isArray(value) ? value.map((r) => (r && typeof r === 'object' ? r : {})) : []
}

/** The widget of a nested list: its columns and, per row, its cells and its buttons. */
export function nestedListWidgetOf(f, value) {
  const columns = nestedColumnsOf(f)
  if (!columns.length) return null
  const readonly = !!f.readOnly
  const rows = nestedRowsOf(value)
  return {
    fieldId: f.fieldId,
    label: fieldLabelOf(f),
    required: !!f.required,
    readonly,
    ...EMPTY_WIDGET_FLAGS,
    isNestedList: true,
    help: fieldHelpOf(f),
    hasHelp: !!fieldHelpOf(f),
    columns,
    rows: rows.map((row, index) => ({
      key: f.fieldId + '#' + index,
      fieldId: f.fieldId,
      index: String(index),
      editable: !readonly,
      canUp: !readonly && index > 0,
      canDown: !readonly && index < rows.length - 1,
      cells: columns.map((c) => {
        const isNumber = !!NUMERIC_TYPES[c.dataType]
        const isBoolean = c.dataType === 'bool' || c.dataType === 'boolean'
        const raw = plainValueOf(row[c.id])
        return {
          fieldId: f.fieldId + '#' + index + '#' + c.id,
          label: c.label,
          readonly,
          // its own flag names: a cell is not a field widget (the page's widget copies are counted)
          isCellNumber: isNumber,
          isCellBoolean: isBoolean,
          isCellText: !isNumber && !isBoolean,
          // a text cell edits a string (an oj-input-text refuses a number value)
          value: isBoolean ? !!raw : (raw == null || raw === '' ? null : (isNumber ? Number(raw) : String(raw))),
        }
      }),
    })),
    value: rows,
    messagesCustom: [],
  }
}

/** The widget flags all off: what a widget with its own template (the nested table) starts from. */
const EMPTY_WIDGET_FLAGS = {
  isText: false, isTextArea: false, isNumber: false, isDate: false, isDateTime: false, isBoolean: false,
  isSelect: false, isLookup: false, lookupActionId: '', options: [],
  isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false, isPassword: false,
  isSlider: false, isStars: false, isColor: false, isRichEditor: false, isMarkupEditor: false, markupKind: '',
  isEmail: false, isUrl: false, currency: '', converter: null, captureMode: '', accept: '', min: 0, max: 0, step: 1,
}

const NESTED_CELL = /^(.+)#(\d+)#([^#]+)$/

/** The state of the open row editor's row (`<list>-container`), or {} when none is open. */
export function rowStateOf(reg, opts = {}) {
  const editor = rowEditorOf(reg, opts)
  const ctx = editor && reg.contexts[editor.id]
  return (ctx && ctx.state) || {}
}

/** A nested list's current rows: the draft's (already edited) or else the row's state's. */
function currentNestedRows(reg, fieldId, draft, opts) {
  if (draft && fieldId in draft) return nestedRowsOf(draft[fieldId])
  return nestedRowsOf(rowStateOf(reg, opts)[fieldId])
}

/**
 * The edit of one CELL of a nested list (its input's id is `<field>#<index>#<column>`) as the
 * field's new value — `{fieldId, value: rows}`, the other rows and cells kept — or null when the
 * id is not a nested cell (the edit is the field's own).
 */
export function rowNestedEditOf(reg, cellId, draft, value, opts = {}) {
  const m = NESTED_CELL.exec(String(cellId || ''))
  if (!m) return null
  const [, fieldId, idx, column] = m
  const rows = currentNestedRows(reg, fieldId, draft, opts).slice()
  const index = Number(idx)
  if (index < 0 || index >= rows.length) return null
  rows[index] = { ...rows[index], [column]: value == null || value === '' ? null : value }
  return { fieldId, value: rows }
}

/**
 * A button of a nested list (`add`, `remove`, `up`, `down`, with the row's index) as the field's
 * new value — `{fieldId, value: rows}` — or null for an unknown op. A new row is empty, with a
 * `_rowNumber` past the others' (the server keys rows by it).
 */
export function rowNestedOpOf(reg, fieldId, op, index, draft, opts = {}) {
  if (!fieldId) return null
  const rows = currentNestedRows(reg, fieldId, draft, opts).slice()
  const i = Number(index)
  if (op === 'add') {
    const next = rows.reduce((max, r) => (Number.isFinite(Number(r._rowNumber)) ? Math.max(max, Number(r._rowNumber)) : max), -1) + 1
    rows.push({ _rowNumber: next })
  } else if (op === 'remove' && i >= 0 && i < rows.length) {
    rows.splice(i, 1)
  } else if (op === 'up' && i > 0 && i < rows.length) {
    [rows[i - 1], rows[i]] = [rows[i], rows[i - 1]]
  } else if (op === 'down' && i >= 0 && i < rows.length - 1) {
    [rows[i], rows[i + 1]] = [rows[i + 1], rows[i]]
  } else return null
  return { fieldId, value: rows }
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

/**
 * How a READ-ONLY value reads (a property row, a status field — the record page of a YAML
 * definition, whose values come raw from a REST source): `{text, badgeClass}`. An amount (dataType
 * or stereotype money) in the UI's locale (moneyText: "249.00", an Amount in its own currency);
 * a value among the field's `options` by its option's LABEL; a status as a chip — a `{type,
 * message}` as it comes, a plain word by the listing's tone rule (AVAILABLE → success) labelled by
 * its option or humanised ("Out of stock"). `badgeClass` is '' unless it is a status.
 */
export function readOnlyDisplayOf(md, value, data) {
  const f = md || {}
  const options = (f.options && f.options.length) || (data && data[f.fieldId] && data[f.fieldId].content) ? optionsOf(f, data) : []
  const optionLabel = (v) => {
    const option = v == null || v === '' || typeof v === 'object' ? null : options.find((o) => o && o.value == v) // eslint-disable-line eqeqeq
    return option ? String(option.label) : null
  }
  if (f.dataType === 'status') {
    if (value == null || value === '') return { text: '', badgeClass: '' }
    if (typeof value === 'object') {
      const type = value.type || 'NONE'
      return { text: String(value.message ?? value.label ?? ''), badgeClass: STATUS_BADGE[type] || STATUS_BADGE.NONE }
    }
    const type = statusTypeOfValue(value, f.tones)
    const label = optionLabel(value)
    return { text: label != null ? label : String(humanizeConstant(String(value))), badgeClass: STATUS_BADGE[type] || STATUS_BADGE.NONE }
  }
  if ((f.dataType === 'money' || f.stereotype === 'money') && value != null && value !== '') {
    return { text: moneyText(value), badgeClass: '' }
  }
  const plain = plainValueOf(value)
  const label = optionLabel(plain)
  if (label != null) return { text: label, badgeClass: '' }
  const shown = shownReadOnlyValueOf(f, plain)
  return { text: shown == null ? '' : String(shown), badgeClass: '' }
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
  // data[fieldId] may be the field's OPTIONS ({content: [...]}), never its value: handed to a required
  // oj-select-one, JET answered with the first option and the form saved it unasked.
  const fromData = d[fieldId] && Array.isArray(d[fieldId].content) ? undefined : d[fieldId]
  const raw = s[fieldId] != null ? s[fieldId] : fromData
  // @PlainText: dense read-only TEXT, whatever its type — an amount formatted («€ 1,180.00», it was a
  // read-only currency box), an option by its label; one line cut with an ellipsis unless @Multiline
  if (md.stereotype === 'plainText') {
    const plainBuilt = fieldWidgetOf({ ...md, stereotype: '', dataType: 'string', options: [], readOnly: true }, data, { lookups: false, value: raw, textWhenEmpty: true })
    const text = typeof plainBuilt.label === 'string' && plainBuilt.label.includes('${')
      ? { ...plainBuilt, label: interpolate(plainBuilt.label, s, { data: d }) } : plainBuilt
    const colspan = Math.max(1, Math.min(Math.floor(Number(md.colspan) || 1), columns))
    return { ...text, isText: true, readonly: true, value: readOnlyDisplayOf(md, raw, data).text,
      fieldClass: md.multiline ? 'mateu-plain-multiline' : 'mateu-plain-ellipsis',
      colspan, colspanAttr: colspan > 1 ? colspan + 'of' + columns : null, placeholder: '', messagesCustom: [] }
  }
  const built = fieldWidgetOf(md, data, { lookups: !md.readOnly, value: raw, textWhenEmpty: true })
  // a label is a template like a section title (`Price per night (${state.currency})`)
  const widget = typeof built.label === 'string' && built.label.includes('${')
    ? { ...built, label: interpolate(built.label, s, { data: d }) } : built
  let value = raw == null || raw === '' ? null : raw
  // an Amount travels as {currency, value, locale}: the money input shows its value (it was blank)
  if (widget.isMoney && value != null && typeof value === 'object') value = value.value
  const colspan = Math.max(1, Math.min(Math.floor(Number(md.colspan) || 1), columns))
  // classic oj-form-layout sizes every child to one column (it wraps each in an oj-flex-item with an
  // inline width): the child says how many it spans of how many, `2of3`, and app.css widens the
  // wrapper (.oj-flex-item:has(> [data-mateu-span="2of3"])) — null = one column
  const colspanAttr = colspan > 1 ? colspan + 'of' + columns : null
  if (widget.isDateRange) return { ...widget, value: dateRangeEndsOf(raw), colspan, colspanAttr, messagesCustom: [] }
  if (widget.isBoolean) value = !!raw
  else if (widget.isSelect) value = value == null ? null : plainValueOf(value)
  else if (widget.isNumber || widget.isMoney || widget.isSlider || widget.isStars) value = value == null || Number.isNaN(Number(value)) ? null : Number(value)
  else if (widget.isMultiSelect || widget.isCheckboxSet) value = Array.isArray(raw) ? raw.map(plainValueOf) : (raw == null || raw === '' ? [] : String(raw).split(','))
  else if (value != null && typeof value === 'object') value = plainValueOf(value)
  if (widget.readonly && value != null) value = shownReadOnlyValueOf(md, value)
  return {
    ...widget,
    value,
    // stepButtonsVisible: JET's oj-input-number draws its − / + buttons when it has a step
    numberStep: md.stepButtonsVisible ? (Number(md.step) > 0 ? Number(md.step) : 1) : 0,
    // the wire's, clamped to the layout's columns: the template sets it as the child's colspan
    colspan,
    colspanAttr,
    // the field's hint while it is empty («e.g. Mars Sample Return»), as the web renderer shows it
    placeholder: md.placeholder ? String(md.placeholder) : '',
    ...helpAsMessageOf(widget),
  }
}

/** @Help, ALWAYS visible under the field (as the web renderer's helper text): JET's help.instruction
 *  only shows while the field has focus, so the widgets that bind messages-custom carry it as an
 *  `info` message (and drop the focus-only instruction, or it would be read twice). */
export function helpAsMessageOf(widget) {
  const BOUND = widget.isText || widget.isNumber || widget.isTextArea || widget.isDate || widget.isDateTime || widget.isSelect
  if (!widget.help || !BOUND || widget.readonly) return { messagesCustom: [] }
  return { help: '', messagesCustom: [{ severity: 'info', summary: widget.help, detail: widget.help }] }
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
    label: fieldLabelOf(f),
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
    addLabel: multi ? chromeText('add') : chromeText('askSearch'),
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
    columns: withoutDefaultSizing(listing.columns || [], listing).filter((c) => c.id !== 'select' && c.id !== ROW_LINES_FIELD),
    rows: listing.rows || [],
    isEmpty: !!listing.isEmpty,
    emptyText: listing.emptyStateMessage || chromeText('noData'),
    selectionMode: { row: multi ? 'multiple' : 'none' },
    pageSize: listing.pageSize || 20,
    paging: listing.paging,
    pickActionId: SEARCHABLE_PICK_ACTION,
    addActionId: SEARCHABLE_ADD_ACTION,
    addLabel: (addButton && addButton.label) || chromeText('addSelected'),
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
    columns: withoutDefaultSizing(listing.columns || [], listing).filter((c) => c.id !== 'select' && c.id !== ROW_LINES_FIELD),
    rows: listing.rows || [],
    isEmpty: !!listing.isEmpty,
    emptyText: listing.emptyStateMessage || chromeText('noData'),
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
// `image` is an image BY ITS URL (typed in, previewed); `uploadableImage` is the one you upload
export const CAPTURE_MODES = { fileUpload: 'file', uploadableImage: 'image', image: 'url', signature: 'signature', camera: 'camera' }

/** The widget of an «extra» stereotype, or null if the field is one of the usual ones. */
export function extraWidgetOf(f, options, value) {
  const st = f.stereotype
  // an editable password is typed into a masked input (oj-input-password): as plain text it
  // showed the secret in clear. A read-only one stays a text value — the fixed mask above.
  if (st === 'password' && !f.readOnly) return { isPassword: true }
  if (st === 'radio' && options.length) return { isRadio: true }
  // a single-value list box: every option visible in a bordered list, one picked (app.css .mateu-listbox)
  if (st === 'listBox' && options.length && f.dataType !== 'array') return { isRadio: true, fieldClass: 'mateu-listbox' }
  // a multi-value field fed by a REST `optionsSource` is a multi-select / checkbox set before its
  // options land too (loadRestOptions fills data[fieldId]; the page re-projects then) — it used to
  // be skipped, as a list with no options
  const offered = options.length || hasOptionsSource(f)
  if (f.dataType === 'array' && offered && MULTI_SELECT_STEREOTYPES[st]) return { isMultiSelect: true }
  if (f.dataType === 'array' && offered && (CHECKBOX_SET_STEREOTYPES[st] || !st || st === 'regular'))
    return { isCheckboxSet: true }
  // email / link → Spectra's typed inputs (oj-sp-input-email / oj-sp-input-url): their own
  // format validation and, read-only, the value as a mailto: / web link
  if (st === 'email') return { isEmail: true }
  if (st === 'link' && (!f.dataType || f.dataType === 'string')) return { isUrl: true }
  if (st === 'money' || f.dataType === 'money') {
    const declared = (f.attributes || []).find && ((f.attributes || []).find((a) => a && a.key === 'currency') || {}).value
    // an Amount carries its own currency; else the declared one; else EUR (as before)
    const own = value != null && typeof value === 'object' && !Array.isArray(value) && value.currency ? String(value.currency) : ''
    const currency = String(declared || own || 'EUR').toUpperCase()
    return {
      isMoney: true,
      // Spectra's oj-sp-input-currency: number with its currency symbol, from the code it is given
      // (no currency service: without one it would fall back to the user preferences' or USD)
      currency,
      // kept for the row editor's oj-input-number (it has no Spectra input)
      converter: converterOf({ type: 'number', options: { style: 'currency', currency, minimumFractionDigits: 2 } }),
    }
  }
  // the accept list travels in the field's generic attributes ({key, value} pairs)
  if (CAPTURE_MODES[st]) {
    const declared = ((f.attributes || []).find && (f.attributes || []).find((a) => a && a.key === 'accept')) || {}
    return { isCapture: true, captureMode: CAPTURE_MODES[st], accept: f.accept || declared.value || '' }
  }
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

/** A `dateRange` form field ({from, to} on the wire, as Vaadin's vcf-date-range-picker edits it). */
export function isDateRangeField(md) {
  return !!md && (md.dataType === 'dateRange' || md.stereotype === 'dateRange')
}

/** The ids a date range's two inputs edit (`<field>#from`, `<field>#to`): JET has no range picker, so
 *  each end is its own oj-input-date and its edit is folded back into the field (rangeEditOf). */
const RANGE_PART = /^(.+)#(from|to)$/

/** A range's ends from its wire value: {from, to}, or Vaadin's "from;to" text. */
export function dateRangeEndsOf(value) {
  if (value && typeof value === 'object') return { from: value.from || null, to: value.to || null }
  if (typeof value === 'string' && value.indexOf(';') >= 0) {
    const [from, to] = value.split(';')
    return { from: from || null, to: to || null }
  }
  return { from: null, to: null }
}

/**
 * The edit of one END of a date range (its input's field id is `<field>#from|to`) as the field's new
 * value — `{fieldId, value: {from, to}}`, the other end kept from the draft or else the state — or null
 * when the id is not a range end (the edit is the field's own).
 */
export function rangeEditOf(fieldId, draft, state, value) {
  const m = RANGE_PART.exec(String(fieldId || ''))
  if (!m) return null
  const id = m[1]
  const current = draft && id in draft ? draft[id] : (state || {})[id]
  return { fieldId: id, value: { ...dateRangeEndsOf(current), [m[2]]: value == null || value === '' ? null : value } }
}

/** Whether the field's options come from a REST source (`optionsSource`: a url or a catalogue `ref`). */
export function hasOptionsSource(md) {
  const src = md && md.optionsSource
  return !!(src && typeof src === 'object' && (src.url || src.ref))
}

/** Does the oj-form-layout paint it? (besides the usual LAYOUT_TYPES) */
export function isExtraLayoutField(md) {
  return !!(isDateRangeField(md) || md.stereotype === 'radio' || md.stereotype === 'money' || md.dataType === 'money'
    || md.stereotype === 'email' || md.stereotype === 'link'
    || md.stereotype === 'slider' || md.stereotype === 'stars' || md.stereotype === 'color'
    || (md.stereotype === 'richText' && !md.readOnly)
    || ((md.stereotype === 'markdown' || md.stereotype === 'html') && !md.readOnly)
    || CAPTURE_MODES[md.stereotype]
    || (md.dataType === 'array' && ((md.options || []).length || hasOptionsSource(md))
      && (MULTI_SELECT_STEREOTYPES[md.stereotype] || CHECKBOX_SET_STEREOTYPES[md.stereotype])))
}

/** Stereotypes that PRESENT a value and take no input (@PlainText, @Badge): drawn read-only.
 *  They were drawn as editable inputs (a badge as a switch), so the user could change what the
 *  server shows as a fact — and send it back. */
export const DISPLAY_ONLY_STEREOTYPES = { plainText: true, badge: true }

/** The date range widget's own flags: its two ends as parts, each with the id its edit carries. */
function dateRangeWidgetOf(f, value) {
  const ends = dateRangeEndsOf(value)
  const label = fieldLabelOf(f)
  // the first end carries the field's label, the second says it is the end of the range
  const help = fieldHelpOf(f)
  const part = (end, key) => ({
    fieldId: f.fieldId + '#' + end,
    label: key ? chromeText(key) : label,
    help: key ? '' : help,
    value: ends[end],
    required: !!f.required,
    readonly: !!f.readOnly,
    converter: dateConverterOf('date'),
  })
  return { isDateRange: true, rangeParts: [part('from', ''), part('to', 'rangeTo')] }
}

/** A field's help (`@Help`, a DescriptionSupplier): the wire's `description`, '' when it has none.
 *  Drawn as the field's Redwood instruction text — JET's `help.instruction`, inline under the field
 *  like Vaadin's helper text; a widget JET does not own (capture, color, rich text…) draws the same
 *  text under its value (fieldHelpOf is the ONE place it is read). */
export function fieldHelpOf(f) {
  const help = f && f.description
  return help == null ? '' : String(help).trim()
}

/**
 * The widget a field gets (flags precomputed for VB's simple bindings), with its help: every copy
 * of the field templates (the page form, the drawer, the dialog, the row editor, the wizard, the
 * island) reads `help` / `hasHelp` from here.
 */
export function fieldWidgetOf(f, data, opts) {
  const widget = widgetOf(f, data, opts)
  const help = fieldHelpOf(f)
  // WCAG 1.3.5: the input's purpose — on the host as data-autocomplete, copied onto the native
  // input by a11y.mjs installInputPurpose
  const autocomplete = f && f.autocomplete && !f.readOnly ? String(f.autocomplete) : null
  return { ...widget, help, hasHelp: !!help, autocomplete }
}

function widgetOf(f, data, { lookups, value, textWhenEmpty }) {
  if (f && DISPLAY_ONLY_STEREOTYPES[f.stereotype] && !f.readOnly) f = { ...f, readOnly: true }
  if (isSearchableField(f)) return searchableWidgetOf(f, data, value)
  // a DATE RANGE: two oj-input-date (from, to), each editing its end (rangeEditOf) — the field was
  // not drawn at all (its type is not a layout type)
  const extra = isDateRangeField(f) ? dateRangeWidgetOf(f, value) : extraWidgetOf(f, optionsOf(f, data), value)
  if (extra) {
    const flags = { isSelect: false, isBoolean: false, isDate: false, isDateTime: false, isNumber: false, isTextArea: false, isText: false }
    return {
      fieldId: f.fieldId,
      label: fieldLabelOf(f),
      required: !!f.required,
      readonly: !!f.readOnly,
      isLookup: false,
      lookupActionId: '',
      options: (extra.isRadio || extra.isMultiSelect || extra.isCheckboxSet) ? optionsOf(f, data) : [],
      ...flags,
      isRadio: false, isMultiSelect: false, isCheckboxSet: false, isMoney: false, isCapture: false, isPassword: false,
      isSlider: false, isStars: false, isColor: false, isRichEditor: false, isMarkupEditor: false, markupKind: '', min: 0, max: 0, step: 1,
      isEmail: false, isUrl: false, currency: '',
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
    label: fieldLabelOf(f),
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
    isEmail: false, isUrl: false, currency: '',
    // a date field writes and reads dates in the UI's locale, not in the one JET booted with; an
    // INTEGER field reads as typed, without thousands separators (a year showed «1,906»)
    converter: isDate ? dateConverterOf('date') : isDateTime ? dateConverterOf('dateTime') : isNumber ? numberConverterOf(f.dataType) : null,
    captureMode: '', accept: '',
  }
}

/** Whole-number types: no grouping, no decimals (a year, a count, a room number). */
export const INTEGER_TYPES = { integer: true, int: true, long: true }
const numberConverters = new Map()
/** The converter of a number field: integers ungrouped, the rest JET's default decimal one; one
 *  instance per kind, so a re-projection does not hand JET a new converter on every keystroke. */
export function numberConverterOf(dataType) {
  const kind = INTEGER_TYPES[dataType] ? 'integer' : 'decimal'
  if (!numberConverters.has(kind)) {
    numberConverters.set(kind, converterOf({ type: 'number', options: kind === 'integer'
      ? { style: 'decimal', useGrouping: false, maximumFractionDigits: 0 }
      : { style: 'decimal' } }))
  }
  return numberConverters.get(kind)
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

/** Whether a host action goes through the /sse endpoint (Action.sse: a LongTask's progress dialog). The
 *  wrapper's actions are noted when the route loads (sseActionIds); a crud's own toolbar buttons
 *  (@ListToolbarButton) only come in its tree — they went out as a plain sync, and their LongTask
 *  never showed its dialog. */
export function isSseAction(ctx, actionId) {
  if (((ctx && ctx.sseActionIds) || []).indexOf(actionId) >= 0) return true
  const declared = declaredActionOf(ctx, actionId)
  return !!(declared && declared.sse)
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
export function formErrorsOf(sections, draft, only, ruleFlags) {
  const restrict = Array.isArray(only) && only.length ? new Set(only) : null
  const d = draft || {}
  const flags = ruleFlags || {}
  const out = []
  for (const section of sections || []) {
    for (const f of section.fields || []) {
      const flag = flags[f.fieldId] || {}
      // a client-side rule may make the field required (or hide it: then it asks nothing)
      if (flag.hidden) continue
      if (!(f.required || flag.required === true) || f.readonly || f.isBoolean) continue
      if (restrict && !restrict.has(f.fieldId)) continue
      const value = Object.prototype.hasOwnProperty.call(d, f.fieldId) ? d[f.fieldId] : f.value
      if (isBlank(plainValueOf(value)) && out.indexOf(f.fieldId) < 0) out.push(f.fieldId)
    }
  }
  return out
}

/**
 * The WIRE validations a form's ServerSide carries (`tree.validations`: the @NotEmpty / @Min /
 * @Max / @Pattern / @Size of its fields, each a `condition` that holds when the value is valid),
 * evaluated against `state` the way the web client's checkValidations does: a condition that does
 * not hold fails its field with its message. A condition the CSP-safe evaluator cannot read
 * (undefined) is left to the server, which checks again. `only` restricts to those fields (the
 * action's fieldsToValidate). → { fieldId: message }, first failure per field.
 */
export function validationErrorsOf(validations, state, only) {
  const restrict = Array.isArray(only) && only.length ? new Set(only) : null
  const scope = { state: state || {}, data: {} }
  const out = {}
  for (const v of validations || []) {
    if (!v || !v.condition) continue
    const fieldIds = String(v.fieldId || '_component').split(',').map((id) => id.trim())
    if (restrict && !fieldIds.some((id) => restrict.has(id))) continue
    const holds = String(v.condition).includes('${')
      ? evaluateTemplate(v.condition, scope)
      : evaluateExpression(v.condition, scope)
    if (holds === undefined || holds) continue
    let message = v.message || ''
    if (message.includes('${')) {
      const evaluated = evaluateTemplate(message, scope)
      if (evaluated != null) message = String(evaluated)
    }
    for (const id of fieldIds) {
      if (!(id in out)) out[id] = message
    }
  }
  return out
}

/**
 * What a validationRequired action may not leave with, on ONE form: its required fields left
 * empty (formErrorsOf, the JET-drawn «Enter a value») plus its wire validations that fail
 * (validationErrorsOf — a bound, a pattern, a size). → { missing: [fieldId] in form order,
 * messages: { fieldId: message } for the ones a wire validation refused }.
 */
export function formRefusalOf(sections, state, draft, validations, only, rules) {
  const merged = Object.assign({}, state || {}, plainDraftOf(draft))
  // the `required` / `hidden` a client-side RULE decides for this state (SetDataValue
  // <field>.required): the control was marked, but an empty value still left
  const ruleFlags = rules && rules.length
    ? fieldFlagsOf(computeRules(rules, { state: merged, data: {} }).data)
    : null
  const missing = formErrorsOf(sections, draft, only, ruleFlags)
  const messages = validationErrorsOf(validations, merged, only)
  // an empty required field is marked by its own JET validator; a class-level check (_component)
  // names no field to mark, so it is the server's to refuse
  for (const id of missing) delete messages[id]
  delete messages._component
  const order = []
  for (const section of sections || []) for (const f of section.fields || []) order.push(f.fieldId)
  const ids = [...missing]
  for (const id of Object.keys(messages)) if (ids.indexOf(id) < 0) ids.push(id)
  const at = (id) => { const i = order.indexOf(id); return i < 0 ? order.length : i }
  ids.sort((a, b) => at(a) - at(b))
  return { missing: ids, messages }
}

const plainDraftOf = (draft) => {
  const out = {}
  for (const k of Object.keys(draft || {})) out[k] = plainValueOf(draft[k])
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
 * The action a change of `fieldId` in the open ROW EDITOR fires: the row's OnValueChange trigger,
 * over the row's state with its draft — the server's `<campo>_refresh-detail` when the row's
 * VisibilitySupplier depends on that field (a block's type: the editor is re-built with the fields
 * of the new type). null when no row editor is open or the field fires nothing.
 */
export function rowValueChangeActionOf(reg, fieldId, rowDraft = {}, opts = {}) {
  const holder = reg && reg.contexts && reg.contexts[opts.holderId || HOST_ID]
  if (!holder || !holder.tree) return null
  const state = holder.state || {}
  const show = state._show_detail || {}
  for (const listId of Object.keys(modalListsOf(holder.tree))) {
    if (!(show[listId] === true || state[listId + '_show_detail'] === true)) continue
    const ctx = reg.contexts[listId + '-container']
    if (!ctx || !ctx.tree) continue
    return valueChangeActionOf(ctx, fieldId, { ...(ctx.state || {}), ...(rowDraft || {}) })
  }
  return null
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
