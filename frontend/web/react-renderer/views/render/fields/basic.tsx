import React, { useEffect, useState } from 'react'
import { Link, Text, TextInput } from '@kit'
import { StarFillIcon, StarIcon } from '@kit/icons'
import { decimalDraft, moneyInputCommit, moneyInputText, moneyText } from '@rn/core/uxRules'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { tx } from '@mr/i18n/texts'

type A11y = { 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/** @Stereotype(stars): five stars, a radio group (arrows move, the value is the count). */
export function Stars({ value, editable, onChange, a11y, max = 5 }: { value: number; editable: boolean; onChange: (v: number) => void; a11y?: A11y; max?: number }) {
  const v = Math.max(0, Math.min(max, Math.round(value) || 0))
  if (!editable) {
    return (
      <span className="mateu-stars" role="img" aria-label={`${v} of ${max} stars`}>
        {Array.from({ length: max }, (_, i) => <span key={i} className={i < v ? 'on' : undefined}>{i < v ? <StarFillIcon /> : <StarIcon />}</span>)}
      </span>
    )
  }
  const move = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(max, v + 1)) }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(0, v - 1)) }
  }
  return (
    <span className="mateu-stars" role="radiogroup" {...a11y} onKeyDown={move}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={i + 1 === v}
          aria-label={`${i + 1} star${i ? 's' : ''}`}
          tabIndex={i + 1 === v || (v === 0 && i === 0) ? 0 : -1}
          className={i < v ? 'on' : undefined}
          // pressing the current value again clears it
          onClick={() => onChange(i + 1 === v ? 0 : i + 1)}
        >
          {i < v ? <StarFillIcon /> : <StarIcon />}
        </button>
      ))}
    </span>
  )
}

/** @Stereotype(slider): a range input between @SliderMin and @SliderMax, the value beside it. */
export function Slider({ value, min, max, step, editable, onChange, a11y, inputRef }: {
  value: number; min: number; max: number; step: number; editable: boolean; onChange: (v: number) => void; a11y?: A11y; inputRef?: React.Ref<HTMLInputElement>
}) {
  return (
    <div className="mateu-slider">
      <input ref={inputRef} type="range" min={min} max={max} step={step || 1} value={value} disabled={!editable} onChange={(e) => onChange(Number(e.target.value))} {...a11y} />
      <output aria-hidden="true">{value}</output>
    </div>
  )
}

/** @Stereotype(color): the native colour picker beside its hex text (either edits the value). */
export function ColorField({ value, editable, onChange, a11y, inputRef }: { value: string; editable: boolean; onChange: (v: string) => void; a11y?: A11y; inputRef?: React.Ref<HTMLInputElement> }) {
  const hex = /^#[0-9a-f]{6}$/i.test(value) ? value : '#000000'
  if (!editable) return <Text><span className="mateu-swatch" style={{ background: hex }} aria-hidden="true" />{value || '—'}</Text>
  return (
    <div className="mateu-color">
      <input ref={inputRef} type="color" value={hex} onChange={(e) => onChange(e.target.value)} {...a11y} />
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} aria-label={tx('hexValue')} size="small" monospace />
    </div>
  )
}

/** A link field shown read-only: an anchor (never javascript:), opened in a new tab when absolute. */
export function LinkValue({ value }: { value: string }) {
  if (!value) return <Text>—</Text>
  const href = safeHref(value) ?? '#'
  const external = /^https?:/i.test(href)
  return <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>{value}</Link>
}

/**
 * A money input's behaviour (spread on a Primer TextInput, so FormControl labels it): the plain
 * number while typing (an Amount keeps its currency and locale), the formatted amount once focus
 * leaves — the RN core's money rules.
 */
export function useMoneyInput(raw: unknown, onChange: (v: unknown) => void) {
  const external = moneyInputText(raw)
  const [draft, setDraft] = useState(external)
  const [focused, setFocused] = useState(false)
  useEffect(() => setDraft((d) => decimalDraft(d, external)), [external])
  const currency = raw && typeof raw === 'object' && typeof (raw as { currency?: unknown }).currency === 'string' ? (raw as { currency: string }).currency : undefined
  return {
    inputMode: 'decimal' as const,
    value: focused || external === '' ? draft : moneyText(raw),
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setDraft(e.target.value); onChange(moneyInputCommit(raw, e.target.value)) },
    trailingVisual: currency,
  }
}

/**
 * dateRange / numberRange: two bounds written as `<field>_from` / `<field>_to` (what listing
 * filters and the server's FilterCriteriaBuilder read).
 */
export function RangeInputs({ fieldId, date, state, editable, onChange, a11y }: {
  fieldId: string; date: boolean; state: Record<string, unknown>; editable: boolean; onChange: (key: string, v: unknown) => void; a11y?: A11y
}) {
  const [local, setLocal] = useState<Record<string, unknown>>({})
  const valueOf = (k: string) => {
    const v = k in local ? local[k] : state[k]
    return v === null || v === undefined ? '' : String(v)
  }
  const put = (k: string, text: string) => {
    const v = text === '' ? null : date ? text : Number(text)
    setLocal((l) => ({ ...l, [k]: v }))
    onChange(k, v)
  }
  const type = date ? 'date' : 'number'
  return (
    <div className="mateu-range" role="group" {...a11y}>
      <TextInput type={type} aria-label={tx('rangeFrom')} value={valueOf(`${fieldId}_from`)} disabled={!editable} onChange={(e) => put(`${fieldId}_from`, e.target.value)} block />
      <span className="mateu-range-sep" aria-hidden="true">–</span>
      <TextInput type={type} aria-label={tx('rangeTo')} value={valueOf(`${fieldId}_to`)} disabled={!editable} onChange={(e) => put(`${fieldId}_to`, e.target.value)} block />
    </div>
  )
}
