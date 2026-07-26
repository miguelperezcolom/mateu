import { type TemplateResult } from 'lit'
import { html } from 'lit'
import { ojElement } from '../../oj/ojElement'
import { interpolate } from '../../core/expressions'
import type { Json, RenderCtx } from '../renderComponent'
import { ctxScope } from '../renderComponent'

/**
 * Button → an authentic oj-c-button, in light DOM. On click it runs the action straight on the
 * view's controller — no DOM-event round-trip, and (crucially) no plain-<button> escape hatch: the
 * island never wraps the button in a shadow root, so oj-c-button always upgrades under the preact
 * binding provider.
 */
export function renderButton(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const label = interpolate(String(m['label'] ?? ''), ctxScope(ctx))
  const actionId = String(m['actionId'] ?? '')
  const parameters = (m['parameters'] as Json) ?? {}
  const disabled = m['disabled'] === true
  const style = String(m['buttonStyle'] ?? m['color'] ?? '')

  const chroming =
    style === 'primary' || style === 'success' ? 'callToAction'
    : style === 'tertiary' || style === 'borderless' ? 'borderless'
    : 'outlined'

  const run = () => {
    if (actionId) void ctx.controller.runAction(actionId, parameters)
  }

  if (!ctx.runtime) {
    return html`<button class="mateu-native-button ${chroming}" ?disabled=${disabled} @click=${run}>${label}</button>`
  }

  return ojElement('oj-c-button', {
    props: { label, chroming, disabled, id: (node as Json)?.['id'] ?? undefined },
    events: { ojAction: run },
  })
}
