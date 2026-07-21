import { html, nothing } from 'lit'
import type ButtonMeta from '@mateu/shared/apiClients/dtos/componentmetadata/Button'
import type { SpectraTemplate } from '@/oj/types'

/**
 * Button → Oracle JET `<oj-c-button>` (a Redwood button everywhere, not just the welcome index).
 *
 * A fixed tag + a click event, so this uses plain Lit rather than the generic {@link ojElement}
 * driver: `.label` is bound by property, and `@ojAction` (the event oj-c-button fires on activation)
 * is re-dispatched as the standard Mateu `action-requested` event the host mateu-component listens
 * for — identical detail shape to the shared buttonRenderer.
 */
export const buttonTemplate: SpectraTemplate = {
  loaders: ['oj-c/button'],
  render(ctx) {
    const m = ctx.component.metadata as ButtonMeta
    const dispatch = (e: Event) =>
      e.currentTarget?.dispatchEvent(
        new CustomEvent('action-requested', {
          detail: { actionId: m.actionId, parameters: m.parameters },
          bubbles: true,
          composed: true,
        }),
      )
    return html`<oj-c-button
      id=${ctx.component.id || nothing}
      class=${ctx.component.cssClasses || nothing}
      style=${ctx.component.style || nothing}
      slot=${ctx.component.slot || nothing}
      .label=${m.label ?? ''}
      chroming=${chromingFor(m.buttonStyle)}
      ?disabled=${!!m.disabled}
      @ojAction=${dispatch}
    ></oj-c-button>`
  },
}

/** Map the Mateu button style to an oj-c-button chroming: primary → the emphasised CTA, else outlined. */
function chromingFor(style: unknown): string {
  return String(style) === 'primary' ? 'callToAction' : 'outlined'
}
