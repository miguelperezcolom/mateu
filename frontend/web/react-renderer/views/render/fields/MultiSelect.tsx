import React, { useState } from 'react'
import { SelectPanel, Text, Token } from '@kit'
import type { WidgetOption } from '@rn/core/fieldOptions'
import { tx } from '@mr/i18n/texts'
import { MultiChoiceAnchor, type A11y } from './ChoiceAnchor'
import { type Item, itemOf } from './choices'

// Split out of choices.tsx: a design system with its own markup for it overrides only this file.

/** multiSelect / a combobox on a collection: Primer's SelectPanel, several picks, filterable. */
export function MultiSelect({ label, options, value, editable, onChange, a11y, buttonRef, placeholder }: {
  label: string; options: WidgetOption[]; value: string[]; editable: boolean; onChange: (v: string[]) => void; a11y?: A11y; buttonRef?: React.Ref<HTMLButtonElement>; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const items = options.map(itemOf)
  const selected = items.filter((i) => value.includes(i.id))
  const shown = items.filter((i) => i.text.toLowerCase().includes(filter.toLowerCase()))
  if (!editable) return <TokenList labels={selected.map((s) => s.text)} />
  return (
    <SelectPanel
      title={label}
      open={open}
      onOpenChange={(o) => { setOpen(o); if (!o) setFilter('') }}
      items={shown}
      selected={selected}
      onSelectedChange={((picked: Item[]) => onChange(picked.map((p) => p.id))) as never}
      onFilterChange={setFilter}
      showSelectedOptionsFirst={false}
      renderAnchor={(props) => <MultiChoiceAnchor props={props} label={label} selected={selected} onRemove={(id) => onChange(value.filter((v) => v !== id))} placeholder={placeholder ?? tx('selectPlaceholder')} a11y={a11y} buttonRef={buttonRef} />}
    />
  )
}

/** Picked values shown read-only as Primer tokens. */
export function TokenList({ labels }: { labels: string[] }) {
  if (!labels.length) return <Text>—</Text>
  return <div style={{ display: 'flex', gap: 'var(--base-size-4)', flexWrap: 'wrap' }}>{labels.map((l) => <Token key={l} text={l} />)}</div>
}
