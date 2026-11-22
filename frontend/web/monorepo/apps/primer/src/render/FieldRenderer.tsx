import React, { useEffect, useId, useRef, useState } from 'react'
import { Checkbox, CheckboxGroup, FormControl, Label, Radio, RadioGroup, Select, Text, TextInput, Textarea, ToggleSwitch, Token } from '@primer/react'
import { readOnlyStatus as statusOf, lookupLabelOf } from '@rn/core/readOnlyDisplay'
import { moneyText } from '@rn/core/uxRules'
import { uploadConfigOf } from '@rn/core/fileUploads'
import { FieldShell, ReadOnlyShell, UnlabelledField } from './fields/shell'
import { ColorField, LinkValue, RangeInputs, Slider, Stars, useMoneyInput } from './fields/basic'
import { ListBox, Lookup, MultiSelect, TokenList, TreeSelect, type TreeOption } from './fields/choices'
import { FileUpload, ImageValue, PhotoCapture, Signature, UploadableImage } from './fields/media'
import { MarkupEditor, RichValue } from './fields/markup'
import { GridField, gridColumnsOf } from './fields/grid'
import { RowEditorGrid } from './fields/rowEditor'
import { ChoiceCards } from './fields/choiceCards'
import { FieldButton, PopoverChoice } from './fields/stereotypes'
import { SearchableField, SearchableMultiField } from './fields/selector'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { fieldPlaceholder } from '@rn/core/uxRules'
import { readOnlyFieldText } from '@rn/core/readOnlyDisplay'
import { isMultiValued, pickedStrings, pickedValue, pickedValues, widgetOptionsOf, type TypedOption, type WidgetOption } from '@rn/core/fieldOptions'
import { fetchExternalJson, mapItemsToOptions, type FetchedOption } from '@rn/core/restFetch'
import { useController } from './ViewHost'

type Dict = Record<string, unknown>

interface FieldMeta {
  fieldId: string
  label?: string
  dataType?: string
  stereotype?: string
  readOnly?: boolean
  disabled?: boolean
  required?: boolean
  description?: string
  placeholder?: string
  autocomplete?: string
  options?: TypedOption[]
  optionsSource?: Dict | null
  initialValue?: unknown
  propertyRow?: boolean
  [k: string]: unknown
}

/**
 * A FormField as Primer draws one: FormControl (label, caption, validation message) around the
 * input its data type and stereotype call for. The value lives in the controller's state; every
 * edit goes through `controller.putState` — the rules, the dirty flag and the action pipeline of
 * the React Native core run unchanged.
 */
export function FieldRenderer({ metadata, state }: { metadata: Dict; state: Dict }) {
  const unlabelled = !String((metadata as FieldMeta).label ?? '').trim()
  return (
    <UnlabelledField.Provider value={unlabelled}>
      <FieldBody metadata={metadata} state={state} />
    </UnlabelledField.Provider>
  )
}

/** Everything a field's drawing needs, worked out once (the rules below only choose and draw). */
interface FieldCtx {
  m: FieldMeta
  controller: ReturnType<typeof useController>
  state: Dict
  fieldId: string
  dataType: string
  stereotype: string
  raw: unknown
  text: string
  label: string
  required: boolean
  readOnly: boolean
  disabled: boolean
  editable: boolean
  error?: string
  help: string
  placeholder?: string
  ref: never
  options: WidgetOption[]
  sourced: FetchedOption[] | null
  unlabelled: boolean
  controlId: string
  status?: 'error'
  commit: (v: unknown) => void
  commitPicked: (picked: string[]) => void
  commitOne: (picked: string) => void
  shell: (render: (a11y: { 'aria-labelledby': string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode) => React.ReactNode
  caption: React.ReactNode
  validation: React.ReactNode
}

/** A rule draws the field when it is its kind, or answers NOT_MINE and the next rule is tried. */
const NOT_MINE = Symbol('not mine')
type Rule = (c: FieldCtx) => React.ReactNode | typeof NOT_MINE

function FieldBody({ metadata, state }: { metadata: Dict; state: Dict }) {
  const unlabelled = React.useContext(UnlabelledField)
  const m = metadata as FieldMeta
  const controller = useController()
  const fieldId = m.fieldId
  const sourced = useSourcedOptions(m.optionsSource ?? undefined, fieldId, state)
  const options = sourced ? widgetOptionsOf(sourced) : widgetOptionsOf(m.options ?? [])
  const inputRef = useRef<HTMLElement | null>(null)
  const controlId = useId()
  useEffect(() => controller.registerFieldFocus(fieldId, () => inputRef.current?.focus()), [controller, fieldId])
  // @Autofocus: the field takes the focus when the screen opens
  useEffect(() => {
    if (m['autofocus'] === true) inputRef.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // a local echo of the last edit: the state object is re-published on every edit
  const [local, setLocal] = useState<unknown>(undefined)
  const attrs = controller.fieldAttributes[fieldId] ?? {}
  if (attrs['hidden']) return null

  const raw = local !== undefined ? local : state[fieldId] ?? m.initialValue
  const commit = (v: unknown) => {
    setLocal(v)
    controller.putState(fieldId, v)
  }
  const label = interpolate(String(m.label ?? ''), { state, appState: controller.session.appState }) || fieldId
  const required = attrs['required'] !== undefined ? Boolean(attrs['required']) : m.required === true
  // read-only = a value to READ (text); disabled = an input that cannot be used NOW (a rule may
  // enable it) — it stays an input, greyed
  const readOnly = m.readOnly === true
  const disabled = !readOnly && (m.disabled === true || !!attrs['disabled'])
  const editable = !readOnly && !disabled
  const error = controller.fieldErrors[fieldId]
  const help = String(m.description ?? '').trim()
  const c: FieldCtx = {
    m, controller, state, fieldId, raw, label, required, readOnly, disabled, editable, error, help, options, sourced, unlabelled, controlId,
    dataType: String(m.dataType ?? 'string'),
    stereotype: String(m.stereotype ?? ''),
    text: raw === null || raw === undefined ? '' : String(raw),
    placeholder: fieldPlaceholder(m) ?? undefined,
    ref: inputRef as never,
    status: error ? 'error' : undefined,
    commit,
    // a pick written back as the options' own values (a source's ids are numbers)
    commitPicked: (picked) => commit(sourced ? pickedValues(sourced, picked) : picked),
    commitOne: (picked) => commit(sourced ? pickedValue(sourced, picked) : picked),
    // a custom widget inside the label / help / error frame (FieldShell names and describes it)
    shell: (render) => <FieldShell label={label} required={required && editable} help={help || undefined} error={error}>{render}</FieldShell>,
    caption: help ? <FormControl.Caption>{help}</FormControl.Caption> : null,
    validation: error ? <FormControl.Validation variant="error">{error}</FormControl.Validation> : null,
  }
  for (const rule of RULES) {
    const drawn = rule(c)
    if (drawn !== NOT_MINE) return <>{drawn}</>
  }
  return <>{textInput(c)}</>
}

const isBoolType = (t: string) => t === 'bool' || t === 'boolean' || t === 'Boolean'
const isMoney = (c: FieldCtx) => c.dataType === 'money' || c.stereotype === 'money' || c.stereotype === 'currency'

// a property row (@Section(propertyList)): label left, value right, read-only
const propertyRow: Rule = ({ m, dataType, raw, label }) => {
  if (!m.propertyRow) return NOT_MINE
  const status = dataType === 'status' ? statusOf(m, raw) : null
  const isBool = isBoolType(dataType) || raw === true || raw === false
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--base-size-16)', padding: 'var(--base-size-8) 0', borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-muted)' }}>
      <Text style={{ color: 'var(--fgColor-muted)' }}>{label}</Text>
      {status ? <Label variant={toneVariant(status.tone)}>{status.label}</Label> : <Text weight="semibold">{isBool ? (raw === true || raw === 'true' ? 'Yes' : 'No') : readOnlyFieldText(m, raw) || '—'}</Text>}
    </div>
  )
}

// a grid: an array of rows (@Stereotype(grid), or an array with columns)
const grid: Rule = ({ m, stereotype, dataType, raw, editable, fieldId, label, controller, state, commit, shell }) => {
  if (!(stereotype === 'grid' || (dataType === 'array' && Array.isArray(m['columns']) && (m['columns'] as unknown[]).length > 0))) return NOT_MINE
  const rows = Array.isArray(raw) ? (raw as Dict[]) : []
  const selectionAction = typeof m['onItemSelectionActionId'] === 'string' ? (m['onItemSelectionActionId'] as string) : ''
  // an editable grid's default "<field>_selected" selection answers nothing in place: it is not a row click
  const rowAction = selectionAction && !(editable && selectionAction === `${fieldId}_selected`) ? selectionAction : ''
  // an editable list without @InlineEditing: the server's row editor (Edit / + / − / ↑ / ↓)
  const columnsMeta = (m['columns'] as Dict[] | undefined) ?? []
  const serverEditor = editable && m['inlineEditing'] !== true
    && columnsMeta.some((c) => ((c['metadata'] as Dict | undefined) ?? c)['id'] === '_select')
  if (serverEditor) {
    return shell(() => (
      <RowEditorGrid fieldId={fieldId} label={label} columns={gridColumnsOf(m['columns'], rows)} rows={rows} state={state}
        formPosition={typeof m['formPosition'] === 'string' ? m['formPosition'] : undefined} />
    ))
  }
  return shell(() => (
    <GridField
      label={label}
      columns={gridColumnsOf(m['columns'], rows)}
      rows={rows}
      editable={editable}
      inlineEditing={m['inlineEditing'] === true}
      onChange={(next) => commit(next)}
      onRowSelected={rowAction ? (row) => void controller.runAction(rowAction, { _clickedRow: row }) : undefined}
      onCellAction={(actionId, row) => void controller.runAction(actionId, row)}
      rowSelectionShortcut={typeof m['rowSelectionShortcut'] === 'string' ? m['rowSelectionShortcut'] : undefined}
    />
  ))
}

// a status: its tone as a Primer Label
const status: Rule = ({ m, dataType, raw, label }) => {
  if (dataType !== 'status') return NOT_MINE
  const st = statusOf(m, raw)
  return <ReadOnlyShell label={label}>{st ? <Label variant={toneVariant(st.tone)}>{st.label}</Label> : <Text>—</Text>}</ReadOnlyShell>
}

// @Badge: a boolean as a chip, lit when true, its text the label
const badge: Rule = ({ stereotype, raw, label }) => {
  if (stereotype !== 'badge') return NOT_MINE
  const on = raw === true || raw === 'true'
  return <div><Label variant={on ? 'success' : 'secondary'}>{label}</Label></div>
}

// booleans: a checkbox (Primer's toggle is for settings that apply at once, a checkbox is a form value)
const bool: Rule = ({ dataType, stereotype, fieldId, label, ref, raw, editable, help, error, required, unlabelled, caption, validation, commit }) => {
  if (!isBoolType(dataType)) return NOT_MINE
  const on = raw === true || raw === 'true'
  if (stereotype === 'toggle' || stereotype === 'switch') {
    const labelId = `${fieldId}-label`
    return (
      <div>
        <span id={labelId} className="mateu-field-label" style={{ display: 'block', marginBottom: 'var(--base-size-4)' }}>{label}</span>
        <ToggleSwitch ref={ref} aria-labelledby={labelId} checked={on} disabled={!editable} onClick={() => commit(!on)} size="small" />
        {help && <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)' }}>{help}</Text>}
        {error && <Text as="p" size="small" role="alert" style={{ color: 'var(--fgColor-danger)' }}>{error}</Text>}
      </div>
    )
  }
  return (
    <FormControl disabled={!editable} required={required}>
      <Checkbox ref={ref} checked={on} onChange={(e) => commit(e.target.checked)} />
      <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
      {caption}
      {validation}
    </FormControl>
  )
}

// @BulletedList: a read-only <ul>
const bulletedList: Rule = ({ stereotype, raw, text, label }) => {
  if (stereotype !== 'bulletedList') return NOT_MINE
  const items = Array.isArray(raw) ? raw.map(String) : text ? [text] : []
  return <ReadOnlyShell label={label}>{items.length ? <ul className="mateu-bullets">{items.map((it, i) => <li key={i}>{it}</li>)}</ul> : <Text>—</Text>}</ReadOnlyShell>
}

// @PlainText: dense read-only text (money formatted), @Multiline wraps
const plainText: Rule = ({ stereotype, m, raw, label }) => {
  if (stereotype !== 'plainText') return NOT_MINE
  return (
    <ReadOnlyShell label={label}>
      <Text as="div" className={`mateu-plain-text${m['multiline'] ? ' multiline' : ''}`} title={m['multiline'] ? undefined : readOnlyFieldText(m, raw)}>{readOnlyFieldText(m, raw) || '—'}</Text>
    </ReadOnlyShell>
  )
}

// ranges (listing filters): two bounds as `<field>_from` / `<field>_to`
const range: Rule = ({ stereotype, fieldId, state, editable, controller, shell }) => {
  if (stereotype !== 'dateRange' && stereotype !== 'numberRange') return NOT_MINE
  return shell((a11y) => <RangeInputs fieldId={fieldId} date={stereotype === 'dateRange'} state={state} editable={editable} onChange={(k, v) => controller.putState(k, v)} a11y={a11y} />)
}

// pictures, files and the capture fields
const media: Rule = ({ stereotype, m, text, raw, label, editable, commit, ref, controller, shell }) => {
  switch (stereotype) {
    case 'image': return <ReadOnlyShell label={label}><ImageValue value={text} alt={label} /></ReadOnlyShell>
    case 'uploadableImage': return shell(() => <UploadableImage value={text} label={label} editable={editable} onChange={commit} buttonRef={ref} />)
    case 'fileUpload': return shell(() => <FileUpload value={raw} config={uploadConfigOf(m['attributes'])} editable={editable} api={controller.session.api} onChange={commit} buttonRef={ref} />)
    case 'signature': return shell(() => <Signature value={text} label={label} editable={editable} onChange={commit} buttonRef={ref} />)
    case 'camera': return shell(() => <PhotoCapture value={text} label={label} editable={editable} onChange={commit} buttonRef={ref} />)
    default: return NOT_MINE
  }
}

// markdown / HTML / rich text: drawn read-only, source + Preview when editable
const markup: Rule = ({ stereotype, editable, text, label, commit, ref, placeholder, status, shell }) => {
  if (stereotype !== 'markdown' && stereotype !== 'html' && stereotype !== 'richText') return NOT_MINE
  const kind = stereotype as 'markdown' | 'html' | 'richText'
  if (!editable) return <ReadOnlyShell label={label}><RichValue value={text} kind={kind} /></ReadOnlyShell>
  return shell((a11y) => <MarkupEditor kind={kind} value={text} onChange={commit} a11y={a11y} inputRef={ref} placeholder={placeholder} validationStatus={status} />)
}

// the widgets that are their own read-only view
const ownWidgets: Rule = ({ stereotype, m, raw, text, label, editable, commit, ref, shell }) => {
  switch (stereotype) {
    case 'stars': return shell((a11y) => <Stars value={Number(raw) || 0} editable={editable} onChange={commit} a11y={a11y} />)
    case 'slider': {
      const min = Number(m['sliderMin'] ?? 0)
      const max = Number(m['sliderMax'] ?? 100)
      return shell((a11y) => <Slider value={raw === null || raw === undefined || raw === '' ? min : Number(raw)} min={min} max={max > min ? max : min + 100} step={Number(m['step'] ?? 1) || 1} editable={editable} onChange={commit} a11y={a11y} inputRef={ref} />)
    }
    case 'color': return shell((a11y) => <ColorField value={text} editable={editable} onChange={commit} a11y={a11y} inputRef={ref} />)
    case 'icon': return <ReadOnlyShell label={label}>{text ? <Token text={text} /> : <Text>—</Text>}</ReadOnlyShell>
    case 'link': return editable ? NOT_MINE : <ReadOnlyShell label={label}><LinkValue value={text} /></ReadOnlyShell>
    default: return NOT_MINE
  }
}

// @Stereotype(button): the field as a button that runs its action
const fieldButton: Rule = ({ stereotype, m, text, label, options, editable, fieldId, controller, ref, shell }) => {
  if (stereotype !== 'button') return NOT_MINE
  const attrs = (m['attributes'] as Dict | undefined) ?? {}
  const actionId = String(m['actionId'] ?? attrs['actionId'] ?? '')
  // an option's label when the value is one of them (an enum shows "First", not FIRST)
  const shown = options.find((o) => o.value === text)?.label ?? text
  return shell(() => (
    <FieldButton text={shown || label} actionId={actionId} disabled={!editable} buttonRef={ref}
      onPress={() => void controller.runAction(actionId, { fieldId, value: text })} />
  ))
}

// a choice: options as selectable cards (several on a collection); popover: the same, in an overlay
const choice: Rule = ({ stereotype, options, dataType, raw, editable, commitPicked, commitOne, ref, shell }) => {
  if ((stereotype !== 'choice' && stereotype !== 'popover') || options.length === 0) return NOT_MINE
  const multiple = dataType === 'array' || Array.isArray(raw)
  const onChange = (v: string[]) => (multiple ? commitPicked(v) : commitOne(v[0] ?? ''))
  if (stereotype === 'popover') {
    return shell((a11y) => <PopoverChoice options={options} value={pickedStrings(raw)} multiple={multiple} editable={editable} onChange={onChange} a11y={a11y} buttonRef={ref} />)
  }
  return shell((a11y) => <ChoiceCards options={options} value={pickedStrings(raw)} multiple={multiple} editable={editable} onChange={onChange} a11y={a11y} />)
}

// @Searchable (a selector Listing behind it): code box + its label + search (`code-` / `codesearch-<field>`);
// on a collection, tokens + «Add» — as the web renderer draws them
const searchable: Rule = ({ stereotype, dataType, fieldId, label, raw, text, editable, commit, ref, shell }) => {
  if (stereotype !== 'searchable') return NOT_MINE
  if (dataType === 'array' || Array.isArray(raw)) {
    return shell((a11y) => <SearchableMultiField fieldId={fieldId} label={label} value={raw} editable={editable} onChange={commit} a11y={a11y} buttonRef={ref} />)
  }
  return shell((a11y) => <SearchableField fieldId={fieldId} label={label} value={text} editable={editable} a11y={a11y} buttonRef={ref} />)
}

// a lookup (@Lookup): a remote combobox — the server searches (`search-<field>`)
const lookup: Rule = ({ m, stereotype, label, fieldId, text, controller, state, editable, commit, ref, placeholder, shell }) => {
  const remote = m['remoteCoordinates'] as Dict | null | undefined
  if (!(stereotype === 'combobox' && remote)) return NOT_MINE
  return shell((a11y) => (
    <Lookup
      label={label}
      fieldId={fieldId}
      value={text}
      valueLabel={lookupLabelOf(controller.rendered.data, state, fieldId)}
      action={typeof remote?.['action'] === 'string' ? (remote['action'] as string) : null}
      editable={editable}
      onChange={commit}
      a11y={a11y}
      buttonRef={ref}
      placeholder={placeholder}
    />
  ))
}

// a tree of options (@TreeSelect)
const treeSelect: Rule = ({ stereotype, m, text, editable, commit, ref, placeholder, shell }) => {
  if (stereotype !== 'treeSelect') return NOT_MINE
  const tree = (m.options as unknown as TreeOption[] | undefined) ?? []
  return shell((a11y) => <TreeSelect options={tree} leavesOnly={m['treeLeavesOnly'] === true} value={text} editable={editable} onChange={commit} a11y={a11y} buttonRef={ref} placeholder={placeholder} />)
}

// read-only: the value as text (an option's label, money formatted, a password hidden)
const readOnlyValue: Rule = (c) => {
  const { readOnly, stereotype, dataType, raw, options, label, text, m } = c
  if (!readOnly || stereotype === 'radio' || stereotype === 'checkbox' || stereotype === 'listBox') return NOT_MINE
  if (isMultiValued(dataType, stereotype, raw) && options.length > 0) {
    const picked = pickedStrings(raw)
    return <ReadOnlyShell label={label}><TokenList labels={options.filter((o) => picked.includes(o.value)).map((o) => o.label)} /></ReadOnlyShell>
  }
  let shown = readOnlyFieldText(m, raw)
  if (stereotype === 'password' && text) shown = '••••••••'
  else if (isMoney(c)) shown = moneyText(raw)
  return (
    <ReadOnlyShell label={label}>
      <Text as="div" style={{ whiteSpace: stereotype === 'textarea' ? 'pre-wrap' : undefined, ...inputLook(m) }}>{shown || '—'}</Text>
    </ReadOnlyShell>
  )
}

// several values
const multiValued: Rule = ({ dataType, stereotype, raw, options, m, label, help, error, required, editable, commitPicked, ref, placeholder, shell }) => {
  if (!(isMultiValued(dataType, stereotype, raw) && (options.length > 0 || m.optionsSource))) return NOT_MINE
  const selected = pickedStrings(raw)
  if (stereotype === 'listBox') return shell((a11y) => <ListBox options={options} value={selected} multiple editable={editable} onChange={commitPicked} a11y={a11y} />)
  if (stereotype !== 'checkbox') return shell((a11y) => <MultiSelect label={label} options={options} value={selected} editable={editable} onChange={commitPicked} a11y={a11y} buttonRef={ref} placeholder={placeholder} />)
  const toggle = (value: string, on: boolean) => commitPicked(on ? [...selected, value] : selected.filter((v) => v !== value))
  return (
    <CheckboxGroup required={required} disabled={!editable}>
      <CheckboxGroup.Label>{label}</CheckboxGroup.Label>
      {help && <CheckboxGroup.Caption>{help}</CheckboxGroup.Caption>}
      {options.map((o) => (
        <FormControl key={o.value}>
          <Checkbox value={o.value} checked={selected.includes(o.value)} onChange={(e) => toggle(o.value, e.target.checked)} />
          <FormControl.Label>{o.label}</FormControl.Label>
        </FormControl>
      ))}
      {error && <CheckboxGroup.Validation variant="error">{error}</CheckboxGroup.Validation>}
    </CheckboxGroup>
  )
}

// one value: a list box, radios or a select
const singleChoice: Rule = ({ stereotype, options, m, text, fieldId, label, help, error, required, editable, disabled, unlabelled, ref, placeholder, status, caption, validation, commitOne, shell }) => {
  if (stereotype === 'listBox' && options.length > 0) {
    return shell((a11y) => <ListBox options={options} value={text ? [text] : []} multiple={false} editable={editable} onChange={(v) => commitOne(v[0] ?? '')} a11y={a11y} />)
  }
  if (stereotype === 'radio' && options.length > 0) {
    return (
      <RadioGroup name={fieldId} required={required} disabled={!editable} onChange={(v) => v != null && commitOne(v)}>
        <RadioGroup.Label>{label}</RadioGroup.Label>
        {help && <RadioGroup.Caption>{help}</RadioGroup.Caption>}
        {options.map((o) => (
          <FormControl key={o.value}>
            <Radio value={o.value} checked={text === o.value} />
            <FormControl.Label>{o.label}</FormControl.Label>
          </FormControl>
        ))}
        {error && <RadioGroup.Validation variant="error">{error}</RadioGroup.Validation>}
      </RadioGroup>
    )
  }
  if (options.length === 0 && !m.optionsSource) return NOT_MINE
  return (
    <FormControl required={required} disabled={disabled}>
      <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
      <Select ref={ref} value={text} onChange={(e) => commitOne(e.target.value)} block validationStatus={status}>
        <Select.Option value="">{placeholder ?? 'Select…'}</Select.Option>
        {options.map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
      </Select>
      {caption}
      {validation}
    </FormControl>
  )
}

const textarea: Rule = ({ stereotype, required, disabled, unlabelled, label, ref, text, commit, placeholder, status, caption, validation }) => {
  if (stereotype !== 'textarea') return NOT_MINE
  return (
    <FormControl required={required} disabled={disabled}>
      <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
      <Textarea ref={ref} value={text} onChange={(e) => commit(e.target.value)} block placeholder={placeholder} validationStatus={status} />
      {caption}
      {validation}
    </FormControl>
  )
}

// money: the number while typing, the formatted amount once focus leaves
const money: Rule = (c) => {
  if (!isMoney(c)) return NOT_MINE
  const { required, disabled, controlId, unlabelled, label, raw, commit, ref, placeholder, status, caption, validation } = c
  return (
    <FormControl required={required} disabled={disabled} id={controlId}>
      <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
      <MoneyTextInput id={controlId} raw={raw} onChange={commit} inputRef={ref} placeholder={placeholder} validationStatus={status} />
      {caption}
      {validation}
    </FormControl>
  )
}

const RULES: Rule[] = [
  propertyRow, grid, status, badge, bool, bulletedList, plainText, searchable, range, media, markup, ownWidgets,
  fieldButton, choice, lookup, treeSelect, readOnlyValue, multiValued, singleChoice, textarea, money,
]

/** `rightAligned` (amounts) and `bold` on the input's own text. */
const inputLook = (m: FieldMeta): React.CSSProperties | undefined =>
  m['rightAligned'] === true || m['bold'] === true
    ? { textAlign: m['rightAligned'] === true ? 'right' : undefined, fontWeight: m['bold'] === true ? 600 : undefined }
    : undefined

const INTEGER = new Set(['integer', 'int', 'long', 'Integer', 'Long'])
const DECIMAL = new Set(['number', 'double', 'float', 'decimal', 'BigDecimal'])
const INPUT_TYPE_OF_STEREOTYPE: Record<string, string> = { password: 'password', email: 'email', link: 'url' }
const INPUT_TYPE_OF_DATA: Record<string, string> = { date: 'date', time: 'time', datetime: 'datetime-local', dateTime: 'datetime-local' }

// the rest: a text input of the type the data calls for
function textInput({ m, dataType, stereotype, required, disabled, unlabelled, label, ref, text, commit, placeholder, status, caption, validation }: FieldCtx) {
  const integer = INTEGER.has(dataType)
  const numeric = integer || DECIMAL.has(dataType)
  const inputType = INPUT_TYPE_OF_STEREOTYPE[stereotype] ?? INPUT_TYPE_OF_DATA[dataType] ?? (numeric ? 'number' : 'text')
  const parse = (v: string): unknown => {
    if (!numeric) return v
    if (v === '') return null
    return integer ? parseInt(v, 10) : Number(v)
  }
  let step: string | number | undefined
  if (numeric && !integer) step = 'any'
  else if (m['step']) step = Number(m['step'])
  return (
    <FormControl required={required} disabled={disabled}>
      <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
      <TextInput
        ref={ref}
        type={inputType}
        value={inputType === 'datetime-local' ? text.slice(0, 16) : text}
        onChange={(e) => commit(parse(e.target.value))}
        block
        placeholder={placeholder}
        autoComplete={m.autocomplete || undefined}
        step={step}
        min={numeric && m['min'] != null ? Number(m['min']) : undefined}
        max={numeric && m['max'] != null ? Number(m['max']) : undefined}
        validationStatus={status}
        style={inputLook(m)}
      />
      {caption}
      {validation}
    </FormControl>
  )
}

/** A money TextInput (the hook keeps the hooks out of FieldRenderer's branches). FormControl links
 *  its label to a TextInput it finds as a direct child, so this one is spelled out in place. */
function MoneyTextInput({ id, raw, onChange, inputRef, placeholder, validationStatus }: {
  id: string; raw: unknown; onChange: (v: unknown) => void; inputRef: never; placeholder?: string; validationStatus?: 'error'
}) {
  const money = useMoneyInput(raw, onChange)
  return <TextInput id={id} ref={inputRef} {...money} block placeholder={placeholder} validationStatus={validationStatus} />
}

/** A status tone (the RN core's success / warning / danger / neutral) as a Primer Label variant. */
function toneVariant(tone: string): 'success' | 'attention' | 'danger' | 'secondary' | 'accent' {
  const t = tone.toLowerCase()
  if (t === 'success') return 'success'
  if (t === 'warning') return 'attention'
  if (t === 'danger' || t === 'error') return 'danger'
  if (t === 'info' || t === 'primary') return 'accent'
  return 'secondary'
}

/** @RestOptions: the options a REST source gives, fetched in the browser or through the server's proxy. */
function useSourcedOptions(source: Dict | undefined, fieldId: string, state: Dict): FetchedOption[] | null {
  const controller = useController()
  const [options, setOptions] = useState<FetchedOption[]>([])
  const appState = controller.session.appState
  const resolve = (t: unknown): string => interpolate(String(t ?? ''), { state, appState })
  const resolved = source ? (controller.session.sources.resolve(source) as Dict & { url?: string; itemsPath?: string; valuePath?: string; labelPath?: string }) : null
  const url = resolved ? resolve(resolved.url) : ''
  const id = useId()
  useEffect(() => {
    if (!source || !resolved) return
    let cancelled = false
    const json = controller.session.sources.viaProxy(source)
      ? controller.fetchViaProxy('options', fieldId)
      : fetchExternalJson(source, resolve, (t) => interpolateUrl(String(t ?? ''), { state, appState }), controller.session.sources)
    json
      .then((j) => { if (!cancelled) setOptions(mapItemsToOptions(j, resolved.itemsPath, resolved.valuePath, resolved.labelPath)) })
      .catch((e) => console.warn('mateu: options fetch failed', id, e))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, !!source])
  return source ? options : null
}
