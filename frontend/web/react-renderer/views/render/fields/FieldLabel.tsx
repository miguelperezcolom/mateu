import React from 'react'

// Split out of shell.tsx: a field's label as the design system draws it (Fiori: ui5-label, its own
// required mark) — overridden alone; the frame around it (help, error, the label naming the
// control) stays shared.

/** The label above a field: its text and the required mark; `muted` for a read-only value's. */
export function FieldLabel({ id, label, required, muted, hidden }: { id?: string; label: string; required?: boolean; muted?: boolean; hidden: boolean }) {
  return (
    <span id={id} className={hidden ? 'sr-only' : 'mateu-field-label' + (muted ? ' mateu-field-label-muted' : '')}>
      {label}
      {required && <span aria-hidden="true" className="mateu-field-required"> *</span>}
    </span>
  )
}
