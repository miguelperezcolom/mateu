import { chromeText } from '../i18n.mjs'
import { elementModuleUrl } from '../elements.mjs'
import { sanitizeHtml, markdownToHtml } from '../richtext.mjs'
import { collectTexts } from './tree.mjs'
import { avatarOf } from './atoms.mjs'
import { ojIconOf, GENERIC_ICON } from './shellNav.mjs'
import { BADGE_CLASSES, NOTICE_CLASSES, dataProviderFactory } from './content.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the DISPLAY components that
// were not rendered before (Kanban, Timeline, PricingTable, OrgChart, Heatmap, Funnel, FeatureGrid,
// Testimonials, CalloutCard, CommentThread, FileList, Checklist, ComparisonCard, ProcessMonitor,
// Skeleton, Icon, MenuBar/ContextMenu, MessageList/MessageInput, Chat, Bpmn, Workflow, Result,
// Directory, CookieConsent, ConfirmDialog, Breadcrumbs, Notification…).
//
// Every function here is PURE: wire metadata → an ATOM (a flat object the atoms template paints).
// The VB template evaluator cannot compare, branch or compute (CSP), so every class, text and flag
// is precomputed. An atom whose element is clickable carries `actionId` + `parameters`, which the
// shared block listener ({{blockAction}}) sends exactly like a button. Where Oracle has a component
// the template uses it (oj-chart funnel, oj-avatar, oj-action-card, oj-rating-gauge, oj-checkboxset,
// oj-menu-button, oj-collapsible, oj-dialog, oj-button…); where it has none the atom is drawn with
// Redwood tokens and classes (app.css, .mateu-*) — each projection says which.

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#|\.{0,2}\/|[^:]*$)/i
/** A link target that is safe to put in an href (no javascript:, data:…); '' otherwise. */
export function safeHref(url) {
  const u = String(url == null ? '' : url).trim()
  if (!u) return ''
  return SAFE_URL.test(u) && !/^\s*(javascript|data|vbscript):/i.test(u) ? u : ''
}

const keyed = (list) => (list || []).map((x, i) => ({ ...x, key: String(i) }))
const str = (v) => (v == null ? '' : String(v))
/** A clickable element: the action it sends (blockAction) and the flag pair the template needs. */
const clickable = (actionId, parameters) => ({
  clickable: !!actionId,
  plain: !actionId,
  actionId: actionId || '',
  parameters: parameters || {},
})
/** A Mateu/Vaadin icon name → a Redwood icon class (the generic one when it has no translation). */
export function iconClassOf(icon) {
  if (!icon) return ''
  return ojIconOf(icon) || GENERIC_ICON
}
/** An emoji or a short text icon (not an icon NAME): shown as text. */
const isGlyph = (icon) => !!icon && !/^[a-z0-9-]+:[a-z0-9-]+$/i.test(icon) && icon.indexOf('oj-ux-') !== 0
const glyphOf = (icon) => (isGlyph(icon) ? icon : '')
const iconOf = (icon) => (isGlyph(icon) ? '' : iconClassOf(icon))

// A wire colour: one of the theme tones, or a CSS colour.
const WIRE_TONES = { success: 1, warning: 1, danger: 1, error: 1, info: 1, neutral: 1, primary: 1, contrast: 1, normal: 1 }
const CSS_COLOR = /^(#[0-9a-f]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)|var\(--[\w-]+\)|[a-z]+)$/i
/** A colour from the wire → a tone class suffix ('success'…) or a CSS colour ('' when neither). */
export function toneOf(color) {
  const c = str(color).trim().toLowerCase()
  if (!c) return ''
  if (c === 'error') return 'danger'
  if (c === 'primary' || c === 'normal' || c === 'contrast') return 'info'
  return WIRE_TONES[c] ? c : ''
}
export function cssColorOf(color) {
  const c = str(color).trim()
  return c && !toneOf(c) && CSS_COLOR.test(c) ? c : ''
}
const badgeClassOf = (color) => BADGE_CLASSES[toneOf(color) || 'contrast'] || BADGE_CLASSES.contrast

// ── Kanban (JET has no board): columns of oj-panel, cards as oj-action-card when they act ───────
export function kanbanAtomOf(m, interp = (x) => x) {
  return {
    isKanban: true,
    columns: keyed((m.columns || []).map((col) => {
      const cards = col.cards || []
      const color = cssColorOf(col.color)
      const tone = toneOf(col.color)
      return {
        title: interp(str(col.title)),
        countText: String(cards.length),
        headerClass: 'mateu-kanban-head' + (tone ? ' mateu-tone-' + tone : ''),
        headerStyle: color ? { borderTopColor: color } : {},
        cards: keyed(cards.map((card) => ({
          title: interp(str(card.title)),
          description: interp(str(card.description)),
          badge: interp(str(card.badge)),
          hasBadge: !!card.badge,
          badgeClass: badgeClassOf(card.color),
          cardStyle: cssColorOf(card.color) ? { borderInlineStartColor: cssColorOf(card.color) } : {},
          cardClass: 'mateu-kanban-card' + (toneOf(card.color) ? ' mateu-tone-' + toneOf(card.color) : ''),
          ...clickable(card.actionId, { _clickedCard: card }),
        }))),
        isEmpty: !cards.length,
      }
    })),
  }
}

// ── Timeline (oj-timeline is deprecated in JET): a Redwood vertical list with markers ────────────
export function timelineAtomOf(m, interp = (x) => x) {
  return {
    isTimeline: true,
    items: keyed((m.items || []).map((it) => ({
      title: interp(str(it.title)),
      description: interp(str(it.description)),
      timestamp: interp(str(it.timestamp)),
      iconClass: iconOf(it.icon),
      glyph: glyphOf(it.icon),
      dotClass: 'mateu-timeline-dot' + (toneOf(it.color) ? ' mateu-tone-' + toneOf(it.color) : ''),
      dotStyle: cssColorOf(it.color) ? { backgroundColor: cssColorOf(it.color) } : {},
      ...clickable(it.actionId, { _clickedItem: it }),
    }))),
  }
}

// ── PricingTable: plans as oj-panel cards (featured = the highlighted one), CTA as oj-button ─────
export function pricingAtomOf(m, interp = (x) => x) {
  const plans = m.plans || []
  return {
    isPricing: true,
    plans: keyed(plans.map((p) => ({
      name: interp(str(p.name)),
      price: interp(str(p.price)),
      period: interp(str(p.period)),
      features: (p.features || []).map((f) => interp(str(f))),
      featured: !!p.featured,
      cardClass: 'oj-panel oj-sm-padding-6x mateu-pricing-plan' + (p.featured ? ' mateu-pricing-featured' : ''),
      hasCta: !!p.actionId,
      ctaLabel: interp(str(p.ctaLabel)) || chromeText('choose'),
      chroming: p.featured ? 'callToAction' : 'outlined',
      colClass: 'oj-flex-item oj-sm-12 oj-md-' + Math.max(3, Math.floor(12 / Math.max(1, Math.min(4, plans.length)))),
      actionId: p.actionId || '',
      parameters: {},
    }))),
  }
}

// ── OrgChart: the tree as an indented outline (VB templates cannot recurse), oj-avatar per node ──
export function orgChartAtomOf(m, interp = (x) => x) {
  const nodes = []
  const walk = (node, depth, last) => {
    if (!node) return
    const { children, ...self } = node
    const av = avatarOf({ name: node.title, image: node.avatar })
    nodes.push({
      depth,
      rowStyle: { paddingInlineStart: (depth * 2) + 'rem' },
      rowClass: 'mateu-org-node' + (depth ? ' mateu-org-child' : '') + (last ? ' mateu-org-last' : ''),
      title: interp(str(node.title)),
      subtitle: interp(str(node.subtitle)),
      initials: av.initials,
      src: av.src,
      ariaLabel: [node.title, node.subtitle].filter(Boolean).join(', '),
      ...clickable(node.actionId, { _clickedNode: self }),
    })
    const kids = children || []
    kids.forEach((k, i) => walk(k, depth + 1, i === kids.length - 1))
  }
  walk(m.root, 0, true)
  return { isOrgChart: true, nodes: keyed(nodes) }
}

// ── Heatmap (JET has none): a calendar heatmap — a column per week, a row per weekday ────────────
const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})/
export function heatLevelOf(value, max) {
  if (!(value > 0) || !(max > 0)) return 0
  return Math.max(1, Math.min(4, Math.ceil((value / max) * 4)))
}
export function heatmapAtomOf(m) {
  const cells = (m.cells || []).filter((c) => c && c.date != null)
  const max = cells.reduce((acc, c) => Math.max(acc, Number(c.value) || 0), 0)
  const cellOf = (c) => {
    const level = heatLevelOf(Number(c.value) || 0, max)
    const text = (c.label ? c.label : c.date + ': ' + (c.value == null ? 0 : c.value))
    return { cls: 'mateu-heat-cell mateu-heat-' + level, title: text, ariaLabel: text }
  }
  const legend = [0, 1, 2, 3, 4].map((l) => ({ key: String(l), cls: 'mateu-heat-cell mateu-heat-' + l }))
  const dated = cells.every((c) => ISO_DAY.test(String(c.date)))
  if (!cells.length || !dated) {
    return { isHeatmap: true, dated: false, weeks: [], flat: keyed(cells.map(cellOf)), legend }
  }
  const dayMs = 86400000
  const toTime = (s) => { const x = ISO_DAY.exec(String(s)); return Date.UTC(+x[1], +x[2] - 1, +x[3]) }
  const byDay = new Map(cells.map((c) => [toTime(c.date), c]))
  const times = [...byDay.keys()].sort((a, b) => a - b)
  // weeks start on Monday: back up to the Monday of the first date
  const dow = (t) => (new Date(t).getUTCDay() + 6) % 7
  let t = times[0] - dow(times[0]) * dayMs
  const end = times[times.length - 1]
  const weeks = []
  while (t <= end) {
    const days = []
    for (let d = 0; d < 7; d++, t += dayMs) {
      const c = byDay.get(t)
      days.push(c ? cellOf(c) : { cls: 'mateu-heat-cell mateu-heat-none', title: '', ariaLabel: '' })
    }
    weeks.push({ days: keyed(days) })
  }
  return { isHeatmap: true, dated: true, weeks: keyed(weeks), flat: [], legend }
}

// ── Funnel → oj-chart type="funnel" (each stage a series, one group) ─────────────────────────────
export function funnelAtomOf(m, interp = (x) => x) {
  const items = (m.stages || []).map((s, i) => {
    const item = { _rowNumber: i, id: String(i), value: Number(s.value) || 0, series: interp(str(s.label)) || 'Stage ' + (i + 1), group: 'Funnel' }
    const color = cssColorOf(s.color)
    if (color) item.color = color
    return item
  })
  return {
    isFunnel: true,
    items,
    provider: dataProviderFactory ? dataProviderFactory(items) : null,
    chartStyle: { width: '100%', height: Math.max(12, Math.min(28, items.length * 4)) + 'rem' },
  }
}

// ── FeatureGrid: oj-panel tiles (an oj-action-card when the feature acts) on an oj-flex grid ─────
export function featureGridAtomOf(m, interp = (x) => x) {
  const columns = m.columns > 0 && m.columns <= 6 ? m.columns : 3
  const colClass = 'oj-flex-item oj-sm-12 oj-md-' + Math.max(2, Math.floor(12 / columns))
  return {
    isFeatureGrid: true,
    features: keyed((m.features || []).map((f) => ({
      title: interp(str(f.title)),
      description: interp(str(f.description)),
      iconClass: iconOf(f.icon),
      glyph: glyphOf(f.icon),
      colClass,
      ...clickable(f.actionId, {}),
    }))),
  }
}

// ── Testimonials: oj-panel quotes, oj-avatar for the author, oj-rating-gauge (read only) ─────────
export function testimonialsAtomOf(m, interp = (x) => x) {
  const items = m.items || []
  return {
    isTestimonials: true,
    items: keyed(items.map((t) => {
      const av = avatarOf({ name: t.author, image: t.avatar })
      return {
        quote: interp(str(t.quote)),
        author: interp(str(t.author)),
        role: interp(str(t.role)),
        initials: av.initials,
        src: av.src,
        rating: Math.max(0, Math.min(5, Number(t.rating) || 0)),
        hasRating: Number(t.rating) > 0,
        ratingLabel: (Number(t.rating) || 0) + ' / 5',
        colClass: 'oj-flex-item oj-sm-12 oj-md-' + (items.length >= 3 ? 4 : items.length === 2 ? 6 : 12),
      }
    })),
  }
}

// ── CalloutCard: an oj-panel band with icon, text and an oj-button CTA ───────────────────────────
const CALLOUT_CLASSES = {
  info: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-info',
  success: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-success',
  warning: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-warning',
  danger: 'oj-panel oj-sm-padding-6x mateu-callout mateu-tone-danger',
  neutral: 'oj-panel oj-sm-padding-6x mateu-callout',
}
export function calloutAtomOf(m, interp = (x) => x) {
  return {
    isCallout: true,
    title: interp(str(m.title)),
    description: interp(str(m.description)),
    iconClass: iconOf(m.icon),
    glyph: glyphOf(m.icon),
    panelClass: CALLOUT_CLASSES[toneOf(m.theme)] || CALLOUT_CLASSES.neutral,
    hasCta: !!m.actionId,
    ctaLabel: interp(str(m.ctaLabel)) || chromeText('learnMore'),
    actionId: m.actionId || '',
    parameters: {},
  }
}

// ── CommentThread: replies indented under their comment, oj-avatar per author ────────────────────
export function commentsAtomOf(m, interp = (x) => x) {
  const out = []
  const walk = (c, depth) => {
    const av = avatarOf({ name: c.author, image: c.avatar })
    out.push({
      depth,
      rowStyle: { marginInlineStart: (depth * 2.5) + 'rem' },
      rowClass: 'mateu-comment' + (depth ? ' mateu-comment-reply' : ''),
      author: interp(str(c.author)),
      text: interp(str(c.text)),
      timestamp: interp(str(c.timestamp)),
      initials: av.initials,
      src: av.src,
    })
    for (const r of c.replies || []) walk(r, depth + 1)
  }
  for (const c of m.comments || []) walk(c, 0)
  return { isComments: true, comments: keyed(out) }
}

// ── FileList: a row per file — icon by type, name as a download link, size · type ───────────────
const FILE_ICONS = [
  [/pdf/i, 'oj-ux-ico-file-pdf'],
  [/(xls|sheet|csv)/i, 'oj-ux-ico-file-xls'],
  [/(doc|word)/i, 'oj-ux-ico-file-doc'],
  [/(png|jpe?g|gif|svg|image|webp)/i, 'oj-ux-ico-file-image'],
  [/(zip|tar|gz|rar|7z)/i, 'oj-ux-ico-file-zip'],
]
export function fileIconOf(type, name) {
  const probe = str(type) + ' ' + str(name).split('.').pop()
  for (const [re, cls] of FILE_ICONS) if (re.test(probe)) return cls
  return 'oj-ux-ico-file'
}
export function fileListAtomOf(m, interp = (x) => x) {
  return {
    isFileList: true,
    files: keyed((m.files || []).map((f) => {
      const href = safeHref(f.url ? elementModuleUrl(f.url) : '')
      return {
        name: interp(str(f.name)),
        meta: [f.size, f.type].filter(Boolean).map(str).join(' · '),
        iconClass: fileIconOf(f.type, f.name),
        href,
        hasHref: !!href && !f.actionId,
        noHref: !href || !!f.actionId,
        ...clickable(f.actionId, { _file: f }),
      }
    })),
  }
}

// ── Checklist: oj-checkboxset per item; toggling sends actionId with {_item, _done} ─────────────
export function checklistAtomOf(m, interp = (x) => x) {
  const items = m.items || []
  const done = items.filter((i) => i.done).length
  return {
    isChecklist: true,
    title: interp(str(m.title)),
    hasTitle: !!m.title,
    progressText: done + ' / ' + items.length,
    progressValue: items.length ? Math.round((done / items.length) * 100) : 0,
    items: keyed(items.map((it) => ({
      label: interp(str(it.label)),
      value: it.done ? ['done'] : [],
      labelClass: it.done ? 'mateu-checklist-done' : '',
      readonly: !it.actionId,
      actionId: it.actionId || '',
      parameters: { _item: it, _done: !it.done },
    }))),
  }
}

// ── ComparisonCard: two values side by side and the delta with its trend ────────────────────────
const TREND = { up: ['oj-ux-ico-arrow-up', 'oj-text-color-success'], down: ['oj-ux-ico-arrow-down', 'oj-text-color-danger'] }
export function comparisonAtomOf(m, interp = (x) => x) {
  const trend = TREND[str(m.trend).toLowerCase()] || ['', 'oj-text-color-secondary']
  return {
    isComparison: true,
    title: interp(str(m.title)),
    leftLabel: interp(str(m.leftLabel)),
    leftValue: interp(str(m.leftValue)),
    rightLabel: interp(str(m.rightLabel)),
    rightValue: interp(str(m.rightValue)),
    delta: interp(str(m.delta)),
    hasDelta: !!m.delta,
    trendIcon: trend[0],
    deltaClass: 'oj-typography-body-sm oj-typography-bold ' + trend[1],
  }
}

// ── ProcessMonitor: a row per process — systems, ok/warning/error counts, status, its action ────
const PROCESS_STATUS = { ok: 'success', success: 'success', running: 'info', warning: 'warning', error: 'danger', failed: 'danger', stopped: 'neutral' }
export function processMonitorAtomOf(m, interp = (x) => x) {
  return {
    isProcessMonitor: true,
    items: keyed((m.items || []).map((p) => ({
      name: interp(str(p.name)),
      systems: (p.systems || []).map(str).join(' · '),
      okText: String(p.ok || 0),
      warningsText: String(p.warnings || 0),
      errorsText: String(p.errors || 0),
      statusLabel: str(p.status),
      hasStatus: !!p.status,
      statusClass: BADGE_CLASSES[PROCESS_STATUS[str(p.status).toLowerCase()] || 'contrast'] || BADGE_CLASSES.contrast,
      hasAction: !!(p.actionId && p.actionLabel),
      actionLabel: interp(str(p.actionLabel)),
      actionId: p.actionId || '',
      parameters: {},
    }))),
  }
}

// ── Skeleton: the shell's own shimmer placeholders (JET has no skeleton component) ───────────────
const SKELETON_SHAPES = {
  text: ['mateu-skel-line', 'mateu-skel-line', 'mateu-skel-line mateu-skel-short'],
  card: ['mateu-skel-block'],
  grid: ['mateu-skel-row', 'mateu-skel-row', 'mateu-skel-row', 'mateu-skel-row'],
  form: ['mateu-skel-label', 'mateu-skel-input', 'mateu-skel-label', 'mateu-skel-input'],
}
export function skeletonAtomOf(m) {
  const shape = SKELETON_SHAPES[str(m.variant)] || SKELETON_SHAPES.text
  const count = Math.max(1, Math.min(20, Number(m.count) || 1))
  const shapes = []
  for (let i = 0; i < count; i++) shapes.push(...shape)
  return { isSkeleton: true, shapes: keyed(shapes.map((cls) => ({ cls: 'mateu-skeleton-bone ' + cls }))) }
}

// ── Icon: the Redwood icon font (oj-ux-ico-*); an emoji travels as text ─────────────────────────
export function iconAtomOf(m) {
  return { isIcon: true, iconClass: iconOf(m.icon), glyph: glyphOf(m.icon), label: str(m.icon) }
}

// ── Menus (MenuBar, ContextMenu, Directory) ─────────────────────────────────────────────────────
/** A MenuOption → what its click does: run an action, or navigate to a route/url. */
export function menuTargetOf(option) {
  if (!option) return null
  if (option.actionId) return { kind: 'action', actionId: option.actionId, parameters: option.params || {} }
  const route = option.route || option.path || ''
  if (route) {
    if (/^https?:/i.test(route)) return { kind: 'url', url: route }
    if (/^[a-z][a-z0-9+.-]*:/i.test(route)) return null // javascript:, data:… go nowhere
    return { kind: 'navigate', route: route.startsWith('/') ? route : '/' + route }
  }
  return null
}
/** The items of an oj-menu (flattening one submenu level into separators + items). */
export function menuItemsOf(options, interp = (x) => x) {
  const out = []
  const push = (o, prefix) => {
    if (!o || o.visible === false) return
    if (o.separator) { out.push({ value: 'sep' + out.length, label: '', isSeparator: true, isItem: false, disabled: true }); return }
    if ((o.submenus || []).length) {
      for (const s of o.submenus) push(s, (prefix ? prefix + ' › ' : '') + interp(str(o.label)))
      return
    }
    const target = menuTargetOf(o)
    out.push({
      value: String(out.length),
      label: (prefix ? prefix + ' › ' : '') + interp(str(o.label)),
      isSeparator: false,
      isItem: true,
      disabled: !!o.disabled || !target,
      iconClass: iconOf(o.icon),
      target,
    })
  }
  for (const o of options || []) push(o, '')
  return out
}
/** What choosing `value` in a menu atom does (null: nothing). */
export function menuChoiceOf(items, value) {
  const item = (items || []).find((i) => i.value === String(value))
  return item && !item.disabled ? item.target : null
}
/** How a page chain carries out a target: the action chain to call (the host's or the island's
 *  dispatcher), the route to navigate to, or the url to open. Pure — the chain only executes it. */
export function dispatchOf(target, variant) {
  if (!target) return null
  if (target.kind === 'action') {
    return { chain: variant === 'island' ? 'dispatchIslandAction' : 'dispatchHostBlockAction',
      params: { actionId: target.actionId, parameters: target.parameters || {} } }
  }
  if (target.kind === 'navigate') return { route: target.route }
  if (target.kind === 'url') return { url: target.url }
  return null
}
export function menuBarAtomOf(m, interp = (x) => x) {
  return {
    isMenuBar: true,
    entries: keyed((m.options || []).filter((o) => o && o.visible !== false && !o.separator).map((o) => {
      const sub = (o.submenus || []).length
      const target = sub ? null : menuTargetOf(o)
      return {
        label: interp(str(o.label)),
        iconClass: iconOf(o.icon),
        isMenu: !!sub,
        isAction: !sub && !!target && target.kind === 'action',
        isLink: !sub && !!target && target.kind !== 'action',
        isInert: !sub && !target,
        href: target && target.kind === 'navigate' ? target.route : target && target.kind === 'url' ? target.url : '',
        disabled: !!o.disabled,
        chroming: o.selected ? 'callToAction' : 'borderless',
        menuItems: sub ? menuItemsOf(o.submenus, interp) : [],
        actionId: target && target.kind === 'action' ? target.actionId : '',
        parameters: target && target.kind === 'action' ? target.parameters : {},
      }
    })),
  }
}
export function contextMenuAtomOf(m, interp = (x) => x) {
  return { isContextMenu: true, label: chromeText('moreActions'), menuItems: menuItemsOf(m.menu, interp), rightClick: !m.activateOnLeftClick }
}
/** Directory: each top-level entry a column with its title and its links (submenus flattened). */
export function directoryAtomOf(m, interp = (x) => x) {
  const linksOf = (o, prefix) => {
    if (!o || o.visible === false) return []
    if ((o.submenus || []).length) return o.submenus.flatMap((s) => linksOf(s, prefix))
    const t = menuTargetOf(o)
    const href = t ? (t.kind === 'navigate' ? t.route : t.kind === 'url' ? t.url : '') : ''
    return [{ label: interp(str(o.label)), href: safeHref(href), description: interp(str(o.description)) }]
  }
  const groups = (m.menu || []).filter((o) => o && o.visible !== false).map((o) => ({
    title: interp(str(o.label)),
    links: keyed(linksOf(o, '')),
  }))
  const cols = Math.max(1, Math.min(4, groups.length))
  return { isDirectory: true, groups: keyed(groups.map((g) => ({ ...g, colClass: 'oj-flex-item oj-sm-12 oj-md-' + Math.floor(12 / cols) }))) }
}

// ── MessageList / MessageInput ────────────────────────────────────────────────────────────────
export function messageListAtomOf(m, interp = (x) => x) {
  return {
    isMessages: true,
    items: keyed((m.items || []).map((it) => {
      const av = avatarOf({ name: it.userName, abbreviation: it.userAbbr, image: it.userImg })
      return {
        userName: interp(str(it.userName)),
        time: str(it.time),
        text: interp(str(it.text)),
        initials: av.initials,
        src: av.src,
        avatarClass: 'mateu-avatar-tone-' + ((Number(it.userColorIndex) || 0) % 6),
      }
    })),
  }
}
export function messageInputAtomOf(m, id) {
  return {
    isMessageInput: true,
    inputId: 'mateuMsg-' + str(id || 'input').replace(/[^\w-]/g, '_'),
    actionId: m.actionId || '',
    placeholder: chromeText('message'),
    sendLabel: chromeText('messageSend'),
  }
}
/** What sending a message does (null when there is nothing to send or nowhere to send it). */
export function messageSendOf(value, actionId) {
  const text = str(value).trim()
  if (!text || !actionId) return null
  return { actionId, parameters: { message: text } }
}

// ── Chat (the component — the app's assistant panel is the shell's): installChatComponents mounts
//    the conversation in its slot and streams the answers with poc/chat.mjs ────────────────────
export function chatAtomOf(m, id) {
  return {
    isChatComponent: true,
    chatId: 'mateuChat-' + str(id || 'chat').replace(/[^\w-]/g, '_'),
    sseUrl: elementModuleUrl(str(m.sseUrl)),
    uploadUrl: m.uploadUrl ? elementModuleUrl(str(m.uploadUrl)) : '',
  }
}

// ── Result: the outcome of an operation — icon by type, message, links ─────────────────────────
const RESULT_LOOKS = {
  success: ['oj-ux-ico-check-circle-s', 'mateu-tone-success'],
  info: ['oj-ux-ico-information-s', 'mateu-tone-info'],
  warning: ['oj-ux-ico-warning-s', 'mateu-tone-warning'],
  error: ['oj-ux-ico-error-s', 'mateu-tone-danger'],
  ignored: ['oj-ux-ico-information', ''],
}
const destinationOf = (d, interp) => {
  if (!d) return null
  const type = str(d.type)
  const label = interp(str(d.description || d.value || d.id))
  if (type === 'Url') return { label, href: safeHref(d.value), isLink: !!safeHref(d.value), isAction: false, actionId: '', parameters: {} }
  if (type === 'ActionId') return { label, href: '', isLink: false, isAction: true, actionId: d.value || d.id || '', parameters: {} }
  // View / Component / CustomEvent: a route of the app when the value looks like one
  const route = str(d.value)
  if (route.startsWith('/')) return { label, href: route, isLink: true, isAction: false, actionId: '', parameters: {} }
  return { label, href: '', isLink: false, isAction: !!(d.id), actionId: d.id || '', parameters: {} }
}
export function resultAtomOf(m, interp = (x) => x) {
  const look = RESULT_LOOKS[str(m.resultType).toLowerCase()] || RESULT_LOOKS.info
  const links = (m.interestingLinks || []).map((d) => destinationOf(d, interp)).filter(Boolean)
  const next = destinationOf(m.nowTo, interp)
  return {
    isResult: true,
    title: interp(str(m.title)),
    message: interp(str(m.message)),
    iconClass: look[0],
    panelClass: 'oj-panel oj-sm-padding-8x mateu-result ' + look[1],
    image: m.leftSideImageUrl ? elementModuleUrl(str(m.leftSideImageUrl)) : '',
    hasImage: !!m.leftSideImageUrl,
    links: keyed(links),
    hasNext: !!next,
    next: next || { label: '', href: '', isLink: false, isAction: false, actionId: '', parameters: {} },
    // the «what next» button sends the atom's own action (the block listener reads the atom)
    actionId: next && next.isAction ? next.actionId : '',
    parameters: {},
  }
}

// ── CookieConsent: a band fixed to the bottom; installCookieConsent hides it when the cookie
//    exists and stores the cookie on «dismiss» ──────────────────────────────────────────────
export function cookieConsentAtomOf(m, interp = (x) => x) {
  const position = str(m.position).toLowerCase()
  return {
    isCookieConsent: true,
    cookieName: str(m.cookieName) || 'cookieconsent_status',
    message: interp(str(m.message)) || chromeText('cookieMessage'),
    dismiss: interp(str(m.dismiss)) || chromeText('cookieDismiss'),
    learnMore: interp(str(m.learnMore)) || chromeText('learnMore'),
    learnMoreLink: safeHref(m.learnMoreLink),
    hasLearnMore: !!safeHref(m.learnMoreLink),
    bandClass: 'mateu-cookie-consent oj-panel oj-sm-padding-4x' + (position.indexOf('top') >= 0 ? ' mateu-cookie-top' : ' mateu-cookie-bottom'),
  }
}
/** Whether the consent cookie is set in a cookie string (document.cookie). */
export function hasConsentCookie(cookieString, name) {
  return String(cookieString || '').split(';').some((c) => c.trim().split('=')[0] === name)
}

// ── ConfirmDialog: an oj-dialog opened while its condition holds; Confirm / Reject / Cancel ─────
/** Evaluates a ConfirmDialog's openedCondition against the state: the same small vocabulary the
 *  client rules use — a `${state.x}` path, its negation, or a comparison with a literal. */
export function confirmOpenOf(condition, state) {
  const c = str(condition).trim()
  if (!c) return false
  if (c === 'true') return true
  if (c === 'false') return false
  const path = (p) => p.split('.').reduce((v, k) => (v != null && typeof v === 'object' ? v[k] : undefined), state || {})
  const unwrap = (s) => s.replace(/^\$\{\s*/, '').replace(/\s*\}$/, '').trim()
  const expr = unwrap(c)
  const lit = (s) => {
    const t = s.trim()
    if (/^(['"]).*\1$/.test(t)) return t.slice(1, -1)
    if (t === 'true') return true
    if (t === 'false') return false
    if (t === 'null' || t === 'undefined') return null
    if (!isNaN(Number(t)) && t !== '') return Number(t)
    return t.startsWith('state.') ? path(t.slice(6)) : undefined
  }
  const cmp = /^(.+?)\s*(===|!==|==|!=|>=|<=|>|<)\s*(.+)$/.exec(expr)
  if (cmp) {
    const a = lit(cmp[1]); const b = lit(cmp[3])
    switch (cmp[2]) {
      case '===': case '==': return a == b // eslint-disable-line eqeqeq
      case '!==': case '!=': return a != b // eslint-disable-line eqeqeq
      case '>': return a > b
      case '<': return a < b
      case '>=': return a >= b
      default: return a <= b
    }
  }
  if (expr.startsWith('!')) return !lit(expr.slice(1))
  return !!lit(expr)
}
export function confirmDialogAtomOf(m, id, state, interp = (x) => x, lines = []) {
  const buttons = []
  if (m.canCancel) buttons.push({ key: 'cancel', label: m.rejectText && !m.canReject ? interp(m.rejectText) : chromeText('cancel'), chroming: 'outlined', actionId: m.cancelActionId || '', parameters: {} })
  if (m.canReject) buttons.push({ key: 'reject', label: interp(str(m.rejectText)) || chromeText('confirmNo'), chroming: 'outlined', actionId: m.rejectActionId || '', parameters: {} })
  buttons.push({ key: 'confirm', label: interp(str(m.confirmText)) || chromeText('ok'), chroming: 'callToAction', actionId: m.confirmActionId || '', parameters: {} })
  const opened = confirmOpenOf(m.openedCondition, state)
  return {
    // painted only while open: the oj-dialog opens itself (initial-visibility) when it appears
    isConfirmDialog: opened,
    dialogId: 'mateuConfirmDialog-' + str(id || 'confirm').replace(/[^\w-]/g, '_'),
    opened,
    header: interp(str(m.header)),
    lines: lines.map(interp).filter(Boolean),
    buttons,
  }
}

// ── Breadcrumbs (the component in content; the shell keeps its own trail) ───────────────────────
export function breadcrumbsAtomOf(m, interp = (x) => x) {
  const crumbs = (m.breadcrumbs || []).map((b) => ({ text: interp(str(b.text)), href: safeHref(b.link), hasHref: !!safeHref(b.link) }))
  return {
    isBreadcrumbs: true,
    crumbs: keyed(crumbs.map((c) => ({ ...c, noHref: !c.hasHref }))),
    current: interp(str(m.currentItemText)),
  }
}

// ── Notification (the component): an info band with its title and text ────────────────────────
export function notificationAtomOf(m, interp = (x) => x) {
  return {
    isNotice: true,
    text: [m.title, m.text].filter(Boolean).map((t) => interp(str(t))).join(' — '),
    noticeClass: NOTICE_CLASSES.info,
    buttons: [],
  }
}

// ── Workflow: the definition as a flow of steps (the web's designer is an editor; Redwood shows it) ─
const STEP_LOOKS = {
  ACTION: ['oj-ux-ico-play', 'stepAction'], JOIN: ['oj-ux-ico-merge', 'stepJoin'], FORK: ['oj-ux-ico-split', 'stepFork'],
  END: ['oj-ux-ico-stop', 'stepEnd'], USER_TASK: ['oj-ux-ico-user-available', 'stepUserTask'], PROCESS: ['oj-ux-ico-settings', 'stepProcess'],
}
export function workflowOrderOf(steps) {
  const byId = new Map(steps.map((s) => [s.id, s]))
  const out = []
  const seen = new Set()
  const visit = (s, guard = new Set()) => {
    if (!s || seen.has(s.id) || guard.has(s.id)) return
    guard.add(s.id)
    if (s.preconditionStepId && byId.has(s.preconditionStepId)) visit(byId.get(s.preconditionStepId), guard)
    seen.add(s.id)
    out.push(s)
  }
  steps.forEach((s) => visit(s))
  return out
}
export function workflowAtomOf(m) {
  let wf
  try { wf = JSON.parse(str(m.value) || '{}') } catch (e) { wf = null }
  if (!wf || typeof wf !== 'object') return { isNotice: true, text: chromeText('workflowInvalid'), noticeClass: NOTICE_CLASSES.warning, buttons: [] }
  const steps = Array.isArray(wf.steps) ? wf.steps.filter((s) => s && s.id) : []
  const names = new Map(steps.map((s) => [s.id, s.name || s.id]))
  return {
    isWorkflow: true,
    name: str(wf.name) || 'Workflow',
    description: str(wf.description),
    status: str(wf.status),
    hasStatus: !!wf.status,
    statusClass: BADGE_CLASSES[{ ACTIVE: 'success', DRAFT: 'info', DISABLED: 'warning', ARCHIVED: 'contrast' }[wf.status] || 'contrast'],
    steps: keyed(workflowOrderOf(steps).map((s, i) => {
      const look = STEP_LOOKS[s.type] || STEP_LOOKS.ACTION
      return {
        number: String(i + 1),
        name: str(s.name) || s.id,
        typeLabel: chromeText(look[1]) + (s.parallel ? ' · ' + chromeText('parallel') : ''),
        iconClass: look[0],
        description: str(s.description),
        after: s.preconditionStepId ? chromeText('afterStep', { name: names.get(s.preconditionStepId) || s.preconditionStepId })
          + (s.preconditionExpression ? chromeText('whenCondition', { condition: s.preconditionExpression }) : '') : '',
      }
    })),
    isEmpty: !steps.length,
  }
}

/** FormEditor: the defined form → FormField metadata the form layout already knows how to paint. */
export function formEditorFieldsOf(m) {
  let def
  try { def = JSON.parse(str(m.value) || '{}') } catch (e) { def = null }
  if (!def || typeof def !== 'object') return null
  return {
    name: str(def.name) || 'Form',
    description: str(def.description),
    fields: (Array.isArray(def.fields) ? def.fields : []).filter((f) => f && f.id).map((f) => ({
      type: 'FormField', fieldId: f.id, label: f.label || f.id, dataType: f.dataType || 'string',
      stereotype: f.stereotype && f.stereotype !== 'regular' ? f.stereotype : undefined,
      required: !!f.required, description: f.description || '', readOnly: false,
    })),
  }
}

// ── BPMN (bpmn-js is not under a permissive licence): the diagram from its own BPMN-DI ──────────
const BPMN_KINDS = {
  startEvent: 'event', endEvent: 'end', intermediateThrowEvent: 'event', intermediateCatchEvent: 'event', boundaryEvent: 'event',
  task: 'task', userTask: 'task', serviceTask: 'task', scriptTask: 'task', sendTask: 'task', receiveTask: 'task', manualTask: 'task', businessRuleTask: 'task', callActivity: 'task', subProcess: 'task',
  exclusiveGateway: 'gateway', parallelGateway: 'gateway', inclusiveGateway: 'gateway', eventBasedGateway: 'gateway', complexGateway: 'gateway',
  dataObjectReference: 'data', dataStoreReference: 'data', textAnnotation: 'note',
}
const xmlAttr = (attrs, name) => {
  const m = new RegExp('(?:^|\\s)' + name + '\\s*=\\s*"([^"]*)"').exec(attrs) || new RegExp('(?:^|\\s)' + name + "\\s*=\\s*'([^']*)'").exec(attrs)
  return m ? m[1].replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#10;/g, ' ').replace(/&amp;/g, '&') : ''
}
/** BPMN 2.0 XML → { nodes, flows, width, height }: shapes placed by their BPMNDI bounds; without
 *  DI, a left-to-right layout by the sequence flows. Pure (no DOMParser: it runs in Node too). */
export function bpmnDiagramOf(xml) {
  const src = str(xml)
  const nodes = []
  const flows = []
  const byId = new Map()
  const tagRe = /<(?:[\w-]+:)?(\w+)\b([^>]*?)(\/?)>/g
  let t
  while ((t = tagRe.exec(src))) {
    const [, tag, attrs] = t
    if (BPMN_KINDS[tag]) {
      const n = { id: xmlAttr(attrs, 'id'), tag, kind: BPMN_KINDS[tag], label: xmlAttr(attrs, 'name') }
      if (n.id) { nodes.push(n); byId.set(n.id, n) }
    } else if (tag === 'sequenceFlow' || tag === 'messageFlow') {
      const f = { id: xmlAttr(attrs, 'id'), source: xmlAttr(attrs, 'sourceRef'), target: xmlAttr(attrs, 'targetRef'), label: xmlAttr(attrs, 'name'), points: [] }
      if (f.id) flows.push(f)
    }
  }
  // text annotations carry their text in a child <text>
  for (const n of nodes) {
    if (n.kind === 'note' && !n.label) {
      const m = new RegExp('<(?:[\\w-]+:)?textAnnotation\\b[^>]*id="' + n.id + '"[^>]*>[\\s\\S]*?<(?:[\\w-]+:)?text>([\\s\\S]*?)</').exec(src)
      if (m) n.label = m[1].trim()
    }
  }
  // BPMNDI: shapes with Bounds, edges with waypoints
  const shapeRe = /<(?:[\w-]+:)?BPMNShape\b([^>]*)>([\s\S]*?)<\/(?:[\w-]+:)?BPMNShape>/g
  let s
  let placed = 0
  while ((s = shapeRe.exec(src))) {
    const n = byId.get(xmlAttr(s[1], 'bpmnElement'))
    const b = /<(?:[\w-]+:)?Bounds\b([^>]*)\/?>/.exec(s[2])
    if (n && b) {
      n.x = +xmlAttr(b[1], 'x'); n.y = +xmlAttr(b[1], 'y'); n.w = +xmlAttr(b[1], 'width'); n.h = +xmlAttr(b[1], 'height')
      placed++
    }
  }
  const edgeRe = /<(?:[\w-]+:)?BPMNEdge\b([^>]*)>([\s\S]*?)<\/(?:[\w-]+:)?BPMNEdge>/g
  let e
  const flowById = new Map(flows.map((f) => [f.id, f]))
  while ((e = edgeRe.exec(src))) {
    const f = flowById.get(xmlAttr(e[1], 'bpmnElement'))
    if (!f) continue
    const wp = /<(?:[\w-]+:)?waypoint\b([^>]*)\/?>/g
    let w
    while ((w = wp.exec(e[2]))) f.points.push([+xmlAttr(w[1], 'x'), +xmlAttr(w[1], 'y')])
  }
  const SIZE = { task: [100, 80], gateway: [50, 50], event: [36, 36], end: [36, 36], data: [36, 50], note: [100, 40] }
  if (placed < nodes.length) {
    // no (or partial) DI: columns by distance from the start along the flows
    const rank = new Map()
    const outgoing = new Map()
    for (const f of flows) { if (!outgoing.has(f.source)) outgoing.set(f.source, []); outgoing.get(f.source).push(f.target) }
    const incoming = new Set(flows.map((f) => f.target))
    const roots = nodes.filter((n) => !incoming.has(n.id))
    const queue = (roots.length ? roots : nodes.slice(0, 1)).map((n) => [n.id, 0])
    while (queue.length) {
      const [id, r] = queue.shift()
      if (rank.has(id) && rank.get(id) >= r) continue
      if (r > nodes.length) continue
      rank.set(id, r)
      for (const next of outgoing.get(id) || []) queue.push([next, r + 1])
    }
    const perRank = new Map()
    for (const n of nodes) {
      if (n.x != null) continue
      const r = rank.has(n.id) ? rank.get(n.id) : 0
      const row = perRank.get(r) || 0
      perRank.set(r, row + 1)
      const [w, h] = SIZE[n.kind] || SIZE.task
      n.w = w; n.h = h
      n.x = 40 + r * 160 + (100 - w) / 2
      n.y = 40 + row * 120 + (80 - h) / 2
    }
    for (const f of flows) f.points = []
  }
  for (const f of flows) {
    if (f.points.length >= 2) continue
    const a = byId.get(f.source); const b = byId.get(f.target)
    if (a && b && a.x != null && b.x != null) f.points = [[a.x + a.w, a.y + a.h / 2], [b.x, b.y + b.h / 2]]
  }
  let maxX = 0; let maxY = 0; let minX = Infinity; let minY = Infinity
  for (const n of nodes) if (n.x != null) { maxX = Math.max(maxX, n.x + n.w); maxY = Math.max(maxY, n.y + n.h + 20); minX = Math.min(minX, n.x); minY = Math.min(minY, n.y) }
  for (const f of flows) for (const [x, y] of f.points) { maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); minX = Math.min(minX, x); minY = Math.min(minY, y) }
  if (!isFinite(minX)) { minX = 0; minY = 0 }
  return {
    nodes: nodes.filter((n) => n.x != null),
    flows: flows.filter((f) => f.points.length >= 2),
    minX: minX - 20, minY: minY - 20,
    width: Math.max(100, maxX - minX + 40), height: Math.max(80, maxY - minY + 40),
  }
}
export function bpmnAtomOf(m, id) {
  const diagram = bpmnDiagramOf(m.xml)
  return {
    isBpmn: true,
    bpmnId: 'mateuBpmn-' + str(id || 'bpmn').replace(/[^\w-]/g, '_'),
    spec: JSON.stringify(diagram),
    isEmpty: !diagram.nodes.length,
    ariaLabel: chromeText('processDiagram', { names: diagram.nodes.filter((n) => n.label).map((n) => n.label).join(', ') }),
  }
}

// ── Rich content as HTML (Popover/Tooltip content): a small, SANITISED serialisation ───────────
const escapeHtml = (t) => str(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
/** For a double-quoted attribute value: also the quotes, or a `"` in the value ends the attribute. */
const escapeAttrValue = (t) => escapeHtml(t).replace(/"/g, '&quot;').replace(/'/g, '&#39;')
/** A component subtree → sanitised HTML (texts with their heading level, links, lists, badges,
 *  markdown, separators; containers as blocks). What it does not know shows as its texts. */
export function componentHtmlOf(node, interp = (x) => x) {
  if (!node || typeof node !== 'object') return ''
  const m = node.metadata || {}
  const kids = () => {
    const out = [...(node.children || [])]
    const inner = m.content
    if (Array.isArray(inner)) out.push(...inner)
    else if (inner && typeof inner === 'object') out.push(inner)
    return out.map((k) => componentHtmlOf(k, interp)).join('')
  }
  let html
  switch (m.type) {
    case 'Text': {
      const tag = /^h[1-6]$/.test(m.container || '') ? 'h4' : 'p'
      html = '<' + tag + '>' + escapeHtml(interp(m.text)) + '</' + tag + '>'
      break
    }
    case 'Anchor': html = '<p><a href="' + escapeAttrValue(safeHref(interp(m.url))) + '">' + escapeHtml(interp(m.text || m.url)) + '</a></p>'; break
    case 'BulletedList': html = '<ul>' + (m.items || []).map((i) => '<li>' + escapeHtml(interp(i)) + '</li>').join('') + '</ul>'; break
    case 'Badge': html = '<span>' + escapeHtml(interp(m.text)) + '</span> '; break
    case 'Markdown': html = markdownToHtml(interp(m.markdown || m.text || '')); break
    case 'Separator': html = '<hr>'; break
    case 'Button': html = ''; break
    default: {
      const inner = kids()
      html = inner || (m.type ? collectTexts(node).map((x) => '<p>' + escapeHtml(interp(x)) + '</p>').join('') : '')
      if (inner && /Layout|Card|Div|Container|Section/.test(m.type || '')) html = '<div>' + inner + '</div>'
    }
  }
  return sanitizeHtml(html)
}

// ── Grid paging & tree (the Grid component) ────────────────────────────────────────────────────
/** A tree's rows flattened depth-first with their depth; collapsed nodes hide their children. */
export function flattenTreeRows(rows, isExpanded = () => true, childrenKey = 'children', depth = 0, path = '') {
  const out = []
  ;(rows || []).forEach((row, i) => {
    const key = path ? path + '.' + i : String(i)
    const kids = Array.isArray(row && row[childrenKey]) ? row[childrenKey] : []
    const expanded = kids.length ? isExpanded(key) : false
    const { [childrenKey]: _ignored, ...flat } = row || {}
    out.push({ ...flat, __depth: depth, __treeKey: key, __hasChildren: kids.length > 0, __expanded: expanded })
    if (expanded) out.push(...flattenTreeRows(kids, isExpanded, childrenKey, depth + 1, key))
  })
  return out
}
/** Client-side paging of a Grid: the slice shown and the pager texts. */
export function gridPageOf(rows, size, page) {
  const total = rows.length
  const pageSize = size > 0 ? size : total || 1
  const pages = Math.max(1, Math.ceil(total / pageSize))
  const current = Math.max(0, Math.min(pages - 1, Number(page) || 0))
  const from = current * pageSize
  const shown = rows.slice(from, from + pageSize)
  return {
    rows: shown,
    paged: total > pageSize,
    page: current,
    pages,
    rangeText: (total ? (from + 1) + '–' + (from + shown.length) : '0') + ' ' + chromeText('pagingOf') + ' ' + total,
    hasPrev: current > 0,
    hasNext: current < pages - 1,
    prevDisabled: current <= 0,
    nextDisabled: current >= pages - 1,
  }
}

// ── ResponsiveGrid auto-fill / auto-fit: the track minimum → oj-flex responsive column classes ──
/** The web renderers' default for a ResponsiveGrid that declares no columns (nor areas). */
export const AUTO_FIT_DEFAULT = 'repeat(auto-fit, minmax(min(100%, 16rem), 1fr))'
/** `repeat(auto-fit, minmax(16rem, 1fr))` → classes that put as many tiles per row as fit at each
 *  breakpoint (sm 0, md 768px, lg 1024px, xl 1280px). null when the template is not that shape. */
export function autoFitColClass(template) {
  const m = /repeat\(\s*auto-(?:fill|fit)\s*,\s*minmax\(\s*(?:min\(\s*100%\s*,\s*)?([\d.]+)(px|rem|em)/i.exec(str(template))
  if (!m) return null
  const px = parseFloat(m[1]) * (m[2] === 'px' ? 1 : 16)
  if (!(px > 0)) return null
  const per = (width) => Math.max(1, Math.min(12, Math.floor(width / px)))
  const span = (width) => {
    const n = per(width)
    // oj-flex columns are twelfths: the largest span that fits n per row
    return Math.max(1, Math.floor(12 / n))
  }
  return 'oj-flex-item oj-sm-' + span(480) + ' oj-md-' + span(768) + ' oj-lg-' + span(1024) + ' oj-xl-' + span(1280) + ' oj-sm-padding-2x-end oj-sm-padding-2x-bottom'
}

// ── HeroSection / EmptyState / ProgressBar in the content ───────────────────────────────────────
export function heroAtomOf(m, interp = (x) => x) {
  const image = m.image ? elementModuleUrl(str(m.image)) : ''
  return {
    isHero: true,
    title: interp(str(m.title)),
    subtitle: interp(str(m.subtitle)),
    heroClass: 'mateu-hero oj-sm-padding-10x' + (m.centered ? ' mateu-hero-centered' : '') + (image ? ' mateu-hero-image' : ''),
    heroStyle: image ? { backgroundImage: 'linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), url("' + image.replace(/"/g, '%22') + '")', minHeight: str(m.height) || '' } : { minHeight: str(m.height) || '' },
  }
}
/** EmptyState → oj-sp-empty-state (its call to action as an oj-button below it). */
export function emptyStateAtomOf(m, interp = (x) => x) {
  return {
    isEmptyStateAtom: true,
    title: [m.icon, interp(str(m.title))].filter(Boolean).join(' '),
    description: interp(str(m.description)),
    hasAction: !!(m.actionId && m.actionLabel),
    actionLabel: interp(str(m.actionLabel)),
    actionId: m.actionId || '',
    parameters: {},
  }
}
/** ProgressBar → oj-progress-bar: its value (or the state at valueKey) over min…max, or indeterminate. */
export function progressBarAtomOf(m, state, interp = (x) => x) {
  const min = Number(m.min) || 0
  const max = Number(m.max) > min ? Number(m.max) : 1
  const raw = m.valueKey && state && state[m.valueKey] != null ? Number(state[m.valueKey]) : Number(m.value)
  const value = Number.isFinite(raw) ? Math.max(min, Math.min(max, raw)) : min
  return {
    isProgressBar: true,
    value: m.indeterminate ? -1 : Math.round(((value - min) / (max - min)) * 100),
    text: interp(str(m.text)),
    ariaLabel: interp(str(m.text)) || 'Progress',
    barClass: 'oj-sm-margin-1x-vertical' + (toneOf(m.theme) ? ' mateu-tone-' + toneOf(m.theme) : ''),
  }
}

// ── CustomComponent: a registry the app fills (the VB app has no build step of its own) ────────
const customComponents = new Map()
/** An app registers a view for a custom component type: mount(el, props) paints it into the slot
 *  (and may return a cleanup). Without one the visible placeholder stays, like the web. */
export function registerCustomComponent(name, mount) {
  if (name && typeof mount === 'function') customComponents.set(String(name), mount)
}
export function customComponentRegistered(name) { return customComponents.has(str(name)) }
export function customComponentMountOf(name) { return customComponents.get(str(name)) || null }
export function customComponentAtomOf(m, id) {
  return {
    isCustomSlot: true,
    name: str(m.name),
    slotId: 'mateuCustom-' + str(id || m.name).replace(/[^\w-]/g, '_'),
    props: JSON.stringify(m.props || {}),
  }
}

// ── MicroFrontend: another Mateu UI (often another backend) loaded into its own surface ────────
/** The surface of a MicroFrontend — loaded like a @Subresource (loadSubresources), but from ITS
 *  baseUrl, and its actions go back to it (runSurfaceAction). The id is derived from what it
 *  points at (like the web's microFrontendUxId), so re-projections reuse the loaded surface. */
export function microFrontendOf(m) {
  const id = 'mfe_' + [m.baseUrl, m.route, m.consumedRoute, m.serverSideType].map((p) => str(p)).join('|').replace(/[^a-zA-Z0-9]/g, '_')
  return {
    id,
    route: str(m.route),
    consumedRoute: str(m.consumedRoute),
    serverSideType: m.serverSideType || undefined,
    componentState: {},
    baseUrl: str(m.baseUrl).replace(/\/+$/, ''),
    appState: m.appState && typeof m.appState === 'object' ? m.appState : null,
    surface: true,
    lazy: false,
  }
}
/** Tags every object of a surface's atoms that sends an action with the surface it belongs to, so
 *  the block dispatcher sends it there (deep: the cards of a board, the buttons of a band…). */
export function tagSurfaceActions(value, surfaceId) {
  if (Array.isArray(value)) return value.map((v) => tagSurfaceActions(v, surfaceId))
  // only plain data: a JET data provider or converter is passed through as it is
  if (!value || typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) return value
  const out = {}
  // (the parameters travel to the server as they are)
  for (const [k, v] of Object.entries(value)) out[k] = k === 'parameters' ? v : tagSurfaceActions(v, surfaceId)
  if ('actionId' in out) out.surfaceId = surfaceId
  return out
}

// ── Unknown / unsupported types: a visible placeholder, like the web renderers ───────────────────
export function unsupportedAtomOf(type, id) {
  return {
    isNotice: true,
    text: chromeText('unsupportedComponent', { type: str(type), id: id && id !== 'fieldId' ? ' (' + id + ')' : '' }),
    noticeClass: NOTICE_CLASSES.warning,
    buttons: [],
    isUnsupported: true,
  }
}

/** The ‹ › buttons of a client-side pager: each carries the key and the value it sets
 *  (the uiValueChanged listener reads them from the button's own $current). */
export function pagerButtonsOf(key, prevValue, nextValue, prevDisabled, nextDisabled, prevLabel = chromeText('pagingPrev'), nextLabel = chromeText('pagingNext')) {
  return [
    { key: 'prev', uiKey: key, uiValue: prevValue, label: prevLabel, icon: 'oj-ux-ico-chevron-left', disabled: !!prevDisabled },
    { key: 'next', uiKey: key, uiValue: nextValue, label: nextLabel, icon: 'oj-ux-ico-chevron-right', disabled: !!nextDisabled },
  ]
}

// ── CarouselLayout (content slides): the pager above the slide shown ────────────────────────────
export function carouselPagerAtomOf(key, current, count, loop) {
  const prev = current > 0 ? current - 1 : (loop ? count - 1 : 0)
  const next = current < count - 1 ? current + 1 : (loop ? 0 : count - 1)
  return {
    isCarouselPager: true,
    positionText: (current + 1) + ' / ' + count,
    nav: pagerButtonsOf(key, prev, next, !loop && current === 0, !loop && current === count - 1, chromeText('previousSlide'), chromeText('nextSlide')),
    dots: keyed(Array.from({ length: count }, (_, i) => ({
      uiKey: key,
      uiValue: i,
      label: chromeText('slideN', { n: i + 1 }),
      current: i === current,
      chroming: i === current ? 'callToAction' : 'borderless',
    }))),
  }
}

/** The types that legitimately reach the visitor's fall-through: containers whose children are
 *  painted in the page flow, parts painted by their owner, and roots projected elsewhere (the
 *  shell, the page header, the listing, the wizard, the overlays). Any OTHER type there has no
 *  view → a visible placeholder. Kept in sync with coverage.mjs by test-display.mjs. */
export const VISITOR_PASS_THROUGH = {
  VerticalLayout: 1, HorizontalLayout: 1, FormItem: 1, FormSection: 1, FormSubSection: 1, FormRow: 1,
  Scroller: 1, FullWidth: 1, Container: 1, Div: 1, ContentLayout: 1, ResponsiveGrid: 1,
  BoardLayout: 1, BoardLayoutRow: 1, BoardLayoutItem: 1, SplitLayout: 1, MasterDetailLayout: 1,
  FoldoutLayout: 1, AccordionPanel: 1, Tab: 1, GridColumn: 1, GridGroupColumn: 1, Breadcrumb: 1,
  CarouselLayout: 1, DashboardLayout: 1, CustomField: 1,
  App: 1, Page: 1, Form: 1, Crud: 1, HeroSection: 1, EmptyState: 1, NotFound: 1, ProgressBar: 1,
  Dialog: 1, Drawer: 1,
}
