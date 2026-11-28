import React from 'react'
import { Datepicker, DatetimePicker, Timepicker } from '@kit'
import type { Rule } from '@mr/views/render/FieldRenderer'
import { NOT_MINE } from '@mr/views/render/fields/rule'

/**
 * SLDS override of views/render/fields/native.tsx: date, time and date-time fields are SLDS's
 * Datepicker / Timepicker blueprints (a calendar dialog, a listbox of times), not the native input.
 * The shared FieldRenderer tries these rules before its generic text input.
 */
const TEXT_STEREOTYPES = new Set(['password', 'email', 'link', 'textarea'])

const PICKERS: Record<string, { Picker: typeof Datepicker; cut: number }> = {
  date: { Picker: Datepicker, cut: 10 },
  time: { Picker: Timepicker, cut: 5 },
  datetime: { Picker: DatetimePicker, cut: 16 },
  dateTime: { Picker: DatetimePicker, cut: 16 },
}

// dates and times: the wire's ISO value in and out
const picker: Rule = ({ dataType, stereotype, options, m, text, ref, placeholder, disabled, required, status, commit, shell }) => {
  const p = PICKERS[dataType]
  if (!p || TEXT_STEREOTYPES.has(stereotype) || options.length > 0 || m.optionsSource) return NOT_MINE
  const { Picker } = p
  return shell((a11y) => (
    <Picker value={text.slice(0, p.cut)} onChange={(v) => commit(v || null)} inputRef={ref as never} placeholder={placeholder}
      disabled={disabled} required={required} validationStatus={status} {...a11y} />
  ))
}

export const NATIVE_RULES: Rule[] = [picker]
