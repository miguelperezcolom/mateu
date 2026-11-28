// The web Gantt's scale: the whole range FITS the width it is given (positions in %), and the ticks
// follow the span — months for a project, years for a programme, decades for an era. The React
// Native core lays a Gantt out at a fixed width per day and scrolls it, which suits a phone and a
// project of weeks; on a page, sixty-five years of missions became a lane tens of thousands of
// pixels wide whose first screen showed two bars.

export interface ScaleTask { id?: string; title?: string; start?: string; end?: string; progress?: number; color?: string }
export interface ScaleTick { label: string; left: number }
export interface ScaleBar<T> { task: T; left: number; width: number; progress: number }
export interface GanttScale<T> { tasks: T[]; ticks: ScaleTick[]; bars: ScaleBar<T>[]; minDay: number; totalDays: number }

const DAY_MS = 86_400_000
const dayOf = (iso: string | undefined): number | null => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}/.test(iso)) return null
  const t = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`)
  return Number.isFinite(t) ? Math.floor(t / DAY_MS) : null
}
const pct = (days: number, total: number) => (days / total) * 100

/** The tick unit for a span of days: months up to two years, years up to twenty, decades beyond. */
export function tickUnitOf(totalDays: number): 'month' | 'quarter' | 'year' | 'decade' {
  if (totalDays <= 2 * 366) return 'month'
  if (totalDays <= 5 * 366) return 'quarter'
  if (totalDays <= 20 * 366) return 'year'
  return 'decade'
}

function ticksOf(minDay: number, maxDay: number, total: number): ScaleTick[] {
  const unit = tickUnitOf(total)
  const first = new Date(minDay * DAY_MS)
  const cursor = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1))
  if (unit === 'quarter') cursor.setUTCMonth(Math.floor(cursor.getUTCMonth() / 3) * 3)
  if (unit === 'year') cursor.setUTCMonth(0)
  if (unit === 'decade') cursor.setUTCFullYear(Math.floor(cursor.getUTCFullYear() / 10) * 10, 0, 1)
  const out: ScaleTick[] = []
  for (let guard = 0; guard < 400; guard++) {
    const day = Math.floor(cursor.getTime() / DAY_MS)
    if (day > maxDay) break
    const y = cursor.getUTCFullYear()
    const m = cursor.getUTCMonth()
    const label = unit === 'decade' ? `${y}s` : unit === 'year' ? String(y) : unit === 'quarter' ? `Q${m / 3 + 1} ${y}` : `${y}-${String(m + 1).padStart(2, '0')}`
    out.push({ label, left: Math.max(0, pct(day - minDay, total)) })
    if (unit === 'month') cursor.setUTCMonth(m + 1)
    else if (unit === 'quarter') cursor.setUTCMonth(m + 3)
    else if (unit === 'year') cursor.setUTCFullYear(y + 1)
    else cursor.setUTCFullYear(y + 10)
  }
  return out
}

/** The tasks with a readable start and end, laid out over [first start, last end] in % of the width. */
export function ganttScale<T extends ScaleTask>(all: T[]): GanttScale<T> | null {
  const tasks = all.filter((t) => dayOf(t.start) != null && dayOf(t.end) != null)
  if (tasks.length === 0) return null
  const minDay = Math.min(...tasks.map((t) => dayOf(t.start)!))
  const maxDay = Math.max(...tasks.map((t) => Math.max(dayOf(t.end)!, dayOf(t.start)!)))
  const totalDays = Math.max(1, maxDay - minDay + 1)
  const bars = tasks.map((task) => {
    const start = dayOf(task.start)!
    const end = Math.max(dayOf(task.end)!, start)
    return {
      task,
      left: pct(start - minDay, totalDays),
      width: pct(end - start + 1, totalDays),
      progress: Math.max(0, Math.min(100, Number(task.progress ?? 0) || 0)),
    }
  })
  return { tasks, ticks: ticksOf(minDay, maxDay, totalDays), bars, minDay, totalDays }
}

/** Where today falls, in %, or null outside the range. */
export function todayPercent(todayDay: number, minDay: number, totalDays: number): number | null {
  const d = todayDay - minDay
  return d < 0 || d > totalDays ? null : pct(d, totalDays)
}
