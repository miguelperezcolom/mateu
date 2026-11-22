import React, { useEffect, useState } from 'react'
import { AnchoredOverlay, Button, Checkbox, CheckboxGroup, FormControl, Select, Stack, TextInput } from '@primer/react'
import { FilterIcon } from '@primer/octicons-react'
import { isBlankFilterValue } from '@rn/renderer/crudListing'
import { NUMERIC, multiValues, optionsOf, type Dict } from './rows'

/**
 * The listing's filters: a Filter button opening a panel with one control per filter, each the
 * widget its type asks for (options → a select, multiSelect → checkboxes, boolean → Yes / No,
 * dateRange / numberRange → from–to, else a text input). Applied, they become the tokens above the
 * rows. The state keys are the crud's: `<field>`, `<field>_from` / `<field>_to`, a value list.
 */
export function FilterPanel({ filters, values, onApply, active }: { filters: Dict[]; values: Dict; onApply: (v: Dict) => void; active: number }) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Dict>(values)
  useEffect(() => { if (open) setDraft(values) }, [open, values])
  const set = (k: string, v: unknown) => setDraft((d) => {
    const next = { ...d }
    if (isBlankFilterValue(v) || (Array.isArray(v) && v.length === 0)) delete next[k]
    else next[k] = v
    return next
  })
  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderAnchor={(props) => (
        <Button {...props} leadingVisual={FilterIcon} count={active || undefined}>Filter</Button>
      )}
      overlayProps={{ role: 'dialog', 'aria-label': 'Filter', width: 'medium' } as never}
      focusZoneSettings={{ disabled: true }}
    >
      <form
        style={{ padding: 'var(--base-size-16)', display: 'grid', gap: 'var(--stack-gap-normal)', maxHeight: '70vh', overflow: 'auto' }}
        onSubmit={(e) => { e.preventDefault(); onApply(draft); setOpen(false) }}
      >
        {filters.map((f) => <FilterControl key={String(f['fieldId'])} filter={f} values={draft} set={set} />)}
        <Stack direction="horizontal" justify="end" gap="condensed">
          <Button type="button" variant="invisible" onClick={() => { onApply({}); setOpen(false) }}>Clear</Button>
          <Button type="submit" variant="primary">Apply</Button>
        </Stack>
      </form>
    </AnchoredOverlay>
  )
}

function FilterControl({ filter, values, set }: { filter: Dict; values: Dict; set: (k: string, v: unknown) => void }) {
  const fieldId = String(filter['fieldId'])
  const label = String(filter['label'] ?? fieldId)
  const stereotype = String(filter['stereotype'] ?? '')
  const dataType = String(filter['dataType'] ?? '')
  const options = optionsOf(filter)
  if (stereotype === 'dateRange' || stereotype === 'numberRange') {
    const type = stereotype === 'dateRange' ? (dataType === 'dateTime' || dataType === 'datetime' ? 'datetime-local' : 'date') : 'number'
    return (
      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend style={{ fontWeight: 'var(--base-text-weight-semibold)' as never, fontSize: 'var(--text-body-size-medium)', marginBottom: 'var(--base-size-4)' }}>{label}</legend>
        <Stack direction="horizontal" gap="condensed">
          <TextInput type={type} aria-label={`${label} from`} placeholder="From" value={String(values[`${fieldId}_from`] ?? '')} onChange={(e) => set(`${fieldId}_from`, e.target.value)} />
          <TextInput type={type} aria-label={`${label} to`} placeholder="To" value={String(values[`${fieldId}_to`] ?? '')} onChange={(e) => set(`${fieldId}_to`, e.target.value)} />
        </Stack>
      </fieldset>
    )
  }
  if (stereotype === 'multiSelect' && options.length > 0) {
    const chosen = multiValues(values[fieldId])
    return (
      <CheckboxGroup>
        <CheckboxGroup.Label>{label}</CheckboxGroup.Label>
        {options.map((o) => (
          <FormControl key={o.value}>
            <Checkbox value={o.value} checked={chosen.includes(o.value)} onChange={(e) => set(fieldId, e.target.checked ? [...chosen, o.value] : chosen.filter((v) => v !== o.value))} />
            <FormControl.Label>{o.label}</FormControl.Label>
          </FormControl>
        ))}
      </CheckboxGroup>
    )
  }
  if (dataType === 'bool' || dataType === 'boolean' || options.length > 0) {
    const opts = options.length > 0 ? options : [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]
    return (
      <FormControl>
        <FormControl.Label>{label}</FormControl.Label>
        <Select block value={String(values[fieldId] ?? '')} onChange={(e) => set(fieldId, e.target.value)}>
          <Select.Option value="">Any</Select.Option>
          {opts.map((o) => <Select.Option key={o.value} value={o.value}>{o.label}</Select.Option>)}
        </Select>
      </FormControl>
    )
  }
  return (
    <FormControl>
      <FormControl.Label>{label}</FormControl.Label>
      <TextInput block type={NUMERIC.has(dataType) ? 'number' : dataType === 'date' ? 'date' : 'text'} value={String(values[fieldId] ?? '')} onChange={(e) => set(fieldId, e.target.value)} />
    </FormControl>
  )
}

/** The applied filters as tokens ("Status: Open, Paid", "Date: 2026-01-01 – 2026-02-01"), each removable. */
export function filterTokens(filters: Dict[], values: Dict): { key: string; text: string; without: Dict }[] {
  const out: { key: string; text: string; without: Dict }[] = []
  for (const f of filters) {
    const fieldId = String(f['fieldId'])
    const label = String(f['label'] ?? fieldId)
    const opts = optionsOf(f)
    const labelOf = (v: string) => opts.find((o) => o.value === v)?.label ?? (v === 'true' ? 'Yes' : v === 'false' ? 'No' : v)
    const from = values[`${fieldId}_from`], to = values[`${fieldId}_to`]
    if (!isBlankFilterValue(from) || !isBlankFilterValue(to)) {
      const without = { ...values }
      delete without[`${fieldId}_from`]
      delete without[`${fieldId}_to`]
      out.push({ key: `${fieldId}_range`, text: `${label}: ${isBlankFilterValue(from) ? '…' : String(from)} – ${isBlankFilterValue(to) ? '…' : String(to)}`, without })
    }
    const v = values[fieldId]
    if (!isBlankFilterValue(v) && !(Array.isArray(v) && v.length === 0)) {
      const without = { ...values }
      delete without[fieldId]
      out.push({ key: fieldId, text: `${label}: ${multiValues(v).map(labelOf).join(', ')}`, without })
    }
  }
  return out
}
