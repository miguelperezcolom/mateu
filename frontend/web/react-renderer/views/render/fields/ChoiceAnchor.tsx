import React from 'react'
import { Button } from '@kit'
import { TriangleDownIcon } from '@kit/icons'

/**
 * The anchors the choice panels open from (select, combobox, multiSelect). Their markup is the
 * design system's own trigger, so a renderer whose design system draws a different trigger
 * structure (SLDS: the combobox's faux input, picked values as a pill group) overrides this file.
 */
export type A11y = { 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/** The anchor button every panel opens from: the picked text, or the placeholder in muted ink. */
export function ChoiceAnchor({ props, text, placeholder, disabled, a11y, buttonRef }: {
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

/** A multi-pick panel's anchor: here the picked texts joined, like one choice. */
export function MultiChoiceAnchor({ props, selected, placeholder, a11y, buttonRef }: {
  props: React.HTMLAttributes<HTMLElement>; label: string; selected: { id: string; text: string }[]; onRemove: (id: string) => void
  placeholder: string; a11y?: A11y; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  return <ChoiceAnchor props={props} text={selected.map((s) => s.text).join(', ')} placeholder={placeholder} a11y={a11y} buttonRef={buttonRef} />
}
