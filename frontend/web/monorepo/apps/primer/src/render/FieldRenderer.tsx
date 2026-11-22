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
import { ChoiceCards } from './fields/choiceCards'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { fieldPlaceholder } from '@rn/core/uxRules'
import { readOnlyFieldText } from '@rn/core/readOnlyDisplay'
import { isMultiValued, pickedStrings, pickedValue, pickedValues, widgetOptionsOf, type TypedOption } from '@rn/core/fieldOptions'
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

function FieldBody({ metadata, state }: { metadata: Dict; state: Dict }) {
  const unlabelled = React.useContext(UnlabelledField)
  const m = metadata as FieldMeta
  const controller = useController()
  const fieldId = m.fieldId
  const dataType = String(m.dataType ?? 'string')
  const stereotype = String(m.stereotype ?? '')
  const sourced = useSourcedOptions(m.optionsSource ?? undefined, fieldId, state)
  const options = sourced ? widgetOptionsOf(sourced) : widgetOptionsOf(m.options ?? [])
  const inputRef = useRef<HTMLElement | null>(null)
  const controlId = useId()
  useEffect(() => controller.registerFieldFocus(fieldId, () => inputRef.current?.focus()), [controller, fieldId])

  // a local echo of the last edit: the state object is re-published on every edit
  const [local, setLocal] = useState<unknown>(undefined)
  const raw = local !== undefined ? local : state[fieldId] ?? m.initialValue
  const text = raw === null || raw === undefined ? '' : String(raw)
  const commit = (v: unknown) => {
    setLocal(v)
    controller.putState(fieldId, v)
  }
  // a pick written back as the options' own values (a source's ids are numbers)
  const commitPicked = (picked: string[]) => commit(sourced ? pickedValues(sourced, picked) : picked)
  const commitOne = (picked: string) => commit(sourced ? pickedValue(sourced, picked) : picked)

  const attrs = controller.fieldAttributes[fieldId] ?? {}
  if (attrs['hidden']) return null
  const label = interpolate(String(m.label ?? ''), { state, appState: controller.session.appState }) || fieldId
  const required = attrs['required'] !== undefined ? Boolean(attrs['required']) : m.required === true
  // read-only = a value to READ (text); disabled = an input that cannot be used NOW (a rule may
  // enable it) — it stays an input, greyed
  const readOnly = m.readOnly === true
  const disabled = !readOnly && (m.disabled === true || !!attrs['disabled'])
  const editable = !readOnly && !disabled
  const error = controller.fieldErrors[fieldId]
  const help = String(m.description ?? '').trim()
  const placeholder = fieldPlaceholder(m) ?? undefined
  const ref = inputRef as never
  // a custom widget inside the label / help / error frame (FieldShell names and describes it)
  const shell = (render: (a11y: { 'aria-labelledby': string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode) => (
    <FieldShell label={label} required={required && editable} help={help || undefined} error={error}>{render}</FieldShell>
  )

  // a property row (@Section(propertyList)): label left, value right, read-only
  if (m.propertyRow) {
    const status = dataType === 'status' ? statusOf(m, raw) : null
    const isBool = dataType === 'bool' || dataType === 'boolean' || raw === true || raw === false
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--base-size-16)', padding: 'var(--base-size-8) 0', borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-muted)' }}>
        <Text style={{ color: 'var(--fgColor-muted)' }}>{label}</Text>
        {status ? <Label variant={toneVariant(status.tone)}>{status.label}</Label> : <Text weight="semibold">{isBool ? (raw === true || raw === 'true' ? 'Yes' : 'No') : readOnlyFieldText(m, raw) || '—'}</Text>}
      </div>
    )
  }

  const caption = help ? <FormControl.Caption>{help}</FormControl.Caption> : null
  const validation = error ? <FormControl.Validation variant="error">{error}</FormControl.Validation> : null
  const status = error ? 'error' as const : undefined

  // a grid: an array of rows (@Stereotype(grid), or an array with columns)
  if (stereotype === 'grid' || (dataType === 'array' && Array.isArray(m['columns']) && (m['columns'] as unknown[]).length > 0)) {
    const rows = Array.isArray(raw) ? (raw as Dict[]) : []
    const selectionAction = typeof m['onItemSelectionActionId'] === 'string' ? (m['onItemSelectionActionId'] as string) : ''
    // an editable grid's default "<field>_selected" selection answers nothing in place: it is not a row click
    const rowAction = selectionAction && !(editable && selectionAction === `${fieldId}_selected`) ? selectionAction : ''
    return shell(() => (
      <GridField
        label={label}
        columns={gridColumnsOf(m['columns'], rows)}
        rows={rows}
        editable={editable}
        inlineEditing={m['inlineEditing'] === true}
        onChange={(next) => commit(next)}
        onRowSelected={rowAction ? (row) => void controller.runAction(rowAction, { _clickedRow: row }) : undefined}
      />
    ))
  }

  // a status: its tone as a Primer Label
  if (dataType === 'status') {
    const st = statusOf(m, raw)
    return <ReadOnlyShell label={label}>{st ? <Label variant={toneVariant(st.tone)}>{st.label}</Label> : <Text>—</Text>}</ReadOnlyShell>
  }

  // @Badge: a boolean as a chip, lit when true, its text the label
  if (stereotype === 'badge') {
    const on = raw === true || raw === 'true'
    return <div><Label variant={on ? 'success' : 'secondary'}>{label}</Label></div>
  }

  // booleans: a checkbox (Primer's toggle is for settings that apply at once, a checkbox is a form value)
  if (dataType === 'bool' || dataType === 'boolean' || dataType === 'Boolean') {
    if (stereotype === 'toggle' || stereotype === 'switch') {
      const labelId = `${fieldId}-label`
      return (
        <div>
          <span id={labelId} className="mateu-field-label" style={{ display: 'block', marginBottom: 'var(--base-size-4)' }}>{label}</span>
          <ToggleSwitch ref={ref} aria-labelledby={labelId} checked={raw === true || raw === 'true'} disabled={!editable} onClick={() => commit(!(raw === true || raw === 'true'))} size="small" />
          {help && <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)' }}>{help}</Text>}
          {error && <Text as="p" size="small" role="alert" style={{ color: 'var(--fgColor-danger)' }}>{error}</Text>}
        </div>
      )
    }
    return (
      <FormControl disabled={!editable} required={required}>
        <Checkbox ref={ref} checked={raw === true || raw === 'true'} onChange={(e) => commit(e.target.checked)} />
        <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
        {caption}
        {validation}
      </FormControl>
    )
  }

  // @BulletedList: a read-only <ul>
  if (stereotype === 'bulletedList') {
    const items = Array.isArray(raw) ? raw.map(String) : text ? [text] : []
    return <ReadOnlyShell label={label}>{items.length ? <ul className="mateu-bullets">{items.map((it, i) => <li key={i}>{it}</li>)}</ul> : <Text>—</Text>}</ReadOnlyShell>
  }

  // @PlainText: dense read-only text (money formatted), @Multiline wraps
  if (stereotype === 'plainText') {
    return (
      <ReadOnlyShell label={label}>
        <Text as="div" className={`mateu-plain-text${m['multiline'] ? ' multiline' : ''}`} title={m['multiline'] ? undefined : readOnlyFieldText(m, raw)}>{readOnlyFieldText(m, raw) || '—'}</Text>
      </ReadOnlyShell>
    )
  }

  // ranges (listing filters): two bounds as `<field>_from` / `<field>_to`
  if (stereotype === 'dateRange' || stereotype === 'numberRange') {
    return shell((a11y) => <RangeInputs fieldId={fieldId} date={stereotype === 'dateRange'} state={state} editable={editable} onChange={(k, v) => controller.putState(k, v)} a11y={a11y} />)
  }

  // pictures and files
  if (stereotype === 'image') return <ReadOnlyShell label={label}><ImageValue value={text} alt={label} /></ReadOnlyShell>
  if (stereotype === 'uploadableImage') return shell(() => <UploadableImage value={text} label={label} editable={editable} onChange={commit} buttonRef={ref} />)
  if (stereotype === 'fileUpload') {
    const config = uploadConfigOf(m['attributes'])
    return shell(() => <FileUpload value={raw} config={config} editable={editable} api={controller.session.api} onChange={commit} buttonRef={ref} />)
  }
  if (stereotype === 'signature') return shell(() => <Signature value={text} label={label} editable={editable} onChange={commit} buttonRef={ref} />)
  if (stereotype === 'camera') return shell(() => <PhotoCapture value={text} label={label} editable={editable} onChange={commit} buttonRef={ref} />)

  // markdown / HTML / rich text: drawn read-only, source + Preview when editable
  if (stereotype === 'markdown' || stereotype === 'html' || stereotype === 'richText') {
    const kind = stereotype as 'markdown' | 'html' | 'richText'
    if (!editable) return <ReadOnlyShell label={label}><RichValue value={text} kind={kind} /></ReadOnlyShell>
    return shell((a11y) => <MarkupEditor kind={kind} value={text} onChange={commit} a11y={a11y} inputRef={ref} placeholder={placeholder} validationStatus={status} />)
  }

  // the widgets that are their own read-only view
  if (stereotype === 'stars') return shell((a11y) => <Stars value={Number(raw) || 0} editable={editable} onChange={commit} a11y={a11y} />)
  if (stereotype === 'slider') {
    const min = Number(m['sliderMin'] ?? 0)
    const max = Number(m['sliderMax'] ?? 100)
    return shell((a11y) => <Slider value={raw === null || raw === undefined || raw === '' ? min : Number(raw)} min={min} max={max > min ? max : min + 100} step={Number(m['step'] ?? 1) || 1} editable={editable} onChange={commit} a11y={a11y} inputRef={ref} />)
  }
  if (stereotype === 'color') return shell((a11y) => <ColorField value={text} editable={editable} onChange={commit} a11y={a11y} inputRef={ref} />)
  if (stereotype === 'icon') return <ReadOnlyShell label={label}>{text ? <Token text={text} /> : <Text>—</Text>}</ReadOnlyShell>
  if (stereotype === 'link' && !editable) return <ReadOnlyShell label={label}><LinkValue value={text} /></ReadOnlyShell>

  // a choice: options as selectable cards (several on a collection)
  if (stereotype === 'choice' && options.length > 0) {
    const multiple = dataType === 'array' || Array.isArray(raw)
    return shell((a11y) => <ChoiceCards options={options} value={pickedStrings(raw)} multiple={multiple} editable={editable} onChange={(v) => (multiple ? commitPicked(v) : commitOne(v[0] ?? ''))} a11y={a11y} />)
  }

  // a lookup: the server searches (`search-<field>`)
  const remote = m['remoteCoordinates'] as Dict | null | undefined
  if (stereotype === 'searchable' || (stereotype === 'combobox' && remote)) {
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
  if (stereotype === 'treeSelect') {
    const tree = (m.options as unknown as TreeOption[] | undefined) ?? []
    return shell((a11y) => <TreeSelect options={tree} leavesOnly={m['treeLeavesOnly'] === true} value={text} editable={editable} onChange={commit} a11y={a11y} buttonRef={ref} placeholder={placeholder} />)
  }

  // read-only: the value as text (an option's label, money formatted, a password hidden)
  if (readOnly && stereotype !== 'radio' && stereotype !== 'checkbox' && stereotype !== 'listBox') {
    if (isMultiValued(dataType, stereotype, raw) && options.length > 0) {
      const picked = pickedStrings(raw)
      return <ReadOnlyShell label={label}><TokenList labels={options.filter((o) => picked.includes(o.value)).map((o) => o.label)} /></ReadOnlyShell>
    }
    const money = dataType === 'money' || stereotype === 'money' || stereotype === 'currency'
    const shown = stereotype === 'password' && text ? '••••••••' : money ? moneyText(raw) : readOnlyFieldText(m, raw)
    return (
      <ReadOnlyShell label={label}>
        <Text as="div" style={{ whiteSpace: stereotype === 'textarea' ? 'pre-wrap' : undefined }}>{shown || '—'}</Text>
      </ReadOnlyShell>
    )
  }

  // several values
  if (isMultiValued(dataType, stereotype, raw) && (options.length > 0 || m.optionsSource)) {
    const selected = pickedStrings(raw)
    if (stereotype === 'listBox') return shell((a11y) => <ListBox options={options} value={selected} multiple editable={editable} onChange={commitPicked} a11y={a11y} />)
    if (stereotype === 'checkbox') {
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
    return shell((a11y) => <MultiSelect label={label} options={options} value={selected} editable={editable} onChange={commitPicked} a11y={a11y} buttonRef={ref} placeholder={placeholder} />)
  }

  // @Stereotype(listBox): the options always visible, one chosen
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

  // one value out of a list
  if (options.length > 0 || m.optionsSource) {
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

  if (stereotype === 'textarea') {
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
  if (dataType === 'money' || stereotype === 'money' || stereotype === 'currency') {
    return (
      <FormControl required={required} disabled={disabled} id={controlId}>
        <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
        <MoneyTextInput id={controlId} raw={raw} onChange={commit} inputRef={ref} placeholder={placeholder} validationStatus={status} />
        {caption}
        {validation}
      </FormControl>
    )
  }

  const integer = ['integer', 'int', 'long', 'Integer', 'Long'].includes(dataType)
  const numeric = integer || ['number', 'double', 'float', 'decimal', 'BigDecimal'].includes(dataType)
  const inputType = stereotype === 'password' ? 'password'
    : stereotype === 'email' ? 'email'
    : stereotype === 'link' ? 'url'
    : dataType === 'date' ? 'date'
    : dataType === 'time' ? 'time'
    : dataType === 'datetime' || dataType === 'dateTime' ? 'datetime-local'
    : numeric ? 'number'
    : 'text'
  return (
    <FormControl required={required} disabled={disabled}>
      <FormControl.Label visuallyHidden={unlabelled}>{label}</FormControl.Label>
      <TextInput
        ref={ref}
        type={inputType}
        value={inputType === 'datetime-local' ? text.slice(0, 16) : text}
        onChange={(e) => {
          const v = e.target.value
          commit(numeric ? (v === '' ? null : integer ? parseInt(v, 10) : Number(v)) : v)
        }}
        block
        placeholder={placeholder}
        autoComplete={m.autocomplete || undefined}
        step={numeric && !integer ? 'any' : m['step'] ? Number(m['step']) : undefined}
        min={numeric && m['min'] != null ? Number(m['min']) : undefined}
        max={numeric && m['max'] != null ? Number(m['max']) : undefined}
        validationStatus={status}
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
