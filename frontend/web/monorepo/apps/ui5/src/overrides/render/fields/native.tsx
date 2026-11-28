import React from 'react'
import { ComboBox, ComboBoxItem, StepInput } from '@ui5/webcomponents-react'
import type { Rule } from '@mr/views/render/FieldRenderer'
import { NOT_MINE } from '@mr/views/render/fields/rule'
import { tx } from '@mr/i18n/texts'
import { lazyPicker } from '@app/ui5/lazyPickers'

/**
 * Fiori's own field controls (the shared FieldRenderer tries these before its generic select and
 * text input): the date / time pickers, the step input for a bounded whole number, the combo box
 * for a long list.
 */

const INTEGER = new Set(['integer', 'int', 'long', 'Integer', 'Long'])
const TEXT_STEREOTYPES = new Set(['password', 'email', 'link', 'textarea'])

// the wire's ISO value in and out (valueFormat); shown in the user's locale (displayFormat)
const PICKERS: Record<string, { component: React.ElementType; format: string; display: string }> = {
  date: { component: lazyPicker('DatePicker'), format: 'yyyy-MM-dd', display: 'medium' },
  time: { component: lazyPicker('TimePicker'), format: 'HH:mm', display: '' },
  datetime: { component: lazyPicker('DateTimePicker'), format: "yyyy-MM-dd'T'HH:mm", display: 'medium' },
  dateTime: { component: lazyPicker('DateTimePicker'), format: "yyyy-MM-dd'T'HH:mm", display: 'medium' },
}

// a long list: Fiori's combo box (type to filter); a short one stays a select
const longList: Rule = ({ stereotype, options, text, ref, placeholder, disabled, required, status, commitOne, shell }) => {
  if (options.length <= 12 || stereotype === 'radio' || stereotype === 'listBox') return NOT_MINE
  return shell((a11y) => (
    <ComboBox ref={ref as never} value={options.find((o) => o.value === text)?.label ?? ''} placeholder={placeholder ?? tx('selectPlaceholder')} disabled={disabled || undefined}
      required={required || undefined} accessibleNameRef={a11y['aria-labelledby']} valueState={status ? 'Negative' : 'None'} style={{ width: '100%' }}
      onSelectionChange={(e: { detail: { item?: HTMLElement | null } }) => commitOne(e.detail.item?.getAttribute('data-value') ?? '')}>
      {options.map((o) => <ComboBoxItem key={o.value} data-value={o.value} text={o.label} />)}
    </ComboBox>
  ))
}

// dates and times: Fiori's pickers (the wire's ISO value in, out)
const picker: Rule = ({ dataType, stereotype, options, m, text, ref, placeholder, disabled, required, status, commit, shell }) => {
  const p = PICKERS[dataType]
  if (!p || TEXT_STEREOTYPES.has(stereotype) || options.length > 0 || m.optionsSource) return NOT_MINE
  const Picker = p.component
  const value = dataType === 'time' ? text.slice(0, 5) : p.format.includes('HH') ? text.slice(0, 16) : text.slice(0, 10)
  return shell((a11y) => (
    <Picker ref={ref as never} value={value} valueFormat={p.format} displayFormat={p.display || undefined} placeholder={placeholder} disabled={disabled || undefined} required={required || undefined}
      accessibleNameRef={a11y['aria-labelledby']} accessibleDescriptionRef={a11y['aria-describedby']} valueState={status ? 'Negative' : 'None'} style={{ width: '100%' }}
      onChange={(e: Event) => commit((e.target as unknown as { value: string }).value || null)} />
  ))
}

// a whole number with bounds or a step: Fiori's step input
const stepInput: Rule = ({ dataType, stereotype, options, m, text, ref, disabled, required, status, commit, shell }) => {
  if (!INTEGER.has(dataType) || (stereotype && stereotype !== 'regular') || options.length > 0 || !(m['min'] != null || m['max'] != null || m['step'])) return NOT_MINE
  return shell((a11y) => (
    <StepInput ref={ref as never} value={text === '' ? undefined : Number(text)} min={m['min'] != null ? Number(m['min']) : undefined} max={m['max'] != null ? Number(m['max']) : undefined}
      step={m['step'] ? Number(m['step']) : 1} disabled={disabled || undefined} required={required || undefined} accessibleNameRef={a11y['aria-labelledby']}
      valueState={status ? 'Negative' : 'None'} style={{ width: '100%' }}
      onChange={(e: Event) => commit(Number((e.target as unknown as { value: number }).value))} />
  ))
}

export const NATIVE_RULES: Rule[] = [longList, picker, stepInput]
