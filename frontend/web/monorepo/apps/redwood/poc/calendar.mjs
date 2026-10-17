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
export function calendarAtomOf(m, id, today = new Date().toISOString().slice(0, 10)) {
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

// ── DOM behaviour (once per document) ────────────────────────────────────────────
let calendarSink = null
export function setCalendarActionSink(fn) { calendarSink = typeof fn === 'function' ? fn : null }

export function installCalendars(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuCalendars) return
  doc.__mateuCalendars = true
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
