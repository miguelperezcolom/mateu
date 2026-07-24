import { nothing, render, type TemplateResult } from 'lit'
import { MateuSession, type NavTarget } from '../core/MateuSession'
import { MateuViewController, type RenderedView } from '../core/MateuViewController'
import { loadOjet, type OjRuntime } from '../oj/runtime'
import { renderShell, type AppMeta, type MenuItem } from '../views/shell/renderShell'
import { renderView, type RenderContext } from '../views/renderView'

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
    // Overlays wired in Phase 3/4.
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
    render(
      renderShell(this.app, this.activeRoute, this.navCollapsed, {
        onNavigate: this.onNavigate,
        onToggleNav: () => {
          this.navCollapsed = !this.navCollapsed
          this.renderAll()
        },
        onHome: () => this.navigateTo(this.app.homeRoute ?? '', this.app.homeConsumedRoute ?? '', this.app.homeServerSideType ?? ''),
      }, content),
      this.root,
    )
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
