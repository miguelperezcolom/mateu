// CALENDAR (Calendar → isCalendar atom). JET has no calendar: the grid is drawn with
// Redwood's tokens; the view selector is JET's oj-buttonset-one and the events, links.
// ALL views (month, week, day, list) come precomputed in the atom — VB's CSP does not
// compute dates — and switching view is DOM state (installCalendars): without re-projecting or
// asking the server. Same rules as libs/mateu calendarModel.ts (ISO dates in UTC, so
// that no time zone moves a day; the multi-day event on all its days; by start time).

const toUtc = (iso) => { const [y, m, d] = iso.split('-').map(Number); return Date.UTC(y, m - 1, d) }
const fromUtc = (ms) => new Date(ms).toISOString().slice(0, 10)
export const calAddDays = (iso, n) => fromUtc(toUtc(iso) + n * 86400000)
/** 0 = Monday … 6 = Sunday */
export const calWeekday = (iso) => (new Date(toUtc(iso)).getUTCDay() + 6) % 7
const firstOfMonth = (iso) => iso.slice(0, 8) + '01'
const lastOfMonth = (iso) => { const [y, m] = iso.split('-').map(Number); return fromUtc(Date.UTC(y, m, 0)) }
const datesBetween = (from, to) => { const out = []; for (let d = from; d <= to; d = calAddDays(d, 1)) out.push(d); return out }

export function calPeriod(view, anchor) {
  if (view === 'day') return { from: anchor, to: anchor }
  if (view === 'week') { const monday = calAddDays(anchor, -calWeekday(anchor)); return { from: monday, to: calAddDays(monday, 6) } }
  return { from: firstOfMonth(anchor), to: lastOfMonth(anchor) }
}

export const calEventsOn = (events, date) => (events || [])
  .filter((e) => e.date && e.date <= date && (e.endDate || e.date) >= date)
  .map((e, i) => ({ e, i }))
  .sort((a, b) => (a.e.startTime || '').localeCompare(b.e.startTime || '') || a.i - b.i)
  .map(({ e }) => e)

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const DOWS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DOWS_LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const TONES = { info: 1, success: 1, warning: 1, danger: 1, neutral: 1 }
const dayNum = (iso) => Number(iso.slice(8))
const monthName = (iso) => MONTHS[Number(iso.slice(5, 7)) - 1]
const longDate = (iso) => DOWS_LONG[calWeekday(iso)] + ', ' + monthName(iso) + ' ' + dayNum(iso)

/** The calendar atom, with the four views precomputed. */
export function calendarAtomOf(m, id, today = new Date().toISOString().slice(0, 10), nav = null) {
  const anchor = m.month || today
  const events = m.events || []
  const days = {}
  for (const d of m.days || []) if (d && d.date) days[d.date] = d
  const dayAction = m.dayActionId || ''
  const chipOf = (e, withTime) => {
    const time = withTime && e.startTime ? e.startTime + (e.endTime ? '–' + e.endTime : '') : ''
    return {
      id: e.id || '', title: e.title || '', date: e.date || '', time,
      text: (time ? time + ' ' : '') + (e.title || ''),
      actionId: e.actionId || '',
      clickable: e.actionId ? 'true' : 'false',
      // an OBJECT: JET's :style does not apply a CSS string
      style: e.color ? { borderLeftColor: e.color } : {},
    }
  }
  const cellOf = (date, withTime) => {
    const info = days[date] || {}
    const evs = calEventsOn(events, date)
    return {
      date, num: String(dayNum(date)), blank: false,
      label: info.label || '',
      cls: 'mateu-cal-cell' + (info.tone && TONES[info.tone] ? ' mateu-cal-' + info.tone : '')
        + (date === today ? ' mateu-cal-today' : '') + (dayAction ? ' mateu-cal-clickable' : ''),
      ariaLabel: longDate(date) + (info.label ? ', ' + info.label : '') + (evs.length ? ', ' + evs.length + (evs.length > 1 ? ' events' : ' event') : ''),
      events: evs.map((e) => chipOf(e, withTime)),
    }
  }
  // month: cells from Monday to Sunday, blank outside the month
  const month = calPeriod('month', anchor)
  const monthCells = Array.from({ length: calWeekday(month.from) }, () => ({ blank: true, cls: 'mateu-cal-cell mateu-cal-blank', events: [], label: '', num: '', date: '' }))
  monthCells.push(...datesBetween(month.from, month.to).map((d) => cellOf(d, false)))
  while (monthCells.length % 7) monthCells.push({ blank: true, cls: 'mateu-cal-cell mateu-cal-blank', events: [], label: '', num: '', date: '' })
  const week = calPeriod('week', anchor)
  const weekDates = datesBetween(week.from, week.to)
  const agenda = datesBetween(month.from, month.to)
    .map((date) => ({ date, cell: cellOf(date, true) }))
    .filter((x) => x.cell.events.length)
    .map(({ date, cell }) => ({ date, dateLabel: longDate(date), label: cell.label, cls: cell.cls.replace('mateu-cal-cell', 'mateu-cal-agenda-date'), events: cell.events }))
  const view = ['month', 'week', 'day', 'list'].includes(m.view) ? m.view : 'month'
  const views = (m.views || []).filter((v) => ['month', 'week', 'day', 'list'].includes(v))
  return {
    isCalendar: true,
    // the Spectra calendar (oj-sp-calendar) that installCalendars mounts over the drawn grid; the
    // grid stays as the fallback while it loads, or when the component cannot be loaded
    spSpec: JSON.stringify(spCalendarSpecOf(m, nav, today)),
    // a CalendarPage's toolbar folded into the calendar: the fallback grid keeps it as plain buttons
    navButtons: nav ? nav.buttons : [],
    calId: 'mateuCal-' + String(id || 'calendar').replace(/[^A-Za-z0-9_-]/g, '_'),
    view,
    dayActionId: dayAction,
    hasSwitcher: views.length > 1,
    viewOptions: views.map((v) => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) })),
    titles: {
      month: monthName(anchor) + ' ' + anchor.slice(0, 4),
      week: monthName(week.from).slice(0, 3) + ' ' + dayNum(week.from) + ' – ' + monthName(week.to).slice(0, 3) + ' ' + dayNum(week.to) + ', ' + week.to.slice(0, 4),
      day: longDate(anchor) + ', ' + anchor.slice(0, 4),
      list: monthName(anchor) + ' ' + anchor.slice(0, 4),
    },
    dows: DOWS,
    monthCells,
    weekHeads: weekDates.map((d) => DOWS[calWeekday(d)] + ' ' + dayNum(d)),
    weekCells: weekDates.map((d) => cellOf(d, true)),
    dayHead: longDate(anchor),
    dayCells: [cellOf(anchor, true)],
    agenda,
    hasAgenda: agenda.length > 0,
  }
}

// ── Spectra's calendar (oj-sp-calendar) ──────────────────────────────────────────
// Spectra HAS a calendar (FullCalendar inside, Redwood-styled): month/week/day/list, its own
// toolbar (title + date picker, ‹ › Today, + Create, the view buttonset). It is fed a DataProvider
// of {id, eventTitle, start, end, allDay, calendarProvider}; colours come from the PROVIDER and are
// one of six Redwood keys (it ignores a per-event colour), so each wire colour maps to the closest
// key. Clicking an event writes `selected` (selectionMode single) — that is our openCalendarEvent.
// Wire features it has no prop for are added on its DOM (FullCalendar stamps data-date on every
// cell): the per-date tone + label (CalendarDay) and the clickable dates (dayActionId).

/** Spectra's event colours (EventColors in oj-sp/calendar) by hue: [key, hue]. */
const SP_EVENT_HUES = [['rose', 355], ['sienna', 30], ['pine', 130], ['teal', 185], ['blue', 215], ['plum', 290]]

/** The Spectra colour key closest to a wire colour (#rgb / #rrggbb); grey or unreadable → teal. */
export function spColorKeyOf(color) {
  const hex = String(color || '').trim().replace(/^#/, '')
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 'teal'
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  if (max - min < 0.08) return 'teal'
  const d = max - min
  let h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  h = (h * 60 + 360) % 360
  let best = SP_EVENT_HUES[0]
  const dist = (a) => Math.min(Math.abs(a - h), 360 - Math.abs(a - h))
  for (const k of SP_EVENT_HUES) if (dist(k[1]) < dist(best[1])) best = k
  return best[0]
}

const SP_VIEWS = ['month', 'week', 'day', 'list']

/** The calendar toolbar a CalendarPage puts above its Calendar (HorizontalLayout of Buttons:
 *  ‹ Today › [views…] [+ Create]) → its actions, so Spectra's own toolbar runs them; null when
 *  the row is anything else (then it stays a row of buttons and the calendar navigates alone). */
export function calendarPageToolbarOf(node, advertised = []) {
  const md = node && node.metadata
  if (!md || md.type !== 'HorizontalLayout') return null
  const kids = (node.children || []).filter(Boolean)
  if (!kids.length || !kids.every((k) => k.metadata && k.metadata.type === 'Button')) return null
  // a jump to any date (the title's date picker) needs goCalendarToDate on the server (3.0-beta.13+):
  // used only when the page advertises it, so an older backend never receives an action it lacks
  const goTo = advertised.includes('goCalendarToDate') ? 'goCalendarToDate' : ''
  const nav = { prev: '', today: '', next: '', goTo, viewAction: '', views: [], create: '', createLabel: '', buttons: [] }
  for (const k of kids) {
    const b = k.metadata
    const id = b.actionId || ''
    nav.buttons.push({ label: String(b.label || ''), actionId: id, params: JSON.stringify(b.parameters || {}) })
    if (id === 'previousCalendarMonth') nav.prev = id
    else if (id === 'nextCalendarMonth') nav.next = id
    else if (id === 'goCalendarToday') nav.today = id
    else if (id === 'switchCalendarView' && b.parameters && SP_VIEWS.includes(b.parameters._view)) {
      nav.viewAction = id
      nav.views.push(b.parameters._view)
    } else if (id === 'createCalendarEvent') {
      nav.create = id
      nav.createLabel = String(b.label || '').replace(/^\+\s*/, '')
    } else return null
  }
  return nav.prev && nav.next ? nav : null
}

/** What oj-sp-calendar is fed for a wire Calendar (+ the page toolbar's actions, when a
 *  CalendarPage drives it). Dates are LOCAL ISO strings (no Z), as FullCalendar places them in the
 *  browser's zone: a UTC midnight would move an all-day event to the day before west of Greenwich. */
export function spCalendarSpecOf(m, nav = null, today = new Date().toISOString().slice(0, 10)) {
  const anchor = m.month || today
  const colours = []
  const events = (m.events || []).filter((e) => e && e.date).map((e, i) => {
    const key = spColorKeyOf(e.color)
    if (!colours.includes(key)) colours.push(key)
    const timed = !!e.startTime
    const end = e.endDate || e.date
    return {
      id: e.id || 'event-' + i,
      eventTitle: e.title || '',
      start: e.date + 'T' + (timed ? e.startTime : '00:00:00'),
      end: timed ? end + 'T' + (e.endTime || e.startTime) : end + 'T23:59:59',
      allDay: !timed,
      calendarProvider: key,
    }
  })
  const actions = {}
  for (const [i, e] of (m.events || []).filter((x) => x && x.date).entries()) {
    if (e.actionId) actions[e.id || 'event-' + i] = { actionId: e.actionId, id: e.id || '', title: e.title || '', date: e.date }
  }
  const days = {}
  for (const d of m.days || []) if (d && d.date) days[d.date] = { tone: TONES[d.tone] ? d.tone : '', label: d.label || '' }
  const view = SP_VIEWS.includes(m.view) ? m.view : 'month'
  // the views the user may switch between: the page toolbar's (server-side) or the Calendar's own
  const offered = nav ? nav.views : (m.views || []).filter((v) => SP_VIEWS.includes(v))
  const views = offered.length ? offered : [view]
  const onOff = (v) => (views.includes(v) || v === view ? 'on' : 'off')
  return {
    events,
    providers: colours.map((c) => ({ name: c, color: c })),
    focusDate: anchor + 'T12:00:00',
    anchor,
    view,
    displayOptions: {
      monthView: onOff('month'), weekView: onOff('week'), dayView: onOff('day'), listView: onOff('list'),
      createEvent: nav && nav.create ? 'on' : 'off',
      createEventLabel: nav && nav.createLabel ? nav.createLabel : '',
      calendars: 'off', eventDetailMode: 'off', firstDayOfWeek: 'monday',
    },
    actions,
    days,
    dayActionId: m.dayActionId || '',
    nav: nav || null,
  }
}

/** A local date (YYYY-MM-DD) of an ISO value written by the calendar. */
const localDateOf = (iso) => {
  const d = new Date(iso)
  if (isNaN(d.valueOf())) return ''
  const p = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate())
}

/** Which page action a navigation inside oj-sp-calendar maps to (the server owns the period):
 *  the period with today → Today, one step after/before → ›/‹, the same period → nothing; any
 *  other jump (the title's date picker) → goCalendarToDate with that `_date` when the page
 *  advertises it, else null (the calendar is put back). */
export function spNavActionOf(nav, view, anchor, toIso, today = localDateOf(new Date().toISOString())) {
  if (!nav) return null
  const to = toIso.length === 10 ? toIso : localDateOf(toIso)
  if (!to) return null
  const v = view === 'list' ? 'month' : view
  const inPeriod = (d, a) => { const p = calPeriod(v, a); return d >= p.from && d <= p.to }
  if (inPeriod(to, anchor)) return { kind: 'same' }
  const step = (n) => (v === 'day' ? calAddDays(anchor, n) : v === 'week' ? calAddDays(anchor, 7 * n) : shiftMonth(anchor, n))
  if (inPeriod(to, step(1))) return { kind: 'action', actionId: nav.next }
  if (inPeriod(to, step(-1))) return { kind: 'action', actionId: nav.prev }
  if (nav.today && inPeriod(today, to)) return { kind: 'action', actionId: nav.today }
  if (nav.goTo) return { kind: 'action', actionId: nav.goTo, params: { _date: to } }
  return null
}
const shiftMonth = (iso, n) => {
  const [y, mo] = iso.split('-').map(Number)
  return fromUtc(Date.UTC(y, mo - 1 + n, 1))
}

// ── DOM behaviour (once per document) ────────────────────────────────────────────
let calendarSink = null
export function setCalendarActionSink(fn) { calendarSink = typeof fn === 'function' ? fn : null }

export function installCalendars(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuCalendars) return
  doc.__mateuCalendars = true
  mountSpCalendars(doc)
  // switching view: the oj-buttonset-one does NOT bubble valueChanged; capture does see it
  doc.addEventListener('valueChanged', (e) => {
    const set = e.target
    if (!set || !set.hasAttribute || !set.hasAttribute('data-cal-switch')) return
    const cal = set.closest('.mateu-cal')
    if (cal && e.detail && e.detail.value) cal.setAttribute('data-cal-shown', e.detail.value)
  }, true)
  const run = (target) => {
    const chip = target.closest('[data-cal-event]')
    const cal = target.closest('.mateu-cal')
    if (!cal || !calendarSink) return false
    const navButton = target.closest('[data-cal-nav-action]')
    if (navButton) {
      let params = {}
      try { params = JSON.parse(navButton.getAttribute('data-cal-nav-params') || '{}') } catch (e) { params = {} }
      calendarSink(navButton.getAttribute('data-cal-nav-action'), params, {})
      return true
    }
    if (chip) {
      if (chip.getAttribute('data-cal-clickable') !== 'true') return false
      calendarSink(chip.getAttribute('data-cal-action'), {
        _clickedEvent: { id: chip.getAttribute('data-cal-event'), title: chip.getAttribute('data-cal-title'), date: chip.getAttribute('data-cal-date') },
      }, {})
      return true
    }
    const cell = target.closest('[data-cal-date]')
    const action = cal.getAttribute('data-day-action')
    if (cell && action && cell.getAttribute('data-cal-date')) {
      calendarSink(action, { _date: cell.getAttribute('data-cal-date') }, {})
      return true
    }
    return false
  }
  // the chips are anchors (focusable, `href="#"`): a handled click must ALSO cancel the anchor's
  // own navigation, or the browser goes to `/#` and VB's router reboots the whole app — the action
  // never ran and the page (its map included) was torn down (walkthrough: «the click fired a nav
  // chain»)
  doc.addEventListener('click', (e) => {
    if (e.target && e.target.closest && run(e.target)) { e.preventDefault(); e.stopPropagation() }
  }, true)
  doc.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('.mateu-cal') && run(e.target)) e.preventDefault()
  }, true)
}

// ── mounting oj-sp-calendar (DOM; the pure parts above are tested in Node) ────────
const SP_CAL_DATE_CELLS = 'td.fc-daygrid-day[data-date], td.fc-timegrid-col[data-date], th.fc-col-header-cell[data-date]'

/** Paints the wire's per-date tone/label on FullCalendar's cells (idempotent: the observer that
 *  calls it also sees its own changes). */
function decorateSpCalendar(el, spec) {
  for (const cell of el.querySelectorAll(SP_CAL_DATE_CELLS)) {
    const info = spec.days[cell.getAttribute('data-date')] || {}
    for (const t of Object.keys(TONES)) cell.classList.toggle('mateu-cal-sp-' + t, info.tone === t)
    cell.classList.toggle('mateu-cal-sp-clickable', !!spec.dayActionId && cell.tagName === 'TD')
    // the month cell's top row (FullCalendar lays it out row-reverse: last child = leftmost, the
    // number stays right) or the week/day column header
    const top = cell.querySelector('.fc-daygrid-day-top') || (cell.tagName === 'TH' ? cell.querySelector('.fc-scrollgrid-sync-inner') : null)
    if (!top) continue
    let label = top.querySelector('.mateu-cal-sp-label')
    if (!info.label) { if (label) label.remove(); continue }
    if (!label) {
      label = el.ownerDocument.createElement('span')
      label.className = 'mateu-cal-sp-label'
      top.appendChild(label)
    }
    if (label.textContent !== info.label) label.textContent = info.label
  }
}

/** The host's classes: `-fixed` when nothing can move the period (no page behind the Calendar),
 *  `-nopick` when the title's date picker cannot jump (the page does not advertise
 *  goCalendarToDate) — only then is the picker switched off. */
export function spCalendarHostClassOf(spec) {
  const nav = spec && spec.nav
  return 'mateu-cal-sp' + (nav ? '' : ' mateu-cal-sp-fixed') + (nav && nav.goTo ? '' : ' mateu-cal-sp-nopick')
}

function buildSpCalendar(doc, cal, spec, ADP) {
  const old = cal.querySelector(':scope > .mateu-cal-sp')
  if (old) old.remove()
  // a host OUTSIDE VB's knockout bindings: a JET element inside a bound page waits for a
  // binding pass that never comes for a node added later (it stays empty, 0×0)
  const host = doc.createElement('div')
  host.className = spCalendarHostClassOf(spec)
  host.setAttribute('data-oj-binding-provider', 'none')
  const el = doc.createElement('oj-sp-calendar')
  el.calendarEvents = new ADP(spec.events, { keyAttributes: 'id' })
  el.calendarProviders = spec.providers
  el.visibleCalendars = spec.providers.map((p) => p.name)
  el.focusDate = spec.focusDate
  el.selectedViewValue = spec.view
  el.selectionMode = 'single'
  el.readonly = true
  el.displayOptions = spec.displayOptions
  // an event: Spectra selects it → its action, with the same parameters the drawn chips send
  el.addEventListener('selectedChanged', (e) => {
    const ids = (e.detail && e.detail.value) || []
    const hit = ids.length ? spec.actions[ids[ids.length - 1]] : null
    if (!hit || !calendarSink) return
    calendarSink(hit.actionId, { _clickedEvent: { id: hit.id, title: hit.title, date: hit.date } }, {})
    setTimeout(() => { el.selected = [] }, 0)
  })
  // the toolbar: with a CalendarPage behind, its ‹ › Today and views are the page's (server-side) actions
  el.addEventListener('focusDateChanged', (e) => {
    if (!e.detail || e.detail.updatedFrom !== 'internal' || !spec.nav) return
    const step = spNavActionOf(spec.nav, el.selectedViewValue || spec.view, spec.anchor, String(e.detail.value || ''))
    if (step && step.kind === 'same') return
    if (step && step.actionId && calendarSink) { calendarSink(step.actionId, step.params || {}, {}); return }
    setTimeout(() => { el.focusDate = spec.focusDate }, 0)
  })
  el.addEventListener('selectedViewValueChanged', (e) => {
    if (!e.detail || e.detail.updatedFrom !== 'internal' || !spec.nav || !spec.nav.viewAction) return
    const v = e.detail.value
    if (v && v !== spec.view && spec.nav.views.includes(v) && calendarSink) calendarSink(spec.nav.viewAction, { _view: v }, {})
  })
  el.addEventListener('spCalendarEventCreate', () => {
    if (spec.nav && spec.nav.create && calendarSink) calendarSink(spec.nav.create, {}, {})
  })
  // a date's cell (dayActionId): FullCalendar stamps data-date on it
  const dayOf = (target) => {
    if (!spec.dayActionId || target.closest('.fc-event, .fc-more-link, .fc-daygrid-more-link, button')) return null
    const cell = target.closest('td.fc-daygrid-day[data-date], td.fc-timegrid-col[data-date]')
    return cell && el.contains(cell) ? cell.getAttribute('data-date') : null
  }
  host.addEventListener('click', (e) => {
    const date = dayOf(e.target)
    if (!date || !calendarSink) return
    e.preventDefault(); e.stopPropagation()
    calendarSink(spec.dayActionId, { _date: date }, {})
  }, true)
  host.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    const date = dayOf(e.target)
    if (!date || !calendarSink) return
    e.preventDefault()
    calendarSink(spec.dayActionId, { _date: date }, {})
  }, true)
  let queued = false
  new MutationObserver(() => {
    if (queued) return
    queued = true
    setTimeout(() => { queued = false; decorateSpCalendar(el, spec) }, 0)
  }).observe(el, { childList: true, subtree: true })
  host.appendChild(el)
  cal.appendChild(host)
  // the drawn grid goes once Spectra has painted (oj-complete); until then (or if it never loads) it stays
  const ready = (n = 0) => {
    if (!host.isConnected) return
    if (el.classList.contains('oj-complete') && el.querySelector('.fc')) { cal.classList.add('mateu-cal-sp-on'); decorateSpCalendar(el, spec); return }
    if (n < 100) setTimeout(() => ready(n + 1), 100)
  }
  ready()
}

function mountSpCalendars(doc) {
  if (typeof MutationObserver === 'undefined' || typeof window === 'undefined' || typeof window.require !== 'function') return
  const fill = (cal) => {
    const raw = cal.getAttribute('data-cal-sp') || ''
    if (!raw || cal.__mateuSpCal === raw) return
    cal.__mateuSpCal = raw
    let spec
    try { spec = JSON.parse(raw) } catch (e) { return }
    window.require(['ojs/ojarraydataprovider', 'oj-sp/calendar/loader'], (ADP) => {
      if (cal.__mateuSpCal === raw && cal.isConnected) buildSpCalendar(doc, cal, spec, ADP)
    }, () => { /* no Spectra calendar: the drawn grid stays */ })
  }
  const scan = (root) => {
    if (!root || root.nodeType !== 1) return
    if (root.matches('.mateu-cal[data-cal-sp]')) fill(root)
    for (const el of root.querySelectorAll('.mateu-cal[data-cal-sp]')) fill(el)
  }
  scan(doc.body || doc.documentElement)
  new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === 'attributes') fill(r.target)
      else for (const n of r.addedNodes) scan(n)
    }
  }).observe(doc.body || doc.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-cal-sp'] })
}
