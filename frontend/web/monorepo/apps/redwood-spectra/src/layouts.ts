/**
 * Layout mapping: Card / FormSection, TabLayout, AccordionLayout, FormLayout,
 * HorizontalLayout, VerticalLayout.
 *
 * Cards are hand-styled Redwood section cards (white slab, hairline border, 8px radius) so the
 * page keeps its Mateu structure (TOC anchors, sticky headers). Tabs use the real oj-c-tab-bar;
 * accordion uses a stack of real oj-c-collapsible panels; form layout uses oj-c-form-layout.
 */
import { html, LitElement, nothing, TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import Card from '@mateu/shared/apiClients/dtos/componentmetadata/Card'
import TabLayout from '@mateu/shared/apiClients/dtos/componentmetadata/TabLayout'
import Tab from '@mateu/shared/apiClients/dtos/componentmetadata/Tab'
import AccordionPanel from '@mateu/shared/apiClients/dtos/componentmetadata/AccordionPanel'
import FormLayout from '@mateu/shared/apiClients/dtos/componentmetadata/FormLayout'
import HorizontalLayout from '@mateu/shared/apiClients/dtos/componentmetadata/HorizontalLayout'
import VerticalLayout from '@mateu/shared/apiClients/dtos/componentmetadata/VerticalLayout'
import { renderComponent, renderComponentInSlot } from '@infra/ui/renderers/renderComponent.ts'
import { ComponentData, ComponentState } from '@infra/ui/renderers/types.ts'

type Ctx = {
  container: LitElement
  component: ClientSideComponent
  baseUrl: string | undefined
  state: ComponentState
  data: ComponentData
  appState: ComponentState
  appData: ComponentData
}

const childrenOf = (c: Ctx): unknown =>
  c.component.children?.map(child =>
    renderComponent(c.container, child as ClientSideComponent, c.baseUrl, c.state, c.data, c.appState, c.appData))

// ---------------------------------------------------------------- card ----

export const renderCard = (c: Ctx): TemplateResult => {
  const metadata = c.component.metadata as Card
  if (!metadata) return html``
  return html`
    <div style="${c.component.style ?? nothing}" class="mateu-oj-card ${c.component.cssClasses ?? ''}"
         slot="${c.component.slot ?? nothing}">
      ${metadata.title || metadata.header || metadata.headerPrefix || metadata.headerSuffix ? html`
        <div class="mateu-oj-card-header">
          ${metadata.headerPrefix ? renderComponentInSlot(c.container, metadata.headerPrefix, c.baseUrl, c.state, c.data, c.appState, c.appData, 'header-prefix', false) : nothing}
          ${metadata.title ? html`<div class="mateu-oj-card-title">${renderComponentInSlot(c.container, metadata.title, c.baseUrl, c.state, c.data, c.appState, c.appData, 'title', false)}</div>` : nothing}
          ${metadata.subtitle ? html`<div class="mateu-oj-card-subtitle">${renderComponentInSlot(c.container, metadata.subtitle, c.baseUrl, c.state, c.data, c.appState, c.appData, 'subtitle', false)}</div>` : nothing}
          ${metadata.header ? renderComponentInSlot(c.container, metadata.header, c.baseUrl, c.state, c.data, c.appState, c.appData, 'header', false) : nothing}
          <div style="flex: 1;"></div>
          ${metadata.headerSuffix ? renderComponentInSlot(c.container, metadata.headerSuffix, c.baseUrl, c.state, c.data, c.appState, c.appData, 'header-suffix', false) : nothing}
        </div>` : nothing}
      ${metadata.media ? html`<div class="mateu-oj-card-media">${renderComponentInSlot(c.container, metadata.media, c.baseUrl, c.state, c.data, c.appState, c.appData, 'media', false)}</div>` : nothing}
      <div class="mateu-oj-card-content">
        ${metadata.content ? renderComponent(c.container, metadata.content, c.baseUrl, c.state, c.data, c.appState, c.appData, false) : nothing}
        ${c.component.children?.map(child => renderComponent(c.container, child as ClientSideComponent, c.baseUrl, c.state, c.data, c.appState, c.appData))}
      </div>
      ${metadata.footer ? html`<div class="mateu-oj-card-footer">${renderComponentInSlot(c.container, metadata.footer, c.baseUrl, c.state, c.data, c.appState, c.appData, 'footer', false)}</div>` : nothing}
    </div>`
}

// ---------------------------------------------------------------- tabs ----

// oj-c.TabBar.TabData: the item key property is `itemKey` (NOT `id`) — with `id` the tab bar
// resolves every key to `undefined` and selection/rendering break.
type TabItem = { itemKey: string; label: string }

/**
 * Stateful tab host: keeps the selected tab client-side (Mateu tabs are disclosure, not server
 * state) and shows only the active panel. oj-c-tab-bar provides the real Redwood tab strip.
 */
@customElement('mateu-oj-tabs')
export class MateuOjTabs extends LitElement {
  @property({ attribute: false })
  items: TabItem[] = []

  @property({ type: Number })
  selected = 0

  // Light DOM: the oj-c styles live in the main document, and slotted Mateu children must stay
  // in the same tree as their mateu-component ancestors for event bubbling.
  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this
  }

  private onSelectionChanged(e: Event) {
    const key = (e as CustomEvent).detail?.value
    const idx = this.items.findIndex(i => i.itemKey === key)
    if (idx >= 0 && idx !== this.selected) {
      this.selected = idx
    }
  }

  private syncPanels() {
    const panels = Array.from(this.querySelectorAll(':scope > [data-tab-panel]')) as HTMLElement[]
    panels.forEach((p, i) => {
      p.style.display = i === this.selected ? '' : 'none'
    })
  }

  protected firstUpdated(): void {
    this.syncPanels()
  }

  protected updated(): void {
    this.syncPanels()
  }

  render(): TemplateResult {
    // Light DOM note: Lit appends this render result AFTER the panel divs projected by the
    // parent template, so CSS (`order: -1` in index.css) keeps the tab strip on top.
    // The <slot> below is inert in light DOM; panels are synced via querySelector instead.
    return html`
      <oj-c-tab-bar
        .data=${this.items}
        .selection=${this.items[this.selected]?.itemKey}
        edge="top"
        layout="condense"
        @selectionChanged=${this.onSelectionChanged}></oj-c-tab-bar>
      <div class="mateu-oj-tab-content"></div>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mateu-oj-tabs': MateuOjTabs
  }
}

export const renderTabLayout = (c: Ctx): TemplateResult => {
  const metadata = c.component.metadata as TabLayout
  const children = (c.component.children ?? []) as ClientSideComponent[]
  const items: TabItem[] = children.map((child, i) => {
    const tab = child.metadata as Tab
    const rawLabel = tab?.label ?? `Tab ${i + 1}`
    const label = rawLabel.includes('${') ? (c.container as unknown as { _evalTemplate: (s: string) => string })._evalTemplate(rawLabel) : rawLabel
    return { itemKey: String(i), label }
  })
  const active = Math.max(0, children.findIndex(child => (child.metadata as Tab)?.active))
  return html`
    <mateu-oj-tabs .items=${items} .selected=${active}
      style="${metadata?.fullWidth ? 'width: 100%;' : ''}${c.component.style ?? ''}"
      class="${c.component.cssClasses ?? nothing}" slot="${c.component.slot ?? nothing}">
      ${children.map(child => html`
        <div data-tab-panel>
          ${child.children?.map(grand => renderComponent(c.container, grand as ClientSideComponent, c.baseUrl, c.state, c.data, c.appState, c.appData))}
        </div>`)}
    </mateu-oj-tabs>`
}

// ---------------------------------------------------------------- accordion ----

export const renderAccordionLayout = (c: Ctx): TemplateResult => {
  const children = (c.component.children ?? []) as ClientSideComponent[]
  return html`
    <div class="mateu-oj-accordion" style="${c.component.style ?? nothing}" slot="${c.component.slot ?? nothing}">
      ${children.map(panel => {
        const meta = panel.metadata as AccordionPanel
        const label = meta?.label?.includes('${')
          ? (c.container as unknown as { _evalTemplate: (s: string) => string })._evalTemplate(meta.label)
          : meta?.label
        return html`
          <oj-c-collapsible ?expanded=${meta?.active === true} ?disabled=${meta?.disabled === true}>
            <span slot="header">${label ?? ''}</span>
            <div class="mateu-oj-accordion-body">
              ${panel.children?.map(child => renderComponent(c.container, child as ClientSideComponent, c.baseUrl, c.state, c.data, c.appState, c.appData))}
            </div>
          </oj-c-collapsible>`
      })}
    </div>`
}

// ---------------------------------------------------------------- form layout ----

export const renderFormLayout = (c: Ctx): TemplateResult => {
  const metadata = c.component.metadata as FormLayout
  // FormRow/FormItem are structural groupings the vaadin layout renders as rows/items;
  // oj-c-form-layout flows fields by colspan, so they flatten into the field stream.
  const flatten = (components: readonly unknown[]): ClientSideComponent[] =>
    (components as ClientSideComponent[]).flatMap(child => {
      const t = child?.metadata?.type
      if (t === 'FormRow' || t === 'FormItem') return flatten(child.children ?? [])
      return [child]
    })
  return html`
    <oj-c-form-layout
      direction="row"
      max-columns="${metadata?.maxColumns && metadata.maxColumns > 0 ? metadata.maxColumns : 12}"
      label-edge="${metadata?.labelsAside ? 'start' : 'top'}"
      style="${metadata?.fullWidth ? 'width: 100%;' : ''}${c.component.style ?? ''}"
      class="${c.component.cssClasses ?? nothing}"
      slot="${c.component.slot ?? nothing}">
      ${flatten(c.component.children ?? []).map(child =>
        renderComponent(c.container, child, c.baseUrl, c.state, c.data, c.appState, c.appData))}
    </oj-c-form-layout>`
}

// ---------------------------------------------------------------- h/v layouts ----

const spacingMap: Record<string, string> = { xs: '4px', s: '8px', m: '16px', l: '24px', xl: '32px' }

export const renderHorizontalLayout = (c: Ctx): TemplateResult => {
  const metadata = c.component.metadata as HorizontalLayout
  const gap = metadata?.spacingVariant ? spacingMap[metadata.spacingVariant] : (metadata?.spacing === false ? '0' : '16px')
  const style = `display: flex; flex-direction: row; gap: ${gap}; align-items: ${metadata?.verticalAlignment ? String(metadata.verticalAlignment).toLowerCase() : 'stretch'};`
    + (metadata?.justification ? `justify-content: ${String(metadata.justification).toLowerCase().replace('_', '-')};` : '')
    + (metadata?.wrap ? 'flex-wrap: wrap;' : '')
    + (metadata?.fullWidth ? 'width: 100%;' : '')
    + (metadata?.padding ? 'padding: 16px;' : '')
    + (c.component.style ?? '')
  return html`<div style="${style}" class="${c.component.cssClasses ?? nothing}" slot="${c.component.slot ?? nothing}">${childrenOf(c)}</div>`
}

export const renderVerticalLayout = (c: Ctx): TemplateResult => {
  const metadata = c.component.metadata as VerticalLayout
  const gap = metadata?.spacingVariant ? spacingMap[metadata.spacingVariant] : (metadata?.spacing === false ? '0' : '16px')
  const style = `display: flex; flex-direction: column; gap: ${gap};`
    + (metadata?.justification ? `justify-content: ${String(metadata.justification).toLowerCase().replace('_', '-')};` : '')
    + (metadata?.fullWidth ? 'width: 100%;' : '')
    + (metadata?.padding ? 'padding: 16px;' : '')
    + (c.component.style ?? '')
  return html`<div style="${style}" class="${c.component.cssClasses ?? nothing}" slot="${c.component.slot ?? nothing}">${childrenOf(c)}</div>`
}
