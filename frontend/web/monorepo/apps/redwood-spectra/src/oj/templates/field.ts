import { html, nothing } from 'lit'
import type CustomFieldMeta from '@mateu/shared/apiClients/dtos/componentmetadata/CustomField'
import type { SpectraRenderContext, SpectraTemplate } from '@/oj/types'

interface FieldOption {
  value?: string
  label?: string
}
interface FormFieldMeta {
  fieldId: string
  stereotype?: string
  dataType?: string
  label?: string
  placeholder?: string
  initialValue?: unknown
  options?: FieldOption[]
  required?: boolean
  disabled?: boolean
  readOnly?: boolean
}

type Ctor = new (data: unknown[], opts: unknown) => unknown
function arrayDataProvider(options: FieldOption[]): unknown {
  const ADP = (window as unknown as { __mateuArrayDataProvider?: Ctor }).__mateuArrayDataProvider
  return ADP ? new ADP(options.map((o) => ({ value: o.value, label: o.label })), { keyAttributes: 'value' }) : undefined
}

/**
 * FormField → an Oracle JET oj-c form control (NO mateu-field / vaadin-*). A field carrying
 * `options` renders as `oj-c-select-single` (a dropdown showing the option LABELS); anything else is
 * a text `oj-c-input-text`. On change it re-dispatches the SAME `value-changed {value, fieldId}`
 * event mateu-field emits, so the host mateu-component's trigger machinery (OnValueChange / AutoSave
 * — e.g. the General Overview `switchRecord`) works unchanged; we only swap the widget.
 */
export const formFieldTemplate: SpectraTemplate = {
  loaders: ['oj-c/select-single', 'oj-c/input-text'],
  render(ctx) {
    const f = ctx.component.metadata as unknown as FormFieldMeta
    const current = valueOf(ctx, f)
    const emit = (value: unknown, target: EventTarget | null) => {
      if (value == null || String(value) === current) return // ignore the init echo + no-ops
      target?.dispatchEvent(
        new CustomEvent('value-changed', {
          detail: { value, fieldId: f.fieldId },
          bubbles: true,
          composed: true,
        }),
      )
    }
    const labelHint = f.label || f.fieldId
    const labelEdge = f.label ? 'top' : 'none'

    if (f.options?.length) {
      return html`<oj-c-select-single
        class="mateu-rw-field"
        label-hint=${labelHint}
        label-edge=${labelEdge}
        item-text="label"
        .data=${arrayDataProvider(f.options)}
        .value=${current}
        ?readonly=${!!f.readOnly}
        ?disabled=${!!f.disabled}
        @valueChanged=${(e: CustomEvent) => emit(e.detail?.value, e.currentTarget)}
      ></oj-c-select-single>`
    }

    return html`<oj-c-input-text
      class="mateu-rw-field"
      label-hint=${labelHint}
      label-edge=${labelEdge}
      .value=${current}
      ?readonly=${!!f.readOnly}
      ?disabled=${!!f.disabled}
      @valueChanged=${(e: CustomEvent) => emit(e.detail?.value, e.currentTarget)}
    ></oj-c-input-text>`
  },
}

function valueOf(ctx: SpectraRenderContext, f: FormFieldMeta): string {
  const state = ctx.state as Record<string, unknown> | undefined
  const raw = state && f.fieldId in state ? state[f.fieldId] : f.initialValue
  return raw == null ? '' : String(raw)
}

/**
 * CustomField → its inner content component (NO vaadin-custom-field). Used e.g. for the General
 * Overview `_overview` field, whose value is the composed EntityHeader + cards subtree.
 */
export const customFieldTemplate: SpectraTemplate = {
  loaders: [],
  render(ctx) {
    const m = ctx.component.metadata as CustomFieldMeta
    return html`<div class="mateu-rw-custom-field">
      ${m.label ? html`<label class="rw-field-label">${m.label}</label>` : nothing}
      ${m.content ? ctx.renderChild(m.content) : nothing}
    </div>`
  },
}
