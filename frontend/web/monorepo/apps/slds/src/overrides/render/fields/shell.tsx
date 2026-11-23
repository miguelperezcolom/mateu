import React, { useId } from 'react'
import '@mr/views/render/fields/fields.css'

/**
 * The label / caption / validation frame for a widget the kit's FormControl does not take as its
 * input (stars, a slider row, a tree, a canvas…): the same look, and the label NAMES the widget
 * (`aria-labelledby` through the render prop), the help and the error DESCRIBE it.
 */
/** A field the server sent with no label (a grid field under its own section title): the name stays
 *  for a screen reader, nothing is painted — the field id is never shown as if it were a label. */
export const UnlabelledField = React.createContext(false)

export function FieldShell({ label, required, help, error, children }: {
  label: string
  required?: boolean
  help?: string
  error?: string
  children: (a11y: { 'aria-labelledby': string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => React.ReactNode
}) {
  const id = useId()
  const labelId = `${id}-label`
  const helpId = help ? `${id}-help` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [errorId, helpId].filter(Boolean).join(' ') || undefined
  // SLDS's Form Element: the label (the required asterisk), the control, the help, the error (slds-has-error)
  return (
    <div className={'slds-form-element mateu-field' + (error ? ' slds-has-error' : '')}>
      <span id={labelId} className={React.useContext(UnlabelledField) ? 'slds-assistive-text' : 'slds-form-element__label'}>
        {required && <abbr className="slds-required" aria-hidden="true">* </abbr>}
        {label}
      </span>
      <div className="slds-form-element__control">
        {children({ 'aria-labelledby': labelId, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      </div>
      {help && <div id={helpId} className="slds-form-element__help mateu-form-caption">{help}</div>}
      {error && <div id={errorId} className="slds-form-element__help" role="alert">{error}</div>}
    </div>
  )
}

/** A read-only value: its label above, the value as text ("—" when empty). */
export function ReadOnlyShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="slds-form-element slds-form-element_readonly mateu-field">
      <span className={React.useContext(UnlabelledField) ? 'slds-assistive-text' : 'slds-form-element__label'}>{label}</span>
      <div className="slds-form-element__control"><div className="slds-form-element__static">{children}</div></div>
    </div>
  )
}
