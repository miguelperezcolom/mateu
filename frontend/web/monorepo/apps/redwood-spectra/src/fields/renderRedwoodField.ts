import { html, nothing, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'

interface FieldOption {
  value?: string
  label?: string
}
interface FormFieldMeta {
  fieldId: string
  label?: string
  stereotype?: string
  dataType?: string
  placeholder?: string
  initialValue?: unknown
  options?: FieldOption[]
  readOnly?: boolean
  disabled?: boolean
}

type Ctor = new (data: unknown[], opts: unknown) => unknown
function arrayDataProvider(options: FieldOption[]): unknown {
  const ADP = (window as unknown as { __mateuArrayDataProvider?: Ctor }).__mateuArrayDataProvider
  return ADP
    ? new ADP(options.map((o) => ({ value: o.value, label: o.label })), { keyAttributes: 'value' })
    : undefined
}

/**
 * FormField → an Oracle JET oj-c form control (the Redwood widget). A field carrying `options`
 * renders as `oj-c-select-single` (dropdown of the option LABELS); a numeric/text field as
 * `oj-c-input-text` (or `-number`); read-only/plainText as plain text. On change it re-dispatches the
 * SAME `value-changed {fieldId, value}` event the neutral field emits, so the host mateu-component's
 * trigger machinery (OnValueChange / AutoSave — e.g. General Overview's record switcher) is unchanged
 * — we only swap the widget. Signature matches the ComponentRenderer widget-map contract.
 */
export function renderRedwoodField(
  _container: unknown,
  component: ClientSideComponent,
  _baseUrl: string | undefined,
  state: ComponentState,
  _data: ComponentData,
  _appState: ComponentState,
  _appData: ComponentData,
  labelAlreadyRendered?: boolean,
): TemplateResult {
  const f = component.metadata as unknown as FormFieldMeta
  const bag = state as Record<string, unknown> | undefined
  const raw = bag && f.fieldId in bag ? bag[f.fieldId] : f.initialValue
  const current = raw == null ? '' : String(raw)

  const emit = (value: unknown, target: EventTarget | null) => {
    if (value == null || String(value) === current) return // ignore the init echo + no-ops
    target?.dispatchEvent(
      new CustomEvent('value-changed', {
        detail: { fieldId: f.fieldId, value },
        bubbles: true,
        composed: true,
      }),
    )
  }

  const labelHint = f.label || f.fieldId
  const labelEdge = labelAlreadyRendered || !f.label ? 'none' : 'top'
  const slot = (component.slot ?? nothing) as string | typeof nothing

  if (f.readOnly || f.stereotype === 'plainText') {
    return html`<div class="mateu-rw-field-plain" slot=${slot}>${current}</div>`
  }

  if (f.options?.length) {
    return html`<oj-c-select-single
      class="mateu-rw-field"
      slot=${slot}
      label-hint=${labelHint}
      label-edge=${labelEdge}
      item-text="label"
      .data=${arrayDataProvider(f.options)}
      .value=${current}
      ?disabled=${!!f.disabled}
      @valueChanged=${(e: CustomEvent) => emit(e.detail?.value, e.currentTarget)}
    ></oj-c-select-single>`
  }

  const numeric =
    f.dataType === 'integer' || f.dataType === 'number' || f.dataType === 'double' || f.dataType === 'money'
  if (numeric) {
    return html`<oj-c-input-number
      class="mateu-rw-field"
      slot=${slot}
      label-hint=${labelHint}
      label-edge=${labelEdge}
      .value=${raw == null ? nothing : Number(raw)}
      ?disabled=${!!f.disabled}
      @valueChanged=${(e: CustomEvent) => emit(e.detail?.value, e.currentTarget)}
    ></oj-c-input-number>`
  }

  return html`<oj-c-input-text
    class="mateu-rw-field"
    slot=${slot}
    label-hint=${labelHint}
    label-edge=${labelEdge}
    .value=${current}
    ?disabled=${!!f.disabled}
    @valueChanged=${(e: CustomEvent) => emit(e.detail?.value, e.currentTarget)}
  ></oj-c-input-text>`
}
