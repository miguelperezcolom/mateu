import { LitElement, html, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import type UICommand from '@mateu/shared/apiClients/dtos/UICommand'
import { renderComponent } from '@/rw/render-tree'
import {
  appBags,
  runActionAndApply,
  setRootSink,
  type IncrementSink,
} from '@/rw/host-bus'
import { runCommand, type CommandHost } from '@/rw/commands'

/**
 * The clean-room root (replaces mateu-ui + mateu-ux — NO Vaadin): owns the route, does the initial
 * load (runAction with an empty actionId), holds the routed fragment and renders it through the
 * native tree. Each explorer route is its own page, so back/forward just reloads.
 */
@customElement('rw-root')
export class RwRoot extends LitElement implements IncrementSink, CommandHost {
  protected createRenderRoot(): HTMLElement {
    return this
  }

  @property() baseUrl = ''
  @property() route = ''

  @state() private fragment: UIFragment | undefined

  connectedCallback(): void {
    super.connectedCallback()
    setRootSink(this)
    window.addEventListener('popstate', this.onPopState)
    void this.load()
  }
  disconnectedCallback(): void {
    super.disconnectedCallback()
    setRootSink(undefined)
    window.removeEventListener('popstate', this.onPopState)
  }
  private onPopState = (): void => {
    window.location.reload()
  }

  private async load(): Promise<void> {
    await runActionAndApply({
      baseUrl: this.baseUrl,
      route: this.route,
      consumedRoute: '',
      actionId: '',
      initiatorComponentId: 'rw-root',
      serverSideType: undefined,
      componentState: {},
      parameters: {},
      initiator: this,
    })
  }

  applyFragment(fragment: UIFragment): void {
    if (!fragment.component && this.fragment?.component) {
      // state/data-only patch: merge, keep the routed content
      this.fragment = {
        ...this.fragment,
        state: { ...this.fragment.state, ...fragment.state },
        data: { ...this.fragment.data, ...fragment.data },
      }
    } else {
      this.fragment = fragment
    }
    this.requestUpdate()
  }

  applyCommand(command: UICommand): void {
    runCommand(command, this)
  }
  requestAction(): void {
    void this.load()
  }
  closeOverlay(): void {
    /* overlays are owned by inner hosts */
  }

  render(): TemplateResult {
    if (!this.fragment?.component) {
      return html`<div class="rw-loading">Loading…</div>`
    }
    return renderComponent(
      this,
      this.fragment.component,
      this.baseUrl,
      (this.fragment.state as Record<string, unknown>) ?? {},
      (this.fragment.data as Record<string, unknown>) ?? {},
      appBags.state,
      appBags.data,
    )
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rw-root': RwRoot
  }
}
