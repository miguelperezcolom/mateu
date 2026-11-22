import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ActionList, AnchoredOverlay, Button, SelectPanel, Text, Token, TreeView } from '@kit'
import { TriangleDownIcon } from '@kit/icons'
import type { WidgetOption } from '@rn/core/fieldOptions'
import { useController } from '@mr/render/ViewHost'
import { tx } from '@mr/i18n/texts'

type A11y = { 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }
type Item = { id: string; text: string; description?: string }

const itemOf = (o: WidgetOption): Item => ({ id: o.value, text: o.label })

/** The anchor button every panel opens from: the picked text, or the placeholder in muted ink. */
function Anchor({ props, text, placeholder, disabled, a11y, buttonRef }: {
  props: React.HTMLAttributes<HTMLElement>; text: string; placeholder: string; disabled?: boolean; a11y?: A11y; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  // the overlay positions itself off ITS ref on the anchor; the field's focus ref rides along
  const theirs = (props as { ref?: React.Ref<HTMLButtonElement> }).ref
  const both = (el: HTMLButtonElement | null) => {
    for (const r of [theirs, buttonRef]) {
      if (typeof r === 'function') r(el)
      else if (r) (r as React.MutableRefObject<HTMLButtonElement | null>).current = el
    }
  }
  // named "<label> <value>": the field's label, then what is picked (the anchor's own text)
  const ownId = (props as { id?: string }).id
  const labelledBy = a11y?.['aria-labelledby'] && ownId ? `${a11y['aria-labelledby']} ${ownId}` : a11y?.['aria-labelledby']
  return (
    <Button
      {...(props as object)}
      {...a11y}
      aria-labelledby={labelledBy}
      ref={both}
      disabled={disabled}
      trailingAction={TriangleDownIcon}
      block
      alignContent="start"
    >
      {text ? text : <span style={{ color: 'var(--fgColor-muted)' }}>{placeholder}</span>}
    </Button>
  )
}

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
      renderAnchor={(props) => <Anchor props={props} text={selected.map((s) => s.text).join(', ')} placeholder={placeholder ?? tx('selectPlaceholder')} a11y={a11y} buttonRef={buttonRef} />}
    />
  )
}

/** Picked values shown read-only as Primer tokens. */
export function TokenList({ labels }: { labels: string[] }) {
  if (!labels.length) return <Text>—</Text>
  return <div style={{ display: 'flex', gap: 'var(--base-size-4)', flexWrap: 'wrap' }}>{labels.map((l) => <Token key={l} text={l} />)}</div>
}

/** @Stereotype(listBox): the options always visible (one, or several on a collection). */
export function ListBox({ options, value, multiple, editable, onChange, a11y }: {
  options: WidgetOption[]; value: string[]; multiple: boolean; editable: boolean; onChange: (v: string[]) => void; a11y?: A11y
}) {
  return (
    <div className="mateu-listbox">
      <ActionList selectionVariant={multiple ? 'multiple' : 'single'} role="listbox" {...a11y} aria-multiselectable={multiple || undefined} showDividers={false}>
        {options.map((o) => {
          const on = value.includes(o.value)
          return (
            <ActionList.Item
              key={o.value}
              role="option"
              selected={on}
              aria-selected={on}
              disabled={!editable}
              onSelect={() => onChange(multiple ? (on ? value.filter((v) => v !== o.value) : [...value, o.value]) : [o.value])}
            >
              {o.label}
            </ActionList.Item>
          )
        })}
      </ActionList>
    </div>
  )
}

export interface TreeOption { value: unknown; label: string; children?: TreeOption[] | null }

const labelIn = (opts: TreeOption[], v: string): string | null => {
  for (const o of opts) {
    if (String(o.value) === v) return o.label
    const sub = labelIn(o.children ?? [], v)
    if (sub != null) return sub
  }
  return null
}

/** @TreeSelect: a button opening Primer's TreeView; with leavesOnly a group only unfolds. */
export function TreeSelect({ options, leavesOnly, value, editable, onChange, a11y, buttonRef, placeholder }: {
  options: TreeOption[]; leavesOnly: boolean; value: string; editable: boolean; onChange: (v: string) => void; a11y?: A11y; buttonRef?: React.Ref<HTMLButtonElement>; placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const label = value ? labelIn(options, value) ?? value : ''
  if (!editable) return <Text>{label || '—'}</Text>
  const nodes = (opts: TreeOption[], path: string): React.ReactNode =>
    opts.map((o, i) => {
      const v = String(o.value)
      const kids = o.children ?? []
      const group = kids.length > 0
      return (
        <TreeView.Item
          key={`${path}${i}`}
          id={`${path}${i}`}
          current={v === value}
          defaultExpanded={group && labelIn(kids, value) != null}
          // a group under leavesOnly only unfolds: no onSelect, so TreeView toggles it on click
          onSelect={group && leavesOnly ? undefined : () => {
            onChange(v)
            setOpen(false)
          }}
        >
          {o.label}
          {group && <TreeView.SubTree>{nodes(kids, `${path}${i}-`)}</TreeView.SubTree>}
        </TreeView.Item>
      )
    })
  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderAnchor={(props) => <Anchor props={props} text={label} placeholder={placeholder ?? tx('selectPlaceholder')} a11y={a11y} buttonRef={buttonRef} />}
      focusZoneSettings={{ disabled: true }}
    >
      <div className="mateu-tree-panel">
        <TreeView aria-label={tx('options')}>{nodes(options, 't')}</TreeView>
      </div>
    </AnchoredOverlay>
  )
}

/**
 * @Lookup / searchable / a remote combobox: a SelectPanel whose typing (debounced) runs the
 * field's `search-<field>` action; the page of options arrives as the field's data
 * (`{content: [{value, label}]}`), handed over by the controller's field data handler.
 */
export function Lookup({ label, fieldId, value, valueLabel, action, editable, onChange, a11y, buttonRef, placeholder }: {
  label: string; fieldId: string; value: string; valueLabel?: string; action?: string | null; editable: boolean; onChange: (v: string) => void; a11y?: A11y; buttonRef?: React.Ref<HTMLButtonElement>; placeholder?: string
}) {
  const controller = useController()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [found, setFound] = useState<Item[]>([])
  const [picked, setPicked] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const searchAction = action || `search-${fieldId}`

  useEffect(() => {
    controller.registerFieldDataHandler(fieldId, (data) => {
      const page = data as { content?: unknown[] } | unknown[] | null
      const content = (Array.isArray(page) ? page : page?.content ?? []) as { value?: unknown; label?: unknown; description?: unknown }[]
      setFound(content.filter((o) => o && o.value !== undefined && o.value !== null).map((o) => ({
        id: String(o.value), text: String(o.label ?? o.value), description: o.description ? String(o.description) : undefined,
      })))
      setLoading(false)
    })
    return () => controller.unregisterFieldDataHandler(fieldId)
  }, [controller, fieldId])

  const search = (text: string) => {
    setLoading(true)
    void controller.runAction(searchAction, { searchText: text }, true)
  }
  const display = picked ?? (value ? valueLabel || value : '')
  const selected = useMemo(() => (value ? found.find((f) => f.id === value) ?? { id: value, text: display } : undefined), [found, value, display])

  if (!editable) return <Text>{display || '—'}</Text>
  return (
    <SelectPanel
      title={label}
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (o) search('')
      }}
      items={found}
      selected={selected}
      onSelectedChange={((item: Item | undefined) => {
        setPicked(item ? item.text : null)
        onChange(item ? item.id : '')
      }) as never}
      onFilterChange={(text) => {
        if (timer.current) clearTimeout(timer.current)
        timer.current = setTimeout(() => search(text), 300)
      }}
      loading={loading}
      message={!loading && found.length === 0 ? { title: tx('noResults'), body: tx('tryAnotherSearch'), variant: 'empty' } : undefined}
      renderAnchor={(props) => <Anchor props={props} text={display} placeholder={placeholder ?? tx('selectPlaceholder')} a11y={a11y} buttonRef={buttonRef} />}
    />
  )
}
