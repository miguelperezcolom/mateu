import { html, nothing, type LitElement, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderFormLayout } from '@infra/ui/renderers/renderLayouts'
import './mateu-spectra-form' // registers <mateu-spectra-form>
import type { FormFieldDef } from './mateu-spectra-form'

const BASIC_DATATYPES = new Set(['string', 'integer', 'number', 'double', 'money', 'boolean', 'date', 'datetime', 'date-time'])
const OJ_TYPE: Record<string, string> = {
  integer: 'integer',
  number: 'number',
  double: 'number',
  money: 'number',
  boolean: 'boolean',
  date: 'date',
  datetime: 'date-time',
  'date-time': 'date-time',
}
const OK_STEREOTYPES = new Set(['', 'regular', 'plainText', 'money'])

interface FieldMeta {
  fieldId: string
  label?: string
  dataType?: string
  stereotype?: string
  required?: boolean
  readOnly?: boolean
  initialValue?: unknown
  options?: unknown[]
  columns?: unknown[]
  createForm?: unknown
  editor?: unknown
}

/**
 * A FormLayout is "flat" (safe for oj-dynamic-form) when it contains ONLY plain FormFields with basic
 * data types — no sections/tabs/rich-stereotype/options/nested fields. Collect the fields + their
 * seed values while checking; bail (flat=false) on anything richer so the shared renderer keeps it.
 */
function collectFlat(children: ClientSideComponent[] | undefined): {
  fields: FormFieldDef[]
  values: Record<string, unknown>
  flat: boolean
} {
  const fields: FormFieldDef[] = []
  const values: Record<string, unknown> = {}
  let flat = true
  const walk = (comps: ClientSideComponent[] | undefined): void => {
    for (const c of comps ?? []) {
      if (!flat) return
      const type = ((c.metadata as { type?: string })?.type ?? (c as { type?: string }).type) as string
      if (type === 'FormField') {
        const f = c.metadata as unknown as FieldMeta
        const richStereotype = !!f.stereotype && !OK_STEREOTYPES.has(f.stereotype)
        if (
          richStereotype ||
          (f.options?.length ?? 0) > 0 ||
          (f.columns?.length ?? 0) > 0 ||
          f.createForm ||
          f.editor ||
          !BASIC_DATATYPES.has(f.dataType ?? 'string')
        ) {
          flat = false
          return
        }
        fields.push({
          id: f.fieldId,
          label: f.label || f.fieldId,
          type: OJ_TYPE[f.dataType ?? 'string'] ?? 'string',
          required: f.required,
          readOnly: f.readOnly,
        })
        values[f.fieldId] = f.initialValue
      } else if (type === 'FormRow' || type === 'FormLayout' || type === 'VerticalLayout' || type === 'HorizontalLayout') {
        walk(c.children as ClientSideComponent[] | undefined)
      } else {
        flat = false
        return
      }
    }
  }
  walk(children)
  return { fields, values, flat }
}

/**
 * Mateu `FormLayout` → the authentic Oracle `oj-dynamic-form` WHEN the form is flat (basic fields
 * only); otherwise the shared field-by-field renderer (which keeps @Section/@Zones/@Tab + rich field
 * types + the oj-c controls). mateu-form still wraps this, so buttons/state/submit are unchanged.
 */
export function renderRedwoodFormLayout(
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
): TemplateResult {
  const { fields, values, flat } = collectFlat(component.children as ClientSideComponent[] | undefined)
  if (!flat || fields.length === 0) {
    return renderFormLayout(container, component, baseUrl, state, data, appState, appData)
  }
  const bag = state as Record<string, unknown> | undefined
  const value: Record<string, unknown> = {}
  fields.forEach((f) => {
    value[f.id] = bag && f.id in bag ? bag[f.id] : values[f.id]
  })
  return html`<div slot="${component.slot ?? nothing}" style="width:100%; ${component.style ?? ''}" class="${component.cssClasses ?? nothing}">
    <mateu-spectra-form .fields=${fields} .value=${value}></mateu-spectra-form>
  </div>`
}
