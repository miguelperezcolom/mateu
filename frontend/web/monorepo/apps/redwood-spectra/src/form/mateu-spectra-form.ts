import { LitElement, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

export interface FormFieldDef {
  id: string
  label: string
  type: string
  required?: boolean
  readOnly?: boolean
}

/**
 * FLAT Mateu forms (crud create/edit with only basic fields, no @Section/@Zones/@Tab) rendered with
 * the authentic Oracle `oj-dynamic-form` (the Dynamic UI pack). Metadata-driven: a JsonMetadataProvider
 * built from the fields, the `value` from the component state. On edit it re-dispatches the SAME
 * per-field `value-changed { fieldId, value }` events the neutral fields emit, so the host
 * mateu-component's state (and the crud save) keep working. Rich forms never reach here — the renderer
 * falls back to the field-by-field oj-c rendering. Light DOM so the oj component upgrades.
 */
@customElement('mateu-spectra-form')
export class MateuSpectraForm extends LitElement {
  @property({ attribute: false }) fields: FormFieldDef[] = []
  @property({ attribute: false }) value: Record<string, unknown> = {}

  private provider?: unknown

  protected createRenderRoot(): HTMLElement {
    return this
  }

  protected willUpdate(c: PropertyValues): void {
    if (c.has('fields')) this.rebuild()
  }

  private rebuild(): void {
    const JMP = (window as unknown as { __mateuJsonMetadataProvider?: new (o: unknown) => unknown })
      .__mateuJsonMetadataProvider
    if (!JMP) return
    const props: Record<string, unknown> = {}
    this.fields.forEach((f) => {
      props[f.id] = { type: f.type, labelHint: f.label, required: !!f.required, readonly: !!f.readOnly }
    })
    this.provider = new JMP({ data: { properties: props } })
  }

  private onValueChanged(e: Event): void {
    const nv = (e as CustomEvent).detail?.value as Record<string, unknown> | undefined
    if (!nv) return
    this.fields.forEach((f) => {
      const v = nv[f.id]
      if (v !== this.value?.[f.id]) {
        this.dispatchEvent(
          new CustomEvent('value-changed', { detail: { fieldId: f.id, value: v }, bubbles: true, composed: true }),
        )
      }
    })
  }

  protected render() {
    if (!this.provider) return html`<div></div>`
    return html`<oj-dynamic-form
      .metadata=${this.provider}
      .value=${this.value}
      .displayProperties=${this.fields.map((f) => f.id)}
      operation="edit"
      label-edge="top"
      max-columns="2"
      style="width:100%;"
      @valueChanged=${(e: Event) => this.onValueChanged(e)}
    ></oj-dynamic-form>`
  }
}
