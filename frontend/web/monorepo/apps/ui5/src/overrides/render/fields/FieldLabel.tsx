import React from 'react'
import { Label as Ui5Label } from '@ui5/webcomponents-react'

/** Fiori's label above a field (ui5-label, its own required mark), which NAMES the control. */
export function FieldLabel({ id, label, required, hidden }: { id?: string; label: string; required?: boolean; muted?: boolean; hidden: boolean }) {
  return (
    <span className={hidden ? 'sr-only' : 'mateu-field-label'}>
      <Ui5Label id={id} required={required || undefined} wrappingType="Normal">{label}</Ui5Label>
    </span>
  )
}
