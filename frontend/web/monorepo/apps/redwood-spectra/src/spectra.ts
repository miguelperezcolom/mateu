/**
 * Spectra (oj-sp) mappings — the whole reason this renderer exists.
 *
 * The oj-sp pack components are Knockout-era composites (oj-bootstrap loads ojs/ojknockout for
 * them), so their props are set as KEBAB-CASE ATTRIBUTES (objects as JSON), not properties.
 * Composite events (ojSpAction / spPrimaryAction / spAction…) are translated into Mateu's
 * action-requested contract.
 */
import { html, nothing, TemplateResult } from 'lit'
import { LitElement } from 'lit'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import MetricCard from '@mateu/shared/apiClients/dtos/componentmetadata/MetricCard'
import DashboardPanel from '@mateu/shared/apiClients/dtos/componentmetadata/DashboardPanel'
import HeroSection from '@mateu/shared/apiClients/dtos/componentmetadata/HeroSection'
import EmptyState from '@mateu/shared/apiClients/dtos/componentmetadata/EmptyState'
import FoldoutLayout from '@mateu/shared/apiClients/dtos/componentmetadata/FoldoutLayout'
import Skeleton from '@mateu/shared/apiClients/dtos/componentmetadata/Skeleton'
import { renderComponent } from '@infra/ui/renderers/renderComponent.ts'
import { ComponentData, ComponentState } from '@infra/ui/renderers/types.ts'
import { dispatchActionRequested } from './oj.ts'

type Ctx = {
  container: LitElement
  component: ClientSideComponent
  baseUrl: string | undefined
  state: ComponentState
  data: ComponentData
  appState: ComponentState
  appData: ComponentData
}

const trendBadge = (trend: 'up' | 'down' | 'neutral' | undefined, label: string | undefined): string | typeof nothing => {
  if (!trend && !label) return nothing
  const status = trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'neutral'
  return JSON.stringify({ text: label ?? trend, status })
}

export const renderMetricCard = (component: ClientSideComponent): TemplateResult => {
  const m = component.metadata as MetricCard
  return html`
    <oj-sp-metric-card
      card-title="${m.title ?? ''}"
      metric-text="${m.value ?? ''}${m.unit ? ` ${m.unit}` : ''}"
      meta-text="${m.trendLabel ?? nothing}"
      description-text="${m.description ?? nothing}"
      badge="${trendBadge(m.trend, m.trendLabel)}"
      style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
      slot="${component.slot ?? nothing}"
      @ojSpAction=${(e: Event) => { if (m.actionId) dispatchActionRequested(e.target as Element, m.actionId) }}>
    </oj-sp-metric-card>`
}

export const renderScoreboard = (c: Ctx): TemplateResult => html`
  <div class="mateu-oj-scoreboard" style="${c.component.style ?? nothing}" slot="${c.component.slot ?? nothing}">
    ${c.component.children?.map(child => renderComponent(c.container, child as ClientSideComponent, c.baseUrl, c.state, c.data, c.appState, c.appData))}
  </div>`

export const renderDashboardPanel = (c: Ctx): TemplateResult => {
  const m = c.component.metadata as DashboardPanel
  return html`
    <div class="mateu-oj-card mateu-oj-dashboard-panel"
         style="${m?.colSpan ? `grid-column: span ${m.colSpan};` : ''}${m?.rowSpan ? `grid-row: span ${m.rowSpan};` : ''}${c.component.style ?? ''}"
         slot="${c.component.slot ?? nothing}">
      ${m?.title || m?.subtitle ? html`
        <div class="mateu-oj-card-header">
          <div>
            ${m.title ? html`<div class="mateu-oj-card-title">${m.title}</div>` : nothing}
            ${m.subtitle ? html`<div class="mateu-oj-card-subtitle">${m.subtitle}</div>` : nothing}
          </div>
        </div>` : nothing}
      <div class="mateu-oj-card-content">
        ${c.component.children?.map(child => renderComponent(c.container, child as ClientSideComponent, c.baseUrl, c.state, c.data, c.appState, c.appData))}
      </div>
    </div>`
}

export const renderHeroSection = (c: Ctx): TemplateResult => {
  const m = c.component.metadata as HeroSection
  // oj-sp-welcome-page is the Spectra hero: title + description over a themed Redwood image.
  return html`
    <oj-sp-welcome-page
      page-title="${m?.title ?? ''}"
      description-text="${m?.subtitle ?? nothing}"
      themed-image="${m?.image ? 'none' : 'pebbles'}"
      style="${m?.height ? `min-height: ${m.height};` : ''}${c.component.style ?? ''}"
      class="${m?.centered ? 'mateu-oj-hero-centered' : ''} ${c.component.cssClasses ?? ''}"
      slot="${c.component.slot ?? nothing}">
      ${m?.image ? html`<img slot="image" src="${m.image}" alt="" style="display:none">` : nothing}
      ${c.component.children?.map(child => renderComponent(c.container, child as ClientSideComponent, c.baseUrl, c.state, c.data, c.appState, c.appData))}
    </oj-sp-welcome-page>`
}

export const renderEmptyState = (component: ClientSideComponent): TemplateResult => {
  const m = component.metadata as EmptyState
  const primaryAction = m.actionId && m.actionLabel
    ? JSON.stringify({ label: m.actionLabel, display: 'on', type: 'callToAction' })
    : nothing
  return html`
    <oj-sp-empty-state
      primary-text="${m.title ?? ''}"
      secondary-text="${m.description ?? nothing}"
      primary-action="${primaryAction}"
      style="${component.style ?? nothing}" class="${component.cssClasses ?? nothing}"
      slot="${component.slot ?? nothing}"
      @spPrimaryAction=${(e: Event) => { if (m.actionId) dispatchActionRequested(e.target as Element, m.actionId) }}>
    </oj-sp-empty-state>`
}

export const renderFoldoutLayout = (c: Ctx): TemplateResult => {
  const m = c.component.metadata as FoldoutLayout
  const children = (c.component.children ?? []) as ClientSideComponent[]
  const overview = children.filter(ch => ch.slot === 'overview')
  return html`
    <oj-sp-foldout-layout
      header-title="${m?.headerTitle ?? ''}"
      style="${c.component.style ?? nothing}" class="${c.component.cssClasses ?? nothing}"
      slot="${c.component.slot ?? nothing}">
      ${(m?.panels ?? []).map((panel, i) => html`
        <oj-sp-foldout-panel panel-title="${panel.title ?? `Panel ${i + 1}`}">
          <div slot="summary">
            ${children.filter(ch => ch.slot === `panel-${i}`).map(ch => renderComponent(c.container, ch, c.baseUrl, c.state, c.data, c.appState, c.appData))}
          </div>
        </oj-sp-foldout-panel>`)}
      ${overview.map(ch => renderComponent(c.container, ch, c.baseUrl, c.state, c.data, c.appState, c.appData))}
    </oj-sp-foldout-layout>`
}

export const renderSkeleton = (component: ClientSideComponent): TemplateResult => {
  const m = component.metadata as Skeleton
  const count = m?.count ?? 1
  return html`
    <div style="${component.style ?? nothing}" slot="${component.slot ?? nothing}">
      ${Array.from({ length: count }, () => html`<oj-c-skeleton height="${m?.variant === 'card' ? '120px' : '16px'}"></oj-c-skeleton>`)}
    </div>`
}
