import { actionsOf, collectFields, collectTexts } from './tree.mjs'
import { islandContentOf } from './content.mjs'
import { findByType } from './listing.mjs'
import { chromeText } from '../i18n.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): welcome, general/item overview, content tab strips, banners, page style.

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
/** Los pares color + ilustración del hero de la welcome: las 5 parejas bg+fg de la galería OFICIAL
 *  (fnd/gallery illust-welcome-banner-*-01..05), cada una con su tono de la paleta oscura RDS. */
export const WELCOME_LOOKS = [
  ['dark-ocean', '01'], ['dark-pine', '02'], ['dark-plum', '03'],
  ['dark-sienna', '04'], ['dark-teal', '05'],
]
export const WELCOME_GALLERY = 'https://static.oracle.com/cdn/fnd/gallery/2307.0.2/images/'

/** Qué welcome es la que se pinta: su clase de servidor (o, sin ella, el id del árbol). */
export function welcomeKeyOf(ctx) {
  const tree = ctx && ctx.tree
  return tree ? (tree.serverSideType || tree.id || '') : ''
}

/**
 * El aspecto del hero: uno al azar al ENTRAR en una welcome, y el mismo mientras se siga en ella.
 *
 * Rotaba en cada proyección, y una welcome se reproyecta con la respuesta de cada acción que se
 * lanza desde ella — también la de un CTA que devuelve una ruta ("Ir a Reservas"): el hero cambiaba
 * de color justo antes de navegar, durante todo lo que tardara en llegar la página siguiente.
 * Ahora sólo rota en una visita nueva: no había welcome pintada (`previous` nulo) o era otra.
 *
 * @param key       welcomeKeyOf del contexto que se proyecta
 * @param previous  el aspecto pintado ({key, theme, illuBg, illu}) si ya había una welcome, o null
 */
/** HeroSection.tone (the server's HeroTone) → the banner's background-color. oj-sp's welcome banner
 *  ships a dark-* tone for each of the nine (dark-ocean … dark-sienna); the five that have an
 *  illustration pair in the gallery keep it, the other four go without one. */
export const WELCOME_TONES = ['ocean', 'pine', 'lilac', 'teal', 'rose', 'pebble', 'slate', 'plum', 'sienna']
export function welcomeToneLookOf(key, tone) {
  const t = String(tone || '').toLowerCase()
  if (WELCOME_TONES.indexOf(t) < 0) return null
  const theme = 'dark-' + t
  const pair = WELCOME_LOOKS.find(([th]) => th === theme)
  return {
    key,
    tone: t,
    theme,
    illuBg: pair ? WELCOME_GALLERY + 'illust-welcome-banner-bg-' + pair[1] + '.png' : '',
    illu: pair ? WELCOME_GALLERY + 'illust-welcome-banner-fg-' + pair[1] + '.png' : '',
  }
}

export function welcomeLookOf(key, previous, random = Math.random, tone = null) {
  // a DECLARED tone (Welcome.heroTone / @WelcomeBanner(tone)) wins over the rotation, every time
  const toned = welcomeToneLookOf(key, tone)
  if (toned) return toned
  if (previous && previous.theme && previous.key === key) return previous
  const [theme, n] = WELCOME_LOOKS[Math.floor(random() * WELCOME_LOOKS.length) % WELCOME_LOOKS.length]
  return {
    key,
    theme,
    illuBg: WELCOME_GALLERY + 'illust-welcome-banner-bg-' + n + '.png',
    illu: WELCOME_GALLERY + 'illust-welcome-banner-fg-' + n + '.png',
  }
}

export function welcomeOf(ctx) {
  const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
  if (!hero) return null
  const md = hero.metadata
  const ctas = actionsOf(hero)
  const panels = findAllByType(ctx.tree, 'DashboardPanel')
  // un TrendChart en un tile → CHART a todo el ancho bajo los KPIs (oj-chart en VB);
  // items PRECOMPUTADOS (id/value/group/series) — el CSP de VB no construye arrays
  const trendPanel = panels.find(
    (panel) => findByType(panel, 'TrendChart') || findByType(panel, 'Chart'))
  const chartNode = trendPanel
    ? findByType(trendPanel, 'TrendChart') || findByType(trendPanel, 'Chart') : null
  const tm = chartNode ? chartNode.metadata : null
  // valores/labels de las dos formas del wire: TrendChart (values/labels planos) o
  // Chart (chartData.labels + datasets[0].data — se toma la primera serie)
  const dataset = tm && tm.chartData && tm.chartData.datasets && tm.chartData.datasets.length
    ? tm.chartData.datasets[0] : null
  const values = tm ? (tm.values || (dataset ? dataset.data : []) || []) : []
  const labels = tm ? (tm.labels || (tm.chartData ? tm.chartData.labels : []) || []) : []
  const series = (dataset && dataset.label) || chromeText('occupancy')
  const trend = tm
    ? {
        title: trendPanel.metadata.title || tm.title || '',
        items: (values || []).map((value, i) => ({
          id: i,
          value,
          group: [labels[i] != null ? labels[i] : String(i + 1)],
          series,
        })),
      }
    : null
  const tiles = panels.filter((panel) => panel !== trendPanel).map((panel) => {
    // un MetricCard dentro del tile → KPI (valor grande + etiqueta + caption)
    const metric = findByType(panel, 'MetricCard') || findByType(panel, 'Stat')
    const mm = metric ? metric.metadata : null
    return {
      title: panel.metadata.title || '',
      texts: collectTexts(panel),
      isKpi: !!mm,
      kpiTitle: mm ? (mm.title || mm.label || '') : '',
      kpiValue: mm ? String(mm.value == null ? '' : mm.value) : '',
      kpiCaption: mm ? (mm.description || mm.caption || '') : '',
      kpiActionId: mm ? (mm.actionId || '') : '',
    }
  })
  return {
    trend,
    // HeroSectionDto.tone: null = the rotating look (welcomeLookOf)
    tone: md.tone || null,
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

/** The first child slotted `slot` of a ResponsiveGrid in the tree, and whether it leads its
 *  siblings: { node, first } or null. */
export function findFirstSlotted(tree, slot) {
  let found = null
  const walk = (n) => {
    if (found || !n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach(walk); return }
    if (n.metadata && n.metadata.type === 'ResponsiveGrid') {
      const kids = n.children || []
      const i = kids.findIndex((k) => k && k.slot === slot)
      if (i >= 0) { found = { node: kids[i], first: i === 0 }; return }
    }
    for (const v of Object.values(n)) if (v && typeof v === 'object') walk(v)
  }
  walk(tree)
  return found
}

/** The overview's `info` slot as a card: a Card brings its title and content, anything else is
 *  the content itself. */
export function overviewInfoCardOf(ctx, node) {
  const isCard = !!(node && node.metadata && node.metadata.type === 'Card')
  const content = isCard ? (node.metadata.content || []) : [node]
  const blocks = islandContentOf({ ...ctx, kind: 'island', tree: { type: 'ClientSide', id: '_overviewInfo', metadata: { type: 'VerticalLayout' },
    children: Array.isArray(content) ? content : [content] } }) || []
  return {
    title: isCard ? cardOf(node).title : '',
    texts: [],
    items: blocks.flatMap((b) => b.items || []),
    isInfo: true,
    colClass: 'oj-flex-item oj-sm-12 oj-md-4',
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
  // the GeneralOverview `info` slot (GeneralOverview.info(): a child slotted `info` of the
  // ResponsiveGrid `general-overview`): drawn as its own, narrower card — untitled, it was taken for
  // a structural wrapper and dropped. First when it travels first (promoteInfoSlot).
  const infoNode = findFirstSlotted(ctx.tree, 'info')
  const infoCard = infoNode ? overviewInfoCardOf(ctx, infoNode.node) : null
  const cards = findAllByType(ctx.tree, 'Card')
    .filter((node) => !infoNode || node !== infoNode.node)
    .map((node) => {
      const card = cardOf(node)
      // el contenido de la tarjeta como ÁTOMOS (no sólo sus textos): una StatusList, una tabla…
      // se pintaban vacías porque sólo se recogía el texto
      const content = (node.metadata && node.metadata.content) || []
      const blocks = islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_overviewCard', metadata: { type: 'VerticalLayout' },
        children: Array.isArray(content) ? content : [content] } }) || []
      return { ...card, items: blocks.flatMap((b) => b.items || []) }
    })
    .filter((card) => card.title) // los Card sin título son wrappers de sección/estructura
  if (infoCard) {
    // a side column next to other cards; alone, as wide as a card
    if (!cards.length) infoCard.colClass = 'oj-flex-item oj-sm-12 oj-md-6'
    if (infoNode.first) cards.unshift(infoCard)
    else cards.push(infoCard)
  }
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

/** Clave de una barra de pestañas del contenido: '' para la primera de primer nivel (la de
 *  siempre, así una página con una sola barra no cambia); dentro de una pestaña, el id de esa
 *  pestaña; las hermanas siguientes llevan '/tabs-N'. */
export function tabStripKeyOf(scope, ordinal) {
  return [scope || '', ordinal ? 'tabs-' + ordinal : ''].filter(Boolean).join('/')
}

/** Id de la pestaña i de una barra: 'tab-i' en la de primer nivel, '<clave>/tab-i' en el resto. */
export function tabIdOf(stripKey, index) {
  return (stripKey ? stripKey + '/' : '') + 'tab-' + index
}

/** La barra a la que pertenece una pestaña (inversa de tabIdOf). */
export function tabStripOf(tabId) {
  const s = String(tabId || '')
  const cut = s.lastIndexOf('/')
  return cut < 0 ? '' : s.slice(0, cut)
}

/** Anota la pestaña elegida en el mapa de activas (una por barra), sin tocar las demás barras. */
export function withActiveTab(activeTabs, tabId) {
  return { ...(activeTabs || {}), [tabStripOf(tabId)]: tabId }
}

/** Ids de las barras de pestañas (átomos isTabs) de unos bloques: las chains las refrescan. */
export function tabBarIdsOf(blocks) {
  const ids = []
  const walk = (items) => (items || []).forEach((a) => {
    if (a && a.isTabs && a.barId) ids.push(a.barId)
    if (a && a.items) walk(a.items)
  })
  ;(blocks || []).forEach((b) => walk(b.items))
  return ids
}

/** Arquetipo ITEM OVERVIEW: panel de datos clave + tabs. */
export function itemOverviewOf(ctx) {
  const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
  if (!tabLayout) return null
  const keyCard = findAllByType(ctx.tree, 'Card').find((card) => !findByType(card, 'TabLayout'))
  // El arquetipo es panel de datos clave + pestañas: sin panel esto no es un item overview,
  // es un FORMULARIO que resulta que lleva pestañas dentro. Reclamarlo igual dejaba la página
  // sin sus campos (no hay tarjeta clave que pintar) y las pestañas reducidas a sus rótulos
  // (de su contenido solo se sacan textos sueltos). Le pasaba al detalle de un proceso.
  if (!keyCard) return null
  // solo las pestañas de la barra EXTERIOR: las de una barra anidada son contenido de su
  // pestaña (sus textos van en los de ella), no hermanas de la lista
  // el contenido como ÁTOMOS (un Markdown, un Chart, una StatusList…): antes solo sus textos sueltos
  const atomsOfNodes = (nodes) => (islandContentOf({ ...ctx, tree: { type: 'ClientSide', id: '_itemOverview',
    metadata: { type: 'VerticalLayout' }, children: nodes } }) || []).flatMap((b) => b.items || [])
  const tabs = (tabLayout.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab').map((tab, i) => ({
    id: 'itab-' + i,
    label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
    texts: collectTexts(tab),
    items: atomsOfNodes(tab.children || []),
  }))
  const keyContent = keyCard ? ((keyCard.metadata && keyCard.metadata.content) || []) : []
  return {
    key: keyCard ? { ...cardOf(keyCard), items: atomsOfNodes(Array.isArray(keyContent) ? keyContent : [keyContent]) } : { title: '', texts: [], items: [] },
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
