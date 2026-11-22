import React, { useState } from 'react'
import { AnchoredOverlay, Button, Text } from '@kit'
import { TriangleDownIcon } from '@kit/icons'
import type { WidgetOption } from '@rn/core/fieldOptions'
import { ChoiceCards } from './choiceCards'
import { tx } from '@mr/i18n/texts'

type A11y = { 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/**
 * @Stereotype(popover): the web's popover choice — the picked value(s) on a trigger, the options as
 * selectable cards in an overlay anchored to it. One pick closes it; on a collection it stays open.
 */
export function PopoverChoice({ options, value, multiple, editable, onChange, a11y, buttonRef }: {
  options: WidgetOption[]; value: string[]; multiple: boolean; editable: boolean
  onChange: (v: string[]) => void; a11y?: A11y; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  const [open, setOpen] = useState(false)
  const shown = options.filter((o) => value.includes(o.value)).map((o) => o.label).join(', ') || value.join(', ')
  if (!editable) return <Text>{shown || '—'}</Text>
  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      renderAnchor={(props) => (
        <Button {...(props as object)} {...a11y} ref={mergeRefs((props as { ref?: React.Ref<HTMLButtonElement> }).ref, buttonRef)} trailingAction={TriangleDownIcon} alignContent="start">
          {shown || <span style={{ color: 'var(--fgColor-muted)' }}>{tx('selectPlaceholder')}</span>}
        </Button>
      )}
      width="large"
    >
      <div style={{ padding: 'var(--base-size-12)' }}>
        <ChoiceCards
          options={options}
          value={value}
          multiple={multiple}
          editable
          a11y={a11y as Record<string, unknown> | undefined}
          onChange={(v) => {
            onChange(v)
            if (!multiple) setOpen(false)
          }}
        />
      </div>
    </AnchoredOverlay>
  )
}

/**
 * @Stereotype(button): the field drawn as a button — its text the value (else the label); pressing
 * it runs the field's action (`actionId`, as a grid's button column does), with the field and its
 * value as parameters. A field with no action is a read-only value shown on a button-looking chip.
 */
export function FieldButton({ text, actionId, disabled, onPress, buttonRef }: {
  text: string; actionId: string; disabled: boolean; onPress: () => void; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  return (
    <div>
      <Button ref={buttonRef} disabled={disabled || !actionId} onClick={onPress}>{text || '—'}</Button>
    </div>
  )
}

export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): (el: T | null) => void {
  return (el) => {
    for (const r of refs) {
      if (typeof r === 'function') r(el)
      else if (r) (r as React.MutableRefObject<T | null>).current = el
    }
  }
}
