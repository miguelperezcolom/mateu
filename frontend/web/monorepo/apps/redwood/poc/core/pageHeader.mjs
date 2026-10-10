import { autoTrail } from '../breadcrumbs.mjs'
import { HOST_ID, actionsOf, dynFormMetadataOf, fieldListOf, formSectionsOf } from './tree.mjs'
import { interpolate } from './content.mjs'
import { findByType } from './listing.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the page header: entity header, KPIs, subtitle, toolbar, back/primary buttons, triggers.

/** El EntityHeader del host (p.ej. el huésped de la Reserva 360) proyectado al HEADER de
 *  pantalla: título = el nombre, subtítulo = subtitle + badges, facts (+métrica) →
 *  contextualInfo del oj-sp-header-general-overview. */
// Paneles cuyo contenido es de UN elemento de una colección (el detalle de una consola): un
// EntityHeader ahí dentro es la ficha del elegido, no la entidad de la PÁGINA — subirlo a la
// cabecera vaciaba el panel de detalle y ponía el nombre del huésped como título de la pantalla.
export const PANE_TYPES = { MasterDetailLayout: true, SplitLayout: true }
export function pageEntityHeaderNode(tree) {
  return findOutsidePanes(tree, 'EntityHeader')
}
/** findByType, pero sin entrar en los paneles de una consola (MasterDetailLayout/SplitLayout): lo
 *  que hay dentro es contenido de un panel, no una pieza de la PÁGINA (su cabecera, su cola). */
export function findOutsidePanes(tree, type) {
  return findOutside(tree, type, PANE_TYPES)
}

/** findByType sin bajar a los tipos de `stops`. */
export function findOutside(tree, type, stops) {
  let found = null
  const walk = (n) => {
    if (found || !n || typeof n !== 'object') return
    const t = n.metadata && n.metadata.type
    if (t === type) { found = n; return }
    if (t && stops[t]) return
    for (const c of n.children || []) walk(c)
    const inner = n.metadata && n.metadata.content
    if (Array.isArray(inner)) inner.forEach(walk)
    else if (inner && typeof inner === 'object') walk(inner)
  }
  walk(tree)
  return found
}

export function entityHeaderOf(ctx) {
  const node = ctx && ctx.tree ? pageEntityHeaderNode(ctx.tree) : null
  if (!node) return null
  const m = node.metadata
  const state = ctx.state || {}
  const badgeText = (m.badges || []).map((b) => b.label).join(' · ')
  const facts = (m.facts || []).map((f) => ({ label: f.label, value: interpolate(f.value, state) }))
  if (m.metricLabel) facts.push({ label: m.metricLabel, value: interpolate(m.metricValue || '', state) })
  // los colores de Chip de Mateu → status del badge oj-sp
  const BADGE_STATUS = { success: 'success', error: 'danger', warning: 'warning', contrast: 'neutral', normal: 'info' }
  return {
    title: interpolate(m.title, state),
    subtitle: interpolate(m.subtitle || '', state) + (badgeText ? ' · ' + badgeText : ''),
    // el subtítulo SIN los badges concatenados (para templates que pintan el badge aparte)
    subtitlePlain: interpolate(m.subtitle || '', state),
    badges: (m.badges || []).map((b) => ({ label: b.label, status: BADGE_STATUS[b.color] || 'neutral' })),
    facts,
  }
}

/** Los KPIs de la Page (@KPI: Page.metadata.kpis = [{title, text}]) → facts del header de
 *  pantalla ({label, value}), como los del EntityHeader: los totales de una reserva arriba, junto
 *  al título, y no perdidos dentro de un panel. `text` puede llevar ${state.x}. */
export function pageKpisOf(ctx) {
  const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
  if (!page) return []
  const state = ctx.state || {}
  return ((page.metadata || {}).kpis || [])
    .filter((k) => k && (k.title || k.text))
    .map((k) => ({ label: k.title || '', value: interpolate(k.text == null ? '' : String(k.text), state) }))
}

/** El subtítulo de la Page (SubtitleSupplier/@Subtitle: p.ej. los importes de una reserva) para
 *  el header de pantalla cuando no hay EntityHeader. Interpolado como el título. */
export function pageSubtitleOf(ctx) {
  const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
  const subtitle = page && page.metadata ? page.metadata.subtitle : ''
  return subtitle ? interpolate(String(subtitle), ctx.state || {}) : ''
}

/** ITEM OVERVIEW nativo (oj-sp-item-overview-page): página de entidad con dos
 *  bloques-columna cuya PRIMERA zona es la ESTRECHA — la anatomía RDS del template
 *  (panel de datos clave a la izquierda + main ancho a la derecha), frente al general
 *  overview (main ancho primero + info estrecha después). El EntityHeader del host se
 *  convierte en el oj-sp-item-overview del slot overview (itemTitle/subtitle/badge +
 *  facts como filas clave en el body); un botón "Volver…" del toolbar pasa a la flecha
 *  goToParent del header de navegación del template y el resto a secondaryActions. */
export function itemOverviewPageOf(entity, blocks, toolbar) {
  if (!entity) return null
  const zoned = (blocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
  if ((blocks || []).length !== 2 || zoned.length !== 2) return null
  const col = (b) => parseInt((b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '0', 10)
  if (col(zoned[0]) >= col(zoned[1])) return null // la ancha primero → general overview
  const full = (b) => Object.assign({}, b, { blockClass: 'oj-flex-item oj-sm-12' })
  const back = (toolbar || []).find((b) => /^volver\b/i.test(b.label || ''))
  const badge = (entity.badges || [])[0] || null
  return {
    on: true,
    overview: {
      title: entity.title || '',
      subtitle: entity.subtitlePlain != null ? entity.subtitlePlain : (entity.subtitle || ''),
      badge: badge ? { text: badge.label, status: badge.status, style: 'subtle', position: 'trailing' } : null,
      facts: entity.facts || [],
      blocks: [full(zoned[0])],
    },
    main: { blocks: [full(zoned[1])] },
    back: { show: !!back, actionId: back ? back.actionId : '', label: back ? back.label : '' },
    secondary: (toolbar || []).filter((b) => b !== back)
      .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
  }
}

/** El TOOLBAR de la Page del host (para las acciones del header de banda):
 *  [{actionId, label, chroming}]. El de estilo primary va al primaryAction del header. */
export function pageToolbarOf(ctx) {
  if (!ctx || !ctx.tree) return []
  // a fluent/YAML `Form` carries its toolbar exactly like a reflected Page does
  const page = findByType(ctx.tree, 'Page') || findByType(ctx.tree, 'Form')
  if (!page) return []
  return (page.metadata.toolbar || [])
    // a ButtonGroup (a toolbar's dropdown: on the wire a Button with `children`, no action of its
    // own) brings its buttons — the header's actions list them
    .flatMap((b) => (b && !b.actionId && Array.isArray(b.children || b.buttons) ? (b.children || b.buttons) : [b]))
    .filter((b) => b && b.actionId)
    .map((b) => ({
      actionId: b.actionId,
      label: b.label || b.actionId,
      chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      disabled: !!b.disabled,
    }))
}

/**
 * Cuál de los botones del toolbar ocupa el hueco de acción PRIMARIA de la cabecera.
 *
 * `oj-sp-header-general-overview` da UN hueco visible para la primaria y pinta la primera
 * secundaria como botón; el resto va al desbordamiento `···`. Con lo que manda el wire hoy —
 * ningún botón marcado `primary` en la vista de un crud — todo caía en secundarias y la acción
 * de verdad (Edit) quedaba escondida detrás de los puntos suspensivos.
 *
 * Manda el wire cuando dice algo (`buttonStyle: primary`). Si no dice nada, se toma la ÚLTIMA
 * que no sea de vuelta: en los toolbars de Mateu el orden es "salir, …, avanzar" — Cancel→Save,
 * Back to list→Add another→Edit —, así que la última no-vuelta es la que uno vino a hacer.
 * Heurística explícita, a sustituir el día que el wire traiga el rol del botón.
 */
export const BACK_ACTIONS = { back: true, 'back-to-list': true, close: true, cancel: true }
// `cancel` y los `cancel-<modo>` del crud (cancel-view, cancel-edit, cancel-new) son la vuelta;
// una acción del dominio que EMPIEZA por cancel no lo es: el «Cancel booking» de una reserva
// (`cancelBooking`) acababa convertido en el enlace de vuelta de la cabecera.
export const isBackButton = (button) => !!button && (
  BACK_ACTIONS[button.actionId] || /^cancel-/.test(String(button.actionId || '')))

/** El botón de VOLVER del toolbar, si lo hay: en RDS eso no es una acción más, es la
 *  afordancia `goToParent` de la cabecera — meterlo entre las secundarias lo esconde en el
 *  desbordamiento justo cuando es lo que más se pulsa. */
export function backToolbarButton(toolbar) {
  return (toolbar || []).find(isBackButton) || null
}

export function primaryToolbarButton(toolbar) {
  const buttons = toolbar || []
  const declared = buttons.find((b) => b.chroming === 'callToAction')
  if (declared) return declared
  for (let i = buttons.length - 1; i >= 0; i -= 1) {
    if (!isBackButton(buttons[i])) return buttons[i]
  }
  return null
}

/**
 * El botón del toolbar que eligió una ACCIÓN SECUNDARIA de un header oj-sp (spSecondaryAction),
 * o null. Los items que les pasamos son { id: actionId, value: actionId, label }, y el header
 * devuelve el item por su id (p.ej. 'walkIn') — o, según la variante, el objeto entero o su
 * label —, así que se resuelve PRIMERO por actionId y sólo después por el rótulo. Buscarlo
 * sólo por label dejaba muertas las secundarias de un listado: el id nunca es el rótulo.
 */
export function secondaryActionOf(detail, toolbar) {
  const d = detail || {}
  const item = d.secondaryItem != null ? d.secondaryItem : (d.item != null ? d.item : d.value)
  const keys = []
  const add = (k) => { if (k != null && k !== '' && typeof k !== 'object') keys.push(String(k)) }
  if (item && typeof item === 'object') {
    add(item.id); add(item.value); add(item.actionId); add(item.key); add(item.label)
  } else {
    add(item)
  }
  add(d.id)
  if (!keys.length) return null
  const buttons = (toolbar || []).filter((b) => b && b.actionId)
  for (const k of keys) {
    const byId = buttons.find((b) => String(b.actionId) === k)
    if (byId) return byId
  }
  for (const k of keys) {
    const byLabel = buttons.find((b) => b.label === k)
    if (byLabel) return byLabel
  }
  return null
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

/** Trigger @AutoSave/AutoSaveTrigger del host (buscar-al-teclear, autoguardado):
 *  {actionId, debounceMillis} o null. El renderer lo honra re-lanzando la acción
 *  debounced en cada pulsación (raw-value de los inputs del host). */
export function autoSaveOf(ctx) {
  const trigger = ((ctx && ctx.tree && ctx.tree.triggers) || [])
    .find((t) => t.type === 'AutoSave' && t.actionId)
  return trigger
    ? { actionId: trigger.actionId, debounceMillis: trigger.debounceMillis || 400 }
    : null
}

/** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
/** La opción de menú de una ruta, a cualquier profundidad. */
export function menuOptionAt(options, route) {
  for (const option of options || []) {
    if ((option.route || option.path) === route) return option
    const found = menuOptionAt(option.submenus || option.submenu, route)
    if (found) return found
  }
  return null
}

/** El título que declara el Crud del host, si lo hay. */
export function crudTitleOf(host) {
  const crud = host && host.tree ? findByType(host.tree, 'Crud') : null
  return crud && crud.metadata ? crud.metadata.title : ''
}

export function summarizeHost(reg, route) {
  const host = reg.contexts[HOST_ID] || {}
  const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
  const menu = (reg.shell && reg.shell.menu) || []
  // a CUALQUIER profundidad: en una shell federada la pantalla que se está viendo cuelga del
  // grupo del pod, dos niveles por debajo, y buscar solo en el primero dejaba el título vacío
  const option = menuOptionAt(menu, route)
  // un listado (pageType collection) también lleva FormFields (columnas) — NO es un form
  const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
  const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
  const state = host.state || {}
  const fields = formMetadata ? fieldListOf(host.tree, state, host.data) : []
  const sections = formMetadata ? formSectionsOf(host.tree, state, host.data) : []
  return {
    // la Page de un listado no lleva título: viaja en la metadata del Crud, y si tampoco
    // está, en el rótulo del menú
    title: pageMetadata.title || crudTitleOf(host) || (option && (option.caption || option.label)) || '',
    // el rastro automático (breadcrumbs.mjs): la cabecera saca de él su «ir al padre». Apagado con
    // @NoBreadcrumbs en la página o en la shell
    trail: pageMetadata.noBreadcrumbs || (reg.shell && reg.shell.noBreadcrumbs)
      ? []
      : autoTrail(menu, route, { title: pageMetadata.title || crudTitleOf(host) }),
    text: formMetadata ? '' : String(state.message == null ? '' : state.message),
    formMetadata,
    fields,
    sections,
    formValue: formMetadata ? { ...state } : null,
    actions: host.tree ? actionsOf(host.tree) : [],
  }
}
