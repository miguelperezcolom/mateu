import { sectionHomeOf, sectionRoutes, isSentinelHome } from '../navTree.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the shell: icons and the navigation menu.

/** Proyección de NAVEGACIÓN de la shell: items de primer nivel + grupos con sus hijos.
 *  Los hijos de un grupo navegan por su ruta COMPUESTA (/gestion/person) con el serverSideType
 *  del app (como Vaadin); un RouteLink dentro de un grupo no resuelve así y se carga por su
 *  ruta TERMINAL (loadMenuRouteInto, en transport.mjs).
 *  Selectores de contexto y acciones de cabecera salen listos para bindings simples. */
// Iconos de menú: el wire trae nombres NEUTRALES (convención Mateu: set de Vaadin,
// p.ej. "vaadin:calendar-user") — cada renderer los traduce a su set; aquí, al icon
// font Redwood (oj-ux-ico-*, clases del gallery bundle). Un valor que ya venga como
// clase oj-ux pasa tal cual; sin traducción conocida → sin icono.
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
  'vaadin:clock': 'oj-ux-ico-clock',
  // la campana del badge de la bandeja (widget de cabecera)
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
}
export function ojIconOf(icon) {
  if (!icon) return undefined
  if (icon.indexOf('oj-ux-') === 0) return icon
  return OJ_ICONS[icon] || undefined
}

/** El icono genérico para un icono DECLARADO que no tiene traducción a Redwood. */
export const GENERIC_ICON = 'oj-ux-ico-arrow-circle-right'

/**
 * Como ojIconOf, pero un icono declarado sin traducción cae en uno genérico: una entrada de menú
 * o un botón de sólo icono nunca se queda en blanco («Llegadas» con vaadin:sign-in salía sin
 * icono junto a sus hermanas). ojIconOf sigue estricto: el HTML de los widgets quita los que no
 * conoce y el FAB de Ask cae en su propio glifo.
 */
export function ojIconOrGenericOf(icon) {
  if (!icon) return undefined
  return ojIconOf(icon) || GENERIC_ICON
}

/**
 * Una opción de menú → nodo del árbol que pintan la barra y el navigator.
 *
 * RECURSIVO porque el menú lo es: una shell federada llega con tres niveles sin pedir permiso
 * (grupo de la shell → grupo del pod → sus pantallas), y aplanarlo no deja el tercer nivel feo,
 * lo deja INALCANZABLE — el grupo del pod se navega como si fuese pantalla y contesta vacío.
 *
 * `id` es la ruta con la que se navega: la TERMINAL para una hoja local (la compuesta,
 * /gestion/person, es un camino de menú y no una ruta que el backend resuelva) y la COMPUESTA
 * para una traída de otro pod (la marca es el baseUrl que le dejó expandRemoteMenus): allí es
 * justo al revés — es la que ese pod sirve, y recortarla la deja sin dueño.
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
  // la ruta COMPUESTA (/gestion/person), como en Vaadin: es un camino de menú que el backend
  // resuelve con el serverSideType del app (onMateuNavigate lo añade vía localMenuOptionOf).
  // Recortarla a la terminal (/person) sólo funcionaba si el campo @Menu se llamaba como la ruta
  // @UI de su clase; con `@Menu FloorPlan floorPlan` + @UI("/floor-plan") quedaba sin dueño.
  void parentRoute
  // a leaf that RUNS rules (RuleLink — e.g. a RunAction naming one of the shell's flows) does not
  // navigate: its id is marked so onMateuNavigate runs its rules instead (shellFlows.mjs)
  const id = menuNodeIdOf(option, raw)
  // una entrada OCULTA (@Menu @Hidden, visible:false) no se dibuja a ninguna profundidad: su ruta
  // sigue resolviendo (la registra el transporte), pero el menú no la enseña
  const children = (option.submenus || option.submenu || []).filter((child) => child.visible !== false)
  return {
    id,
    label: option.caption || option.label || id,
    icon: ojIconOrGenericOf(option.icon),
    // una sección remota cuyo pod no contestó: está, pero no se abre, y dice por qué
    disabled: !!option.unavailable,
    hint: option.unavailable ? (option.description || '') : '',
    hasChildren: children.length > 0,
    // el padre de un nieto es la ruta CRUDA del hijo, no su id ya recortado
    children: children.map((child) => navNodeOf(child, raw)),
    // MENÚ DE TARJETAS (@Menu(display = cards) en un grupo): en vez de un oj-menu, un oj-popup
    // con una rejilla de oj-action-card — título, descripción, icono/imagen y, si la entrada tiene
    // hijos, esos hijos como acciones de la tarjeta. Los ids del popup y de su lanzador van
    // precalculados (el CSP de VB no concatena en las plantillas).
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
        // un icono declarado sin equivalente Redwood toma el genérico: las tarjetas quedan alineadas
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

export function shellNavOf(reg) {
  const shell = reg.shell || {}
  const items = []
  const menuTree = []
  let hasGroups = false
  for (const option of shell.menu || []) {
    // una opción que viaja sin pintarse (remota oculta): expandRemoteMenus ya la quita, pero un
    // menú que no pase por ahí tampoco debe dibujarla
    if (option.visible === false) continue
    const node = navNodeOf(option, '')
    items.push(node.disabled
      ? { id: node.id, label: node.label, icon: node.icon, disabled: true }
      : { id: node.id, label: node.label, icon: node.icon })
    if (node.hasChildren) hasGroups = true
    // las rutas que cubre la sección: con ellas se marca la que está en pantalla (activeSectionOf)
    node.routes = sectionRoutes(option, node)
    // HAMBURGER_SECTIONS: adónde lleva elegir la sección en la hamburguesa (su primera pantalla)
    node.home = sectionHomeOf(node)
    menuTree.push(node)
  }
  // la VARIANTE del wire manda: TABS → in-app navigation; HAMBURGUER_MENU/TILES →
  // hamburguesa que abre un DRAWER izquierdo con oj-navigation-list (como el navigator
  // FA); MENU_ON_TOP → SUBCABECERA: una banda clara bajo la cabecera oscura con el título de la
  // consola y las opciones de primer nivel (dropdown oj-menu para los grupos), como la banda 2
  // del renderer web; TABS con grupos (no caben en la barra inferior) → esas mismas opciones
  // dentro de la cabecera oscura (topbar)
  // HAMBURGER_SECTIONS (Opera Cloud) → SECCIONES: la hamburguesa abre un drawer con el primer
  // nivel (sólo las secciones) y la subcabecera lleva el segundo nivel de la sección en pantalla.
  // HAMBURGER_MENU es la grafía correcta de HAMBURGUER_MENU (el servidor manda la vieja; una
  // definición que llegue sin pasar por él puede traer la nueva).
  let mode = 'tabs'
  if (shell.variant === 'HAMBURGUER_MENU' || shell.variant === 'HAMBURGER_MENU' || shell.variant === 'TILES') mode = 'drawer'
  else if (shell.variant === 'HAMBURGER_SECTIONS') mode = 'sections'
  else if (shell.variant === 'MENU_ON_TOP') mode = 'subheader'
  else if (hasGroups) mode = 'topbar'
  return {
    mode,
    title: shell.title || '',
    items,
    menuTree,
    // la lista de la hamburguesa en modo secciones: cada sección, sin lo que cuelga de ella; su id
    // es su home (lo que navega al elegirla) y `section` el de la sección (lo que se marca)
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
    headerActions: (shell.headerActions || []).map((a) => ({
      actionId: a.actionId,
      label: a.label,
      hasChildren: !!(a.children && a.children.length),
      children: (a.children || []).map((c) => ({ actionId: c.actionId, label: c.label })),
    })),
    serverSideType: shell.serverSideType,
    // sin home declarada (centinela del servidor) → la primera pantalla del menú EN PROFUNDIDAD:
    // con secciones (HAMBURGER_SECTIONS) el primer nivel son grupos y la home de la sección es su
    // primera entrada; el centinela se cargaba tal cual y la app arrancaba en «Not found.»
    homeRoute: isSentinelHome(shell.homeRoute)
      ? ((menuTree.find((node) => node.home) || {}).home || '')
      : shell.homeRoute,
  }
}
