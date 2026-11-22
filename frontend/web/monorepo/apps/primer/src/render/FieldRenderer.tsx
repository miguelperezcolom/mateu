import React, { useEffect, useId, useRef, useState } from 'react'
import { Checkbox, CheckboxGroup, FormControl, Label, Radio, RadioGroup, Select, Text, TextInput, Textarea, ToggleSwitch } from '@primer/react'
import { interpolate, interpolateUrl } from '@rn/core/expressions'
import { fieldPlaceholder } from '@rn/core/uxRules'
import { readOnlyFieldText, readOnlyStatus } from '@rn/core/readOnlyDisplay'
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
  const m = metadata as FieldMeta
  const controller = useController()
  const fieldId = m.fieldId
  const dataType = String(m.dataType ?? 'string')
  const stereotype = String(m.stereotype ?? '')
  const sourced = useSourcedOptions(m.optionsSource ?? undefined, fieldId, state)
  const options = sourced ? widgetOptionsOf(sourced) : widgetOptionsOf(m.options ?? [])
  const inputRef = useRef<HTMLElement | null>(null)
  useEffect(() => controller.registerFieldFocus(fieldId, () => inputRef.current?.focus()), [controller, fieldId])

  // a local echo of the last edit: the state object is re-published on every edit
  const [local, setLocal] = useState<unknown>(undefined)
  const raw = local !== undefined ? local : state[fieldId] ?? m.initialValue
  const text = raw === null || raw === undefined ? '' : String(raw)
  const commit = (v: unknown) => {
    setLocal(v)
    controller.putState(fieldId, v)
  }

  const attrs = controller.fieldAttributes[fieldId] ?? {}
  if (attrs['hidden']) return null
  const label = interpolate(String(m.label ?? ''), { state, appState: controller.session.appState }) || fieldId
  const required = attrs['required'] !== undefined ? Boolean(attrs['required']) : m.required === true
  const editable = !m.readOnly && !m.disabled && !attrs['disabled']
  const error = controller.fieldErrors[fieldId]
  const help = String(m.description ?? '').trim()
  const placeholder = fieldPlaceholder(m) ?? undefined

  // a property row (@Section(propertyList)): label left, value right, read-only
  if (m.propertyRow) {
    const status = dataType === 'status' ? readOnlyStatus(m, raw) : null
    const isBool = dataType === 'bool' || dataType === 'boolean' || raw === true || raw === false
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--base-size-16)', padding: 'var(--base-size-8) 0', borderBottom: 'var(--borderWidth-thin) solid var(--borderColor-muted)' }}>
        <Text style={{ color: 'var(--fgColor-muted)' }}>{label}</Text>
        {status ? <Label>{status.label}</Label> : <Text weight="semibold">{isBool ? (raw === true || raw === 'true' ? 'Yes' : 'No') : readOnlyFieldText(m, raw) || '—'}</Text>}
      </div>
    )
  }

  const caption = help ? <FormControl.Caption>{help}</FormControl.Caption> : null
  const validation = error ? <FormControl.Validation variant="error">{error}</FormControl.Validation> : null

  // booleans: a checkbox (Primer's toggle is for settings that apply at once, a checkbox is a form value)
  if (dataType === 'bool' || dataType === 'boolean' || dataType === 'Boolean') {
    if (stereotype === 'toggle' || stereotype === 'switch') {
      const labelId = `${fieldId}-label`
      return (
        <div>
          <Text id={labelId} weight="semibold" style={{ display: 'block', marginBottom: 'var(--base-size-4)' }}>{label}</Text>
          <ToggleSwitch aria-labelledby={labelId} checked={raw === true || raw === 'true'} disabled={!editable} onClick={() => commit(!(raw === true || raw === 'true'))} size="small" />
          {help && <Text as="p" size="small" style={{ color: 'var(--fgColor-muted)' }}>{help}</Text>}
        </div>
      )
    }
    return (
      <FormControl disabled={!editable} required={required}>
        <Checkbox checked={raw === true || raw === 'true'} onChange={(e) => commit(e.target.checked)} />
        <FormControl.Label>{label}</FormControl.Label>
        {caption}
        {validation}
      </FormControl>
    )
  }

  // read-only: the value as text (an option's label, money formatted, a status as a label)
  if (!editable && stereotype !== 'radio' && stereotype !== 'checkbox') {
    const status = dataType === 'status' ? readOnlyStatus(m, raw) : null
    const shown = stereotype === 'password' && text ? '••••••••' : readOnlyFieldText(m, raw)
    return (
      <div>
        <Text as="div" size="small" weight="semibold" style={{ color: 'var(--fgColor-muted)', marginBottom: 'var(--base-size-4)' }}>{label}</Text>
        {status ? <Label>{status.label}</Label> : <Text as="div" style={{ whiteSpace: stereotype === 'textarea' ? 'pre-wrap' : undefined }}>{shown || '—'}</Text>}
      </div>
    )
  }

  // several values: checkboxes (a checkbox group), else a multiple select
  if (isMultiValued(dataType, stereotype, raw) && options.length > 0) {
    const selected = pickedStrings(raw)
    const toggle = (value: string, on: boolean) => {
      const next = on ? [...selected, value] : selected.filter((v) => v !== value)
      commit(sourced ? pickedValues(sourced, next) : next)
    }
    return (
      <CheckboxGroup required={required}>
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

  if (stereotype === 'radio' && options.length > 0) {
    return (
      <RadioGroup name={fieldId} required={required} disabled={!editable} onChange={(v) => v != null && commit(sourced ? pickedValue(sourced, v) : v)}>
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
      <FormControl required={required}>
        <FormControl.Label>{label}</FormControl.Label>
        <Select ref={inputRef as never} value={text} onChange={(e) => commit(sourced ? pickedValue(sourced, e.target.value) : e.target.value)} block validationStatus={error ? 'error' : undefined}>
          <Select.Option value="">{placeholder ?? 'Select…'}</Select.Option>
          {options.map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
        </Select>
        {caption}
        {validation}
      </FormControl>
    )
  }

  if (stereotype === 'textarea' || stereotype === 'richText' || stereotype === 'markdown' || stereotype === 'html') {
    return (
      <FormControl required={required}>
        <FormControl.Label>{label}</FormControl.Label>
        <Textarea ref={inputRef as never} value={text} onChange={(e) => commit(e.target.value)} block placeholder={placeholder} validationStatus={error ? 'error' : undefined} />
        {caption}
        {validation}
      </FormControl>
    )
  }

  const numeric = ['integer', 'int', 'long', 'number', 'double', 'float', 'decimal', 'money'].includes(dataType)
  const inputType = stereotype === 'password' ? 'password'
    : stereotype === 'email' ? 'email'
    : dataType === 'date' ? 'date'
    : dataType === 'time' ? 'time'
    : dataType === 'datetime' || dataType === 'dateTime' ? 'datetime-local'
    : numeric ? 'number'
    : 'text'
  return (
    <FormControl required={required}>
      <FormControl.Label>{label}</FormControl.Label>
      <TextInput
        ref={inputRef as never}
        type={inputType}
        value={inputType === 'datetime-local' ? text.slice(0, 16) : text}
        onChange={(e) => {
          const v = e.target.value
          commit(numeric ? (v === '' ? null : Number(v)) : v)
        }}
        block
        placeholder={placeholder}
        autoComplete={m.autocomplete || undefined}
        step={dataType === 'money' || dataType === 'double' || dataType === 'decimal' ? 'any' : undefined}
        validationStatus={error ? 'error' : undefined}
      />
      {caption}
      {validation}
    </FormControl>
  )
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
