/**
 * Button → oj-c-button / oj-c-menu-button mapping.
 *
 * Mateu's ButtonStyle/ButtonColor map onto oj-c `chroming`:
 *   primary            → callToAction (the charcoal CTA)
 *   color=error        → danger
 *   tertiary/tertiaryInline → borderless
 *   everything else    → outlined
 * Buttons with children become an oj-c-menu-button (the Redwood "actions" split menu).
 *
 * renderToolbarButton / renderPeerNav render inside mateu-content-header's SHADOW ROOT, so they
 * stamp data-oj-binding-provider on an in-shadow ancestor and inject the oj-c runtime stylesheets
 * into that shadow root (see oj.ts).
 */
import { html, nothing, TemplateResult } from 'lit'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import Button from '@mateu/shared/apiClients/dtos/componentmetadata/Button'
import { ButtonColor } from '@mateu/shared/apiClients/dtos/componentmetadata/ButtonColor'
import { ButtonStyle } from '@mateu/shared/apiClients/dtos/componentmetadata/ButtonStyle'
import { ComponentData, ComponentState } from '@infra/ui/renderers/types.ts'
import { interpolate } from '@infra/ui/interpolation.ts'
import { dispatchActionRequested, injectOjStylesIntoContentHeaders } from './oj.ts'

type Chroming = 'callToAction' | 'outlined' | 'borderless' | 'danger'

const chromingFor = (button: Pick<Button, 'buttonStyle' | 'color'>): Chroming => {
  if (button.color === ButtonColor.error) return 'danger'
  switch (button.buttonStyle) {
    case ButtonStyle.primary:
      return 'callToAction'
    case ButtonStyle.tertiary:
    case ButtonStyle.tertiaryInline:
      return 'borderless'
    default:
      return 'outlined'
  }
}

/** Rough Vaadin-icon → Oracle UX icon-font class translation ('vaadin:check' → oj-ux-ico-check). */
const ojIconClass = (vaadinIcon: string | undefined): string | undefined => {
  if (!vaadinIcon) return undefined
  const name = vaadinIcon.replace(/^vaadin:/, '')
  return `oj-ux-ico-${name}`
}

const onAction = (e: Event, button: Pick<Button, 'actionId' | 'parameters'>) => {
  dispatchActionRequested(e.target as Element, button.actionId, button.parameters)
}

export const renderButton = (component: ClientSideComponent, state?: ComponentState, data?: ComponentData): TemplateResult => {
  const metadata = component.metadata as Button
  const label = interpolate(metadata.label, state, data)
  const chroming = chromingFor(metadata)
  const startIcon = ojIconClass(metadata.iconOnLeft)
  const endIcon = ojIconClass(metadata.iconOnRight)

  if (metadata.children?.length) {
    return html`<oj-c-menu-button
      id="${component.id}"
      label="${label}"
      chroming="${chroming}"
      ?disabled="${metadata.disabled}"
      style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
      slot="${component.slot ?? nothing}">
      <oj-menu slot="menu">
        ${metadata.children.map(child => html`
          <oj-option id="${child.actionId}" ?disabled=${child.disabled}
            @click=${(e: Event) => onAction(e, child)}>${interpolate(child.label, state, data)}</oj-option>`)}
      </oj-menu>
    </oj-c-menu-button>`
  }

  return html`<oj-c-button
    id="${component.id}"
    label="${label}"
    chroming="${chroming}"
    ?disabled="${metadata.disabled}"
    title="${metadata.shortcut ? `${label} (${metadata.shortcut})` : nothing}"
    style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
    slot="${component.slot ?? nothing}"
    @ojAction=${(e: Event) => onAction(e, metadata)}>
    ${startIcon ? html`<span slot="startIcon" class="${startIcon}"></span>` : nothing}
    ${endIcon ? html`<span slot="endIcon" class="${endIcon}"></span>` : nothing}
  </oj-c-button>`
}

/** One header toolbar button (crud listing toolbar / content header) with Redwood chroming.
 * Renders inside mateu-content-header's shadow root — inject the oj-c styles + fixes into it
 * at hook-call time (see injectOjStylesIntoContentHeaders for why not lit's ref directive). */
export const renderToolbarButton = (button: unknown, label: string, onClick: () => void): TemplateResult => {
  const b = button as Button
  const chroming = chromingFor(b)
  injectOjStylesIntoContentHeaders()
  return html`<span data-oj-binding-provider="preact" style="display: inline-flex;">
    <oj-c-button
      label="${label}"
      chroming="${chroming}"
      ?disabled=${b?.disabled}
      @ojAction=${() => onClick()}></oj-c-button>
  </span>`
}

/** Previous/next peer-object arrows in the page header (borderless icon buttons). */
export const renderPeerNav = (peerNav: { prevLabel?: string; prevRoute?: string; nextLabel?: string; nextRoute?: string }): TemplateResult => {
  injectOjStylesIntoContentHeaders()
  return html`
  <span data-oj-binding-provider="preact" style="display: inline-flex; gap: 4px;">
    <oj-c-button chroming="borderless" class="peer-nav-prev"
      title="${peerNav.prevLabel ?? 'Previous'}"
      ?disabled=${!peerNav.prevRoute}
      @ojAction=${() => { if (peerNav.prevRoute) window.location.href = peerNav.prevRoute }}>
      <span slot="startIcon" class="oj-ux-ico-caret-left"></span>
    </oj-c-button>
    <oj-c-button chroming="borderless" class="peer-nav-next"
      title="${peerNav.nextLabel ?? 'Next'}"
      ?disabled=${!peerNav.nextRoute}
      @ojAction=${() => { if (peerNav.nextRoute) window.location.href = peerNav.nextRoute }}>
      <span slot="startIcon" class="oj-ux-ico-caret-right"></span>
    </oj-c-button>
  </span>`
}
