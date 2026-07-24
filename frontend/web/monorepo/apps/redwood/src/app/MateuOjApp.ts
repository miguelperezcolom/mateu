import { html, nothing, render, type TemplateResult } from 'lit'
import { MateuSession, type NavTarget, type OverlayOpenerContext } from '../core/MateuSession'
import { MateuViewController, type RenderedView } from '../core/MateuViewController'
import { loadOjet, type OjRuntime } from '../oj/runtime'
import { renderShell, type AppMeta, type MenuItem } from '../views/shell/renderShell'
import { renderView, type RenderContext } from '../views/renderView'
import { renderComponent, type RenderCtx } from '../views/renderComponent'

interface Overlay {
  node: Json
  controller: MateuViewController
}

type Json = Record<string, any>

export interface MateuOjAppConfig {
  /** The app's base URL (the AP-injected `<mateu-ui baseUrl>`; '' for a root app). */
  baseUrl: string
  /** Optional path prefix stripped when reading the route from window.location. */
  pathPrefix?: string
  /** The DOM node the whole app renders into. */
  root: HTMLElement
}

/**
 * The redwood renderer's top-level app: the OJET-native island. It owns the app SHELL (menu / header
 * chrome, from the App wire metadata) and a single CONTENT controller (the ported MateuViewController)
 * that drives the routed content area. This mirrors the web shell/content split (mateu-app + mateu-ux)
 * without reusing any of Mateu's Lit shadow-DOM components — so the real Oracle JET components render
 * in light DOM with no shadow-boundary / binding-provider friction.
 */
export class MateuOjApp {
  private readonly baseUrl: string
  private readonly pathPrefix: string
  private readonly root: HTMLElement
  private readonly sessionId = crypto.randomUUID()

  private session!: MateuSession
  private content!: MateuViewController
  private runtime: OjRuntime | null = null

  private app: AppMeta = {}
  private activeRoute = ''
  private navCollapsed = false
  private view: RenderedView = { component: null, state: {}, data: null, loading: true, error: null, version: 0 }
  private overlays: Overlay[] = []

  constructor(cfg: MateuOjAppConfig) {
    this.baseUrl = (cfg.baseUrl ?? '').replace(/\/+$/, '')
    this.pathPrefix = cfg.pathPrefix ?? ''
    this.root = cfg.root
  }

  async boot(): Promise<void> {
    // OJET load runs in parallel with the first data load — the shell needs no OJET, and the content
    // renderers await ojRuntime.ready() themselves. Never let a CDN hiccup block the app booting.
    loadOjet().then(
      (rt) => {
        this.runtime = rt
        this.renderAll()
      },
      (e) => console.warn('[redwood] OJET runtime unavailable — content falls back to plain HTML.', e),
    )

    this.session = new MateuSession(this.baseUrl, this.sessionId)
    this.wireSession()

    this.content = new MateuViewController(this.session)
    this.content.onRender = (v) => {
      this.view = v
      this.renderAll()
    }
    this.content.detailOpener = null // in-place navigation (single content area)

    this.activeRoute = this.routeFromUrl()
    this.renderAll()

    // One raw load to obtain the App metadata (menu + chrome) for the shell.
    try {
      const inc = await this.session.api.initialLoad(this.activeRoute, this.session.appState)
      const appMeta = extractApp(inc)
      if (appMeta) this.app = appMeta
      this.renderAll()
      // Hand the same increment to the content controller so it resolves/follows to the content
      // (App → home route) without a second manual load.
      this.content.currentRoute = this.activeRoute
      this.content.currentConsumedRoute = ''
      this.content.applyIncrement(inc as Json)
    } catch (e) {
      this.view = { ...this.view, loading: false, error: errorText(e) }
      this.renderAll()
    }

    window.addEventListener('popstate', () => {
      const route = this.routeFromUrl()
      this.activeRoute = route
      void this.content.navigate(route, '', this.app.serverSideType ?? '')
    })
  }

  // ── session host hooks ──────────────────────────────────────────────────────────────

  private wireSession(): void {
    this.session.notify = (title, text, variant) => {
      // Phase 0: console toast. A real oj-sp-messages toast is wired in the chrome phase.
      const line = title ? `${title}: ${text}` : text
      if (variant === 'error') console.error('[Mateu]', line)
      else console.log('[Mateu]', variant, line)
    }
    this.session.setTitle = (title) => {
      if (title) document.title = title
    }
    this.session.openView = (target: NavTarget) => {
      this.navigateTo(target.route, target.consumedRoute, target.serverSideType)
    }
    this.session.openOverlay = (component, state, _data, opener?: OverlayOpenerContext) => {
      const node = component as Json
      const ctrl = new MateuViewController(this.session)
      ctrl.onRender = () => this.renderAll()
      if (opener) {
        ctrl.currentRoute = opener.route
        ctrl.currentConsumedRoute = opener.consumedRoute
        ctrl.currentServerSideType = opener.serverSideType
      }
      const init = ((node['metadata'] as Json)?.['initialData'] as Json) ?? (state as Json) ?? {}
      ctrl.currentComponentState = { ...init }
      this.overlays.push({ node, controller: ctrl })
      this.renderAll()
    }
    this.session.closeTopOverlay = () => {
      this.overlays.pop()
      this.renderAll()
    }
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.overlays.length) {
        this.overlays.pop()
        this.renderAll()
      }
    })
  }

  // ── navigation ──────────────────────────────────────────────────────────────────────

  private onNavigate = (item: MenuItem): void => {
    if (item.actionId) {
      void this.content.runAction(item.actionId)
      return
    }
    this.navigateTo(item.route ?? '', item.consumedRoute ?? '', item.serverSideType ?? '')
  }

  private navigateTo(route: string, consumedRoute: string, serverSideType: string): void {
    this.activeRoute = normalise(route)
    this.pushUrl(route)
    void this.content.navigate(route, consumedRoute, serverSideType)
  }

  private pushUrl(route: string): void {
    const clean = normalise(route)
    const url = this.baseUrl + this.pathPrefix + (clean ? '/' + clean : '')
    try {
      window.history.pushState({}, '', url || '/')
    } catch {
      /* ignore */
    }
  }

  /** The RDS page-width anatomy (fixed / fullWidth / edgeToEdge) — the wire carries it on the Page
   *  metadata (and the ServerSide wrapper). Drives the content area's max-width / gutters. */
  private resolvePageWidth(): string {
    const comp = this.view.component as Json | null
    const pw = (comp?.['metadata'] as Json)?.['pageWidth'] ?? comp?.['pageWidth']
    return typeof pw === 'string' && pw ? pw : 'fixed'
  }

  private routeFromUrl(): string {
    let path = decodeURIComponent(window.location.pathname)
    if (this.pathPrefix && path.startsWith(this.pathPrefix)) path = path.slice(this.pathPrefix.length)
    if (this.baseUrl && path.startsWith(this.baseUrl)) path = path.slice(this.baseUrl.length)
    return normalise(path)
  }

  // ── rendering ───────────────────────────────────────────────────────────────────────

  private renderAll(): void {
    const ctx: RenderContext = { controller: this.content, runtime: this.runtime }
    const content: TemplateResult | typeof nothing = renderView(this.view, ctx)
    const pageWidth = this.resolvePageWidth()
    const shell = renderShell(this.app, this.activeRoute, this.navCollapsed, pageWidth, {
      onNavigate: this.onNavigate,
      onToggleNav: () => {
        this.navCollapsed = !this.navCollapsed
        this.renderAll()
      },
      onHome: () => this.navigateTo(this.app.homeRoute ?? '', this.app.homeConsumedRoute ?? '', this.app.homeServerSideType ?? ''),
      onContextChange: (fieldName, value) => {
        // @AppContext: fix a value for every screen — merge into appState, reload the current route.
        this.session.appState[fieldName] = value
        void this.content.navigate(this.activeRoute, this.content.currentConsumedRoute, this.app.serverSideType ?? '')
      },
      onHeaderAction: (actionId) => void this.content.runAction(actionId),
    }, content)
    render(html`${shell}${this.overlays.map((o) => this.renderOverlay(o))}`, this.root)
  }

  /** Render a Dialog / Drawer overlay: backdrop + panel with the content driven by its own
   *  controller (seeded with the opener's navigation context so its buttons dispatch on the host). */
  private renderOverlay(overlay: Overlay): TemplateResult {
    const m = (overlay.node['metadata'] as Json) ?? {}
    const isDrawer = String(m['type']) === 'Drawer'
    const title = String(m['headerTitle'] ?? m['title'] ?? '')
    const subtitle = String(m['subtitle'] ?? '')
    const position = String(m['position'] ?? 'end')
    const width = String(m['width'] ?? (isDrawer ? '36rem' : ''))
    const content = m['content'] as unknown
    const ctx: RenderCtx = {
      controller: overlay.controller,
      runtime: this.runtime,
      state: overlay.controller.currentComponentState,
      data: null,
    }
    const close = () => {
      const i = this.overlays.indexOf(overlay)
      if (i >= 0) this.overlays.splice(i, 1)
      this.renderAll()
    }
    const panelStyle = isDrawer ? `width:${width}; ${position === 'start' ? 'left:0;' : position === 'bottom' ? 'left:0;right:0;bottom:0;width:auto;' : 'right:0;'}` : ''
    return html`
      <div class="mateu-overlay-backdrop" @click=${close}>
        <div
          class="mateu-overlay ${isDrawer ? 'drawer drawer-' + position : 'dialog'}"
          style=${panelStyle}
          @click=${(e: Event) => e.stopPropagation()}
        >
          <div class="mateu-overlay-header">
            <div>
              ${title ? html`<div class="mateu-overlay-title oj-typography-heading-sm">${title}</div>` : nothing}
              ${subtitle ? html`<div class="oj-typography-body-sm oj-text-color-secondary">${subtitle}</div>` : nothing}
            </div>
            <button class="mateu-icon-button" aria-label="Close" @click=${close}><span class="oj-ux-ico-close"></span></button>
          </div>
          <div class="mateu-overlay-body">${content ? renderComponent(content, ctx) : nothing}</div>
        </div>
      </div>
    `
  }
}

// ── helpers ─────────────────────────────────────────────────────────────────────────────

/** Walk the increment's fragment component trees for the App metadata (menu + chrome). */
function extractApp(inc: unknown): AppMeta | null {
  const fragments = ((inc as Json)?.['fragments'] as Json[]) ?? []
  for (const fragment of fragments) {
    const found = findApp(fragment['component'])
    if (found) return found
  }
  return null
}

function findApp(component: unknown, depth = 0): AppMeta | null {
  if (!component || typeof component !== 'object' || depth > 6) return null
  const node = component as Json
  const meta = (node['metadata'] as Json) ?? {}
  if (meta['type'] === 'App') return meta as AppMeta
  for (const child of (node['children'] as Json[]) ?? []) {
    const found = findApp(child, depth + 1)
    if (found) return found
  }
  return null
}

function normalise(r: string): string {
  return (r ?? '').replace(/^\/+|\/+$/g, '')
}

function errorText(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}
