import React from 'react'
import { MultiComboBox, MultiComboBoxItem, Token as Ui5Token, Tokenizer } from '@ui5/webcomponents-react'
import { Text } from '@kit'
import type { WidgetOption } from '@rn/core/fieldOptions'
import { tx } from '@mr/i18n/texts'

type A11y = { 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/** multiSelect / a combobox on a collection: Fiori's multi-combo box (filter as you type, tokens). */
export function MultiSelect({ label, options, value, editable, onChange, a11y, buttonRef, placeholder }: {
  label: string; options: WidgetOption[]; value: string[]; editable: boolean; onChange: (v: string[]) => void; a11y?: A11y; buttonRef?: React.Ref<HTMLElement>; placeholder?: string
}) {
  if (!editable) return <TokenList labels={options.filter((o) => value.includes(o.value)).map((o) => o.label)} />
  return (
    <MultiComboBox ref={buttonRef as never} placeholder={placeholder ?? tx('selectPlaceholder')} accessibleName={label} accessibleNameRef={a11y?.['aria-labelledby']}
      valueState={a11y?.['aria-invalid'] ? 'Negative' : 'None'} style={{ width: '100%' }}
      onSelectionChange={(e: CustomEvent<{ items: HTMLElement[] }>) => onChange(e.detail.items.map((it) => it.getAttribute('data-value') ?? ''))}>
      {options.map((o) => <MultiComboBoxItem key={o.value} data-value={o.value} text={o.label} selected={value.includes(o.value) || undefined} />)}
    </MultiComboBox>
  )
}

/** Picked values shown read-only: Fiori tokens. */
export function TokenList({ labels }: { labels: string[] }) {
  if (labels.length === 0) return <Text>—</Text>
  return <Tokenizer readonly>{labels.map((l, i) => <Ui5Token key={i} text={l} />)}</Tokenizer>
}
