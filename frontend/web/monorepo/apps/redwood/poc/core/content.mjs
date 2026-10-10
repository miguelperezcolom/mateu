import { calendarAtomOf } from '../calendar.mjs'
import { readTileOrder, orderedTileIndices, tileKeyOf, tileScopeOf } from '../prefs.mjs'
import { elementModuleUrl } from '../elements.mjs'
import { collectTexts } from './tree.mjs'
import { RICH_TEXT_STEREOTYPES, actionPanelAtomOf, avatarOf, chartAtomOf, dragMimeOf, gridColClasses, isRichAtom, mapAtomOf, matrixAtomOf, metricOf, panelColClass, richHtmlOf } from './atoms.mjs'
import { findAllByType, tabIdOf, tabStripKeyOf } from './overviews.mjs'
import { ojIconOrGenericOf } from './shellNav.mjs'
import { findOutsidePanes } from './pageHeader.mjs'
import { findByType, statusBadgeRows } from './listing.mjs'
import { EMPTY_VALUE, isModalRowEditor, layoutFieldOf, plainValueOf } from './rowEditor.mjs'
import { ganttAtomOf, planningAtomOf } from './boards.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the content visitor (islandContentOf → blocks of atoms), host content, subresources.

/** Colores de Chip del wire → clases badge de JET (sistema, Redwood). PRECOMPUTADO (CSP). */
export const BADGE_CLASSES = {
  error: 'oj-badge oj-badge-danger oj-badge-subtle',
  danger: 'oj-badge oj-badge-danger oj-badge-subtle',
  warning: 'oj-badge oj-badge-warning oj-badge-subtle',
  success: 'oj-badge oj-badge-success oj-badge-subtle',
  contrast: 'oj-badge oj-badge-neutral oj-badge-subtle',
  // the plain chip — Vaadin paints it in the primary tone; entityHeaderOf already reads it as info
  normal: 'oj-badge oj-badge-info oj-badge-subtle',
  info: 'oj-badge oj-badge-info oj-badge-subtle',
}

/** Proyección del TaskQueue (cola de trabajo del front-office): grupos de cards con
 *  badges; el clic despacha metadata.actionId con parameters._item = id del item
 *  (contrato del renderer web compartido: mateu-task-queue.ts). Los datos viajan
 *  INLINE en la metadata — no hay eje data ni triggers. */
export function taskQueueOf(tree) {
  // una cola DENTRO de un panel de consola es la lista de esa consola (átomo isQueue del
  // dispatcher), no el modo «cola de trabajo + isla» de página completa
  const node = findOutsidePanes(tree, 'TaskQueue')
  if (!node) return null
  return queueProjectionOf(node.metadata)
}

/** Los grupos de tarjetas de una TaskQueue, listos para pintar (modo página y átomo isQueue). */
export function queueProjectionOf(md) {
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

export const NOT_FOUND_TEXTS = {
  es: { title: 'No encontrado', message: 'Puede que se haya borrado o que el enlace no sea correcto.', back: 'Volver' },
  en: { title: 'Not found', message: 'It may have been deleted, or the link is wrong.', back: 'Go back' },
}

/** Proyección de la página NOT FOUND: lo que contesta el server cuando la ruta nombra un registro
 *  o una pantalla que no existe (una reserva borrada, un enlace mal copiado) — en lugar de un
 *  toast de error sobre una página vacía. Se pinta con el idioma de Redwood para esto, el
 *  oj-sp-empty-state a página completa (su ilustración de fondo + texto primario/secundario + la
 *  navigationAction como vuelta atrás), dentro de la shell. Los textos los manda el server (el
 *  mensaje de la excepción como titular); si faltan, los genéricos en el idioma de la página.
 *  null si el host no es un not-found. */
export function notFoundOf(tree, lang) {
  const node = findByType(tree, 'NotFound')
  if (!node) return null
  const md = node.metadata || {}
  const texts = String(lang || '').toLowerCase().startsWith('es') ? NOT_FOUND_TEXTS.es : NOT_FOUND_TEXTS.en
  const backRoute = md.backRoute || ''
  return {
    title: md.title || texts.title,
    message: md.message || texts.message,
    backRoute,
    // la vuelta atrás es la navigationAction del empty-state (un enlace); sin ruta, ninguna
    navigationAction: backRoute ? { label: md.backLabel || texts.back, display: 'on' } : null,
  }
}

/** Interpolación del wire (labels con plantillas): ${state.clave} → valor del state. */
/** La ruta que abre una fila (`/customers/${row.id}`), o '' si la plantilla no se resuelve entera. */
export function rowRouteOf(template, row) {
  if (!template) return ''
  let unresolved = false
  const route = String(template).replace(/\$\{\s*row\.([A-Za-z0-9_]+)\s*\}/g, (all, field) => {
    const value = row ? row[field] : undefined
    if (value == null || value === '') { unresolved = true; return '' }
    return encodeURIComponent(typeof value === 'object' ? (value.value ?? value.message ?? '') : String(value))
  })
  return unresolved || route.includes('${') ? '' : route
}

export function interpolate(text, state) {
  // `${state.x}` y también `${state['x']}` / `${state["x"]}` (la posición del editor de filas
  // llega como ${state['_position']})
  // y rutas anidadas: `${state.status.message}` (la insignia de un @Status de la cabecera)
  return String(text == null ? '' : text).replace(
    /\$\{state(?:\.([A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)*)|\[\s*['"]([^'"\]]+)['"]\s*\])\}/g,
    (all, dotted, quoted) => {
      if (quoted) return state && state[quoted] != null ? String(state[quoted]) : ''
      let value = state
      for (const part of dotted.split('.')) {
        value = value != null && typeof value === 'object' ? value[part] : undefined
      }
      return value != null && typeof value !== 'object' ? String(value) : ''
    },
  )
}

export const TEXT_CLASSES = {
  xl: 'oj-typography-heading-md',
  l: 'oj-typography-subheading-md',
  s: 'oj-typography-body-sm',
  xs: 'oj-typography-body-xs oj-text-color-secondary',
}
export const NOTICE_CLASSES = {
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
/** Fábrica de data providers de JET, inyectada por la app (en Node no hay ninguna: el atom
 *  viaja con las filas y sin proveedor, que es lo que los tests comprueban). */
export let dataProviderFactory = null
export function setDataProviderFactory(factory) { dataProviderFactory = factory }

/** Fábrica de conversores de JET (oj-input-number de un importe): JET 18 ya no acepta el
 *  conversor como JSON, quiere una instancia de IntlNumberConverter. En Node se queda la
 *  especificación, que es lo que los tests comprueban. */
/** Quién lee las preferencias de columnas del listado en pantalla (la app: localStorage por
 *  ruta). En Node, nadie: las columnas salen tal cual. */
export let columnPrefsReader = null
export function setColumnPrefsReader(fn) { columnPrefsReader = typeof fn === 'function' ? fn : null }

/** Paneles plegables abiertos/cerrados por el usuario (clave → bool); lo no tocado, como manda
 *  el wire (AccordionPanel.active, Details.opened). Estado de cliente, como la pestaña activa. */
export const panelState = {}
export function setPanelExpanded(key, expanded) { panelState[key] = !!expanded }
export function panelExpanded(key, fallback) { return key in panelState ? panelState[key] : !!fallback }

export let converterFactory = null
export function setConverterFactory(factory) { converterFactory = factory }
export function converterOf(spec) {
  return converterFactory ? converterFactory(spec) : spec
}

export function islandContentOf(ctx, opts = {}) {
  if (!ctx || !ctx.tree) return null
  // La pestaña activa es POR BARRA: un mapa {clave de barra: id de pestaña} (opts.activeTabs).
  // opts.activeTab (un único id) sigue valiendo para la barra de primer nivel.
  const activeTabs = { ...(opts.activeTab ? { '': opts.activeTab } : {}), ...(opts.activeTabs || {}) }
  // Barras ANIDADAS (un TabLayout dentro de una pestaña): cada barra tiene su clave, derivada de
  // la pestaña que la contiene (tabScope) y de su ordinal entre hermanas — ver tabStripKeyOf.
  let tabScope = ''
  const stripsPerScope = {}
  let tabBars = 0
  const state = ctx.state || {}
  const interp = (t) => interpolate(t, state)
  const badgeOf = (b) => ({
    label: b.label,
    badgeClass: BADGE_CLASSES[b.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
  })
  const buttonOf = (m) => ({
    actionId: m.actionId,
    label: m.label || m.actionId,
    disabled: !!m.disabled,
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
  let elementOrdinal = 0
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
  // Proyecta hijos como BLOQUES-COLUMNA de la rejilla oj-flex (colClass oj-md-(NN→doceavos)): las
  // zonas de @Zones y los dos paneles de un maestro-detalle. Si una columna genera varios bloques
  // se FUSIONAN en uno (un flex no puede apilar dos items en la misma celda de fila).
  const projectColumns = (children, percents, extraClass) => {
    children.forEach((child, i) => {
      const col = Math.min(11, Math.max(1, Math.round(percents[i] * 12 / 100)))
      // las cssClasses del wire de la COLUMNA viajan al bloque (p.ej. la banda
      // neutra de la info secundaria del general overview: oj-panel + oj-bg-*)
      const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
        + (extraClass ? ' ' + extraClass : '')
        + (child.cssClasses ? ' ' + child.cssClasses : '')
      const before = blocks.length
      plain = null
      visit(child, null)
      plain = null
      const created = blocks.splice(before)
      if (created.length === 1) {
        created[0].colClass = colClass
        blocks.push(created[0])
      } else if (created.length > 1) {
        blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
      }
    })
  }
  // hijos con su clase de columna YA calculada (rejillas: ResponsiveGrid, DashboardLayout)
  // Devuelve false (y no deja nada) si alguna columna genera bloques que no se pueden fusionar en
  // una celda: una isla anidada (el hoisting convierte su bloque entero en la isla) o un bloque
  // especial sin átomos — entonces el llamante apila los hijos como antes.
  const projectSized = (children, colClasses, tags = null) => {
    const start = blocks.length
    const out = []
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      const before = blocks.length
      plain = null
      if (child && child.metadata && child.metadata.type === 'DashboardPanel') visitDashboardPanel(child, null)
      else visit(child, null)
      plain = null
      const created = blocks.splice(before)
      const tag = tags ? tags[i] : null
      if (created.length === 1) out.push({ ...created[0], colClass: colClasses[i], ...tag })
      else if (created.length > 1) {
        if (created.some((b) => !Array.isArray(b.items) || b.items.some((a) => a && a.isNested))) {
          blocks.splice(start)
          return false
        }
        out.push({ isPlain: true, colClass: colClasses[i], items: created.flatMap((b) => b.items), ...tag })
      }
    }
    blocks.push(...out)
    return true
  }
  // un DashboardPanel = una tarjeta-bloque (título + subtítulo + su contenido) con su ancho
  const visitDashboardPanel = (panel, colClass) => {
    const pm = panel.metadata || {}
    const card = { isCard: true, items: [], ...(colClass ? { colClass } : {}) }
    blocks.push(card)
    plain = null
    if (pm.title) card.items.push({ isText: true, text: interp(pm.title), cls: 'oj-typography-subheading-xs' })
    if (pm.subtitle) card.items.push({ isText: true, text: interp(pm.subtitle), cls: 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-2x-bottom' })
    for (const child of kidsOf(panel)) visit(child, card)
    plain = null
  }
  const visit = (node, container) => {
    if (!node || typeof node !== 'object') return
    // @Subresource: el listado embebido es OTRA superficie (su ServerSide). Deja un hueco que
    // withSubresources rellena con su tabla cuando está cargada — bajar a su App de mediador lo
    // tomaba por la isla anidada del check-in (isNested), y la fusión vaciaba el bloque entero:
    // con la pestaña Orders o Billing activa no quedaba ni la barra de pestañas
    if (node !== ctx.tree) {
      const sub = subresourceIslandOf(node)
      if (sub) { atom({ isSubresource: true, islandId: sub.id, subresource: sub }, container); return }
    }
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
        projectColumns(node.children, node.children.map((_, i) => parseFloat(zoneMatches[i][1])))
        return
      }
    }
    // CONSOLA / MAESTRO-DETALLE (MasterDetailLayout, SplitLayout): children = [maestro, detalle].
    // Misma proyección que las zonas: dos bloques-columna de la rejilla oj-flex (lista a la
    // izquierda, detalle a la derecha, 5/12 + 7/12), que bajo md se apilan — como la vista
    // Console de OPERA. Vertical (SplitLayout orientation vertical) → uno debajo del otro. Dentro
    // de otro bloque no hay columnas que repartir: se proyecta en su sitio, en orden.
    if ((t === 'MasterDetailLayout' || t === 'SplitLayout') && !container) {
      const kids = (node.children || []).filter(Boolean)
      if (kids.length >= 2 && String(m.orientation || '').toLowerCase() !== 'vertical') {
        projectColumns(kids.slice(0, 2), [41.7, 58.3], 'mateu-split-pane')
        return
      }
      for (const kid of kids) visit(kid, container)
      return
    }
    if (t === 'App') {
      // isla ANIDADA (p.ej. el documento del check-in): marcador de posición — el
      // contenido vive en su propio contexto y lo pinta mateuNested en ese hueco
      atom({ isNested: true, islandId: node.id }, container)
      return
    }
    // FORMULARIO (FormLayout: sus FormRow de FormFields, con maxColumns y el colspan de cada
    // campo) → UN atom isFormLayout que la plantilla pinta con el oj-form-layout de JET
    // (max-columns / direction=row / colspan en cada hijo): el reparto en columnas es el de
    // JET, no una rejilla propia. Cada campo lleva su widget de verdad (texto, número, fecha,
    // booleano, select) y su readonly — la vista de detalle de un crud manda todos sus campos
    // readOnly y se tienen que ver como tales, no como inputs editables. Lo que no es un
    // campo escalar (un grid, una property row, otro componente) corta el grupo y se proyecta
    // como siempre, en su sitio.
    if (t === 'FormLayout') {
      const columns = Math.min(4, Math.max(1, m.maxColumns || m.columns || 1))
      const layouts = []
      let layout = null
      const walkLayout = (n) => {
        if (!n || typeof n !== 'object') return
        const md = n.metadata
        if (md && md.type === 'FormRow') { kidsOf(n).forEach(walkLayout); return }
        const field = md && md.type === 'FormField' ? layoutFieldOf(md, state, ctx.data, columns) : null
        if (field) {
          if (!layout) {
            layout = { isFormLayout: true, columns, fields: [] }
            layouts.push(layout)
            atom(layout, container)
          }
          layout.fields.push(field)
          return
        }
        layout = null
        visit(n, container)
      }
      kidsOf(node).forEach(walkLayout)
      // todo de sólo lectura (la vista de detalle): el propio form layout va readonly y JET
      // pinta cada campo como valor, sin caja de input
      for (const l of layouts) l.readonly = l.fields.every((f) => f.readonly)
      return
    }
    if (t === 'FormField') {
      const fieldId = m.fieldId || m.id
      // GRID embebido en un formulario (una lista con columnas: los Steps/Messages de un
      // proceso). No es el listado de un crud —ése tiene su propia rama y su cabecera de
      // búsqueda—, es una tabla más del contenido.
      if ((m.columns || []).length) {
        const rows = Array.isArray(state[fieldId]) ? state[fieldId] : []
        // lista EDITABLE con el editor de fila en un diálogo (@DetailFormCustomisation
        // position = modal): "+" debajo y, por fila, Editar / Quitar en su última columna
        const rowEditable = isModalRowEditor(m)
        const columns = m.columns
          .map((col) => col.metadata || col)
          // la columna-botón `_select` ("Edit") del wire la sustituye la de acciones de fila
          .filter((c) => !(c.id === '_select' && c.stereotype === 'button'))
          .map((c) => {
            const def = { headerText: c.label || c.id, field: c.id }
            if (c.dataType === 'status') def.template = 'cellStatusBadge'
            return def
          })
        if (rowEditable) {
          columns.push({ headerText: '', field: '__rowActions', template: 'cellListRowActions', sortable: 'disabled' })
        }
        // en una lista editable, una celda que aún no tiene valor (la línea y el total de una
        // habitación recién añadida: los pone el servidor al crear) dice «—», no un hueco
        const dashEmpty = (row) => {
          const out = { ...row }
          for (const col of columns) {
            if (col.field !== '__rowActions' && (out[col.field] == null || out[col.field] === '')) out[col.field] = EMPTY_VALUE
          }
          return out
        }
        const shown = statusBadgeRows(rows, m.columns).map((row, i) => (rowEditable
          ? {
            ...dashEmpty(row),
            _rowNumber: row._rowNumber == null ? i : row._rowNumber,
            __rowKey: String(row._rowNumber == null ? i : row._rowNumber),
            __editActionId: fieldId + '_select',
            __removeActionId: fieldId + '_remove',
          }
          : row))
        atom({
          isGrid: true,
          fieldId,
          label: m.label || '',
          columns,
          rows: shown,
          // el data provider lo construye la app (JET); en Node no hay, y el atom viaja igual
          adp: dataProviderFactory ? dataProviderFactory(shown) : null,
          isEmpty: rows.length === 0,
          rowEditable,
          addActionId: rowEditable ? fieldId + '_add' : '',
          addLabel: 'Add',
        }, container)
        return
      }
      if (RICH_TEXT_STEREOTYPES[m.stereotype] && m.readOnly) {
        // richText / html / markdown de SÓLO LECTURA: con su formato (editable: un oj-text-area
        // en el form layout — JET no trae editor de texto enriquecido)
        const raw = state[fieldId] != null ? state[fieldId] : (ctx.data || {})[fieldId]
        atom({ isRichText: true, label: interp(m.label || ''), html: richHtmlOf(m.stereotype, plainValueOf(raw)) }, container)
        return
      }
      if (m.stereotype === 'bulletedList') {
        // @BulletedList sobre una List<String>: su rótulo y sus valores como la lista de viñetas
        // de siempre (el componente BulletedList ya era un átomo; el campo caía al vacío)
        const raw = state[fieldId] != null ? state[fieldId] : (ctx.data || {})[fieldId]
        const items = (Array.isArray(raw) ? raw : raw == null || raw === '' ? [] : [raw]).map((v) => String(plainValueOf(v)))
        if (m.label) atom({ isText: true, text: interp(m.label), cls: 'oj-typography-body-sm oj-text-color-secondary oj-sm-margin-1x-bottom' }, container)
        atom({ isBullets: true, items }, container)
        return
      }
      if (m.propertyRow) {
        // un lookup de sólo lectura viaja como el campo '<campo>-label', con su ETIQUETA en
        // data['<campo>-label'] (no en el state); un campo normal puede traer su etiqueta igual
        const data = ctx.data || {}
        const fromData = (key) => (data[key] != null && typeof data[key] !== 'object' ? data[key] : null)
        const raw = state[fieldId] != null ? state[fieldId]
          : fromData(fieldId) != null ? fromData(fieldId) : (m.value != null ? m.value : '')
        const lookupLabel = fromData(fieldId + '-label')
        const shown = lookupLabel != null && lookupLabel !== '' ? lookupLabel : raw
        atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(shown)) }, container)
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
    if (t === 'TabLayout') {
      // Las pestañas se APLANAN: el atom de la barra + el contenido de la pestaña activa
      // como átomos normales del mismo contenedor. Anidar átomos dentro de átomos obligaría a
      // duplicar toda la plantilla dentro de la pestaña y a pelearse con el $current anidado
      // de VB; así el vocabulario que ya existe pinta el contenido sin enterarse.
      const tabs = (node.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab')
      if (!tabs.length) return
      // una sola pestaña visible no es una elección: su contenido sin barra (conserva su clave de
      // ruta, así nada se mueve cuando un flag vuelve a mostrar las otras)
      if (tabs.length === 1) {
        for (const child of tabs[0].children || []) visit(child, container)
        return
      }
      // cada barra con SU clave y SUS ids (la de primer nivel conserva 'tab-N'): con ids y
      // pestaña activa compartidos, pulsar la pestaña 2 de una barra interior cambiaba también
      // la exterior
      const ordinal = stripsPerScope[tabScope] || 0
      stripsPerScope[tabScope] = ordinal + 1
      const stripKey = tabStripKeyOf(tabScope, ordinal)
      const ids = tabs.map((tab, i) => tabIdOf(stripKey, i))
      const wanted = ids.indexOf(activeTabs[stripKey] || '')
      const selected = wanted >= 0 ? wanted : tabs.findIndex((tab) => tab.metadata.active)
      const current = selected >= 0 ? selected : 0
      atom({
        isTabs: true,
        // la primera barra conserva el id de siempre (las chains la refrescan por selector)
        barId: tabBars++ ? 'mateuContentTabs-' + (tabBars - 1) : 'mateuContentTabs',
        stripKey,
        selectedId: ids[current],
        tabs: tabs.map((tab, i) => ({
          id: ids[i],
          // el contador de sus @Subresource EAGER viaja con la pestaña («Subnets (12)»)
          label: interp(tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1))
            + (tab.metadata.badge ? ' (' + tab.metadata.badge + ')' : ''),
          // @Tab(key): seleccionarla empuja su URL (ver contentTabSelected)
          routeKey: tab.metadata.routeKey || '',
          // @Tab(shortcut): la selecciona por teclado (keys.mjs)
          shortcut: String(tab.metadata.shortcut || '').toLowerCase(),
        })),
      }, container)
      const outerScope = tabScope
      tabScope = ids[current]
      try {
        for (const child of tabs[current].children || []) visit(child, container)
      } finally {
        tabScope = outerScope
      }
      return
    }
    if (t === 'CustomField') {
      // envoltorio: lo que importa es lo que lleva dentro — en metadata.content o, para un
      // campo que guarda un componente (un Anchor, un Chart… declarado como campo del form),
      // en children: mirando solo content esos campos desaparecían sin dejar rastro
      for (const child of kidsOf(node)) visit(child, container)
      return
    }
    if (t === 'Element') {
      // Componente WEB de terceros (el grafo de un proceso). Los atributos son su único canal
      // de datos y viajan en la METADATA, que un State no reenvía: escritos como `${state.x}`
      // son VALORES y se reevalúan en cada render — mismo idioma que cualquier rótulo. El
      // módulo del atributo `import` lo carga la app la primera vez que se usa la etiqueta.
      const attributes = {}
      for (const key of Object.keys(m.attributes || {})) attributes[key] = interp(m.attributes[key])
      atom({
        isElement: true,
        // el servidor manda un id de relleno ("fieldId") a TODOS los Element (un record sin id):
        // dos en la misma pantalla (un plano por planta, dos tablas en un foldout) compartían
        // hueco y se pisaban. Sin id propio, nombre + ordinal: estable mientras la estructura
        // de la pantalla no cambie
        elementId: node.id && node.id !== 'fieldId' ? node.id : m.name + '#' + (elementOrdinal++),
        name: m.name,
        importUrl: (m.attributes || {}).import || '',
        attributes,
        style: node.style || '',
        cssClasses: node.cssClasses || '',
        content: interp(m.content || ''),
        asHtml: !!m.html,
        // el contenido llevaba `${…}` → ha entrado DATO en el marcado: se sanea al montarlo
        dataInContent: String(m.content || '').indexOf('${') >= 0,
        on: m.on || null,
      }, container)
      return
    }
    // ── DASHBOARD en cualquier página: rejilla de paneles (cada DashboardPanel, una tarjeta con su
    // ancho en columnas), banda de KPIs (Scoreboard/MetricCard) y gráficos (oj-chart) ──
    // ResponsiveGrid (la rejilla general): sus pistas (grid-template-columns) y los colSpans de
    // cada hijo → bloques-columna oj-flex de su ancho. Dentro de una tarjeta, apilado.
    if (t === 'ResponsiveGrid' && !container) {
      // el span de cada hijo: el del wire (colSpans) o el que el hijo lleva consigo — un
      // DashboardPanel su colSpan, la banda de KPIs (Scoreboard) la fila entera
      const serverKids = kidsOf(node)
      const serverSpans = serverKids.map((k, i) => (m.colSpans && m.colSpans[i])
        || (k && k.metadata && k.metadata.type === 'DashboardPanel' ? k.metadata.colSpan
          : k && k.metadata && k.metadata.type === 'Scoreboard' ? 999 : 1))
      // REORDENABLE (ResponsiveGrid.reorderable): los tiles en el orden guardado del usuario, cada
      // bloque marcado con su clave y su ámbito — installTileReorder los arrastra y re-proyecta
      let order = serverKids.map((_, i) => i)
      let tags = null
      if (m.reorderable) {
        const scope = tileScopeOf(node.id)
        const keys = serverKids.map((k, i) => tileKeyOf(k, i))
        order = orderedTileIndices(keys, readTileOrder(scope))
        tags = order.map((i) => ({ tileKey: keys[i], tileScope: scope }))
      }
      const kids = order.map((i) => serverKids[i])
      const spans = order.map((i) => serverSpans[i])
      const classes = gridColClasses(m.gridTemplateColumns, spans, kids.length)
      if (classes && projectSized(kids, classes, tags)) return
    }
    if (t === 'DashboardLayout') {
      const columns = m.columns > 0 ? m.columns : 3
      const kids = kidsOf(node)
      if (projectSized(kids, kids.map((k) => panelColClass(k && k.metadata && k.metadata.colSpan, columns)))) return
      for (const child of kids) visit(child, container)
      return
    }
    if (t === 'DashboardPanel') {
      visitDashboardPanel(node, null)
      return
    }
    if (t === 'Scoreboard') {
      const metrics = findAllByType(node, 'MetricCard').map((n) => metricOf(n.metadata, interp))
      if (metrics.length) atom({ isScoreboard: true, metrics }, container)
      return
    }
    if (t === 'MetricCard') {
      // consecutivos se juntan en la misma banda (como los botones)
      const target = container || plain
      const last = target && target.items.length ? target.items[target.items.length - 1] : null
      if (last && last.isScoreboard) last.metrics.push(metricOf(m, interp))
      else atom({ isScoreboard: true, metrics: [metricOf(m, interp)] }, container)
      return
    }
    if (t === 'Chart' || t === 'TrendChart') {
      atom(chartAtomOf(m, t, interp), container)
      return
    }
    if (t === 'Card') {
      const card = { isCard: true, items: [] }
      blocks.push(card)
      plain = null
      // el título de un Card fluido es un COMPONENTE (un Text): sus textos, como en cardOf
      const title = m.title && (typeof m.title === 'string' ? m.title : (m.title.text || collectTexts(m.title)[0] || ''))
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
    if (t === 'CustomComponent') {
      // Escape hatch (#14): VB no trae un renderer para el tipo → placeholder visible + los hijos
      // slotted igualmente (paridad con el <mateu-unsupported> del web).
      atom({
        isNotice: true,
        text: 'Custom component "' + (m.name || '') + '" — no VB renderer',
        noticeClass: NOTICE_CLASSES.warning,
        buttons: [],
      }, container)
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
            // un h2 al frente de una zona es el TITULO del fold (el gop lo asciende a
            // cabecera de slot con el subrayado del foldout)
            isH2: m.container === 'h2',
            text,
            cls: 'oj-typography-subheading-xs' + (notFirst ? ' oj-sm-margin-10x-top' : ''),
          }, container)
        } else {
          atom({ isText: true, text, cls: TEXT_CLASSES[m.size] || 'oj-typography-body-md' }, container)
        }
      }
      return
    }
    // ENLACE (Anchor): un <a> de verdad — el tema Redwood lo pinta como enlace, el manejador
    // global de links.mjs navega DENTRO de la shell si es una ruta de la app, y target=_blank
    // (una URL externa, un PDF) abre otra pestaña sin pasar por el servidor
    if (t === 'Anchor') {
      const href = interp(m.url)
      if (href) {
        const target = m.target ? String(m.target) : ''
        atom({
          isAnchor: true,
          text: interp(m.text) || href,
          href,
          target: target || '_self',
          rel: target === '_blank' ? 'noopener noreferrer' : '',
        }, container)
      }
      return
    }
    // FOLDOUT DENTRO DE UNA PESTAÑA (el de página lo pinta oj-sp-foldout-layout, foldoutOf): el
    // overview en su sitio y cada panel como un panel plegable — su título y, abierto, su
    // contenido; los paneles abiertos por defecto (open) se respetan
    if (t === 'FoldoutLayout' && tabScope) {
      const bySlot = {}
      for (const child of node.children || []) bySlot[child.slot || ''] = child
      if (bySlot.overview) visit(bySlot.overview, container)
      ;(m.panels || []).forEach((panel, i) => {
        const key = 'fold:' + (node.id || 'foldout') + ':' + i
        const expanded = panelExpanded(key, panel.open !== false)
        atom({ isCollapsible: true, collapsibleKey: key, title: interp(panel.title || ''), expanded, disabled: false }, container)
        const content = bySlot['panel-' + i]
        if (expanded && content) visit(content, container)
      })
      return
    }
    // PANELES PLEGABLES (AccordionLayout de AccordionPanel, Details): como las pestañas, se
    // APLANAN — la cabecera es un átomo isCollapsible (un oj-collapsible de JET) y el contenido
    // del panel va detrás, como átomos normales, sólo si está abierto. Abierto/cerrado es estado
    // del CLIENTE (panelExpanded, por clave): plegar re-proyecta sin preguntar al servidor.
    if (t === 'AccordionLayout') {
      kidsOf(node).forEach((panel, i) => {
        const pm = panel.metadata || {}
        const key = 'acc:' + (node.id || 'accordion') + ':' + i
        const expanded = panelExpanded(key, !!pm.active)
        atom({ isCollapsible: true, collapsibleKey: key, title: interp(pm.label || ''), expanded, disabled: !!pm.disabled }, container)
        if (expanded) for (const child of kidsOf(panel)) visit(child, container)
      })
      return
    }
    if (t === 'Details') {
      const summaryTexts = m.summary ? collectTexts(m.summary) : []
      const key = 'det:' + (node.id && node.id !== 'fieldId' ? node.id : (summaryTexts[0] || 'details'))
      const expanded = panelExpanded(key, !!m.opened)
      atom({ isCollapsible: true, collapsibleKey: key, title: interp(summaryTexts.join(' ')), expanded, disabled: false }, container)
      if (expanded && m.content) visit(m.content, container)
      return
    }
    // TAPE CHART (PlanningBoard → oj-gantt de JET): filas = recursos (con sus columnas de
    // atributos en la etiqueta), tareas = bloques. Proyección en planningAtomOf (pura, testeada);
    // los eventos de JET (ojMove, ojResize, doble clic, rango) los traduce planningActionOf.
    if (t === 'PlanningBoard') {
      atom(planningAtomOf(m, node.id), container)
      return
    }
    // COLA como pieza de contenido (la lista de una consola maestro-detalle): las mismas tarjetas
    // oj-action-card del modo cola; cada una lleva su acción (la de la cola, con {_item}) para
    // que el despachador genérico de bloques la ejecute, y la opción de línea va DEBAJO de la
    // tarjeta (dentro, su clic sería también el de la tarjeta)
    if (t === 'TaskQueue') {
      const q = queueProjectionOf(m)
      atom({
        isQueue: true,
        groups: q.groups.map((g) => ({
          label: g.label,
          items: g.items.map((it) => ({
            ...it,
            actionId: q.actionId,
            parameters: { _item: it.id },
            lineActions: it.hasAction ? [{ actionId: it.actionId, label: it.actionLabel, parameters: it.parameters }] : [],
          })),
        })),
      }, container)
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
      // Como en el web: un aviso sin texto (un @Notice cuyo campo vale null o blanco) y sin
      // contenido no se pinta — el valor del campo es su propio interruptor de visibilidad.
      const noticeText = interp(m.text)
      if (!noticeText.trim() && !kidsOf(node).length) return
      atom({
        isNotice: true,
        text: noticeText,
        noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
        buttons: collectButtons({ children: kidsOf(node) }, []),
      }, container)
      return
    }
    if (t === 'Markdown') {
      // Markdown CON formato (encabezados, listas, citas, código, negrita, enlaces…): HTML saneado
      // que installRichText vuelca en su contenedor (VB no estampa HTML desde un binding)
      const html = richHtmlOf('markdown', interp(m.markdown || m.text || ''))
      if (html) atom({ isRichText: true, label: '', html }, container)
      return
    }
    if (t === 'Grid') {
      // un Grid fluido (columnas en content, filas en page.content): la misma tabla embebida que
      // un campo de tipo lista — oj-table en modo lista; los grupos de columnas se aplanan
      const leafColumns = []
      const walkCols = (n) => {
        const cm = n && (n.metadata || n)
        if (!cm) return
        if (cm.type === 'GridGroupColumn') { kidsOf(n).forEach(walkCols); (cm.columns || []).forEach(walkCols); return }
        if (cm.type === 'GridColumn' || cm.id) leafColumns.push(cm)
      }
      ;(m.content || []).forEach(walkCols)
      const rows = ((m.page && m.page.content) || []).map((r, i) => ({ ...r, _rowNumber: r._rowNumber == null ? i : r._rowNumber }))
      const columns = leafColumns.map((c) => ({ headerText: interp(c.label || c.id), field: c.id }))
      atom({
        isGrid: true,
        fieldId: node.id || 'grid',
        label: '',
        columns,
        rows,
        adp: dataProviderFactory ? dataProviderFactory(rows) : null,
        isEmpty: rows.length === 0,
        rowEditable: false,
        addActionId: '',
        addLabel: 'Add',
      }, container)
      return
    }
    if (t === 'Gantt') {
      atom(ganttAtomOf(m, node.id), container)
      return
    }
    if (t === 'DropZone') {
      // un destino donde soltar filas arrastradas (@DragRows): título, subtítulo y su contenido como
      // líneas de texto; dnd.mjs lo resalta mientras se arrastra su tipo y lanza su acción al soltar
      const lines = kidsOf(node).flatMap((k) => collectTexts(k)).map(interp).filter(Boolean)
      atom({
        isDropZone: true,
        title: interp(m.title || ''),
        subtitle: interp(m.subtitle || ''),
        lines,
        accept: dragMimeOf(m.accept || ''),
        actionId: m.actionId || '',
        params: JSON.stringify(m.parameters || {}),
        ariaLabel: (m.title || '') + (m.subtitle ? ', ' + m.subtitle : '') + ' — drop target',
      }, container)
      return
    }
    if (t === 'Popover') {
      // lo envuelto se pinta como un disparador con su texto; el contenido, como líneas en la
      // ventana flotante compartida (hover.mjs) — al pasar/enfocar (hover) o al pulsar (click)
      const wrappedTexts = m.wrapped ? collectTexts(m.wrapped).map(interp).filter(Boolean) : []
      const label = wrappedTexts.join(' ') || (m.wrapped && m.wrapped.metadata && m.wrapped.metadata.label) || 'Details'
      const lines = m.content ? collectTexts(m.content).map(interp).filter(Boolean) : []
      const text = lines.join('\n')
      atom({
        isPopover: true,
        label: interp(label),
        hoverText: m.trigger === 'hover' ? text : '',
        clickText: m.trigger === 'hover' ? '' : text,
      }, container)
      return
    }
    if (t === 'Calendar') {
      atom(calendarAtomOf(m, node.id), container)
      return
    }
    if (t === 'MatrixGrid') {
      atom(matrixAtomOf(m, node.id, interp), container)
      return
    }
    if (t === 'Map') {
      atom(mapAtomOf(m, node.id, node.style), container)
      return
    }
    if (t === 'ActionPanel') {
      atom(actionPanelAtomOf(m, node.id, interp), container)
      return
    }
    if (t === 'BulletedList') {
      atom({ isBullets: true, items: (m.items || []).map(interp) }, container)
      return
    }
    if (t === 'Image') {
      // JET no tiene componente de imagen: un <img> con el ancho de su contenedor como tope
      // una ruta RELATIVA la sirve el backend (como el módulo de un Element), no la app VB
      if (m.src) atom({ isImage: true, src: elementModuleUrl(interp(m.src)), alt: interp(m.alt || '') }, container)
      return
    }
    if (t === 'Avatar') {
      atom({ isAvatar: true, avatars: [avatarOf(m)], overflow: '' }, container)
      return
    }
    if (t === 'AvatarGroup') {
      // oj-avatar por persona hasta maxItemsVisible, y «+N» con las que no caben
      const all = (m.avatars || []).map(avatarOf)
      const max = m.maxItemsVisible > 0 ? m.maxItemsVisible : all.length
      atom({ isAvatar: true, avatars: all.slice(0, max), overflow: all.length > max ? '+' + (all.length - max) : '' }, container)
      return
    }
    if (t === 'CarouselLayout') {
      // una GALERÍA (todas las diapositivas son imágenes) → oj-film-strip de JET, con sus flechas
      // y su paginación; un carrusel de contenido arbitrario sigue apilando sus diapositivas
      const slides = kidsOf(node)
      const images = slides.map((n) => (n && n.metadata && n.metadata.type === 'Image' && n.metadata.src ? n.metadata : null))
      if (slides.length && images.every(Boolean)) {
        atom({ isGallery: true, id: node.id || 'gallery',
          images: images.map((im, i) => ({ key: String(i), src: elementModuleUrl(interp(im.src)), alt: interp(im.alt || '') })),
          looping: m.loop ? 'page' : 'off' }, container)
        return
      }
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
              iconClass: ojIconOrGenericOf(it.actionIcon) || '' })
          }
          if (it.actionLabel2 && it.actionId2) {
            rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
              iconClass: ojIconOrGenericOf(it.actionIcon2) || '' })
          }
          if (it.actionLabel3 && it.actionId3) {
            rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
              iconClass: ojIconOrGenericOf(it.actionIcon3) || '' })
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
            // nivel del heading del titulo apilado: h4 bajo un grupo con h3 propio
            isH4: m.itemHeadingLevel === 4,
            // cronologia bajo el titulo (p.ej. las entradas de una incidencia)
            lines: (it.lines || []).map(interp),
            hasLines: !!(it.lines && it.lines.length),
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

/** ¿Hace el contenido de la pantalla de cuerpo de la página? (si no, lo pinta el form genérico)
 *
 *  Sí cuando trae algo RICO (isRichAtom, una barra de pestañas, una tabla, un componente web, un
 *  listado @Subresource): sus campos ya se ven ahí. Y sí cuando el form genérico no tiene NADA
 *  que pintar: una página de solo lectura llega como textos sueltos — sus campos @ReadOnly son
 *  Text en el wire, no FormFields — y sin esta regla salía vacía (CustomerHistory). */
export function hostContentShown(blocks, summary) {
  if (!blocks || !blocks.length) return false
  const rich = (a) => isRichAtom(a) || !!(a && (a.isTabs || a.isGrid || a.isElement || a.isSubresource))
  if (blocks.some((block) => (block.items || []).some(rich))) return true
  const s = summary || {}
  return !s.formMetadata && !(s.fields || []).length && !(s.sections || []).length && !s.text
}

// ── @Subresource: listados embebidos en el contenido (P1) ─────────────────────────────────────
//
// Un campo @Subresource llega como un ServerSide INTERIOR (su isla) con un App de mediador cuya
// homeRoute lleva `_hideTitle=1` (y `_scope`, y `_lazy` si es ON_OPEN): el servidor solo marca
// así a los sub-recursos. Se carga al quedar a la vista — la pestaña activa —, con el estado que
// el padre le siembra (initialData: el id del maestro) y su búsqueda OnLoad, y se pinta como una
// tabla en su sitio del contenido.

/** Si el nodo es la frontera de un @Subresource, cómo cargarlo; si no, null. */
export function subresourceIslandOf(node) {
  if (!node || typeof node !== 'object' || node.type !== 'ServerSide' || !node.id) return null
  const app = (node.children || [])[0]
  const md = app && app.metadata
  if (!md || md.type !== 'App' || md.variant !== 'MEDIATOR' || !md.homeRoute) return null
  const [path, query] = String(md.homeRoute).split('?')
  const params = {}
  for (const pair of String(query || '').split('&')) {
    if (!pair) continue
    const at = pair.indexOf('=')
    params[decodeURIComponent(at < 0 ? pair : pair.slice(0, at))] = at < 0 ? '' : decodeURIComponent(pair.slice(at + 1))
  }
  if (params._hideTitle !== '1') return null
  return {
    id: node.id,
    route: md.homeRoute,
    consumedRoute: md.homeConsumedRoute || path,
    serverSideType: md.homeServerSideType || node.serverSideType,
    // la marca de la ruta viaja también en el estado (_scope: lo que el padre fija), como en Vaadin
    componentState: { ...params, ...(node.initialData || {}) },
    lazy: params._lazy === '1',
  }
}

/** Los huecos @Subresource del contenido que aún no tienen su superficie cargada. */
export function pendingSubresourcesOf(blocks, contexts) {
  const out = []
  for (const block of blocks || []) {
    for (const a of block.items || []) {
      if (a && a.isSubresource && !(contexts && contexts[a.islandId] && contexts[a.islandId].tree)) out.push(a.subresource)
    }
  }
  return out
}

/** El contenido con cada hueco @Subresource cargado convertido en su tabla (o, si no es un
 *  listado, en su contenido). Los que aún no están cargados se quedan como hueco (no pintan). */
export function withSubresources(blocks, contexts) {
  if (!blocks) return blocks
  return blocks.map((block) => ({
    ...block,
    items: (block.items || []).flatMap((a) => {
      if (!a || !a.isSubresource) return [a]
      const ctx = contexts && contexts[a.islandId]
      if (!ctx || !ctx.tree) return [a]
      const crud = findByType(ctx.tree, 'Crud')
      if (!crud) {
        const inner = islandContentOf(ctx)
        return inner ? inner.flatMap((b) => b.items) : []
      }
      const md = crud.metadata || {}
      const wire = (md.columns || []).map((col) => col.metadata || col)
        // las acciones por fila no tienen sitio en la tabla de solo consulta
        .filter((c) => c.dataType !== 'actionGroup' && !(c.id === '_select' && c.stereotype === 'button'))
      const page = (((ctx.data || {}).crud || {}).page) || {}
      const rows = statusBadgeRows(page.content || [], wire)
      return [{
        isGrid: true,
        isSubresourceGrid: true,
        fieldId: a.islandId,
        label: md.title || '',
        columns: wire.map((c) => (c.dataType === 'status'
          ? { headerText: c.label || c.id, field: c.id, template: 'cellStatusBadge' }
          : { headerText: c.label || c.id, field: c.id })),
        rows,
        adp: dataProviderFactory ? dataProviderFactory(rows) : null,
        isEmpty: rows.length === 0,
        total: page.totalElements == null ? rows.length : page.totalElements,
        rowEditable: false,
        addActionId: '',
        addLabel: '',
      }]
    }),
  }))
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
      if (a.fields) marked.fields = a.fields.map((f) => ({ ...f, fromNested: true }))
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
/** ¿El card llevaba título? visit() lo mete como primer átomo de texto con la clase del
 *  subencabezado — que es justo lo que distingue una tarjeta de verdad del marco de la página. */
export function cardHasTitle(block) {
  const first = (block.items || [])[0]
  return !!(first && first.isText && String(first.cls || '').indexOf('oj-typography-subheading') >= 0)
}

export function hostContentOf(ctx, islandBlocks, opts = {}) {
  const blocks = islandContentOf(ctx, opts)
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
          // el contador «2 | 3» del RAIL (@WizardProgress(RAIL)): el oj-sp del proceso guiado
          // ya pinta el suyo en su raíl, uno más en el contenido es un duplicado
          if (atom.isText && /^\d+ \| \d+$/.test(String(atom.text || '').trim())) return false
          if (!opts.keepWizardNav && atom.isButtons && atom.buttons.length
              && atom.buttons.every((b) => b.actionId === 'next' || b.actionId === 'back')) return false
          // el pie del ÚLTIMO paso: Back + la acción de completar (@WizardCompletionAction) — el
          // pie del proceso guiado ya los pinta (wizardForwardOf), aquí salían duplicados
          if (!opts.keepWizardNav && atom.isButtons && atom.buttons.length === 2
              && atom.buttons.some((b) => b.actionId === 'back')
              && !atom.buttons.some((b) => b.actionId === 'next')) return false
        }
        return true
      }),
    }))
    .filter((block) => block.items.length)
    // el loop del host pinta los bloques dentro de un oj-flex: los bloques-columna de una
    // fila zonada llevan su colClass; el resto ocupa la fila entera (oj-sm-12)
    .map((block) => ({ ...block, blockClass: block.colClass || 'oj-flex-item oj-sm-12' }))
  // Un ÚNICO card SIN TÍTULO que envuelve todo el contenido no es una tarjeta: es el marco de
  // la página, y ése ya lo pinta el contenedor de contenido. Pintarlo además como oj-panel deja
  // una caja dentro de otra, que es como se veía cualquier pantalla con pestañas o con una
  // tabla dentro — mientras que una ficha normal (la rama de formulario) no la tiene. Con
  // título sí es una tarjeta de verdad y se respeta, igual que cuando hay varias.
  if (merged.length === 1 && merged[0].isCard && !cardHasTitle(merged[0])) {
    merged = [{ ...merged[0], isCard: false, isPlain: true }]
  }
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
