import React from 'react'
import { CheckCircleFillIcon } from '@primer/octicons-react'
import type { WidgetOption } from '@rn/core/fieldOptions'

/**
 * @Stereotype(choice): the options as selectable cards (the web's mateu-choice) — a radio group,
 * or a group of checkboxes on a collection. Arrow keys move like the native controls.
 */
export function ChoiceCards({ options, value, multiple, editable, onChange, a11y }: {
  options: WidgetOption[]; value: string[]; multiple: boolean; editable: boolean; onChange: (v: string[]) => void
  a11y?: Record<string, unknown>
}) {
  const toggle = (v: string) => {
    if (!editable) return
    if (multiple) onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
    else onChange([v])
  }
  return (
    <div className="mateu-choice-cards" role={multiple ? 'group' : 'radiogroup'} {...a11y}>
      {options.map((o, i) => {
        const on = value.includes(o.value)
        return (
          <button
            key={o.value}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            disabled={!editable}
            tabIndex={multiple || on || (value.length === 0 && i === 0) ? 0 : -1}
            className="mateu-choice-card"
            onClick={() => toggle(o.value)}
            onKeyDown={(e) => {
              if (multiple) return
              const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0
              if (!step) return
              e.preventDefault()
              const next = options[(i + step + options.length) % options.length]
              onChange([next.value])
              ;((e.currentTarget.parentElement?.children[(i + step + options.length) % options.length]) as HTMLElement | undefined)?.focus()
            }}
          >
            <span>{o.label}</span>
            {on && <CheckCircleFillIcon className="mateu-choice-check" />}
          </button>
        )
      })}
    </div>
  )
}
