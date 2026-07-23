import { LitElement, html, nothing, type TemplateResult } from 'lit'
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import { renderApp } from '@infra/ui/renderers/appRenderer'
import { MateuApp } from '@infra/ui/mateu-app'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'
import { ComponentState, ComponentData } from '@infra/ui/renderers/types'
import { pageLayoutSync } from './shell/pageLayoutSync'
import './shell/mateu-spectra-nav' // registers <mateu-spectra-nav>
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
import { renderRedwoodEmptyState } from './emptystate/renderRedwoodEmptyState'
import { renderRedwoodSection } from './section/renderRedwoodSection'
import { renderRedwoodBreadcrumbs } from './breadcrumbs/renderRedwoodBreadcrumbs'
import {
  renderRedwoodAvatar,
  renderRedwoodProgressBar,
  renderRedwoodBadge,
  renderRedwoodMeter,
} from './display/renderRedwoodLeaves'

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
  // Empty state → Oracle Spectra oj-sp-empty-state.
  [ComponentMetadataType.EmptyState]: (_c, comp) => renderRedwoodEmptyState(comp),
  // Form section → Oracle Spectra oj-sp-section.
  [ComponentMetadataType.FormSection]: (c, comp, b, s, d, as, ad) => renderRedwoodSection(c, comp, b, s, d, as, ad),
  // Breadcrumbs → Oracle Spectra oj-sp-breadcrumb-container.
  [ComponentMetadataType.Breadcrumbs]: (_c, comp) => renderRedwoodBreadcrumbs(comp),
  // Leaf display components → authentic oj-c-*.
  [ComponentMetadataType.Avatar]: (_c, comp) => renderRedwoodAvatar(comp),
  [ComponentMetadataType.ProgressBar]: (_c, comp) => renderRedwoodProgressBar(comp),
  [ComponentMetadataType.Badge]: (_c, comp) => renderRedwoodBadge(comp),
  [ComponentMetadataType.Meter]: (_c, comp) => renderRedwoodMeter(comp),
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

  /**
   * The AUTHENTIC Spectra app shell. Instead of the neutral rail/hamburger chrome, we mount the real
   * `oj-sp-simple-ui-shell` with `oj-sp-global-header` (title + the Ask-Oracle nav palette + theme
   * toggle) in its globalHeader slot, and the routed content in stretchingContents. The content pane
   * is produced by the neutral renderer in CHROMELESS mode (just the mateu-ux router outlet + chat),
   * so we reuse all its routing wiring and only swap the chrome. Runs in light DOM (mateu-app renders
   * to light DOM here) so the oj-sp components upgrade.
   */
  renderAppComponent(
    container: MateuApp,
    component: ClientSideComponent | undefined,
    baseUrl: string | undefined,
    state: ComponentState,
    data: ComponentData,
    appState: ComponentState,
    appData: ComponentData,
  ): TemplateResult {
    const metadata = component?.metadata as App | undefined
    if (!metadata) {
      return super.renderAppComponent(container, component, baseUrl, state, data, appState, appData)
    }
    // Chromeless apps already have no chrome — let the neutral path handle them (content + FAB).
    if (metadata.chromeless) {
      return super.renderAppComponent(container, component, baseUrl, state, data, appState, appData)
    }

    // The routed content pane: neutral renderer in chromeless mode = mateu-api-caller > mateu-ux (+ chat).
    const content = renderApp(
      container,
      { ...metadata, chromeless: true } as App,
      baseUrl,
      state,
      data,
      appState,
      appData,
    )

    return html`
      <oj-sp-simple-ui-shell ${pageLayoutSync()}>
        <oj-sp-global-header slot="globalHeader">
          <span
            slot="start"
            class="mateu-spectra-app-title"
            style="font-weight:700; font-size:1rem; white-space:nowrap; color:#fff;"
            >${metadata.title ?? ''}</span
          >
          <mateu-spectra-nav slot="center" .menu=${metadata.menu ?? []}></mateu-spectra-nav>
          ${metadata.themeToggle
            ? html`<button
                slot="end"
                title="Toggle theme"
                @click=${container.toggleTheme}
                style="width:2.25rem; height:2.25rem; border:none; border-radius:50%; background:transparent; color:#fff; font-size:1.1rem; cursor:pointer;"
              >
                ${container.isDark ? '☀' : '🌙'}
              </button>`
            : nothing}
        </oj-sp-global-header>
        <div slot="stretchingContents" class="oj-sp-rw-ask-oracle-page-container">${content}</div>
      </oj-sp-simple-ui-shell>
    `
  }

  // The icon port for Redwood. Wire icon names are Vaadin/Lumo iconset names; there is no 1:1 map to
  // Oracle's ojux font, so the common app-chrome + action icons resolve to self-contained Unicode
  // glyphs (reliable, no font dependency). Unknown names fall back to a small neutral dot.
  renderIcon(name: string, style?: string, cssClasses?: string): TemplateResult {
    const key = (name || '').replace(/^(vaadin|lumo):/, '')
    const glyph = REDWOOD_ICON_GLYPHS[key]
    return html`<span class="mateu-icon ${cssClasses ?? ''}" data-icon="${name}" aria-hidden="true"
                      style="display:inline-flex; align-items:center; justify-content:center; width:1em; height:1em; line-height:1; ${style ?? ''}"
                >${glyph ?? '•'}</span>`
  }
}

// Vaadin/Lumo icon name (prefix stripped) → Unicode glyph, for the icons the shell + widgets actually use.
const REDWOOD_ICON_GLYPHS: Record<string, string> = {
  menu: '☰',            // ☰
  search: '🔍',    // 🔍
  'sun-o': '☀',         // ☀
  moon: '🌙',      // 🌙
  'comments-o': '💬', // 💬
  comment: '💬',
  plus: '+',            // +
  minus: '−',           // −
  check: '✓',           // ✓
  close: '✕',           // ✕
  edit: '✎',            // ✎
  trash: '🗑',     // 🗑
  dashboard: '▦',       // ▦
  bell: '🔔',      // 🔔
  user: '👤',      // 👤
  cog: '⚙',             // ⚙
  filter: '≡',          // ≡
  download: '⤓',        // ⤓
  upload: '⤑',          // ⤑
  refresh: '↻',         // ↻
  'angle-left': '‹',    // ‹
  'angle-right': '›',   // ›
  'angle-down': '⌄',    // ⌄
  'angle-up': '⌃',      // ⌃
  ellipsis: '⋯',        // ⋯
  'ellipsis-dots-v': '⋮', // ⋮
}
