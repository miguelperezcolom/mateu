import { html, nothing, type TemplateResult } from 'lit'

/** App metadata shape (subset of the wire App DTO) the shell reads. */
export interface MenuItem {
  label?: string
  icon?: string
  separator?: boolean
  route?: string
  consumedRoute?: string
  serverSideType?: string
  actionId?: string
  selected?: boolean
  submenus?: MenuItem[]
}

export interface ContextSelector {
  fieldName: string
  label?: string
  options?: { value?: unknown; label?: string }[]
}

export interface HeaderAction {
  actionId: string
  label?: string
  icon?: string
  children?: HeaderAction[]
}

export interface AppMeta {
  title?: string
  subtitle?: string
  logo?: string
  variant?: string
  menu?: MenuItem[]
  homeRoute?: string
  homeConsumedRoute?: string
  homeServerSideType?: string
  serverSideType?: string
  themeToggle?: boolean
  contextSelectors?: ContextSelector[]
  contextActions?: HeaderAction[]
}

export interface ShellHandlers {
  onNavigate: (item: MenuItem) => void
  onToggleNav: () => void
  onHome: () => void
  onContextChange?: (fieldName: string, value: unknown) => void
  onHeaderAction?: (actionId: string) => void
}

/**
 * Maps a Mateu (Vaadin-flavoured) icon name to an Oracle Redwood ojux icon class. The ojux icon
 * font (oj-ux-ico-*) is loaded from the CDN. Unknown names fall back to a neutral tile glyph.
 */
export function ojIcon(name: string | undefined): string {
  if (!name) return 'oj-ux-ico-tiles'
  const n = name.replace(/^vaadin:/, '').replace(/^lumo:/, '').toLowerCase()
  const map: Record<string, string> = {
    home: 'oj-ux-ico-home',
    dashboard: 'oj-ux-ico-bar-chart',
    'chart-bar': 'oj-ux-ico-bar-chart',
    user: 'oj-ux-ico-contact',
    users: 'oj-ux-ico-contact-group',
    'user-card': 'oj-ux-ico-contact',
    cog: 'oj-ux-ico-settings',
    cogs: 'oj-ux-ico-settings',
    settings: 'oj-ux-ico-settings',
    list: 'oj-ux-ico-list',
    table: 'oj-ux-ico-table',
    grid: 'oj-ux-ico-table',
    file: 'oj-ux-ico-file',
    'file-text': 'oj-ux-ico-file-text',
    folder: 'oj-ux-ico-folder',
    calendar: 'oj-ux-ico-calendar',
    clock: 'oj-ux-ico-clock',
    search: 'oj-ux-ico-search',
    cart: 'oj-ux-ico-cart',
    package: 'oj-ux-ico-box',
    box: 'oj-ux-ico-box',
    tag: 'oj-ux-ico-tag',
    tags: 'oj-ux-ico-tag',
    money: 'oj-ux-ico-money',
    invoice: 'oj-ux-ico-invoice',
    bell: 'oj-ux-ico-bell',
    envelope: 'oj-ux-ico-email',
    tiles: 'oj-ux-ico-tiles',
    building: 'oj-ux-ico-building',
    globe: 'oj-ux-ico-globe',
    tools: 'oj-ux-ico-wrench',
  }
  return map[n] ?? 'oj-ux-ico-tiles'
}

function renderMenuItem(item: MenuItem, activeRoute: string, handlers: ShellHandlers, depth: number): TemplateResult {
  if (item.separator) return html`<li class="mateu-nav-separator" role="separator"></li>`

  const children = item.submenus ?? []
  if (children.length > 0) {
    return html`
      <li class="mateu-nav-group">
        <div class="mateu-nav-group-label oj-typography-body-xs oj-text-color-secondary">
          <span class="${ojIcon(item.icon)} mateu-nav-icon"></span>
          <span>${item.label ?? ''}</span>
        </div>
        <ul class="mateu-nav-sublist">
          ${children.map((c) => renderMenuItem(c, activeRoute, handlers, depth + 1))}
        </ul>
      </li>
    `
  }

  const isActive = !!item.route && normaliseRoute(item.route) === normaliseRoute(activeRoute)
  return html`
    <li>
      <a
        class="mateu-nav-item ${isActive ? 'active' : ''}"
        href="#"
        @click=${(e: Event) => {
          e.preventDefault()
          handlers.onNavigate(item)
        }}
      >
        <span class="${ojIcon(item.icon)} mateu-nav-icon"></span>
        <span class="mateu-nav-label">${item.label ?? item.route ?? ''}</span>
      </a>
    </li>
  `
}

function normaliseRoute(r: string): string {
  return (r ?? '').replace(/^\/+|\/+$/g, '')
}

/** @AppContext selector → a compact header dropdown that fixes a value for every screen. */
function renderContextSelector(s: ContextSelector, handlers: ShellHandlers): TemplateResult {
  const options = s.options ?? []
  return html`<label class="mateu-context-selector" title=${s.label ?? s.fieldName}>
    <select @change=${(e: Event) => handlers.onContextChange?.(s.fieldName, (e.target as HTMLSelectElement).value)}>
      <option value="">${s.label ?? s.fieldName}</option>
      ${options.map((o) => html`<option value=${String(o.value ?? '')}>${o.label ?? String(o.value ?? '')}</option>`)}
    </select>
  </label>`
}

/** App header action → a button (or dropdown of children) next to the context selectors. */
function renderHeaderAction(a: HeaderAction, handlers: ShellHandlers): TemplateResult {
  const children = a.children ?? []
  if (children.length) {
    return html`<div class="mateu-header-action-group">
      <button class="mateu-header-action">${a.label ?? ''} ▾</button>
      <div class="mateu-header-action-menu">
        ${children.map((c) => html`<button @click=${() => handlers.onHeaderAction?.(c.actionId)}>${c.label ?? ''}</button>`)}
      </div>
    </div>`
  }
  return html`<button class="mateu-header-action" @click=${() => handlers.onHeaderAction?.(a.actionId)}>
    ${a.icon ? html`<span class="${ojIcon(a.icon)}"></span>` : nothing}${a.label ?? ''}
  </button>`
}

/**
 * The authentic Redwood app shell — plain HTML using Oracle's own oj-web-applayout / oj-flex /
 * oj-typography CSS classes (from the CDN oj-redwood-min.css). No OJET component / binding-provider
 * dependency here: the chrome is bulletproof CSS, and the real oj-c / oj-sp / oj-dynamic components
 * live only inside the routed content. Mirrors the Visual Builder dashboard example's shell markup.
 */
export function renderShell(
  app: AppMeta,
  activeRoute: string,
  navCollapsed: boolean,
  pageWidth: string,
  handlers: ShellHandlers,
  content: TemplateResult | typeof nothing,
): TemplateResult {
  const menu = app.menu ?? []
  const selectors = app.contextSelectors ?? []
  const actions = app.contextActions ?? []
  return html`
    <div class="oj-web-applayout-page mateu-redwood-shell">
      <header class="oj-web-applayout-header mateu-header" role="banner">
        <div class="oj-flex-bar oj-sm-align-items-center mateu-header-bar">
          <div class="oj-flex-bar-start oj-sm-align-items-center">
            <button
              class="mateu-icon-button"
              aria-label="Toggle navigation"
              @click=${() => handlers.onToggleNav()}
            >
              <span class="oj-ux-ico-menu"></span>
            </button>
            <a
              class="mateu-app-title oj-typography-heading-sm oj-typography-bold"
              href="#"
              @click=${(e: Event) => {
                e.preventDefault()
                handlers.onHome()
              }}
              >${app.title ?? 'Mateu'}</a
            >
          </div>
          <div class="oj-flex-bar-end oj-sm-align-items-center mateu-header-end">
            ${selectors.map((s) => renderContextSelector(s, handlers))}
            ${actions.map((a) => renderHeaderAction(a, handlers))}
            <span class="oj-ux-ico-contact mateu-header-avatar" aria-hidden="true"></span>
          </div>
        </div>
      </header>

      <div class="mateu-shell-body">
        <nav class="mateu-nav-rail ${navCollapsed ? 'collapsed' : ''}" aria-label="Application navigation">
          <ul class="mateu-nav-list">
            ${menu.map((item) => renderMenuItem(item, activeRoute, handlers, 0))}
          </ul>
        </nav>
        <main class="mateu-content-area oj-web-applayout-content" id="mateu-content" data-page-width=${pageWidth}>
          ${content}
        </main>
      </div>
    </div>
  `
}
