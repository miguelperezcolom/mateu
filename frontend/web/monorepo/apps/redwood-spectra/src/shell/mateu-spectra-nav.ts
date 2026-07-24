import { LitElement, html, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'

/** One Mateu menu node (subset of the wire MenuOption used for navigation). */
interface MenuNode {
  label?: string
  route?: string
  icon?: string
  separator?: boolean
  submenus?: MenuNode[]
}

/** A product-map tree item (optionsKeys map label/url onto these). Leaves MUST carry children:[]. */
interface MapNode {
  id: string
  label: string
  url: string
  children: MapNode[]
}

/**
 * The authentic Ask-Oracle navigation for the Redwood Spectra shell: a search trigger in the global
 * header that opens the full-screen `oj-sp-ask-oracle-product-map` (fed with the app menu as a tree).
 * Selecting an item navigates via the standard SPA route events. Renders in LIGHT DOM so the oj-sp
 * component upgrades (it needs the body's preact binding provider, which doesn't cross a shadow root).
 */
@customElement('mateu-spectra-nav')
export class MateuSpectraNav extends LitElement {
  /** The Mateu app menu tree (App DTO `menu`). */
  @property({ attribute: false }) menu: MenuNode[] = []

  /** App title — used to label the synthetic category that holds the top-level leaf routes. */
  @property({ attribute: false }) appTitle = ''

  @state() private open = false

  private overlay?: HTMLElement

  // Light DOM: oj-sp-* VComponents only upgrade under the body's data-oj-binding-provider="preact".
  protected createRenderRoot(): HTMLElement {
    return this
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.closePalette()
  }

  protected updated(_c: PropertyValues): void {
    if (this.open && !this.overlay) this.openPalette()
    if (!this.open && this.overlay) this.closePalette()
  }

  private toMapTree(nodes: MenuNode[], prefix = 'm'): MapNode[] {
    const out: MapNode[] = []
    nodes.forEach((n, i) => {
      if (n.separator) return
      const id = `${prefix}-${i}`
      out.push({
        id,
        label: n.label ?? '',
        url: n.route ?? '',
        children: n.submenus?.length ? this.toMapTree(n.submenus, id) : [],
      })
    })
    return out
  }

  /**
   * The Ask-Oracle product-map treats TOP-LEVEL nodes as categories (headers) and only navigates on
   * their children — so a top-level LEAF route (e.g. a `@Menu RouteLink`) would be dead. Wrap all
   * top-level leaves under one synthetic category (the app title) so they become navigable 2nd-level
   * items; top-level groups stay as their own categories.
   */
  private buildRootTree(): MapNode[] {
    const nodes = (this.menu ?? []).filter((n) => !n.separator)
    const leaves = nodes.filter((n) => !n.submenus?.length)
    const groups = nodes.filter((n) => n.submenus?.length)
    const out: MapNode[] = []
    if (leaves.length) {
      out.push({
        id: '__general__',
        label: this.appTitle || 'Menú',
        url: '',
        children: leaves.map((n, i) => ({ id: `leaf-${i}`, label: n.label ?? '', url: n.route ?? '', children: [] })),
      })
    }
    groups.forEach((n, i) => {
      const id = `grp-${i}`
      out.push({ id, label: n.label ?? '', url: n.route ?? '', children: this.toMapTree(n.submenus ?? [], id) })
    })
    return out
  }

  private navigate(route: string): void {
    this.open = false
    this.dispatchEvent(new CustomEvent('route-changed', { detail: { route }, bubbles: true, composed: true }))
    this.dispatchEvent(new CustomEvent('navigate-to-requested', { detail: { route }, bubbles: true, composed: true }))
  }

  private openPalette(): void {
    const ATDP = (window as unknown as { __mateuArrayTreeDataProvider?: new (d: unknown[], o: unknown) => unknown })
      .__mateuArrayTreeDataProvider
    if (!ATDP) return

    const overlay = document.createElement('div')
    overlay.className = 'mateu-spectra-nav-overlay'
    overlay.setAttribute('style', 'position:fixed; inset:0; z-index:9999;')

    const close = document.createElement('button')
    close.setAttribute('aria-label', 'Close')
    close.textContent = '✕'
    close.setAttribute(
      'style',
      'position:fixed; top:1rem; right:1.25rem; z-index:10000; width:2.25rem; height:2.25rem; border:none; border-radius:50%; background:rgba(255,255,255,.15); color:#fff; font-size:1.1rem; cursor:pointer;',
    )
    close.addEventListener('click', () => (this.open = false))

    const pm = document.createElement('oj-sp-ask-oracle-product-map') as HTMLElement & {
      data?: unknown
      optionsKeys?: unknown
    }
    pm.setAttribute('style', 'display:block; width:100%; height:100%;')
    pm.data = new ATDP(this.buildRootTree(), { keyAttributes: 'id', childrenAttribute: 'children' })
    pm.optionsKeys = { label: 'label', url: 'url' }
    pm.addEventListener('ojSpNavigate', (e: Event) => {
      const d = (e as CustomEvent).detail as Record<string, unknown> | undefined
      const url =
        (d?.url as string) ??
        ((d?.data as Record<string, unknown>)?.url as string) ??
        ((d?.item as Record<string, unknown>)?.url as string) ??
        (typeof d === 'string' ? (d as unknown as string) : undefined)
      if (url) this.navigate(url)
    })

    overlay.append(pm, close)
    document.body.appendChild(overlay)
    this.overlay = overlay
    this._esc = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') this.open = false
    }
    document.addEventListener('keydown', this._esc)
  }

  private _esc?: (ev: KeyboardEvent) => void

  private closePalette(): void {
    if (this._esc) document.removeEventListener('keydown', this._esc)
    this._esc = undefined
    this.overlay?.remove()
    this.overlay = undefined
  }

  protected render() {
    return html`
      <button
        class="mateu-spectra-nav-trigger"
        title="Search & navigate"
        @click=${() => (this.open = true)}
        style="display:inline-flex; align-items:center; gap:.5rem; height:2.25rem; padding:0 1rem; min-width:16rem;
               border:1px solid rgba(255,255,255,.35); border-radius:1.25rem; background:rgba(255,255,255,.1);
               color:#fff; font:inherit; cursor:pointer;"
      >
        <span aria-hidden="true">🔍</span>
        <span style="opacity:.85;">Search &amp; navigate</span>
      </button>
    `
  }
}
