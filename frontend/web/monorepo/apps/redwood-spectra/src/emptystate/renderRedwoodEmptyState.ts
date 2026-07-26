import { nothing, type TemplateResult } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import type EmptyState from '@mateu/shared/apiClients/dtos/componentmetadata/EmptyState'
import { ojElement } from '../oj/ojDriver'

/**
 * Mateu `EmptyState` → the authentic Oracle Spectra `oj-sp-empty-state`.
 *
 * Wire (EmptyState DTO): icon?, title?, description?, actionId?, actionLabel?.
 * oj-sp-empty-state props (CDN component.json): primaryText, secondaryText, primaryAction
 * ({label, icon, display:on|off|disabled, type:danger|callToAction|outlined}); event spPrimaryAction.
 * The component owns its own Redwood illustration, so the Mateu emoji `icon` has no authentic slot
 * and is intentionally NOT rendered (we don't hand-roll an illustration). The CTA maps to
 * primaryAction and dispatches the standard `action-requested` on click.
 */
export function renderRedwoodEmptyState(component: ClientSideComponent): TemplateResult {
  const m = component.metadata as EmptyState
  const hasAction = !!(m.actionId && m.actionLabel)
  const primaryAction = hasAction
    ? { label: m.actionLabel, display: 'on', type: 'callToAction' }
    : null

  return ojElement('oj-sp-empty-state', {
    props: {
      primaryText: m.title ?? '',
      secondaryText: m.description ?? '',
      primaryAction,
    },
    attrs: {
      slot: component.slot || undefined,
      class: component.cssClasses || undefined,
      style: component.style || undefined,
    },
    events: {
      spPrimaryAction: (e: Event) => {
        if (!m.actionId) return
        e.target?.dispatchEvent(
          new CustomEvent('action-requested', { detail: { actionId: m.actionId }, bubbles: true, composed: true }),
        )
      },
    },
    children: nothing,
  })
}
