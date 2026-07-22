import { html, LitElement, TemplateResult } from 'lit'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import FormField from '@mateu/shared/apiClients/dtos/componentmetadata/FormField'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { ComponentData, ComponentState } from '@infra/ui/renderers/types.ts'
import { MateuTableCrud } from '@infra/ui/mateu-table-crud.ts'
import { ojReady } from './oj.ts'
import { renderField } from './fields.ts'
import { renderButton, renderPeerNav, renderToolbarButton } from './buttons.ts'
import {
  renderAccordionLayout,
  renderCard,
  renderFormLayout,
  renderHorizontalLayout,
  renderTabLayout,
  renderVerticalLayout,
} from './layouts.ts'
import { renderPagination, renderTableComponent } from './crud.ts'
import {
  renderDashboardPanel,
  renderEmptyState,
  renderFoldoutLayout,
  renderHeroSection,
  renderMetricCard,
  renderScoreboard,
  renderSkeleton,
} from './spectra.ts'
import { renderBadge, renderChart, renderProgressBar } from './misc.ts'

/**
 * Types rendered with real Oracle JET (oj-c) components or hand-built Redwood markup.
 * Everything else falls through to the shared switch (delegated set below).
 */
const OJ_RENDERED: ReadonlySet<ComponentMetadataType> = new Set([
  ComponentMetadataType.FormField,
  ComponentMetadataType.Button,
  ComponentMetadataType.Card,
  ComponentMetadataType.TabLayout,
  ComponentMetadataType.AccordionLayout,
  ComponentMetadataType.FormLayout,
  ComponentMetadataType.HorizontalLayout,
  ComponentMetadataType.VerticalLayout,
  ComponentMetadataType.Badge,
  ComponentMetadataType.ProgressBar,
  ComponentMetadataType.Chart,
  // Spectra (oj-sp)
  ComponentMetadataType.MetricCard,
  ComponentMetadataType.Scoreboard,
  ComponentMetadataType.DashboardPanel,
  ComponentMetadataType.HeroSection,
  ComponentMetadataType.EmptyState,
  ComponentMetadataType.FoldoutLayout,
  ComponentMetadataType.Skeleton,
])

/**
 * Types rendered by the shared, design-system-agnostic Mateu infrastructure, themed into
 * Redwood via the Lumo→Redwood token bridge (and the renderer hooks for table/filter bar /
 * pagination / toolbar buttons):
 *  - Page / Form / App: structural containers (mateu-page honours the Redwood band hooks)
 *  - Crud: shared mateu-table-crud orchestrates search/toolbar/state and calls back into this
 *    renderer for the table, pagination and toolbar buttons
 *  - Text: plain semantic typography (inherits the Redwood font)
 *  - Dialog / Drawer / Details / Popover / Tooltip / MenuBar / Breadcrumbs …: shared chrome
 */
const DELEGATED: ReadonlySet<ComponentMetadataType> = new Set([
  ComponentMetadataType.Page,
  ComponentMetadataType.Form,
  ComponentMetadataType.App,
  ComponentMetadataType.Crud,
  ComponentMetadataType.Text,
  ComponentMetadataType.FormSection,
  ComponentMetadataType.FormSubSection,
  ComponentMetadataType.Container,
  ComponentMetadataType.Div,
  ComponentMetadataType.Element,
  ComponentMetadataType.FullWidth,
  ComponentMetadataType.Scroller,
  ComponentMetadataType.Anchor,
  ComponentMetadataType.Icon,
  ComponentMetadataType.Image,
  ComponentMetadataType.Markdown,
  ComponentMetadataType.Breadcrumbs,
  ComponentMetadataType.MenuBar,
  ComponentMetadataType.Dialog,
  ComponentMetadataType.Drawer,
  ComponentMetadataType.Details,
  ComponentMetadataType.Popover,
  ComponentMetadataType.Tooltip,
  ComponentMetadataType.ConfirmDialog,
  ComponentMetadataType.Notification,
  ComponentMetadataType.CustomField,
  ComponentMetadataType.ContextMenu,
  ComponentMetadataType.Separator,
  ComponentMetadataType.BulletedList,
  ComponentMetadataType.DashboardLayout,
  ComponentMetadataType.Avatar,
  ComponentMetadataType.AvatarGroup,
  ComponentMetadataType.FormRow,
  ComponentMetadataType.FormItem,
])

export const SUPPORTED_TYPES: ReadonlySet<ComponentMetadataType> = new Set([...OJ_RENDERED, ...DELEGATED])

/**
 * The Redwood Spectra renderer: draws the Mateu wire format with real Oracle JET 19 (oj-c) and
 * Spectra (oj-sp) components loaded from Oracle's CDN.
 *
 * When the CDN could not be reached at boot (window.__mateuOj.ready === false), every hook
 * delegates to the shared base renderer and the app stays usable (graceful degradation).
 */
export class RedwoodSpectraComponentRenderer extends BasicComponentRenderer {
  rendererName(): string {
    return 'redwood-spectra'
  }

  supportedClientSideTypes(): ReadonlySet<ComponentMetadataType> | undefined {
    // CDN down → declare full support so nothing renders as a placeholder; the shared switch
    // then draws everything with the base components.
    return ojReady() ? SUPPORTED_TYPES : undefined
  }

  rendersCrudLayouts(): boolean {
    return ojReady()
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
    if (ojReady() && component?.metadata) {
      const type = component.metadata.type
      const ctx = { container, component, baseUrl, state, data, appState, appData }
      switch (type) {
        case ComponentMetadataType.FormField:
          return renderField(component, component.metadata as FormField, state, labelAlreadyRendered)
        case ComponentMetadataType.Button:
          return renderButton(component, state, data)
        case ComponentMetadataType.Card:
          return renderCard(ctx)
        case ComponentMetadataType.TabLayout:
          return renderTabLayout(ctx)
        case ComponentMetadataType.AccordionLayout:
          return renderAccordionLayout(ctx)
        case ComponentMetadataType.FormLayout:
          return renderFormLayout(ctx)
        case ComponentMetadataType.HorizontalLayout:
          return renderHorizontalLayout(ctx)
        case ComponentMetadataType.VerticalLayout:
          return renderVerticalLayout(ctx)
        case ComponentMetadataType.Badge:
          return renderBadge(component)
        case ComponentMetadataType.ProgressBar:
          return renderProgressBar(component, state)
        case ComponentMetadataType.Chart:
          return renderChart(component)
        case ComponentMetadataType.MetricCard:
          return renderMetricCard(component)
        case ComponentMetadataType.Scoreboard:
          return renderScoreboard(ctx)
        case ComponentMetadataType.DashboardPanel:
          return renderDashboardPanel(ctx)
        case ComponentMetadataType.HeroSection:
          return renderHeroSection(ctx)
        case ComponentMetadataType.EmptyState:
          return renderEmptyState(component)
        case ComponentMetadataType.FoldoutLayout:
          return renderFoldoutLayout(ctx)
        case ComponentMetadataType.Skeleton:
          return renderSkeleton(component)
        case ComponentMetadataType.FormRow:
        case ComponentMetadataType.FormItem:
          // Structural grouping inside form layouts — flatten into the child stream.
          return html`${component.children?.map(child =>
            this.renderClientSideComponent(container, child as ClientSideComponent, baseUrl, state, data, appState, appData, labelAlreadyRendered))}`
        default:
          break
      }
    }
    return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
  }

  renderTableComponent(
    container: MateuTableCrud,
    component: ClientSideComponent | undefined,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
  ): TemplateResult {
    if (!ojReady()) {
      return super.renderTableComponent(container, component, baseUrl, state, data, appState, appData)
    }
    return renderTableComponent(container, component, baseUrl, state, data, appState, appData)
  }

  renderPagination(container: MateuTableCrud, component: ClientSideComponent | undefined): TemplateResult {
    if (!ojReady()) {
      return super.renderPagination(container, component)
    }
    return renderPagination(container, component)
  }

  // renderFilterBar intentionally NOT overridden: the shared mateu-filter-bar already IS the
  // Redwood smart-search chips pattern, themed via the Lumo→Redwood bridge.

  renderToolbarButton(button: unknown, label: string, onClick: () => void): TemplateResult {
    if (!ojReady()) {
      // Let mateu-content-header / mateu-table-crud render their default button instead
      // (an empty TemplateResult would be truthy and suppress it).
      return undefined as unknown as TemplateResult
    }
    return renderToolbarButton(button, label, onClick)
  }

  renderPeerNav(peerNav: { prevLabel?: string; prevRoute?: string; nextLabel?: string; nextRoute?: string }): TemplateResult {
    if (!ojReady()) {
      return undefined as unknown as TemplateResult
    }
    return renderPeerNav(peerNav)
  }
}
