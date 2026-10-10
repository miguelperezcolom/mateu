import { collectTexts } from './tree.mjs'
import { BADGE_CLASSES, interpolate, islandContentOf } from './content.mjs'
import { PANE_TYPES, findOutside } from './pageHeader.mjs'
import { STATUS_BADGE, findByType, findFirst } from './listing.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): page archetypes projected from the tree: foldout, wizard.

/** Proyección del FOLDOUT (Fase 7): overview + paneles con sus cabeceras (metadata.panels)
 *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout.
 *  Cada slot proyecta además sus bloques RICOS (mismo pipeline que el host: tarjetas
 *  StatusList, botones, inputs, notices…) — el markup pinta blocks y deja texts solo
 *  como forma legada para tests/fixtures. */
export function foldoutOf(ctx) {
  // el foldout de PÁGINA: uno metido en una pestaña (o en un panel de consola) es contenido de esa
  // pestaña — visit() lo pinta allí, con sus paneles plegables — y no se adueña de la pantalla
  const node = ctx && ctx.tree ? findOutside(ctx.tree, 'FoldoutLayout', { ...PANE_TYPES, TabLayout: true }) : null
  if (!node) return null
  const md = node.metadata
  const children = node.children || []
  const bySlot = {}
  for (const child of children) bySlot[child.slot || ''] = child
  const blocksOf = (slotNode) => {
    const blocks = slotNode
      ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {}, data: (ctx && ctx.data) || {} })
      : null
    // mismo contrato visual que hostContentOf: bloques-columna con su colClass,
    // el resto a fila completa
    return (blocks || []).map((block) => ({
      ...block,
      blockClass: block.colClass || 'oj-flex-item oj-sm-12',
    }))
  }
  // Las insignias de la PÁGINA (el @Status de la cabecera: «Confirmed») encabezan el overview:
  // el web las pinta junto al título, y la cabecera de VB no tiene sitio para ellas. Mismas
  // clases badge de JET que las celdas @Status; una plantilla sin resolver no se pinta.
  const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
  const state = (ctx && ctx.state) || {}
  const pageBadges = ((page && page.metadata && page.metadata.badges) || [])
    .map((b) => {
      const label = interpolate(b.text || '', state)
      const color = interpolate(b.color || '', state)
      return {
        isBadge: true,
        label,
        badgeClass: STATUS_BADGE[color] || BADGE_CLASSES[String(color).toLowerCase()] || STATUS_BADGE.NONE,
        blockClass: 'oj-flex-item oj-sm-12',
      }
    })
    .filter((b) => b.label && b.label.trim() && !b.label.includes('${'))
  return {
    headerTitle: md.headerTitle || '',
    badges: pageBadges,
    overview: {
      texts: collectTexts(bySlot['overview']),
      // un bloque PLANO que las lleva como átomos: el template del overview solo pinta bloques
      // isCard/isPlain e isBadge es un átomo de sus items — un bloque isBadge suelto no se veía
      blocks: (pageBadges.length
        ? [{ isPlain: true, isCard: false, blockClass: 'oj-flex-item oj-sm-12', items: pageBadges }]
        : []).concat(blocksOf(bySlot['overview'])),
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
      // FoldoutPanel.summary (child slotted summary-N): oj-sp-foldout-panel's own `summary` slot,
      // the compact line under the panel title
      ...foldoutSummaryOf(bySlot['summary-' + i]),
    })),
  }
}

/** A foldout panel's summary (the `summary-N` child): `hasSummary` + its texts as one line. */
export function foldoutSummaryOf(slotNode) {
  const parts = []
  const walk = (n) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    const m = n.metadata || {}
    // the short pieces a summary is made of: texts, and the label of a badge/chip
    if (m.type === 'Text' && m.text != null) parts.push(String(m.text))
    else if ((m.type === 'Badge' || m.type === 'Chip') && (m.label || m.text)) parts.push(String(m.label || m.text))
    else if (m.type === 'Notice' && m.text) parts.push(String(m.text))
    for (const c of n.children || []) walk(c)
    if (m.content) walk(m.content)
  }
  walk(slotNode)
  const text = parts.map((t) => t.trim()).filter(Boolean).join(' · ')
  return { hasSummary: !!text, summary: text }
}

/** Proyección del WIZARD (Fase 8): los ProgressSteps del wire → pasos ({id,label} + currentStep
 *  por id). null si la página no es un wizard. En la pantalla de resultado todos los pasos van
 *  'done' → currentStep = el último.
 *
 *  ORIENTACIÓN: la decide el propio wizard con @WizardProgress — RAIL manda un ProgressSteps
 *  VERTICAL (el rail lateral: el oj-sp-guided-process auténtico, con su columna de pasos a la
 *  derecha); STEPS manda uno HORIZONTAL, y eso es un tren de pasos ARRIBA (horizontal: true →
 *  oj-train sobre el contenido, y en pantallas estrechas la lista de pasos en vertical, que un
 *  tren de 4-5 rótulos no cabe en un móvil). */
/** Id del paso virtual que el guided process enseña cuando el wizard ya terminó. */
export const WIZARD_DONE_STEP = '_completed'

export function wizardOf(ctx) {
  const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
  if (!node) return null
  const md = node.metadata
  const wire = md.steps || []
  const current = wire.find((s) => s.status === 'current')
  const currentId = current ? current.id : (wire.length ? wire[wire.length - 1].id : null)
  const currentIndex = Math.max(0, wire.findIndex((s) => s.id === currentId))
  const statusOf = (s, i) => s.status || (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming')
  // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on'. El
  // status es el del TEMPLATE (success | error | none), no el de Mateu: un paso hecho es
  // 'success' — el overview pinta «Completado» al pie de su columna y el rail su marca
  const steps = wire.map((s, i) => ({
    id: s.id,
    label: s.title || s.id,
    title: s.title || s.id,
    display: 'on',
    status: statusOf(s, i) === 'done' ? 'success' : 'none',
  }))
  // RESULTADO: con todos los pasos hechos (el wire no trae el paso de resultado, que no es un
  // paso del proceso) el guided process se quedaba en el último paso — su título y su pie
  // Cancel/Done. Se añade un paso final «Completed», hecho y actual: el título dice que terminó y
  // el pie se oculta (completed → clase mateu-wizard-completed en la página)
  const completed = wire.length > 0 && wire.every((s, i) => statusOf(s, i) === 'done')
  if (completed) {
    steps.push({ id: WIZARD_DONE_STEP, label: 'Completed', title: 'Completed', display: 'on', status: 'success' })
  }
  const currentStep = completed ? WIZARD_DONE_STEP : currentId
  // el título del proceso (el h2 del wizard) y su subtítulo (@Subtitle): el overview del
  // guided process los pinta arriba a la izquierda, sobre las columnas de los pasos
  const heading = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
    && n.metadata.container === 'h2' && !!n.metadata.text) : null
  const subtitleNode = ctx.tree ? findFirst(ctx.tree, (n) => n.metadata && n.metadata.type === 'Text'
    && /(^|\s)mateu-wizard-subtitle(\s|$)/.test(n.cssClasses || '')) : null
  return {
    title: heading ? String(heading.metadata.text) : '',
    subtitle: subtitleNode ? String(subtitleNode.metadata.text || '') : '',
    // Start del overview: el primer paso; con el wizard ya empezado, «Reanudar» en el suyo
    resumeStepId: !completed && currentIndex > 0 && currentId ? currentId : '',
    steps,
    currentStep,
    completed,
    horizontal: !md.vertical,
    currentIndex: completed ? steps.length - 1 : currentIndex,
    currentLabel: steps.length ? steps[completed ? steps.length - 1 : currentIndex].label : '',
    total: steps.length,
    // el tren (oj-train): los hechos se pueden VISITAR (volver atrás), los que faltan no —
    // se avanza con el botón del paso, que valida
    trainSteps: wire.map((s, i) => {
      const status = statusOf(s, i)
      return {
        id: s.id,
        label: s.title || s.id,
        visited: status === 'done',
        disabled: status === 'upcoming',
      }
    }),
    // la misma lista, para la variante vertical (pantallas estrechas): número o ✓ + rótulo
    listSteps: wire.map((s, i) => {
      const status = statusOf(s, i)
      return {
        id: s.id,
        label: s.title || s.id,
        marker: status === 'done' ? '✓' : String(i + 1),
        cls: 'mateu-wizard-step mateu-wizard-step-' + status,
      }
    }),
  }
}
