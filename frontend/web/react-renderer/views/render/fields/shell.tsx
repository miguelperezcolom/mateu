import React, { useId } from 'react'
import { Text } from '@kit'
import { AlertFillIcon } from '@kit/icons'
import './fields.css'

/**
 * The label / caption / validation frame for a widget Primer's FormControl does not take as its
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
  return (
    <div className="mateu-field">
      <span id={labelId} className={React.useContext(UnlabelledField) ? 'sr-only' : 'mateu-field-label'}>
        {label}
        {required && <span aria-hidden="true" className="mateu-field-required"> *</span>}
      </span>
      {children({ 'aria-labelledby': labelId, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      {help && <Text as="p" id={helpId} size="small" className="mateu-field-help">{help}</Text>}
      {error && (
        <Text as="p" id={errorId} size="small" className="mateu-field-error" role="alert">
          <AlertFillIcon size={12} /> {error}
        </Text>
      )}
    </div>
  )
}

/** A read-only value: its label above, the value as text ("—" when empty). */
export function ReadOnlyShell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mateu-field">
      <span className={React.useContext(UnlabelledField) ? 'sr-only' : 'mateu-field-label mateu-field-label-muted'}>{label}</span>
      <div>{children}</div>
    </div>
  )
}
