import { LitElement, type TemplateResult } from 'lit'
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { renderRedwoodField } from './fields/renderRedwoodField'
import { renderRedwoodButton } from './fields/renderRedwoodButton'
import {
  renderDashboardLayout,
  renderScoreboard,
  renderDashboardPanel,
  renderMetricCard,
} from './dashboard/renderRedwoodDashboard'
import { renderEntityHeader, renderCard } from './overview/renderRedwoodOverview'
import { renderFoldout } from './foldout/renderRedwoodFoldout'
import { renderWelcome } from './welcome/renderRedwoodWelcome'

type WidgetRenderer = (
  container: LitElement,
  component: ClientSideComponent,
  baseUrl: string | undefined,
  state: ComponentState,
  data: ComponentData,
  appState: ComponentState,
  appData: ComponentData,
  labelAlreadyRendered?: boolean,
) => TemplateResult

/**
 * Redwood (Oracle JET / Spectra) widget overrides. Each entry replaces the core DS-neutral default
 * for one wire type with an Oracle `oj-c-*` / `oj-sp-*` rendering (driven imperatively via
 * ojDriver's applyOj). Anything NOT listed here falls through to the neutral default in core, so
 * the adapter is always runnable while partial. Grow this map one line at a time.
 */
const REDWOOD_WIDGETS: Partial<Record<ComponentMetadataType, WidgetRenderer>> = {
  [ComponentMetadataType.FormField]: (c, comp, b, s, d, as, ad, lar) =>
    renderRedwoodField(c, comp, b, s, d, as, ad, lar),
  [ComponentMetadataType.Button]: (_c, comp, _b, s, d) => renderRedwoodButton(comp, s, d),
  // Dashboard family → Oracle Spectra dashboard components.
  [ComponentMetadataType.DashboardLayout]: (c, comp, b, s, d, as, ad) => renderDashboardLayout(c, comp, b, s, d, as, ad),
  [ComponentMetadataType.Scoreboard]: (c, comp, b, s, d, as, ad) => renderScoreboard(c, comp, b, s, d, as, ad),
  [ComponentMetadataType.DashboardPanel]: (c, comp, b, s, d, as, ad) => renderDashboardPanel(c, comp, b, s, d, as, ad),
  [ComponentMetadataType.MetricCard]: (c, comp) => renderMetricCard(c, comp),
  // General Overview surfaces → Redwood-styled header + card.
  [ComponentMetadataType.EntityHeader]: (c, comp) => renderEntityHeader(c, comp),
  [ComponentMetadataType.Card]: (c, comp, b, s, d, as, ad) => renderCard(c, comp, b, s, d, as, ad),
  // Foldout page → Oracle Spectra foldout layout.
  [ComponentMetadataType.FoldoutLayout]: (c, comp, b, s, d, as, ad) => renderFoldout(c, comp, b, s, d, as, ad),
  // Welcome / hero → Oracle Spectra welcome page.
  [ComponentMetadataType.HeroSection]: (c, comp, b, s, d, as, ad) => renderWelcome(c, comp, b, s, d, as, ad),
}

/**
 * The Redwood renderer as an ADAPTER on the de-vaadinized neutral core: it subclasses
 * BasicComponentRenderer and only overrides the widgets it re-skins with Oracle Redwood; the page
 * frame (the Spectra shell + pageLayout width anatomy) is applied in renderAppComponent.
 */
export class RedwoodComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {
  rendererName(): string {
    return 'redwood'
  }

  renderClientSideComponent(
    container: LitElement,
    component: ClientSideComponent | undefined,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
    labelAlreadyRendered: boolean | undefined,
  ): TemplateResult {
    const rawType = component?.metadata?.type ?? (component as unknown as { type?: string })?.type
    const type = (Object.values(ComponentMetadataType) as string[]).includes(rawType as string)
      ? (rawType as ComponentMetadataType)
      : undefined
    const widget = type ? REDWOOD_WIDGETS[type] : undefined
    if (widget && component) {
      return widget(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }
    return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
  }
}
