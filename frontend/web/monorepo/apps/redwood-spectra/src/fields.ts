/**
 * FormField → Oracle JET mapping (see README for the full table).
 *
 * The root element of each template is the oj-c element itself (not a wrapper div): oj-c reads
 * `colspan` + `label-hint` from the DIRECT children of oj-c-form-layout, so a wrapper would
 * break the Redwood form grid. Read-only fields degrade to the Redwood read-only pattern
 * (small label over a plain value).
 *
 * Every editable control translates its JET `valueChanged` event into Mateu's `value-changed`
 * contract event ({fieldId, value}, bubbles+composed) which mateu-component writes into state.
 */
import { html, nothing, TemplateResult } from 'lit'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import FormField from '@mateu/shared/apiClients/dtos/componentmetadata/FormField'
import Option from '@mateu/shared/apiClients/dtos/componentmetadata/Option'
import { ComponentState } from '@infra/ui/renderers/types.ts'
import { arrayDataProvider, dispatchValueChanged, injectOjStylesIntoContentHeaders } from './oj.ts'

const fieldValue = (field: FormField, state: ComponentState): unknown => {
  const v = state?.[field.fieldId]
  return v === undefined || v === null ? field.initialValue : v
}

const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v))

const optionRows = (field: FormField): { value: string; label: string }[] =>
  (field.options ?? []).map((o: Option) => ({ value: String(o.value), label: o.label ?? String(o.value) }))

const displayValue = (field: FormField, value: unknown): string => {
  if (value === undefined || value === null || value === '') return '—'
  if (field.options?.length) {
    const hit = field.options.find(o => String(o.value) === String(value))
    if (hit) return hit.label ?? String(hit.value)
  }
  if (typeof value === 'boolean') return value ? '✓' : '✗'
  if (typeof value === 'object') {
    const v = value as Record<string, unknown>
    return String(v.label ?? v.name ?? v.message ?? JSON.stringify(value))
  }
  return String(value)
}

/** Redwood read-only rendering: small secondary-text label over the plain value. */
const renderReadOnly = (component: ClientSideComponent, field: FormField, value: unknown): TemplateResult => html`
  <div class="mateu-oj-field-ro"
       data-colspan="${field.colspan ?? 1}"
       colspan="${(field.colspan ?? 1) > 1 ? field.colspan! : nothing}"
       style="${component.style ?? nothing}"
       slot="${component.slot ?? nothing}">
    <div class="mateu-oj-field-ro-label">${field.label ?? ''}</div>
    <div class="mateu-oj-field-ro-value">${displayValue(field, value)}</div>
  </div>
`

export const renderField = (
  component: ClientSideComponent,
  field: FormField,
  state: ComponentState,
  labelAlreadyRendered: boolean | undefined,
): TemplateResult => {
  // Cheap, idempotent: keeps mateu-content-header shadow roots styled even on pages whose
  // header has no toolbar buttons (so renderToolbarButton never runs), e.g. KPI-only headers.
  injectOjStylesIntoContentHeaders()
  const value = fieldValue(field, state)
  const label = labelAlreadyRendered ? undefined : (field.label ?? undefined)
  const onChange = (e: Event) => {
    const v = (e as CustomEvent).detail?.value
    dispatchValueChanged(e.target as Element, field.fieldId, v)
  }
  const common = {
    colspan: (field.colspan ?? 1) > 1 ? field.colspan! : nothing,
  }

  // Read-only / plain-text stereotypes use the Redwood read-only pattern.
  if (field.readOnly || field.stereotype === 'plainText') {
    return renderReadOnly(component, field, value)
  }

  switch (field.stereotype) {
    case 'textarea':
      return html`<oj-c-text-area
        label-hint="${label ?? nothing}" .value=${str(value)} ?required=${field.required}
        ?disabled=${field.disabled} placeholder="${field.placeholder ?? nothing}"
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-text-area>`

    case 'password':
      return html`<oj-c-input-password
        label-hint="${label ?? nothing}" .value=${str(value)} ?required=${field.required}
        ?disabled=${field.disabled} placeholder="${field.placeholder ?? nothing}"
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-input-password>`

    case 'radio':
      return html`<oj-c-radioset
        label-hint="${label ?? nothing}" .value=${value === undefined || value === null ? null : str(value)}
        ?required=${field.required} ?disabled=${field.disabled}
        .options=${optionRows(field)}
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-radioset>`

    case 'select':
    case 'combobox':
    case 'searchable':
    case 'choice':
      return html`<oj-c-select-single
        label-hint="${label ?? nothing}" .value=${value === undefined || value === null ? null : str(value)}
        ?required=${field.required} ?disabled=${field.disabled} placeholder="${field.placeholder ?? nothing}"
        .data=${arrayDataProvider(optionRows(field), 'value')}
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-select-single>`

    case 'listBox':
      return html`<oj-c-select-multiple
        label-hint="${label ?? nothing}" .value=${value ?? null}
        ?required=${field.required} ?disabled=${field.disabled}
        .data=${arrayDataProvider(optionRows(field), 'value')}
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-select-multiple>`

    case 'toggle':
      return html`<div class="mateu-oj-toggle" colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}</div>` : nothing}
        <oj-switch .value=${value === true || value === 'true'} ?disabled=${field.disabled}
                   @valueChanged=${onChange}></oj-switch>
        ${field.description ? html`<div class="mateu-oj-field-help">${field.description}</div>` : nothing}
      </div>`

    case 'stars':
      return html`<div colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}</div>` : nothing}
        <oj-c-rating-gauge .value=${Number(value ?? 0)} .max=${field.max && field.max > 0 ? field.max : 5}
                           ?disabled=${field.disabled} ?readonly=${field.readOnly}
                           @valueChanged=${onChange}></oj-c-rating-gauge>
      </div>`

    case 'slider':
      return html`<div colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}</div>` : nothing}
        <oj-slider .min=${field.min ?? field.sliderMin ?? 0} .max=${field.max ?? field.sliderMax ?? 100}
                   .step=${field.step && field.step > 0 ? field.step : 1}
                   .value=${Number(value ?? field.min ?? 0)} ?disabled=${field.disabled}
                   style="width: 100%;"
                   @valueChanged=${onChange}></oj-slider>
        ${field.description ? html`<div class="mateu-oj-field-help">${field.description}</div>` : nothing}
      </div>`

    case 'fileUpload':
    case 'uploadableImage': {
      const isImage = field.stereotype === 'uploadableImage'
      const hasValue = value !== undefined && value !== null && value !== ''
      const onSelect = (e: Event) => {
        const files = (e as CustomEvent).detail?.files as File[] | undefined
        const file = files?.[0]
        if (!file) return
        const reader = new FileReader()
        // Mateu contract (see mateu-field): the file travels in the field value as a data URI.
        reader.onload = () => dispatchValueChanged(e.target as Element, field.fieldId, reader.result as string)
        reader.readAsDataURL(file)
      }
      return html`<div class="mateu-oj-upload" colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}${field.required ? ' *' : ''}</div>` : nothing}
        ${isImage && hasValue
          ? html`<img src="${str(value)}" alt="${field.label ?? ''}" class="mateu-oj-upload-preview">`
          : nothing}
        <oj-c-file-picker
          .accept=${isImage ? ['image/*'] : nothing}
          ?disabled=${field.disabled}
          @ojSelect=${onSelect}></oj-c-file-picker>
        ${field.description ? html`<div class="mateu-oj-field-help">${field.description}</div>` : nothing}
      </div>`
    }

    case 'image':
      return html`<div colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}</div>` : nothing}
        ${value ? html`<img src="${str(value)}" alt="${field.label ?? ''}" class="mateu-oj-upload-preview">` : html`—`}
      </div>`

    case 'badge':
      return html`<div colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}</div>` : nothing}
        <oj-c-badge>${displayValue(field, value)}</oj-c-badge>
      </div>`

    case 'link': {
      const href = field.link?.href ?? str(value)
      return html`<div colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}</div>` : nothing}
        <a class="oj-link" href="${href}">${field.label ?? str(value)}</a>
      </div>`
    }

    case 'markdown':
    case 'richText':
    case 'html':
      // Rendered (not edited) rich content, as in the shared renderer.
      // eslint-disable-next-line no-unsanitized/property
      return html`<div colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        class="mateu-oj-richtext" .innerHTML=${str(value)}></div>`

    case 'color':
      return html`<div colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        ${label ? html`<div class="mateu-oj-field-ro-label">${label}</div>` : nothing}
        <span class="mateu-oj-colorswatch" style="background-color: ${str(value) || 'transparent'}"></span>
      </div>`
  }

  // dataType-driven defaults
  switch ((field.dataType ?? '').toLowerCase()) {
    case 'int':
    case 'integer':
    case 'long':
    case 'double':
    case 'float':
    case 'decimal':
    case 'number':
      return html`<oj-c-input-number
        label-hint="${label ?? nothing}" .value=${value === undefined || value === null || value === '' ? null : Number(value)}
        ?required=${field.required} ?disabled=${field.disabled} placeholder="${field.placeholder ?? nothing}"
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}; ${field.rightAligned ? 'text-align: right;' : ''}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-input-number>`

    case 'bool':
    case 'boolean':
      // oj-c-checkbox takes its label from the default slot (it has no label-hint prop).
      return html`<oj-c-checkbox
        .value=${value === true || value === 'true'} ?required=${field.required} ?disabled=${field.disabled}
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}>${label ?? ''}</oj-c-checkbox>`

    case 'date':
      return html`<oj-c-input-date-picker
        label-hint="${label ?? nothing}" .value=${str(value) ? str(value).slice(0, 10) : null}
        ?required=${field.required} ?disabled=${field.disabled}
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-input-date-picker>`

    case 'time':
      return html`<oj-c-input-time-mask
        label-hint="${label ?? nothing}" .value=${str(value) || null}
        ?required=${field.required} ?disabled=${field.disabled}
        .help=${{ instruction: field.description ?? '' }}
        colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
        @valueChanged=${onChange}></oj-c-input-time-mask>`

    case 'datetime': {
      // ISO 'yyyy-mm-ddThh:mm' split across a Redwood date picker + time mask, recombined on change.
      const iso = str(value)
      const datePart = iso ? iso.slice(0, 10) : null
      const timePart = iso.includes('T') ? iso.split('T')[1].slice(0, 5) : null
      const combine = (e: Event) => {
        const root = (e.target as Element).parentElement
        const d = (root?.querySelector('oj-c-input-date-picker') as unknown as { value: string })?.value ?? ''
        const t = (root?.querySelector('oj-c-input-time-mask') as unknown as { value: string })?.value ?? ''
        dispatchValueChanged(e.target as Element, field.fieldId, t ? `${d}T${t}` : d)
      }
      return html`<div class="mateu-oj-datetime" colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
        <oj-c-input-date-picker label-hint="${label ?? nothing}" .value=${datePart}
          ?required=${field.required} ?disabled=${field.disabled} @valueChanged=${combine}></oj-c-input-date-picker>
        <oj-c-input-time-mask label-hint=" " .value=${timePart}
          ?disabled=${field.disabled} @valueChanged=${combine}></oj-c-input-time-mask>
      </div>`
    }
  }

  // default: text input (covers email + plain strings)
  return html`<oj-c-input-text
    label-hint="${label ?? nothing}" .value=${str(value)} ?required=${field.required}
    ?disabled=${field.disabled} placeholder="${field.placeholder ?? nothing}"
    .help=${{ instruction: field.description ?? '' }}
    colspan="${common.colspan}" style="${component.style ?? nothing}" slot="${component.slot ?? nothing}"
    @valueChanged=${onChange}></oj-c-input-text>`
}
