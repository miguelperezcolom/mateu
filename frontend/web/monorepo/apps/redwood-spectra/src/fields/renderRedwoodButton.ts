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
export function renderRedwoodButton(
  component: ClientSideComponent,
  state?: ComponentState,
  data?: ComponentData,
): TemplateResult {
  const m = component.metadata as unknown as ButtonMeta
  const label = interpolate(m.label ?? '', state, data)
  const chroming = m.buttonStyle === 'primary' ? 'callToAction' : m.buttonStyle === 'tertiary' ? 'borderless' : 'outlined'

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
