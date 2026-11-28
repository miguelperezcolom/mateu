import React, { useId, useState } from 'react'
import { Button as Ui5Button, Input, RatingIndicator, ResponsivePopover, Slider as Ui5Slider, StepInput } from '@ui5/webcomponents-react'
import { lazyPicker } from '@app/ui5/lazyPickers'
import { Text } from '@kit'
import { tx } from '@mr/i18n/texts'
import type { A11y } from '@mr/views/render/fields/basic'

const ColorPicker = lazyPicker('ColorPicker')

const DateRangePicker = lazyPicker('DateRangePicker')

/** @Stereotype(stars): Fiori's rating indicator (arrows move, the value is the count). */
export function Stars({ value, editable, onChange, a11y, max = 5 }: { value: number; editable: boolean; onChange: (v: number) => void; a11y?: A11y; max?: number }) {
  const v = Math.max(0, Math.min(max, Math.round(value) || 0))
  return (
    <RatingIndicator value={v} max={max} displayOnly={!editable || undefined} accessibleNameRef={a11y?.['aria-labelledby']}
      accessibleName={!editable ? `${v} / ${max}` : undefined}
      onChange={(e: Event) => onChange(Number((e.target as unknown as { value: number }).value))} />
  )
}

/** @Stereotype(slider): Fiori's slider between @SliderMin and @SliderMax, its value in a tooltip. */
export function Slider({ value, min, max, step, editable, onChange, a11y, inputRef }: {
  value: number; min: number; max: number; step: number; editable: boolean; onChange: (v: number) => void; a11y?: A11y; inputRef?: React.Ref<HTMLElement>
}) {
  return (
    <Ui5Slider ref={inputRef as never} min={min} max={max} step={step || 1} value={value} disabled={!editable || undefined} showTooltip
      accessibleName={undefined} aria-labelledby={a11y?.['aria-labelledby']} style={{ width: '100%' }}
      onInput={(e: Event) => onChange(Number((e.target as unknown as { value: number }).value))} />
  )
}

/** @Stereotype(color): the hex value in an input, Fiori's colour picker in a popover from its swatch. */
export function ColorField({ value, editable, onChange, a11y, inputRef }: { value: string; editable: boolean; onChange: (v: string) => void; a11y?: A11y; inputRef?: React.Ref<HTMLElement> }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'
  const id = `c${useId().replace(/:/g, '')}`
  const [open, setOpen] = useState(false)
  if (!editable) return <Text><span className="mateu-swatch" style={{ background: hex }} aria-hidden="true" />{value || '—'}</Text>
  return (
    <div className="mateu-color">
      <Ui5Button id={id} design="Transparent" tooltip={tx('hexValue')} accessibleName={tx('hexValue')} onClick={() => setOpen((o) => !o)}>
        <span className="mateu-swatch" style={{ background: hex }} aria-hidden="true" />
      </Ui5Button>
      <Input ref={inputRef as never} value={value} accessibleNameRef={a11y?.['aria-labelledby']} onInput={(e: Event) => onChange((e.target as HTMLInputElement).value)} />
      <ResponsivePopover opener={id} open={open} onClose={() => setOpen(false)}>
        {open && (
          <ColorPicker value={hex} onChange={(e: Event) => {
            const c = String((e.target as unknown as { value: string }).value ?? '')
            const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c)
            onChange(m ? '#' + [m[1], m[2], m[3]].map((n) => Number(n).toString(16).padStart(2, '0')).join('') : c)
          }} />
        )}
      </ResponsivePopover>
    </div>
  )
}

/**
 * dateRange / numberRange: two bounds written as `<field>_from` / `<field>_to` (what listing
 * filters and the server's FilterCriteriaBuilder read) — Fiori's date range picker, or two step
 * inputs for numbers.
 */
export function RangeInputs({ fieldId, date, state, editable, onChange, a11y }: {
  fieldId: string; date: boolean; state: Record<string, unknown>; editable: boolean; onChange: (key: string, v: unknown) => void; a11y?: A11y
}) {
  const [local, setLocal] = useState<Record<string, unknown>>({})
  const valueOf = (k: string) => {
    const v = k in local ? local[k] : state[k]
    return v === null || v === undefined ? '' : String(v)
  }
  const put = (k: string, v: unknown) => {
    setLocal((l) => ({ ...l, [k]: v }))
    onChange(k, v)
  }
  const from = `${fieldId}_from`
  const to = `${fieldId}_to`
  if (date) {
    const shown = valueOf(from) || valueOf(to) ? `${valueOf(from)} - ${valueOf(to)}` : ''
    return (
      <DateRangePicker value={shown} valueFormat="yyyy-MM-dd" delimiter="-" disabled={!editable || undefined} accessibleNameRef={a11y?.['aria-labelledby']} accessibleDescriptionRef={a11y?.['aria-describedby']} style={{ width: '100%' }}
        onChange={(e: Event) => {
          const t = e.target as unknown as { startDateValue?: Date | null; endDateValue?: Date | null; value: string }
          const [a = '', b = ''] = String(t.value ?? '').split(' - ').map((x) => x.trim())
          put(from, a || null)
          put(to, b || a || null)
        }} />
    )
  }
  const num = (k: string) => (valueOf(k) === '' ? undefined : Number(valueOf(k)))
  return (
    <div className="mateu-range" role="group" {...a11y}>
      <StepInput value={num(from)} accessibleName={tx('rangeFrom')} disabled={!editable || undefined} style={{ flex: 1 }}
        onChange={(e: Event) => put(from, Number((e.target as unknown as { value: number }).value))} />
      <span className="mateu-range-sep" aria-hidden="true">–</span>
      <StepInput value={num(to)} accessibleName={tx('rangeTo')} disabled={!editable || undefined} style={{ flex: 1 }}
        onChange={(e: Event) => put(to, Number((e.target as unknown as { value: number }).value))} />
    </div>
  )
}
