import { html, nothing, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type Avatar from '@mateu/shared/apiClients/dtos/componentmetadata/Avatar'
import type ProgressBar from '@mateu/shared/apiClients/dtos/componentmetadata/ProgressBar'
import type Badge from '@mateu/shared/apiClients/dtos/componentmetadata/Badge'
import type Meter from '@mateu/shared/apiClients/dtos/componentmetadata/Meter'
import { ojElement } from '../oj/ojDriver'

/** Mateu `Avatar` → authentic `oj-c-avatar` (initials/src/size). */
export function renderRedwoodAvatar(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as Avatar
  return ojElement('oj-c-avatar', {
    props: {
      initials: m.abbreviation || undefined,
      src: m.image || undefined,
      size: 'md',
    },
    attrs: {
      slot: component.slot || undefined,
      title: m.name || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
  })
}

/** Mateu `ProgressBar` → authentic `oj-c-progress-bar` (value 0..max; value=-1 = indeterminate). */
export function renderRedwoodProgressBar(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as ProgressBar
  const max = m.max && m.max > 0 ? m.max : 100
  const value = m.indeterminate ? -1 : (m.value ?? 0)
  return ojElement('oj-c-progress-bar', {
    props: { value, max },
    attrs: {
      slot: component.slot || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
  })
}

// Lumo badge theme (the wire `color`) → oj-c-badge variant.
const BADGE_VARIANT: Record<string, string> = {
  success: 'success',
  error: 'danger',
  warning: 'warning',
  contrast: 'info',
  normal: 'neutral',
}

/** Mateu `Badge` (the in-body chip) → authentic `oj-c-badge` (label + color variant). */
export function renderRedwoodBadge(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as Badge
  const variant = BADGE_VARIANT[String((m.color as unknown as string) ?? 'normal')] ?? 'neutral'
  return ojElement('oj-c-badge', {
    props: { label: m.text ?? '', variant, size: m.small ? 'sm' : undefined },
    attrs: {
      slot: component.slot || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
  })
}

/** Mateu `Meter` → authentic `oj-c-meter-bar` with a label/caption wrapper; color reflects warn/danger. */
export function renderRedwoodMeter(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as Meter
  const value = m.value ?? 0
  const max = m.max && m.max > 0 ? m.max : 100
  let color: string | undefined
  if (m.dangerAt != null && value >= m.dangerAt) color = '#C74634'
  else if (m.warnAt != null && value >= m.warnAt) color = '#946f00'
  const caption = [m.unit ? `${value} ${m.unit}` : undefined, m.caption].filter(Boolean).join(' · ')
  return html`<div
    slot="${component.slot ?? nothing}"
    class="${component.cssClasses ?? nothing}"
    style="${component.style ?? ''}"
  >
    ${m.label ? html`<div style="font-weight:600; margin-bottom:.25rem;">${m.label}</div>` : nothing}
    ${ojElement('oj-c-meter-bar', { props: { value, max, size: 'md', color }, attrs: { style: 'width:100%;' } })}
    ${caption
      ? html`<div style="font-size:.8rem; color:var(--lumo-secondary-text-color,#666); margin-top:.25rem;">${caption}</div>`
      : nothing}
  </div>`
}
