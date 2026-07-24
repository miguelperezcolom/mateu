import { html, nothing, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { interpolate } from '@infra/ui/interpolation'

interface ButtonMeta {
  label?: string
  actionId?: string
  parameters?: unknown
  buttonStyle?: string
  color?: string
  disabled?: boolean
  shortcut?: string
}

/**
 * Button → an Oracle JET `oj-c-button` (the core's default buttonRenderer uses vaadin-button, which
 * is not loaded in this adapter). On click it dispatches the SAME `action-requested {actionId,
 * parameters}` event the core expects, so toolbars/CTAs/actions work unchanged. buttonStyle 'primary'
 * (or a danger color) maps to the Redwood chroming; everything else is an outlined button.
 */
/**
 * A plain Redwood-styled button. Used where `oj-c-button` cannot upgrade — inside the shadow roots of
 * mateu-page / mateu-form (their `<slot name="buttons">` puts action buttons behind a shadow boundary,
 * so the body's preact binding provider is unreachable → "Cannot determine binding provider for a
 * disconnected subtree"). Looks like a Redwood button via CSS and works in any (shadow/light) context.
 */
export function redwoodPlainButton(
  label: string,
  onClick: (e: Event) => void,
  variant: 'primary' | 'outlined' | 'borderless' = 'outlined',
  slot?: string,
): TemplateResult {
  const base =
    'font:inherit; font-weight:600; cursor:pointer; padding:0 1.1rem; height:2.25rem; border-radius:1.25rem; white-space:nowrap; line-height:1;'
  const skin =
    variant === 'primary'
      ? 'border:1px solid #1a5a6b; background:#1a5a6b; color:#fff;'
      : variant === 'borderless'
        ? 'border:none; background:transparent; color:#1a5a6b;'
        : 'border:1px solid rgba(22,21,19,.35); background:#fff; color:#161513;'
  return html`<button slot=${(slot ?? nothing) as string | typeof nothing} style="${base} ${skin}" @click=${onClick}>${label}</button>`
}

export function renderRedwoodButton(
  component: ClientSideComponent,
  state?: ComponentState,
  data?: ComponentData,
): TemplateResult {
  const m = component.metadata as unknown as ButtonMeta
  const label = interpolate(m.label ?? '', state, data)
  const chroming = m.buttonStyle === 'primary' ? 'callToAction' : m.buttonStyle === 'tertiary' ? 'borderless' : 'outlined'

  // Action buttons slotted into mateu-page/mateu-form's shadow can't use oj-c-button — render a plain
  // Redwood button that dispatches the same action-requested event.
  if (component.slot === 'buttons') {
    const variant = m.buttonStyle === 'primary' ? 'primary' : m.buttonStyle === 'tertiary' ? 'borderless' : 'outlined'
    return redwoodPlainButton(
      label,
      (e: Event) =>
        (e.currentTarget as HTMLElement)?.dispatchEvent(
          new CustomEvent('action-requested', {
            detail: { actionId: m.actionId, parameters: m.parameters },
            bubbles: true,
            composed: true,
          }),
        ),
      variant,
      component.slot,
    )
  }

  const onAction = (e: Event) =>
    (e.currentTarget as HTMLElement)?.dispatchEvent(
      new CustomEvent('action-requested', {
        detail: { actionId: m.actionId, parameters: m.parameters },
        bubbles: true,
        composed: true,
      }),
    )

  return html`<oj-c-button
    id=${component.id ?? nothing}
    slot=${(component.slot ?? nothing) as string | typeof nothing}
    label=${label}
    chroming=${chroming}
    ?disabled=${!!m.disabled}
    @ojAction=${onAction}
  ></oj-c-button>`
}
