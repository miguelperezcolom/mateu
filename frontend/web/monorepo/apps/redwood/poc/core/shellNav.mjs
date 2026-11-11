import { VAADIN_TO_OJ } from './iconMap.mjs'
import { sectionHomeOf, sectionRoutes, isSentinelHome } from '../navTree.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the shell: icons and the navigation menu.

/** Shell NAVIGATION projection: top-level items + groups with their children.
 *  A group's children navigate by their COMPOSED route (/gestion/person) with the app's
 *  serverSideType (like Vaadin); a RouteLink inside a group does not resolve that way and is loaded
 *  by its TERMINAL route (loadMenuRouteInto, in transport.mjs).
 *  Context selectors and header actions come out ready for simple bindings. */
// Menu icons: the wire brings NEUTRAL names (Mateu convention: Vaadin's set,
// e.g. "vaadin:calendar-user") — each renderer translates them to its set; here, to the Redwood
// icon font (oj-ux-ico-*, gallery bundle classes). A value that already comes as an
// oj-ux class passes as is; with no known translation → no icon.
export const OJ_ICONS = {
  'vaadin:calendar-user': 'oj-ux-ico-calendar-contact',
  'vaadin:calendar': 'oj-ux-ico-calendar',
  'vaadin:tasks': 'oj-ux-ico-task',
  'vaadin:automation': 'oj-ux-ico-robot-action',
  'vaadin:cog': 'oj-ux-ico-settings',
  'vaadin:cogs': 'oj-ux-ico-settings',
  'vaadin:home': 'oj-ux-ico-home',
  'vaadin:user': 'oj-ux-ico-contact',
  'vaadin:users': 'oj-ux-ico-contact-group',
  'vaadin:bed': 'oj-ux-ico-bed',
  'vaadin:chart': 'oj-ux-ico-bar-chart',
  'vaadin:table': 'oj-ux-ico-table',
  'vaadin:money': 'oj-ux-ico-currency-money',
  'vaadin:barcode': 'oj-ux-ico-scan-barcode',
  'vaadin:pencil': 'oj-ux-ico-edit',
  'vaadin:ban': 'oj-ux-ico-do-not-enter',
  'vaadin:rotate-left': 'oj-ux-ico-undo',
  'vaadin:exchange': 'oj-ux-ico-exchange-h',
  'vaadin:wifi': 'oj-ux-ico-connection',
  'vaadin:key': 'oj-ux-ico-key',
  'vaadin:pen': 'oj-ux-ico-signature',
  'vaadin:credit-card': 'oj-ux-ico-bank-card',
  'vaadin:gift': 'oj-ux-ico-gift',
  'vaadin:cart': 'oj-ux-ico-cart',
  'vaadin:check': 'oj-ux-ico-check',
  'vaadin:arrow-right': 'oj-ux-ico-arrow-right',
  'vaadin:arrow-left': 'oj-ux-ico-arrow-left',
  'vaadin:clock': 'oj-ux-ico-clock',
  'vaadin:list': 'oj-ux-ico-list',
  // the tray badge's bell (header widget)
  'vaadin:bell': 'oj-ux-ico-notification',
  'vaadin:bell-o': 'oj-ux-ico-notification',
  'vaadin:envelope': 'oj-ux-ico-email',
  'vaadin:sign-out': 'oj-ux-ico-logout',
  'vaadin:sign-in': 'oj-ux-ico-login',
  'vaadin:cloud': 'oj-ux-ico-cloud',
  'vaadin:trending-up': 'oj-ux-ico-trending-up',
  'vaadin:building': 'oj-ux-ico-building',
  'vaadin:refresh': 'oj-ux-ico-refresh',
  'vaadin:close-circle': 'oj-ux-ico-close-circle',
  'vaadin:tablet': 'oj-ux-ico-tablet-portrait',
}
export function ojIconOf(icon) {
  if (!icon) return undefined
  if (icon.indexOf('oj-ux-') === 0) return icon
  if (OJ_ICONS[icon]) return OJ_ICONS[icon]
  // the whole Vaadin set (and lumo:), translated to the gallery font's names (core/iconMap.mjs)
  const m = /^(?:vaadin|lumo):([a-z0-9-]+)$/.exec(String(icon))
  return m && VAADIN_TO_OJ[m[1]] ? 'oj-ux-ico-' + VAADIN_TO_OJ[m[1]] : undefined
}

/** The generic icon for a DECLARED icon that has no Redwood translation. */
export const GENERIC_ICON = 'oj-ux-ico-arrow-circle-right'

/**
 * Like ojIconOf, but a declared icon with no translation falls back to a generic one: a menu entry
 * or an icon-only button is never left blank («Llegadas» with vaadin:sign-in came out with no
 * icon next to its siblings). ojIconOf stays strict: the widgets' HTML drops the ones it does not
 * know and the Ask FAB falls back to its own glyph.
 */
export function ojIconOrGenericOf(icon) {
  if (!icon) return undefined
  return ojIconOf(icon) || GENERIC_ICON
}

/**
 * A menu option → node of the tree the bar and the navigator paint.
 *
 * RECURSIVE because the menu is: a federated shell arrives with three levels without asking
 * (shell group → pod group → its screens), and flattening it does not make the third level ugly,
 * it makes it UNREACHABLE — the pod group is navigated as if it were a screen and answers empty.
 *
 * `id` is the route it navigates with: the TERMINAL one for a local leaf (the composed one,
 * /gestion/person, is a menu path and not a route the backend resolves) and the COMPOSED one
 * for one brought from another pod (the mark is the baseUrl expandRemoteMenus left on it): there it
 * is exactly the other way round — it is the one that pod serves, and trimming it leaves it ownerless.
 */
/** The id prefix of a menu leaf that runs rules instead of navigating (RuleLink). */
export const MENU_RULE_PREFIX = '__menuRule:'

/** A menu option's node id: its route, or — for a leaf carrying rules — a marked id. */
export function menuNodeIdOf(option, raw) {
  const r = raw != null ? raw : (option.route || option.path || '')
  return (option.rules || []).length ? MENU_RULE_PREFIX + (r || option.label || '') : r
}

export function navNodeOf(option, parentRoute) {
  const raw = option.route || option.path || ''
  // the COMPOSED route (/gestion/person), as in Vaadin: it is a menu path the backend
  // resolves with the app's serverSideType (onMateuNavigate adds it via localMenuOptionOf).
  // Trimming it to the terminal (/person) only worked if the @Menu field was named like its
  // class's @UI route; with `@Menu FloorPlan floorPlan` + @UI("/floor-plan") it was left ownerless.
  void parentRoute
  // a leaf that RUNS rules (RuleLink — e.g. a RunAction naming one of the shell's flows) does not
  // navigate: its id is marked so onMateuNavigate runs its rules instead (shellFlows.mjs)
  const id = menuNodeIdOf(option, raw)
  // a HIDDEN entry (@Menu @Hidden, visible:false) is not drawn at any depth: its route
  // still resolves (the transport registers it), but the menu does not show it
  const children = (option.submenus || option.submenu || []).filter((child) => child.visible !== false)
  return {
    id,
    label: option.caption || option.label || id,
    icon: ojIconOrGenericOf(option.icon),
    // a remote section whose pod did not answer: it is there, but it does not open, and says why
    disabled: !!option.unavailable,
    hint: option.unavailable ? (option.description || '') : '',
    hasChildren: children.length > 0,
    // a grandchild's parent is the child's RAW route, not its already trimmed id
    children: children.map((child) => navNodeOf(child, raw)),
    // CARD MENU (@Menu(display = cards) on a group): instead of an oj-menu, an oj-popup
    // with a grid of oj-action-card — title, description, icon/image and, if the entry has
    // children, those children as the card's actions. The ids of the popup and its launcher are
    // precomputed (VB's CSP does not concatenate in templates).
    ...cardsOf(option, children, raw),
  }
}

export function cardsOf(option, children, raw) {
  const isCards = option.display === 'cards' && children.length > 0
  if (!isCards) return { isCards: false, cards: [], popupId: '', anchorId: '' }
  const key = String(raw || option.label || 'cards').replace(/[^A-Za-z0-9_-]/g, '_')
  return {
    isCards: true,
    popupId: 'mateuCards_' + key,
    anchorId: 'mateuCardsBtn_' + key,
    cards: children.filter((c) => !c.separator).map((child) => {
      const node = navNodeOf(child, raw)
      return {
        id: node.id,
        label: node.label,
        description: child.description || '',
        // a declared icon with no Redwood equivalent takes the generic one: the cards stay aligned
        iconClass: child.icon ? ojIconOrGenericOf(child.icon) : '',
        image: child.image || '',
        hasImage: !!child.image,
        hasIcon: !child.image && !!child.icon,
        navigable: !node.hasChildren,
        actions: node.children.filter((a) => !a.hasChildren).map((a) => ({ id: a.id, label: a.label })),
      }
    }),
  }
}

/**
 * What the shell draws around the content, from its nav mode: the navigator (HAMBURGER_MENU folds
 * it with the hamburger; MENU_ON_LEFT and RAIL keep it docked, RAIL narrow), no chrome at all
 * (@App(chromeless)), and Spectra's Ask FAB (the Search-or-go palette) — off in a FRAMED app (an
 * iframe preview) that enables no command center or global search: there the FAB only covered the
 * small frame's content. Pure.
 */
export function shellChromeOf(nav, shell, framed = false) {
  const mode = (nav && nav.mode) || ''
  const palette = !!(shell && (shell.commandCenterEnabled || shell.globalSearchEnabled || shell.chromeless))
  return {
    drawer: mode === 'drawer' || mode === 'left' || mode === 'rail',
    docked: mode === 'left' || mode === 'rail',
    rail: mode === 'rail',
    chromeless: mode === 'none',
    askFab: framed && !palette ? 'off' : 'on',
  }
}

export function shellNavOf(reg) {
  const shell = reg.shell || {}
  const items = []
  const menuTree = []
  let hasGroups = false
  for (const option of shell.menu || []) {
    // an option that travels without being painted (hidden remote): expandRemoteMenus already removes it, but a
    // menu that does not go through there must not draw it either
    if (option.visible === false) continue
    // TILES: every group opens as a panel of CARDS (the card menu, @Menu(display = cards)) —
    // Redwood's springboard of tiles, in the subheader band
    const tiled = shell.variant === 'TILES' && (option.submenus || option.submenu || []).length && !option.display
      ? { ...option, display: 'cards' } : option
    const node = navNodeOf(tiled, '')
    items.push(node.disabled
      ? { id: node.id, label: node.label, icon: node.icon, disabled: true }
      : { id: node.id, label: node.label, icon: node.icon })
    if (node.hasChildren) hasGroups = true
    // the routes the section covers: with them the one on screen is marked (activeSectionOf)
    node.routes = sectionRoutes(option, node)
    // HAMBURGER_SECTIONS: where choosing the section in the hamburger leads (its first screen)
    node.home = sectionHomeOf(node)
    menuTree.push(node)
  }
  // the wire's VARIANT rules: TABS → in-app navigation; HAMBURGER_MENU/TILES →
  // hamburger that opens a left DRAWER with oj-navigation-list (like the FA
  // navigator); MENU_ON_TOP → SUBHEADER: a light band under the dark header with the
  // console title and the top-level options (oj-menu dropdown for the groups), like band 2
  // of the web renderer; TABS with groups (they do not fit in the bottom bar) → those same options
  // inside the dark header (topbar)
  // HAMBURGER_SECTIONS (Opera Cloud) → SECTIONS: the hamburger opens a drawer with the first
  // level (only the sections) and the subheader carries the second level of the section on screen.
  // MENU_ON_LEFT → LEFT: the same navigator, docked and always there (no hamburger to fold it);
  // RAIL → RAIL: that navigator as a narrow rail of the first level; TILES → the subheader band
  // with each group as a panel of cards; @App(chromeless) → NONE: no navigation chrome at all —
  // the Ask palette (the command center) is the way around
  let mode = 'tabs'
  if (shell.chromeless) mode = 'none'
  else if (shell.variant === 'HAMBURGER_MENU') mode = 'drawer'
  else if (shell.variant === 'MENU_ON_LEFT') mode = 'left'
  else if (shell.variant === 'RAIL') mode = 'rail'
  else if (shell.variant === 'TILES') mode = 'tiles'
  else if (shell.variant === 'HAMBURGER_SECTIONS') mode = 'sections'
  else if (shell.variant === 'MENU_ON_TOP') mode = 'subheader'
  else if (hasGroups) mode = 'topbar'
  return {
    mode,
    title: shell.title || '',
    items,
    menuTree,
    // the hamburger list in sections mode: each section, without what hangs from it; its id
    // is its home (what navigates when chosen) and `section` the section's (what gets marked)
    sections: menuTree.map((node) => ({
      id: node.home || node.id,
      section: node.id,
      label: node.label,
      icon: node.icon,
      disabled: node.disabled || !node.home,
      hint: node.hint,
      hasChildren: false,
      children: [],
    })),
    selectors: (shell.appContext || []).map((selector) => ({
      fieldName: selector.fieldName,
      label: selector.label || selector.fieldName,
      options: (selector.options || []).map((o) => ({ value: o.value, label: o.label || String(o.value) })),
    })),
    // a YAML header action may NAVIGATE (AppHeaderActionDto.route) instead of dispatching:
    // headerActionRouteOf tells the click chain where to go
    headerActions: (shell.headerActions || []).map((a) => ({
      actionId: a.actionId,
      label: a.label,
      route: a.route || '',
      hasChildren: !!(a.children && a.children.length),
      children: (a.children || []).map((c) => ({ actionId: c.actionId, label: c.label, route: c.route || '' })),
    })),
    serverSideType: shell.serverSideType,
    // no declared home (server sentinel) → the menu's first screen IN DEPTH:
    // with sections (HAMBURGER_SECTIONS) the first level is groups and the section's home is its
    // first entry; the sentinel used to be loaded as is and the app started on «Not found.»
    homeRoute: isSentinelHome(shell.homeRoute)
      ? ((menuTree.find((node) => node.home) || {}).home || '')
      : shell.homeRoute,
  }
}

/**
 * The in-app route a header action navigates to (AppHeaderActionDto.route, authored in YAML), or ''
 * when it dispatches its actionId app-level as before. Looked up by the clicked key — the actionId,
 * or, for a route-only action (no actionId), the route itself — at any depth of the dropdowns.
 */
export function headerActionRouteOf(headerActions, key) {
  if (key == null || key === '') return ''
  for (const a of headerActions || []) {
    if (a && a.route && (a.actionId === key || a.route === key)) return a.route
    const inner = headerActionRouteOf(a && a.children, key)
    if (inner) return inner
  }
  return ''
}
