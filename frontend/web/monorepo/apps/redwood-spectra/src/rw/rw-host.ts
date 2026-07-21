import { LitElement, html, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import type Component from '@mateu/shared/apiClients/dtos/Component'
import type ServerSideComponent from '@mateu/shared/apiClients/dtos/ServerSideComponent'
import type UIFragment from '@mateu/shared/apiClients/dtos/UIFragment'
import type UICommand from '@mateu/shared/apiClients/dtos/UICommand'
import { UIFragmentAction } from '@mateu/shared/apiClients/dtos/UIFragmentAction'
import { renderComponent } from '@/rw/render-tree'
import {
  registerHost,
  unregisterHost,
  runActionAndApply,
  type IncrementSink,
} from '@/rw/host-bus'
import { runCommand, type CommandHost } from '@/rw/commands'

/**
 * A stateful host for one ServerSide wire node (clean-room mateu-component — NO Vaadin). It holds
 * the node's state/data, renders its children through the native tree, turns field changes into
 * trigger-driven actions, calls the protocol client on actions, and applies fragments/commands
 * addressed to its id.
 */
@customElement('rw-host')
export class RwHost extends LitElement implements IncrementSink, CommandHost {
  // Light DOM: global Redwood CSS + oj-c upgrades need it, and events bubble without shadow hops.
  protected createRenderRoot(): HTMLElement {
    return this
  }

  @property({ attribute: false }) component!: ServerSideComponent
  @property() baseUrl = ''
  @property({ attribute: false }) seedState: Record<string, unknown> = {}
  @property({ attribute: false }) seedData: Record<string, unknown> = {}
  @property({ attribute: false }) appState: Record<string, unknown> = {}
  @property({ attribute: false }) appData: Record<string, unknown> = {}

  @state() private st: Record<string, unknown> = {}
  @state() private dt: Record<string, unknown> = {}

  private seeded = false
  private registeredId: string | undefined
  private readonly autoSaveTimers = new Map<string, ReturnType<typeof setTimeout>>()

  connectedCallback(): void {
    super.connectedCallback()
    this.registeredId = this.component?.id
    registerHost(this.registeredId, this)
  }
  disconnectedCallback(): void {
    super.disconnectedCallback()
    unregisterHost(this.registeredId, this)
  }

  willUpdate(_changed: PropertyValues): void {
    if (!this.seeded && this.component) {
      this.seeded = true
      this.st = { ...this.seedState }
      this.dt = { ...this.seedData }
    }
  }

  render(): TemplateResult {
    return html`<div
      @value-changed=${this.onValueChanged}
      @action-requested=${this.onActionRequested}
    >
      ${(this.component?.children ?? []).map((c) =>
        renderComponent(this, c, this.baseUrl, this.st, this.dt, this.appState, this.appData),
      )}
    </div>`
  }

  // ---- field change → triggers ---------------------------------------------------------------

  private onValueChanged = (e: Event): void => {
    e.stopPropagation()
    const detail = (e as CustomEvent).detail as { value: unknown; fieldId: string }
    if (!detail?.fieldId) return
    this.st = { ...this.st, [detail.fieldId]: detail.value }
    const triggers = this.component?.triggers ?? []
    triggers
      .filter((t) => String(t.type) === 'OnValueChange')
      .filter((t) => !t.propertyName || t.propertyName === detail.fieldId)
      .forEach((t) => this.requestAction(t.actionId, {}))
    triggers
      .filter((t) => String(t.type) === 'AutoSave')
      .forEach((t) => {
        const ms = t.debounceMillis ?? 800
        const prev = this.autoSaveTimers.get(t.actionId)
        if (prev) clearTimeout(prev)
        this.autoSaveTimers.set(
          t.actionId,
          setTimeout(() => {
            this.autoSaveTimers.delete(t.actionId)
            this.requestAction(t.actionId, {})
          }, ms),
        )
      })
  }

  // ---- action-requested → server -------------------------------------------------------------

  private onActionRequested = (e: Event): void => {
    const detail = (e as CustomEvent).detail as {
      actionId: string
      parameters?: Record<string, unknown>
    }
    if (!detail?.actionId) return
    const owns = (this.component?.actions ?? []).some((a) => a.id === detail.actionId)
    if (!owns) return // let it bubble to an ancestor host
    e.stopPropagation()
    this.requestAction(detail.actionId, detail.parameters ?? {})
  }

  requestAction(actionId: string, parameters: Record<string, unknown>): void {
    void runActionAndApply({
      baseUrl: this.baseUrl,
      route: '',
      consumedRoute: '',
      actionId,
      initiatorComponentId: this.component?.id ?? '',
      serverSideType: this.component?.serverSideType,
      componentState: { ...this.st },
      parameters,
      initiator: this,
    })
  }

  // ---- increment sink ------------------------------------------------------------------------

  applyFragment(fragment: UIFragment): void {
    if (fragment.component) {
      if (fragment.action === UIFragmentAction.Add) {
        const children: Component[] = [...(this.component.children ?? []), fragment.component]
        this.component = { ...this.component, children }
      } else {
        this.component = fragment.component as ServerSideComponent
        this.seeded = true // adopt the new tree; don't re-seed from the old seedState
        if (fragment.action === UIFragmentAction.Replace) {
          this.st = {}
          this.dt = {}
        }
      }
    }
    if (fragment.state) this.st = { ...this.st, ...fragment.state }
    if (fragment.data) this.dt = { ...this.dt, ...fragment.data }
    this.requestUpdate()
  }

  applyCommand(command: UICommand): void {
    runCommand(command, this)
  }

  closeOverlay(): void {
    // Overlays arrive as Add-fragment children; drop the last one so a re-render doesn't resurrect it.
    const children = this.component?.children ?? []
    if (children.length) {
      this.component = { ...this.component, children: children.slice(0, -1) }
      this.requestUpdate()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rw-host': RwHost
  }
}
