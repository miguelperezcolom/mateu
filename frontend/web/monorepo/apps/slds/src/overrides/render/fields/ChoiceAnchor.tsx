import React from 'react'
import { Token } from '@kit'
import { ChevronDownIcon } from '@kit/icons'
import { st } from '@app/i18n/st'

/**
 * SLDS override of views/render/fields/ChoiceAnchor.tsx: the choice panels open from the Combobox
 * blueprint's faux input (`slds-combobox_container` › `slds-input_faux`), and a multi-pick shows
 * "N selected" with the picks as a pill group under it (SLDS's multi-select combobox).
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
  // SLDS's Combobox trigger: the faux input (`slds-input_faux`) showing the pick, its ▾ icon
  return (
    <div className="slds-combobox_container">
      <div className="slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click">
        <div className="slds-combobox__form-element slds-input-has-icon slds-input-has-icon_right" role="none">
          <button
            type="button"
            {...(props as object)}
            {...a11y}
            aria-labelledby={labelledBy}
            ref={both}
            disabled={disabled}
            className="slds-input_faux slds-combobox__input mateu-combobox-faux"
          >
            <span className="slds-truncate">{text ? text : <span className="slds-text-color_weak">{placeholder}</span>}</span>
          </button>
          <span className="slds-icon_container slds-icon-utility-down slds-input__icon slds-input__icon_right">
            <ChevronDownIcon size={14} className="slds-icon slds-icon slds-icon_x-small slds-icon-text-default" />
          </span>
        </div>
      </div>
    </div>
  )
}

/** A multi-pick: "N selected" in the faux input, the picks as removable pills below. */
export function MultiChoiceAnchor({ props, label, selected, onRemove, placeholder, a11y, buttonRef }: {
  props: React.HTMLAttributes<HTMLElement>; label: string; selected: { id: string; text: string }[]; onRemove: (id: string) => void
  placeholder: string; a11y?: A11y; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  return (
    <div>
      <ChoiceAnchor props={props} text={selected.length ? st('nSelected', { n: selected.length }) : ''} placeholder={placeholder} a11y={a11y} buttonRef={buttonRef} />
      {selected.length > 0 && (
        <div className="slds-listbox_selection-group">
          <ul className="slds-listbox slds-listbox_horizontal" aria-label={label}>
            {selected.map((sel) => (
              <li key={sel.id} className="slds-listbox-item">
                <Token text={sel.text} onRemove={() => onRemove(sel.id)} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
