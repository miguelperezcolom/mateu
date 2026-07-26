import { html, nothing, type TemplateResult } from 'lit'
import { ojElement } from '../../oj/ojElement'
import type { Json, RenderCtx } from '../renderComponent'

interface FieldOption {
  value?: unknown
  label?: string
}

/**
 * FormField → an authentic Oracle JET oj-c form control, in light DOM. On change it writes straight
 * to the view's controller (putState) — no DOM-event round-trip, no shadow boundary, so oj-c
 * upgrades cleanly and there is never a plain-input fallback.
 *
 * When the OJET runtime is unavailable (CDN down), it degrades to a native control so the form still
 * works — the only place the renderer leaves the Redwood component set, and only as a safety net.
 */
export function renderField(_node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const fieldId = String(m['fieldId'] ?? '')
  const label = String(m['label'] ?? fieldId)
  const dataType = String(m['dataType'] ?? 'string')
  const stereotype = String(m['stereotype'] ?? 'regular')
  const options = (m['options'] as FieldOption[]) ?? []
  const disabled = m['disabled'] === true || ctx.controller.fieldAttributes[fieldId]?.['disabled'] === true
  const hidden = ctx.controller.fieldAttributes[fieldId]?.['hidden'] === true
  const readOnly = m['readOnly'] === true || stereotype === 'plainText'
  const colspan = Number(m['colspan']) || 1
  const error = ctx.controller.fieldErrors[fieldId]

  if (hidden) return html``

  const raw = fieldId in ctx.state ? ctx.state[fieldId] : m['initialValue']
  const current = raw == null ? '' : raw

  const commit = (value: unknown) => ctx.controller.putState(fieldId, value)

  const wrap = (inner: TemplateResult | typeof nothing) =>
    html`<div class="mateu-field" style="grid-column: span ${colspan};">
      ${inner}${error ? html`<div class="mateu-field-error oj-typography-body-xs">${error}</div>` : nothing}
    </div>`

  // Read-only / plain text.
  if (readOnly) {
    return wrap(html`
      <div class="mateu-field-plain">
        <span class="mateu-field-label oj-typography-body-xs oj-text-color-secondary">${label}</span>
        <span class="mateu-field-value oj-typography-body-md">${formatPlain(current, dataType)}</span>
      </div>
    `)
  }

  // No OJET runtime — native fallback so the form still works.
  if (!ctx.runtime) return wrap(renderNativeFallback(fieldId, label, dataType, options, current, disabled, commit))

  const labelHint = label
  const labelEdge = 'top'

  // Boolean → checkbox.
  if (dataType === 'boolean') {
    return wrap(
      ojElement('oj-c-checkbox', {
        props: { value: current === true, disabled, labelEdge, label: labelHint },
        events: { valueChanged: (e: Event) => commit((e as CustomEvent).detail?.value === true) },
      }),
    )
  }

  // Options → single select (dropdown of the option labels).
  if (options.length > 0) {
    const ADP = ctx.runtime.ArrayDataProvider
    const data = new ADP(
      options.map((o) => ({ value: o.value, label: o.label ?? String(o.value ?? '') })),
      { keyAttributes: 'value' },
    )
    return wrap(
      ojElement('oj-c-select-single', {
        props: {
          data,
          itemText: 'label',
          value: current === '' ? null : current,
          disabled,
          labelHint,
          labelEdge,
        },
        events: { valueChanged: (e: Event) => commit((e as CustomEvent).detail?.value) },
      }),
    )
  }

  // Numeric.
  if (['integer', 'number', 'double', 'money', 'decimal', 'long', 'float'].includes(dataType)) {
    return wrap(
      ojElement('oj-c-input-number', {
        props: { value: raw == null ? null : Number(raw), disabled, labelHint, labelEdge },
        events: { valueChanged: (e: Event) => commit((e as CustomEvent).detail?.value) },
      }),
    )
  }

  // Multi-line text.
  if (stereotype === 'textarea' || stereotype === 'text' || dataType === 'text') {
    return wrap(
      ojElement('oj-c-text-area', {
        props: { value: String(current), disabled, labelHint, labelEdge },
        events: { valueChanged: (e: Event) => commit((e as CustomEvent).detail?.value) },
      }),
    )
  }

  // Default: single-line text.
  return wrap(
    ojElement('oj-c-input-text', {
      props: { value: String(current), disabled, labelHint, labelEdge, placeholder: m['placeholder'] ?? undefined },
      events: { valueChanged: (e: Event) => commit((e as CustomEvent).detail?.value) },
    }),
  )
}

function formatPlain(value: unknown, dataType: string): string {
  if (value == null || value === '') return '—'
  if (dataType === 'money') {
    const n = Number(value)
    if (!Number.isNaN(n)) return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (dataType === 'boolean') return value === true ? '✓' : '—'
  return String(value)
}

function renderNativeFallback(
  fieldId: string,
  label: string,
  dataType: string,
  options: FieldOption[],
  current: unknown,
  disabled: boolean,
  commit: (v: unknown) => void,
): TemplateResult {
  const onInput = (e: Event) => commit((e.target as HTMLInputElement).value)
  if (dataType === 'boolean') {
    return html`<label class="mateu-native-field"
      ><input type="checkbox" .checked=${current === true} ?disabled=${disabled} @change=${(e: Event) => commit((e.target as HTMLInputElement).checked)} />
      ${label}</label
    >`
  }
  if (options.length > 0) {
    return html`<label class="mateu-native-field"
      ><span>${label}</span>
      <select ?disabled=${disabled} @change=${onInput}>
        ${options.map((o) => html`<option value=${String(o.value ?? '')} ?selected=${o.value === current}>${o.label ?? String(o.value ?? '')}</option>`)}
      </select></label
    >`
  }
  const numeric = ['integer', 'number', 'double', 'money', 'decimal', 'long', 'float'].includes(dataType)
  return html`<label class="mateu-native-field"
    ><span>${label}</span>
    <input
      id=${fieldId}
      type=${numeric ? 'number' : 'text'}
      .value=${current == null ? '' : String(current)}
      ?disabled=${disabled}
      @input=${(e: Event) => commit(numeric ? Number((e.target as HTMLInputElement).value) : (e.target as HTMLInputElement).value)}
  /></label>`
}
