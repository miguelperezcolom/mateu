import React, { useEffect, useState } from 'react'
import { Link, Text, TextInput } from '@kit'
import { decimalDraft, moneyInputCommit, moneyInputText, moneyText } from '@rn/core/uxRules'
import { safeHref } from '@infra/ui/safeNavigate.ts'
export { Stars, Slider, ColorField, RangeInputs } from './valueControls'

export type A11y = { 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/** A link field shown read-only: an anchor (never javascript:), opened in a new tab when absolute. */
export function LinkValue({ value }: { value: string }) {
  if (!value) return <Text>—</Text>
  const href = safeHref(value) ?? '#'
  const external = /^https?:/i.test(href)
  return <Link href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} style={{ overflowWrap: 'anywhere' }}>{value}</Link>
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

