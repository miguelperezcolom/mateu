// Renderer de Mateu sobre VB — el NÚCLEO, en JS puro y testeable sin VB.
// En la app VB estas funciones serían métodos de app-flow.js; aquí son funciones
// libres para testearlas en Node.
//
// v3 (2026-07-24): ajustado al WIRE REAL (fixtures/real/*.json, capturados con capture.mjs
// contra demo/demo-vb en :9005). Contrato observado:
//   - Bootstrap del shell: POST {base}/mateu/v3/components/_/action (route '', __load__) → App.
//     Todo lo demás: POST {base}/mateu/v3/sync/{route|_no_route} con actionId '' para cargas.
//   - `targetComponentId` es el ECO del `initiatorComponentId` de la request ('' → host), y el
//     server DERIVA los ids internos del initiator ('crud1' → 'crud1_app', 'crud1_list'): la
//     unicidad de ids entre superficies es responsabilidad del CLIENTE (un contextId por superficie).
//   - El estado viaja en `fragment.state`; los overlays (Drawer) llevan `metadata.initialData`.
//   - Un mediador (crud, isla) llega como ServerSide cuyo child0 es un App (chromeless): su
//     CONTENIDO se carga con una segunda request con consumedRoute=rootRoute del App interior
//     + serverSideType=homeServerSideType. `mediatorOf(ctx)` extrae esa info.
//   - CloseModal lleva data.eventName → hay que emitir el evento del bus (@SubscribeTo);
//     p.ej. el crud refresca el listado suscrito a 'mateu-crud:saved-in-drawer'.
//   - Una frontera de isla embebida es un nodo ServerSide interior con id = nombre de campo
//     ('_guestNote') y initialData con los marcadores (_embeddedMediator/_inline).

export const HOST_ID = '__root__'

/** Recorrido que NO cruza fronteras de isla: un ServerSide INTERIOR es otra superficie
 *  (sus campos/acciones pertenecen a su propio contexto, no al host). */
function walkWithinSurface(node, visit) {
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (!isRoot && n.type === 'ServerSide') return // frontera de isla: parar
    visit(n)
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach((x) => walk(x, false))
      else if (v && typeof v === 'object') walk(v, false)
    }
  }
  walk(node, true)
}

/** Helper de RENDER: recolecta los FormFields de la superficie (sin cruzar islas). */
export function collectFields(node, out = []) {
  walkWithinSurface(node, (n) => { if (n.fieldId) out.push(n) })
  return out
}

/** Helper de RENDER: recolecta botones/acciones de la superficie (sin cruzar islas). */
export function collectActions(node, out = []) {
  walkWithinSurface(node, (n) => { if (n.actionId && n.label && !n.fieldId) out.push(n) })
  return out
}

/** Fronteras de isla embebida — DOS sabores confirmados en wire real:
 *  (a) nodos ServerSide INTERIORES (id propio, p.ej. '_guestNote');
 *  (b) nodos ClientSide App variant=MEDIATOR con id estable (p.ej.
 *      'island_checkin_st_maria') cuya PROPIA metadata trae homeRoute
 *      (?_embeddedMediator=1) + homeConsumedRoute + homeServerSideType —
 *      el detalle del TaskQueue del front-office llega así. */
export function collectIslands(tree, out = []) {
  const walk = (node, isRoot) => {
    if (!node || typeof node !== 'object') return
    if (!isRoot && node.type === 'ServerSide') {
      out.push(node)
      return // sus hijos pertenecen a la isla, no al host
    }
    if (!isRoot && node.type === 'ClientSide' && node.id && node.metadata
        && node.metadata.type === 'App' && node.metadata.variant === 'MEDIATOR') {
      out.push({
        id: node.id,
        route: node.metadata.homeRoute,
        consumedRoute: node.metadata.homeConsumedRoute || node.metadata.homeRoute,
        serverSideType: node.metadata.homeServerSideType,
        // el CONTEXTO sembrado por el host (stayId, paxIndex…): debe viajar como
        // componentState en la carga inicial de la isla (mateu-ux.initialState)
        initialData: node.initialData || null,
      })
      return
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach((x) => walk(x, false))
      else if (v && typeof v === 'object') walk(v, false)
    }
  }
  walk(tree, true)
  return out
}

/** Helper de RENDER: FormField[] del árbol → metadata de oj-dyn-form (mapa campo → meta).
 *  null si el árbol no tiene campos (página sin formulario). */
export function dynFormMetadataOf(tree) {
  const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
  const metadata = {}
  for (const f of collectFields(tree)) {
    if (!f.dataType || metadata[f.fieldId]) continue // duplicados = referencias de FormRow
    metadata[f.fieldId] = {
      type: NUMERIC.indexOf(f.dataType) >= 0 ? 'number'
        : f.dataType === 'bool' || f.dataType === 'boolean' ? 'boolean' : 'string',
      displayName: f.label || f.fieldId,
      required: !!f.required,
      readonly: !!f.readOnly,
    }
  }
  return Object.keys(metadata).length ? metadata : null
}

/** Helper de RENDER: botones únicos del árbol. chroming viene PRECOMPUTADO (los bindings
 *  VB deben quedar como paths simples: un ternario en un atributo rompe la evaluación CSP
 *  de TODAS las propiedades del elemento). */
export function actionsOf(tree) {
  const seen = {}
  const out = []
  for (const a of collectActions(tree)) {
    if (seen[a.actionId]) continue
    seen[a.actionId] = true
    out.push({
      actionId: a.actionId,
      label: a.label,
      style: a.buttonStyle || 'outlined',
      chroming: a.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
    })
  }
  return out
}

/** Helper de RENDER: lista de campos para el switch widgetFor (isText/isNumber/isBoolean
 *  PRECOMPUTADOS — los bindings VB deben ser paths simples), con el valor sacado del state. */
export function fieldListOf(tree, state) {
  const metadata = dynFormMetadataOf(tree)
  if (!metadata) return []
  const s = state || {}
  return Object.keys(metadata).map((fieldId) => {
    const f = metadata[fieldId]
    return {
      fieldId,
      label: f.displayName,
      required: f.required,
      readonly: f.readonly,
      isNumber: f.type === 'number',
      isBoolean: f.type === 'boolean',
      isText: f.type !== 'number' && f.type !== 'boolean',
      value: s[fieldId] == null ? null : s[fieldId],
    }
  })
}

/** Proyección del OVERLAY superior del stack (drawer del crud): título + campos + acciones.
 *  null si no hay overlays. Sus acciones se postean contra el HOST (el drawer no lleva
 *  ServerSide propio — confirmado en el wire). */
export function overlayOf(reg) {
  const id = reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
  if (!id || !reg.contexts[id]) return null
  const ctx = reg.contexts[id]
  // bloques display del contenido del drawer (ResourceGrid/OfferCard/StatusList…):
  // el panel VB los pinta con el MISMO template de átomos que el host — un drawer no
  // es solo campos y botones (p.ej. el picker de habitaciones)
  const content = islandContentOf(ctx)
  return {
    id,
    title: ctx.title || '',
    position: ctx.position || 'end',
    width: ctx.width,
    state: ctx.state || {},
    fields: fieldListOf(ctx.tree, ctx.state),
    actions: actionsOf(ctx.tree),
    content: content || [],
    hasContent: !!(content && content.length),
  }
}

/** Vigía del diálogo de progreso de un LongTask sobre el stream SSE: consume el Add del
 *  Dialog-con-ProgressBar y los state-only dirigidos a su id; devuelve eventos
 *  {kind: open|progress, title?, text?, value?, rest} para que el chain pinte el
 *  oj-dialog — `rest` lleva los commands/messages del increment (el último los trae:
 *  dispatchEvent del refresco) SIN el fragment del diálogo, listos para reducir. */
export function longTaskWatcher() {
  const hasProgressBar = (node) => {
    if (!node || typeof node !== 'object') return false
    if (node.metadata && node.metadata.type === 'ProgressBar') return true
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) { if (v.some(hasProgressBar)) return true }
      else if (v && typeof v === 'object' && hasProgressBar(v)) return true
    }
    return false
  }
  const w = { dialogId: null, closeAfter: null }
  w.consume = (inc) => {
    for (const fragment of inc.fragments || []) {
      const md = fragment.component && fragment.component.metadata
      if (fragment.action === 'Add' && md && md.type === 'Dialog' && hasProgressBar(fragment.component)) {
        w.dialogId = md.id
        const seed = md.initialData || {}
        return {
          kind: 'open',
          title: seed.title,
          text: seed.progressText,
          value: seed.progressValue || 0,
          rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
        }
      }
    }
    if (!w.dialogId) return null
    const frs = inc.fragments || []
    if (frs.length && frs.every((f) => !f.component && f.targetComponentId === w.dialogId)) {
      const st = frs[0].state || {}
      if (st._closeAfterMillis != null) w.closeAfter = st._closeAfterMillis
      return {
        kind: 'progress',
        title: st.title,
        text: st.progressText,
        value: st.progressValue,
        rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
      }
    }
    return null
  }
  return w
}

/** Helper de RENDER: recolecta los textos (metadata.type Text) de un subárbol. */
export function collectTexts(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
    out.push(node.metadata.text)
  }
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => collectTexts(x, out))
    else if (v && typeof v === 'object') collectTexts(v, out)
  }
  return out
}

/** Proyección del FOLDOUT (Fase 7): overview + paneles con sus cabeceras (metadata.panels)
 *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout.
 *  Cada slot proyecta además sus bloques RICOS (mismo pipeline que el host: tarjetas
 *  StatusList, botones, inputs, notices…) — el markup pinta blocks y deja texts solo
 *  como forma legada para tests/fixtures. */
export function foldoutOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'FoldoutLayout') : null
  if (!node) return null
  const md = node.metadata
  const children = node.children || []
  const bySlot = {}
  for (const child of children) bySlot[child.slot || ''] = child
  const blocksOf = (slotNode) => {
    const blocks = slotNode
      ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {} })
      : null
    // mismo contrato visual que hostContentOf: bloques-columna con su colClass,
    // el resto a fila completa
    return (blocks || []).map((block) => ({
      ...block,
      blockClass: block.colClass || 'oj-flex-item oj-sm-12',
    }))
  }
  return {
    headerTitle: md.headerTitle || '',
    overview: {
      texts: collectTexts(bySlot['overview']),
      blocks: blocksOf(bySlot['overview']),
    },
    panels: (md.panels || []).map((panel, i) => ({
      title: panel.title || '',
      subtitle: panel.subtitle || '',
      // título compuesto del panel: "Operaciones · 1 de 7" — el contador vive en la
      // CABECERA (leído del contenido vivo por índice, refresca sin re-stampar)
      headerLabel: (panel.title || '') + (panel.subtitle ? ' · ' + panel.subtitle : ''),
      open: panel.open !== false,
      // width EXPLÍCITO del wire (FoldoutPanel.width): el markup fija el panel a esa
      // medida — sin él, el motor responsive del foldout reparte a su aire y las
      // tarjetas del cockpit se solapan
      width: panel.width || '',
      texts: collectTexts(bySlot['panel-' + i]),
      blocks: blocksOf(bySlot['panel-' + i]),
    })),
  }
}

/** Proyección del WIZARD (Fase 8): los ProgressSteps del wire → tren del guided-process
 *  ({id,label} + currentStep por id). null si la página no es un wizard. En la pantalla de
 *  resultado todos los pasos van 'done' → currentStep = el último. */
export function wizardOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
  if (!node) return null
  const md = node.metadata
  // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on';
  // el status de Mateu NO se emite (el indicador del rail espera otro enum)
  const steps = (md.steps || []).map((s) => ({
    id: s.id,
    label: s.title || s.id,
    title: s.title || s.id,
    display: 'on',
  }))
  const current = (md.steps || []).find((s) => s.status === 'current')
  return {
    steps,
    currentStep: current ? current.id : (steps.length ? steps[steps.length - 1].id : null),
  }
}

/** Helper de RENDER: todos los nodos de un tipo (sin cruzar fronteras de isla). */
export function findAllByType(tree, type) {
  const out = []
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (!isRoot && n.type === 'ServerSide') return
    if (n.metadata && n.metadata.type === type) out.push(n)
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach((x) => walk(x, false))
      else if (v && typeof v === 'object') walk(v, false)
    }
  }
  walk(tree, true)
  return out
}

/** Card → {title, texts} (el título del Card es un componente Text anidado). */
export function cardOf(node) {
  const md = (node && node.metadata) || {}
  return { title: collectTexts(md.title)[0] || '', texts: collectTexts(md.content) }
}

/** Arquetipo WELCOME: hero (título/subtítulo + CTAs) + tiles del DashboardLayout. */
export function welcomeOf(ctx) {
  const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
  if (!hero) return null
  const md = hero.metadata
  const ctas = actionsOf(hero)
  const tiles = findAllByType(ctx.tree, 'DashboardPanel').map((panel) => ({
    title: panel.metadata.title || '',
    texts: collectTexts(panel),
  }))
  return {
    title: md.title || '',
    subtitle: md.subtitle || '',
    ctas,
    primaryCta: ctas.length ? { label: ctas[0].label } : { label: '' },
    primaryCtaId: ctas.length ? ctas[0].actionId : '',
    secondaryCta: ctas.length > 1 ? { label: ctas[1].label } : null,
    secondaryCtaId: ctas.length > 1 ? ctas[1].actionId : '',
    tiles,
  }
}

/** Arquetipo GENERAL OVERVIEW: switcher de registro + EntityHeader + cards. */
export function generalOverviewOf(ctx) {
  const header = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
  if (!header) return null
  const md = header.metadata
  const switcher = collectFields(ctx.tree).find((f) => f.options && f.options.length)
  // el arquetipo REQUIERE el switcher de registro: un EntityHeader suelto (p.ej. el 360
  // de en casa o el folio de check-out como página) NO es un General Overview
  if (!switcher) return null
  const state = ctx.state || {}
  const badgeText = (md.badges || []).map((b) => b.label).join(' · ')
  const facts = (md.facts || []).map((f) => ({ label: f.label, value: f.value }))
  if (md.metricLabel) facts.push({ label: md.metricLabel, value: md.metricValue })
  const cards = findAllByType(ctx.tree, 'Card')
    .map(cardOf)
    .filter((card) => card.title) // los Card sin título son wrappers de sección/estructura
  return {
    title: md.title || '',
    subtitle: (md.subtitle || '') + (badgeText ? ' · ' + badgeText : ''),
    facts,
    switcherField: switcher ? switcher.fieldId : '',
    switcherOptions: switcher
      ? switcher.options.map((o) => ({ value: o.value, label: o.label }))
      : [],
    switcherValue: switcher ? state[switcher.fieldId] : null,
    cards,
  }
}

/** Arquetipo ITEM OVERVIEW: panel de datos clave + tabs. */
export function itemOverviewOf(ctx) {
  const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
  if (!tabLayout) return null
  const keyCard = findAllByType(ctx.tree, 'Card').find((card) => !findByType(card, 'TabLayout'))
  const tabs = findAllByType(ctx.tree, 'Tab').map((tab, i) => ({
    id: 'itab-' + i,
    label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
    texts: collectTexts(tab),
  }))
  return {
    key: keyCard ? cardOf(keyCard) : { title: '', texts: [] },
    tabs,
  }
}

/** Puerta 1.3: banners de página (Page.metadata.banners) → items del
 *  oj-sp-messages-banner del starter (MessagesBannerType). */
export function bannersOf(ctx) {
  const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
  // los messageType del oj-sp-messages-banner van con prefijo general-* (patrón del starter)
  const THEMES = { INFO: 'general-info', SUCCESS: 'general-success', WARNING: 'general-warning', DANGER: 'general-error' }
  return (((page || {}).metadata || {}).banners || []).map((banner, i) => ({
    id: 'mateu-banner-' + i,
    messageType: THEMES[banner.theme] || 'general-info',
    primaryText: banner.title || '',
    secondaryText: banner.description || '',
  }))
}

/** Puerta 1.6: anatomía RDS del ancho de página (medición Toolkit 24C) — el wrapper del
 *  contenido aplica contexts[host].pageWidth: fixed = tope 1408px con gutters 24px;
 *  fullWidth = fluido con gutters 24px; edgeToEdge = 0 márgenes. En FIXED el borde
 *  DERECHO se ancla a la MISMA fórmula con la que oj-sp-simple-ui-shell coloca su
 *  chrome flotante (chat FAB: right = (100vw - 1536px)/2, medido) — el shell calcula
 *  su caja sobre el viewport COMPLETO e ignora el navigator drawer, así que centrar
 *  el contenido en el área restante lo desalineaba del FAB en viewports anchos;
 *  izquierda auto (absorbe el drawer), tope 1408. */
export function pageStyleOf(ctx) {
  const width = (ctx && ctx.pageWidth) || 'fixed'
  if (width === 'edgeToEdge') return { maxWidth: 'none', margin: '0', padding: '0' }
  if (width === 'fullWidth') return { maxWidth: 'none', margin: '0', padding: '24px' }
  return {
    maxWidth: '1408px',
    margin: '0 max(24px, calc((100vw - 1536px) / 2 + 64px)) 0 auto',
    padding: '24px',
  }
}

/** Proyección de NAVEGACIÓN de la shell: items de primer nivel + grupos con sus hijos.
 *  Un grupo (submenus en el wire) NO resuelve por sync — sus hijos navegan por la ruta
 *  TERMINAL (la compuesta /gestion/person da "Not found."; se recorta el prefijo del padre).
 *  Selectores de contexto y acciones de cabecera salen listos para bindings simples. */
// Iconos de menú: el wire trae nombres NEUTRALES (convención Mateu: set de Vaadin,
// p.ej. "vaadin:calendar-user") — cada renderer los traduce a su set; aquí, al icon
// font Redwood (oj-ux-ico-*, clases del gallery bundle). Un valor que ya venga como
// clase oj-ux pasa tal cual; sin traducción conocida → sin icono.
const OJ_ICONS = {
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
}
export function ojIconOf(icon) {
  if (!icon) return undefined
  if (icon.indexOf('oj-ux-') === 0) return icon
  return OJ_ICONS[icon] || undefined
}

export function shellNavOf(reg) {
  const shell = reg.shell || {}
  const items = []
  const menuTree = []
  let hasGroups = false
  for (const option of shell.menu || []) {
    const route = option.route || option.path
    const label = option.caption || option.label || route
    const children = option.submenus || option.submenu || []
    items.push({ id: route, label, icon: ojIconOf(option.icon) })
    if (children.length) hasGroups = true
    menuTree.push({
      id: route,
      label,
      hasChildren: children.length > 0,
      children: children.map((child) => {
        const childRoute = child.route || child.path || ''
        const terminal = childRoute.indexOf(route + '/') === 0 ? childRoute.slice(route.length) : childRoute
        return { id: terminal, label: child.caption || child.label || terminal }
      }),
    })
  }
  // la VARIANTE del wire manda: TABS → in-app navigation; HAMBURGUER_MENU/TILES →
  // hamburguesa que abre un DRAWER izquierdo con oj-navigation-list (como el navigator
  // FA); MENU_ON_TOP (o TABS con grupos) → opciones de primer nivel VISIBLES en el
  // header, dropdown oj-menu solo para los grupos
  let mode = 'tabs'
  if (shell.variant === 'HAMBURGUER_MENU' || shell.variant === 'TILES') mode = 'drawer'
  else if (shell.variant === 'MENU_ON_TOP' || hasGroups) mode = 'topbar'
  return {
    mode,
    items,
    menuTree,
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
  }
}

/** Colores de Chip del wire → clases badge de JET (sistema, Redwood). PRECOMPUTADO (CSP). */
const BADGE_CLASSES = {
  error: 'oj-badge oj-badge-danger oj-badge-subtle',
  danger: 'oj-badge oj-badge-danger oj-badge-subtle',
  warning: 'oj-badge oj-badge-warning oj-badge-subtle',
  success: 'oj-badge oj-badge-success oj-badge-subtle',
  contrast: 'oj-badge oj-badge-neutral oj-badge-subtle',
}

/** Proyección del TaskQueue (cola de trabajo del front-office): grupos de cards con
 *  badges; el clic despacha metadata.actionId con parameters._item = id del item
 *  (contrato del renderer web compartido: mateu-task-queue.ts). Los datos viajan
 *  INLINE en la metadata — no hay eje data ni triggers. */
export function taskQueueOf(tree) {
  const node = findByType(tree, 'TaskQueue')
  if (!node) return null
  const md = node.metadata
  return {
    actionId: md.actionId,
    groups: (md.groups || []).map((group) => ({
      label: group.label,
      items: (group.items || []).map((item) => ({
        id: item.id,
        title: item.title,
        caption: item.caption || '',
        selected: !!item.selected,
        cardClass: item.selected ? 'oj-sm-margin-2x-bottom oj-bg-neutral-20' : 'oj-sm-margin-2x-bottom',
        badges: (item.badges || []).map((badge) => ({
          label: badge.label,
          badgeClass: BADGE_CLASSES[badge.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
        })),
        // opción de LÍNEA (p.ej. "Check-out" solo en reservas in house): botón en la card
        // que despacha su propio actionId con {_item} — mismo contrato que el renderer web
        hasAction: !!(item.actionLabel && item.actionId),
        actionLabel: item.actionLabel || '',
        actionId: item.actionId || '',
        parameters: { _item: item.id },
      })),
    })),
  }
}

/** Proyección del EmptyState suelto (placeholder del panel de detalle, o página de
 *  bienvenida). Tras seleccionar un item el server lo sustituye por la isla → null. */
export function emptyStateOf(tree) {
  const node = findByType(tree, 'EmptyState')
  if (!node) return null
  const md = node.metadata
  return {
    title: (md.icon ? md.icon + ' ' : '') + (md.title || ''),
    description: md.description || '',
  }
}

/** Interpolación del wire (labels con plantillas): ${state.clave} → valor del state. */
export function interpolate(text, state) {
  return String(text == null ? '' : text).replace(
    /\$\{state\.([A-Za-z0-9_]+)\}/g,
    (all, key) => (state && state[key] != null ? String(state[key]) : ''),
  )
}

const TEXT_CLASSES = {
  xl: 'oj-typography-heading-md',
  l: 'oj-typography-subheading-md',
  s: 'oj-typography-body-sm',
  xs: 'oj-typography-body-xs oj-text-color-secondary',
}
const NOTICE_CLASSES = {
  success: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30',
  warning: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-warning-30',
  danger: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-danger-30',
  info: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-info-30',
}

/** Proyección GENÉRICA del contenido display de una isla (p.ej. el CheckInWizard
 *  embebido del front-office): BLOQUES (plain | card) de átomos precomputados para el
 *  CSP de VB (flags is*, clases, textos interpolados contra el state). Las islas
 *  ANIDADAS (App mediador dentro de la isla, p.ej. el documento) se saltan — fase
 *  posterior. null si el árbol no aporta nada display (isla de formulario puro). */
export function islandContentOf(ctx) {
  if (!ctx || !ctx.tree) return null
  const state = ctx.state || {}
  const interp = (t) => interpolate(t, state)
  const badgeOf = (b) => ({
    label: b.label,
    badgeClass: BADGE_CLASSES[b.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
  })
  const buttonOf = (m) => ({
    actionId: m.actionId,
    label: m.label || m.actionId,
    chroming: m.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
    parameters: m.parameters || {},
  })
  const money = (value, currency) => (currency || '€') + ' ' + Number(value || 0)
    .toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const STATUS_TEXT = {
    success: 'oj-text-color-success',
    warning: 'oj-text-color-warning',
    danger: 'oj-text-color-danger',
    error: 'oj-text-color-danger',
  }
  const blocks = []
  let plain = null
  const atom = (a, container) => {
    if (container) { container.items.push(a); return }
    if (!plain) { plain = { isPlain: true, items: [] }; blocks.push(plain) }
    plain.items.push(a)
  }
  // los hijos de un nodo viajan en children Y/O en metadata.content (CustomField, Notice…)
  const kidsOf = (node) => {
    const out = [...(node.children || [])]
    const inner = node.metadata && node.metadata.content
    if (Array.isArray(inner)) out.push(...inner)
    else if (inner && typeof inner === 'object') out.push(inner)
    return out
  }
  const collectButtons = (node, out) => {
    if (!node || typeof node !== 'object') return out
    if (node.metadata && node.metadata.type === 'Button') { out.push(buttonOf(node.metadata)); return out }
    for (const child of kidsOf(node)) collectButtons(child, out)
    return out
  }
  const visit = (node, container) => {
    if (!node || typeof node !== 'object') return
    const m = node.metadata
    const t = m && m.type
    // FILA ZONADA (@Zones): HorizontalLayout cuyos hijos son columnas con
    // flex: 1 1 calc(NN% …) — cada zona se proyecta como bloque-columna (colClass
    // oj-md-(NN→doceavos)); si una zona genera varios bloques se FUSIONAN en uno
    // (un flex no puede apilar dos items en la misma celda de fila)
    if (t === 'HorizontalLayout' && !container) {
      const zoneMatches = (node.children || []).map(
        (ch) => String(ch.style || '').match(/flex:\s*1 1 calc\((\d+(?:\.\d+)?)%/))
      if (zoneMatches.length >= 2 && zoneMatches.every(Boolean)) {
        node.children.forEach((zoneChild, i) => {
          const pct = parseFloat(zoneMatches[i][1])
          const col = Math.min(11, Math.max(1, Math.round(pct * 12 / 100)))
          const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
          const before = blocks.length
          plain = null
          visit(zoneChild, null)
          plain = null
          const created = blocks.splice(before)
          if (created.length === 1) {
            created[0].colClass = colClass
            blocks.push(created[0])
          } else if (created.length > 1) {
            blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
          }
        })
        return
      }
    }
    if (t === 'App') {
      // isla ANIDADA (p.ej. el documento del check-in): marcador de posición — el
      // contenido vive en su propio contexto y lo pinta mateuNested en ese hueco
      atom({ isNested: true, islandId: node.id }, container)
      return
    }
    if (t === 'FormField') {
      const fieldId = m.fieldId || m.id
      if (m.propertyRow) {
        const raw = state[fieldId] != null ? state[fieldId] : (m.value != null ? m.value : '')
        atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(raw)) }, container)
        return
      }
      // FormField FLUIDO editable (p.ej. el buscador de cargos del modo check-out):
      // input ligado por fieldId al estado del contexto (draft + auto-save)
      if (m.dataType === 'string' || m.dataType === 'integer' || m.dataType === 'number') {
        atom({
          isInput: true,
          fieldId,
          label: m.label || '',
          value: state[fieldId] == null ? '' : String(state[fieldId]),
        }, container)
      }
      return
    }
    if (t === 'Card') {
      const card = { isCard: true, items: [] }
      blocks.push(card)
      plain = null
      const title = m.title && (m.title.text || (typeof m.title === 'string' ? m.title : ''))
      if (title) card.items.push({ isText: true, text: interp(title), cls: 'oj-typography-subheading-xs oj-sm-margin-2x-bottom' })
      for (const child of node.children || []) visit(child, card)
      const cardInner = m.content
      if (Array.isArray(cardInner)) cardInner.forEach((c) => visit(c, card))
      else if (cardInner && typeof cardInner === 'object' && cardInner.metadata) visit(cardInner, card)
      plain = null
      return
    }
    if (t === 'Page') {
      // título de la isla + su TOOLBAR (los @Toolbar del server viajan en metadata.toolbar)
      const pageTitle = interp(m.title || '')
      if (pageTitle) atom({ isText: true, text: pageTitle, cls: 'oj-typography-subheading-sm' }, container)
      const toolbar = (m.toolbar || []).filter((b) => b && b.actionId)
      if (toolbar.length) atom({ isButtons: true, fromPageToolbar: true, buttons: toolbar.map(buttonOf) }, container)
      for (const child of kidsOf(node)) visit(child, container)
      return
    }
    if (t === 'Text') {
      const text = interp(m.text)
      if (text) {
        // container h1..h6 → HEADING de contenido: h3 real (el escalón siguiente al h2
        // de la sección), con ritmo de grupo (margin-top) cuando no abre el bloque
        const heading = /^h[1-6]$/.test(m.container || '')
        if (heading) {
          const target = container || plain
          const notFirst = !!(target && target.items.length)
          atom({
            isText: true,
            isHeading: true,
            text,
            cls: 'oj-typography-subheading-xs' + (notFirst ? ' oj-sm-margin-10x-top' : ''),
          }, container)
        } else {
          atom({ isText: true, text, cls: TEXT_CLASSES[m.size] || 'oj-typography-body-md' }, container)
        }
      }
      return
    }
    if (t === 'ProgressSteps') {
      const steps = (m.steps || []).map((step) => ({ id: step.id, label: step.title || step.label || step.id }))
      const current = (m.steps || []).find((step) => step.status === 'current')
      atom({ isProgress: true, steps, selectedId: current ? current.id : (steps[0] && steps[0].id) }, container)
      return
    }
    if (t === 'EntityHeader') {
      atom({
        isEntityHeader: true,
        title: interp(m.title),
        subtitle: interp(m.subtitle || ''),
        badges: (m.badges || []).map(badgeOf),
        facts: (m.facts || []).map((f) => ({ label: f.label, value: interp(f.value) })),
        metricLabel: m.metricLabel || '',
        metricValue: interp(m.metricValue || ''),
      }, container)
      return
    }
    if (t === 'Notice') {
      atom({
        isNotice: true,
        text: interp(m.text),
        noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
        buttons: collectButtons({ children: kidsOf(node) }, []),
      }, container)
      return
    }
    if (t === 'BulletedList') {
      atom({ isBullets: true, items: (m.items || []).map(interp) }, container)
      return
    }
    if (t === 'Separator') {
      atom({ isSeparator: true }, container)
      return
    }
    if (t === 'Badge') {
      atom({ isBadge: true, label: interp(m.text), badgeClass: BADGE_CLASSES[m.color] || 'oj-badge oj-badge-neutral oj-badge-subtle' }, container)
      return
    }
    if (t === 'ResourceGrid') {
      const columns = m.columns && m.columns > 0 && m.columns <= 12 ? m.columns : 4
      const colClass = 'oj-flex-item oj-sm-' + Math.max(1, Math.floor(12 / columns))
      atom({
        isResourceGrid: true,
        items: (m.items || []).map((it) => ({
          id: it.id,
          title: it.title,
          subtitle: it.subtitle || '',
          statusLabel: it.statusLabel || '',
          statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
          note: it.note || '',
          recommendedLabel: it.recommended ? (m.recommendedLabel || '') : '',
          enabled: !it.disabled,
          disabled: !!it.disabled,
          actionId: m.actionId,
          parameters: { _item: it.id },
          colClass,
          cardClass: it.selected ? 'oj-bg-neutral-20' : '',
        })),
      }, container)
      return
    }
    if (t === 'OfferCard') {
      atom({
        isOffer: true,
        tag: interp(m.tag || ''),
        title: interp(m.title || ''),
        subtitle: interp(m.subtitle || ''),
        features: (m.features || []).map(interp).join(' · '),
        currentLabel: m.current ? (m.currentLabel || '') : '',
        addedLabel: m.added ? (m.addedLabel || '') : '',
        priceLabel: interp(m.priceLabel || ''),
        actionLabel: m.actionId ? (m.actionLabel || '') : '',
        actionId: m.actionId || '',
        parameters: {},
      }, container)
      return
    }
    if (t === 'AddOnPicker') {
      atom({
        isAddOns: true,
        actionId: m.actionId,
        currency: m.currency || '€',
        totalLabel: m.totalLabel || 'Total',
        items: (m.items || []).map((it) => ({
          id: it.id,
          icon: it.icon || '',
          title: interp(it.title),
          description: interp(it.description || ''),
          price: it.price || 0,
          priceText: money(it.price, m.currency) + (it.unit ? ' / ' + it.unit : ''),
          includedLabel: it.includedLabel || '',
          selectable: !it.includedLabel,
          added: !!it.added,
        })),
      }, container)
      return
    }
    if (t === 'StatusList') {
      // columns > 1 → grid responsive de N columnas: el wrapper pasa a oj-flex (wrap) y
      // cada ítem se pinta como TARJETA (oj-panel: borde propio, badge de estado dentro)
      // — celdas sin borde dejaban ambiguo a qué tarea pertenece cada chip y el conjunto
      // no se leía como listado de tareas. La celda exterior es a su vez oj-flex para que
      // el panel interior estire a la altura de la fila (align-items stretch).
      // Todo precomputado por ítem — el CSP de VB no divide ni compara.
      const cols = m.columns && m.columns > 1 && m.columns <= 12 ? m.columns : 0
      const rowClass = 'oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom'
      // SOLO columns>1 fuerza tarjetas: una lista de una columna con acciones (los
      // huéspedes) se pinta con la rama APILADA del markup — nombre como h3 (nivel
      // siguiente al h2 de la sección), sin avatar, ritmo .mateu-list-item
      const asCards = cols > 0
      // la rejilla del cockpit: celdas de MEDIDA FIJA (.mateu-grid-cell, 22rem) con el
      // aire entre tarjetas como gap de la rejilla (.mateu-grid) — ver app.css
      const cellClass = cols
        ? 'oj-flex-item mateu-grid-cell oj-flex oj-sm-margin-4x-bottom'
        : (asCards ? 'oj-flex-item oj-sm-12 oj-flex oj-sm-margin-4x-bottom' : '')
      atom({
        isStatusList: true,
        wrapClass: cols > 0 ? 'oj-flex mateu-grid' : (asCards ? 'oj-flex' : ''),
        items: (m.items || []).map((it) => {
          // hasta DOS acciones por fila (p.ej. Escanear / A mano por pax) — array
          // precomputado; una fila CON acciones se pinta APILADA (título+chip /
          // descripción / botones) para no descolocarse en carriles estrechos
          // hasta TRES acciones por fila; con actionIcon* el botón se pinta SOLO-ICONO
          // (label como tooltip/aria) — iconClass precomputado vía ojIconOf
          const rowActions = []
          if (it.actionLabel && it.actionId) {
            rowActions.push({ label: it.actionLabel, actionId: it.actionId, parameters: { _item: it.id },
              iconClass: ojIconOf(it.actionIcon) || '' })
          }
          if (it.actionLabel2 && it.actionId2) {
            rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
              iconClass: ojIconOf(it.actionIcon2) || '' })
          }
          if (it.actionLabel3 && it.actionId3) {
            rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
              iconClass: ojIconOf(it.actionIcon3) || '' })
          }
          return {
            rowClass,
            gridCell: asCards,
            cellClass,
            statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
            avatar: it.avatar || '',
            icon: it.icon || '',
            title: interp(it.title),
            description: interp(it.description || ''),
            status: interp(it.status || ''),
            statusClass: STATUS_TEXT[it.statusColor] || 'oj-text-color-secondary',
            actions: rowActions,
            hasActions: rowActions.length > 0,
            actionLabel: it.actionLabel || '',
            actionId: it.actionId || m.rowActionId || '',
            parameters: { _item: it.id },
            // rowActionId SIN botón propio = la FILA ENTERA es actuable (contrato del
            // renderer web: clic de fila → rowActionId con {_item})
            rowClickable: !!(m.rowActionId && !it.actionLabel),
          }
        }),
      }, container)
      return
    }
    if (t === 'Ledger') {
      atom({
        isLedger: true,
        lines: (m.lines || []).map((line) => ({
          concept: interp(line.concept),
          amountText: line.included ? (line.includedLabel || '') : money(line.amount, m.currency),
          amountClass: (line.amount || 0) < 0 ? 'oj-text-color-success' : '',
        })),
        totalLabel: m.totalLabel || 'Total',
        totalText: money(m.total, m.currency),
      }, container)
      return
    }
    if (t === 'PaymentPicker') {
      atom({
        isPayment: true,
        contextLabel: m.contextLabel || '',
        contextValue: interp(m.contextValue || ''),
        methods: (m.methods || []).map((method) => ({
          label: method.label,
          chroming: method.id === m.selected ? 'callToAction' : 'outlined',
          actionId: m.methodActionId,
          parameters: { _method: method.id },
        })),
        confirmLabel: m.confirmLabel || 'Confirmar',
        confirmActionId: m.actionId,
        confirmParameters: { _method: m.selected },
      }, container)
      return
    }
    if (t === 'Meter') {
      atom({
        isMeter: true,
        label: m.label || '',
        value: m.value || 0,
        max: m.max || 100,
        valueText: (m.unit === '€' ? money(m.value, '€') : String(m.value)) + ' / ' + (m.unit === '€' ? money(m.max, '€') : String(m.max)),
        caption: interp(m.caption || ''),
      }, container)
      return
    }
    if (t === 'TaskProgress') {
      // banner de subtareas N-de-M (checklist de operaciones): completo → panel success y
      // sin botón (contrato del componente); todo precomputado (el CSP de VB no compara)
      const total = m.total || 0
      const done = m.done || 0
      const complete = total > 0 && done >= total
      atom({
        isTaskProgress: true,
        label: interp(m.label || ''),
        value: done,
        max: total,
        valueText: done + ' de ' + total,
        panelClass: complete
          ? 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30'
          : 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-neutral-20',
        actionLabel: !complete && m.actionId ? (m.actionLabel || '') : '',
        actionId: m.actionId || '',
        parameters: {},
      }, container)
      return
    }
    if (t === 'Stat') {
      atom({
        isStat: true,
        label: m.label || '',
        value: String(m.value == null ? '' : m.value) + (m.unit ? ' ' + m.unit : ''),
      }, container)
      return
    }
    if (t === 'Button') {
      const target = container || plain
      const last = target && target.items.length ? target.items[target.items.length - 1] : null
      if (last && last.isButtons) last.buttons.push(buttonOf(m))
      else atom({ isButtons: true, buttons: [buttonOf(m)] }, container)
      return
    }
    for (const child of kidsOf(node)) visit(child, container)
  }
  visit(ctx.tree, null)
  // HOISTING de la isla anidada: un bloque cuyo contenido es la isla (card "Documento")
  // se convierte en bloque isNestedBlock — el markup la pinta a nivel de BLOQUE porque
  // a más profundidad el evaluador CSP de VB deja de resolver los bindings del template
  const hoisted = blocks.map((block) => (
    block.items.some((a) => a.isNested)
      ? { ...block, isNestedBlock: true, items: block.items.filter((a) => !a.isNested) }
      : block
  ))
  const hasDisplay = hoisted.some((b) => b.items.some((a) => !a.isButtons) || b.isNestedBlock)
  return hasDisplay ? hoisted : null
}

/** Fusiona el contenido de la isla ANIDADA dentro de los bloques de la isla madre:
 *  el bloque isNestedBlock (la card que solo contenía la isla) pasa a ser una card
 *  normal cuyos items son los átomos de la anidada, MARCADOS fromNested (también sus
 *  botones) para que el dispatcher enrute sus acciones al contexto anidado. Motivo:
 *  leer $application.variables DENTRO de un template anidado no re-liga los contextos
 *  internos en el evaluador CSP de VB — los datos deben fluir por $current. */
export function mergeNestedContent(islandBlocks, nestedBlocks) {
  if (!islandBlocks) return islandBlocks
  const nestedAtoms = (nestedBlocks || []).reduce((out, block) => out.concat(block.items), [])
    .map((a) => {
      const marked = { ...a, fromNested: true }
      if (a.buttons) marked.buttons = a.buttons.map((btn) => ({ ...btn, fromNested: true }))
      return marked
    })
  return islandBlocks.map((block) => (
    block.isNestedBlock
      ? { ...block, isNestedBlock: false, isCard: true, isPlain: false, items: nestedAtoms }
      : block
  ))
}

/** Contenido display del HOST (páginas de detalle standalone: /encasa/:id, /checkout/:id,
 *  y los pasos del wizard /checkin/:id): los mismos bloques que una isla, con la PRIMERA
 *  isla del host (p.ej. el documento) fusionada en su hueco (atomos fromNested → despachan
 *  al contexto de la isla). En modo wizard se filtran el título de página, el ProgressSteps
 *  y los botones back/next: el guided process ya aporta rail, título y Continue. */
export function hostContentOf(ctx, islandBlocks, opts = {}) {
  const blocks = islandContentOf(ctx)
  if (!blocks) return null
  let merged = mergeNestedContent(blocks, islandBlocks || null)
  const title = opts.title || ''
  let titleDropped = false
  let entityDropped = false
  merged = merged
    .map((block) => ({
      ...block,
      items: block.items.filter((atom) => {
        // el título de Page sobra: la banda del header (o el guided process) ya lo pinta
        if (!titleDropped && atom.isText && title && atom.text === title) {
          titleDropped = true
          return false
        }
        // el TOOLBAR de Page tampoco va al contenido: se proyecta a las acciones del
        // header (pageToolbarOf → primary/secondary de la banda) — SALVO el de la ISLA
        // fusionada (fromNested, p.ej. Cancel/Save del editor del documento): ese
        // pertenece a la isla y se pinta en su bloque
        if (atom.fromPageToolbar && !atom.fromNested) return false
        // y el EntityHeader tampoco cuando el header de pantalla lo muestra (título/
        // subtítulo/facts del huésped en la banda, en vez del título genérico)
        if (opts.dropEntityHeader && atom.isEntityHeader && !entityDropped) {
          entityDropped = true
          return false
        }
        if (opts.forWizard) {
          if (atom.isProgress) return false
          if (atom.isButtons && atom.buttons.length
              && atom.buttons.every((b) => b.actionId === 'next' || b.actionId === 'back')) return false
        }
        return true
      }),
    }))
    .filter((block) => block.items.length)
    // el loop del host pinta los bloques dentro de un oj-flex: los bloques-columna de una
    // fila zonada llevan su colClass; el resto ocupa la fila entera (oj-sm-12)
    .map((block) => ({ ...block, blockClass: block.colClass || 'oj-flex-item oj-sm-12' }))
  return merged.length ? merged : null
}

/** Acción FORWARD del wizard (Continue/Completar): se deriva del PIE real del árbol — el
 *  bloque de botones que acompaña a 'back' (los wizards ricos tienen además acciones de
 *  página como selectPax que NO son el forward; elegir "primera acción no-back" fallaba). */
export function wizardForwardOf(ctx) {
  const blocks = islandContentOf(ctx)
  if (!blocks) return null
  let forward = null
  for (const block of blocks) {
    for (const atomItem of block.items) {
      if (!atomItem.isButtons) continue
      const hasBack = atomItem.buttons.some((b) => b.actionId === 'back')
      const candidate = atomItem.buttons.find((b) => b.actionId !== 'back')
      if (candidate && (hasBack || candidate.actionId === 'next')) {
        forward = { actionId: candidate.actionId, label: candidate.label }
      }
    }
  }
  return forward
}

/** El EntityHeader del host (p.ej. el huésped de la Reserva 360) proyectado al HEADER de
 *  pantalla: título = el nombre, subtítulo = subtitle + badges, facts (+métrica) →
 *  contextualInfo del oj-sp-header-general-overview. */
export function entityHeaderOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
  if (!node) return null
  const m = node.metadata
  const state = ctx.state || {}
  const badgeText = (m.badges || []).map((b) => b.label).join(' · ')
  const facts = (m.facts || []).map((f) => ({ label: f.label, value: interpolate(f.value, state) }))
  if (m.metricLabel) facts.push({ label: m.metricLabel, value: interpolate(m.metricValue || '', state) })
  return {
    title: interpolate(m.title, state),
    subtitle: interpolate(m.subtitle || '', state) + (badgeText ? ' · ' + badgeText : ''),
    facts,
  }
}

/** El TOOLBAR de la Page del host (para las acciones del header de banda):
 *  [{actionId, label, chroming}]. El de estilo primary va al primaryAction del header. */
export function pageToolbarOf(ctx) {
  if (!ctx || !ctx.tree) return []
  const page = findByType(ctx.tree, 'Page')
  if (!page) return []
  return (page.metadata.toolbar || [])
    .filter((b) => b && b.actionId)
    .map((b) => ({
      actionId: b.actionId,
      label: b.label || b.actionId,
      chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
    }))
}

/** Descartar el overlay superior SIN guardar (✕/Esc/backdrop — no emite evento alguno). */
export function dismissOverlay(reg) {
  if (!reg.stack || !reg.stack.length) return reg
  const id = reg.stack[reg.stack.length - 1]
  const contexts = { ...reg.contexts }
  delete contexts[id]
  return { ...reg, contexts, stack: reg.stack.slice(0, -1) }
}

/** Acciones suscritas a un evento del bus (@SubscribeTo): p.ej. el listing refresca con
 *  'search' cuando el CloseModal del drawer emite mateu-crud:saved-in-drawer. */
export function eventTriggersOf(ctx, eventName) {
  return ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .filter((t) => t.type === 'OnCustomEvent' && t.eventName === eventName && t.actionId)
    .map((t) => t.actionId)
}

/** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
export function summarizeHost(reg, route) {
  const host = reg.contexts[HOST_ID] || {}
  const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
  const menu = (reg.shell && reg.shell.menu) || []
  const option = menu.find((m) => m.route === route)
  // un listado (pageType collection) también lleva FormFields (columnas) — NO es un form
  const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
  const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
  const state = host.state || {}
  const fields = formMetadata ? fieldListOf(host.tree, state) : []
  return {
    // la Page de un listado no lleva título (viaja en la metadata del Crudl) → caption del menú
    title: pageMetadata.title || (option && (option.caption || option.label)) || '',
    text: formMetadata ? '' : String(state.message == null ? '' : state.message),
    formMetadata,
    fields,
    formValue: formMetadata ? { ...state } : null,
    actions: host.tree ? actionsOf(host.tree) : [],
  }
}

/** Helper de RENDER: primer nodo del árbol con metadata.type dado. */
export function findByType(tree, type) {
  let found = null
  const walk = (node) => {
    if (found || !node || typeof node !== 'object') return
    if (node.metadata && node.metadata.type === type) { found = node; return }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach(walk)
      else if (v && typeof v === 'object') walk(v)
    }
  }
  walk(tree)
  return found
}

/** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
 *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
 *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
export function listingOf(ctx) {
  const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
  if (!crudNode) return null
  const md = crudNode.metadata
  const page = (((ctx.data || {}).crud || {}).page) || {}
  return {
    title: md.title || '',
    subtitle: md.subtitle || '',
    searchable: !!md.searchable,
    pageSize: md.pageSize || 20,
    emptyStateMessage: md.emptyStateMessage || 'No data.',
    columns: (md.columns || []).map((col) => {
      const c = col.metadata || col
      const def = { headerText: c.label || c.id, field: c.id }
      // celda editable → plantilla de editor por tipo (siempre visible, commit por celda:
      // el contrato es update-row + parameters._editedRow; fixtures/real/update-row.json)
      if (c.editable && c.editorType) {
        def.template = c.editorType === 'boolean' ? 'cellEditBoolean'
          : (c.editorType === 'integer' || c.editorType === 'number') ? 'cellEditNumber'
            : 'cellEditText'
      }
      return def
    }),
    // densidad Redwood de la tabla: el 'grid' compacto es para tablas de TRABAJO —
    // se activa cuando el crud es editable inline (@InlineEditing marca las columnas
    // como editable en el wire); un listado de consulta queda en 'list' (aireado).
    // PRECOMPUTADO (CSP de VB).
    display: (md.columns || []).some((col) => (col.metadata || col).editable) ? 'grid' : 'list',
    // tabla de TRABAJO: el clic de fila NO navega (las celdas se editan in situ)
    editable: (md.columns || []).some((col) => (col.metadata || col).editable),
    rows: page.content || [],
    total: page.totalElements == null ? null : page.totalElements,
    isEmpty: (page.content || []).length === 0,
    toolbar: (md.toolbar || []).map((b) => ({
      actionId: b.actionId,
      label: b.label,
      chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
    })),
  }
}

/** Triggers OnLoad del contexto (p.ej. el listing dispara 'search' al cargar). */
export function onLoadTriggers(ctx) {
  return ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .filter((t) => t.type === 'OnLoad' && t.actionId)
    .map((t) => t.actionId)
}

/** Si el contexto es un MEDIADOR (ServerSide → child App), la info para cargar su contenido. */
export function mediatorOf(ctx) {
  const tree = ctx?.tree
  if (tree?.type !== 'ServerSide') return null
  const child = (tree.children || [])[0]
  const md = child?.metadata
  if (md?.type !== 'App') return null
  return {
    rootRoute: md.rootRoute || ctx.state?._route || '',
    homeRoute: md.homeRoute ?? '',
    serverSideType: md.homeServerSideType ?? md.serverSideType,
    variant: md.variant,
  }
}

const metaOf = (fr) => fr.component?.metadata || {}

let overlaySeq = 0
/** Construye un contexto de overlay (drawer/dialog) a partir de un fragmento Add. */
export function buildOverlay(fr) {
  const md = metaOf(fr)
  const id = 'overlay-' + ++overlaySeq
  return {
    id,
    kind: 'drawer',
    tree: fr.component, // el árbol completo — md.content lleva el contenido (patrón Card)
    state: md.initialData || fr.state || {},
    title: md.headerTitle || md.title,
    subtitle: md.subtitle,
    position: md.position || 'end',
    width: md.width,
    size: md.size,
    dirty: false,
  }
}

/** Resuelve a qué clave del registro va un target: eco del initiator; ''/null → host. */
const resolveTarget = (contexts, t) => {
  if (t == null || t === '') return HOST_ID
  if (contexts[t]) return t
  // eco de un id de componente ya registrado (p.ej. SSE que responde al uuid del árbol)
  const byTreeId = Object.keys(contexts).find((k) => contexts[k].tree?.id === t)
  return byTreeId || t
}

/**
 * EL REDUCER. reg = { contexts, stack, shell }; devuelve el NUEVO reg + los efectos que VB
 * aplica. Puro e inmutable con structural sharing: solo las entradas tocadas cambian de ref.
 * opts.initiator = contextId de la superficie que lanzó la request (para comandos sin target,
 * como el MarkAsClean del save-in-drawer).
 */
export function reduceContexts(reg, increment, opts = {}) {
  const contexts = { ...reg.contexts }
  const stack = [...reg.stack]
  let shell = reg.shell || null
  const effects = {
    toasts: [],
    banners: increment.banners || [],
    navigate: null,
    urlPush: null,
    download: null,
    runActions: [],
    docTitle: null,
    events: [], // bus @SubscribeTo: [{ name, detail }]
  }

  for (const m of increment.messages || [])
    effects.toasts.push({ text: m.text || m.title, variant: m.variant || 'info' })

  // ── fragmentos → shell | superficies ──────────────────────────────────────
  for (const fr of increment.fragments || []) {
    const md = metaOf(fr)

    // El App del BOOTSTRAP (root ClientSide type App) configura el chrome. Un App de
    // mediador NO pasa por aquí: llega envuelto en un ServerSide (child0) y es contenido.
    if (fr.component?.type === 'ClientSide' && md.type === 'App') {
      shell = {
        title: md.title,
        menu: md.menu || [],
        variant: md.variant,
        serverSideType: md.serverSideType, // para las acciones de cabecera (app-level)
        appContext: md.contextSelectors || [],
        headerActions: md.contextActions || [],
        themeToggle: md.themeToggle,
      }
      continue
    }

    if (fr.action === 'Add') {
      const ctx = buildOverlay(fr)
      contexts[ctx.id] = ctx
      stack.push(ctx.id)
      continue
    }

    // Replace / ReplaceKeepData / State-only: MISMO camino para form, mediador, isla…
    const id = resolveTarget(contexts, fr.targetComponentId)
    const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {}, data: {} }
    const ss = fr.component?.type === 'ServerSide' ? fr.component : null
    contexts[id] = {
      ...prev,
      kind: prev.kind,
      tree: fr.component || prev.tree, // sin component => State-only: conserva el árbol
      pageType: ss?.pageType ?? (fr.component ? undefined : prev.pageType),
      pageWidth: ss?.pageWidth ?? (fr.component ? undefined : prev.pageWidth),
      state: !fr.component
        ? { ...prev.state, ...(fr.state || {}) } // State-only: MERGE (no borrar la isla)
        : fr.action === 'ReplaceKeepData'
          ? { ...prev.state, ...(fr.state || md.initialData || {}) }
          : (fr.state ?? md.initialData ?? prev.state),
      // data = eje de DATOS calculados por el server (p.ej. las filas del listing, keyed
      // por id de componente: {crud: {page: …}}); un fragmento data-only MERGEA
      data: !fr.component
        ? { ...prev.data, ...(fr.data || {}) }
        : (fr.data ?? {}),
      dirty: false,
    }
  }

  // ── comandos → efectos (algunos mutan el registro) ────────────────────────
  const emit = (data) => {
    if (!data) return
    if (typeof data === 'string') effects.events.push({ name: data, detail: null })
    else if (data.eventName) effects.events.push({ name: data.eventName, detail: data.detail ?? null })
  }
  for (const c of increment.commands || []) {
    const t = c.targetComponentId
    switch (c.type) {
      case 'SetWindowTitle':
        effects.docTitle = c.data
        break
      case 'NavigateTo': {
        const d = String(c.data || '')
        effects.navigate = /^https?:/.test(d) ? { url: d } : { route: d }
        break
      }
      case 'PushStateToHistory':
        effects.urlPush = c.data
        break
      case 'CloseModal': {
        const id = t && contexts[t] ? t : stack[stack.length - 1]
        if (id) {
          delete contexts[id]
          const i = stack.indexOf(id)
          if (i >= 0) stack.splice(i, 1)
        }
        emit(c.data) // eventName del cierre → bus (p.ej. refresco del listado del crud)
        break
      }
      case 'DispatchEvent':
        emit(c.data)
        break
      case 'MarkAsClean': {
        const id = t && contexts[t] ? t : opts.initiator
        if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: false }
        break
      }
      case 'MarkAsDirty': {
        const id = t && contexts[t] ? t : opts.initiator
        if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: true }
        break
      }
      case 'DownloadFile':
        effects.download = c.data
        break
      case 'RunAction':
        effects.runActions.push(c.data)
        break
    }
  }

  return { contexts, stack, shell, effects }
}
