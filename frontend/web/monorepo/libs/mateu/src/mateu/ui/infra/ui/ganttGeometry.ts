import GanttTask from "@mateu/shared/apiClients/dtos/componentmetadata/GanttTask";

export const DAY = 24 * 60 * 60 * 1000;

/** A wire date (YYYY-MM-DD, or a date-time whose date part is kept) as local midnight in ms, or
 *  null when absent or unparseable. */
export function dayMs(value?: string | null): number | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value ?? '')
    if (!m) return null
    const t = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])).getTime()
    return isNaN(t) ? null : t
}

export interface GanttBar { task: GanttTask, start: number, end: number, leftPct: number, widthPct: number }
export interface GanttGeometry { min: number, max: number, span: number, bars: GanttBar[] }

/**
 * Where each bar sits on the shared time axis (percentages of the lane). The degenerate inputs
 * are settled the same way in every renderer: a task without both dates is not drawn, an end
 * BEFORE the start is a single day at the start — so no bar can have a negative width. Null when
 * there is nothing to draw.
 */
export function ganttGeometry(tasks: GanttTask[]): GanttGeometry | null {
    const drawn = (tasks ?? []).flatMap(task => {
        const start = dayMs(task?.start)
        const end = dayMs(task?.end)
        return start == null || end == null ? [] : [{ task, start, end: Math.max(start, end) }]
    })
    if (!drawn.length) return null
    // one day of padding on each side so the first/last bars don't touch the edges
    const min = Math.min(...drawn.map(d => d.start)) - DAY
    const max = Math.max(...drawn.map(d => d.end)) + 2 * DAY
    const span = max - min
    return {
        min, max, span,
        bars: drawn.map(d => ({
            ...d,
            leftPct: (d.start - min) / span * 100,
            widthPct: (d.end + DAY - d.start) / span * 100,
        })),
    }
}

/** The unit of the time axis: chosen by the span, so a header never holds hundreds of cells. */
export type GanttScale = 'month' | 'quarter' | 'year' | 'decade'

export interface GanttTick { label: string, from: number, to: number }

/**
 * The axis unit for a range: months up to a year and a half, quarters up to four and a half years,
 * years up to thirty, then decades. A space programme from 1961 to 2026 drawn by month was ~780
 * header cells — the lane overflowed into a long horizontal scroll and only one or two bars were in
 * view; by decade it is seven.
 */
export function ganttScale(min: number, max: number): GanttScale {
    const a = new Date(min), b = new Date(max)
    const months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth()) + 1
    if (months <= 18) return 'month'
    if (months <= 54) return 'quarter'
    if (months <= 360) return 'year'
    return 'decade'
}

/**
 * The header cells of the axis at its {@link ganttScale}: each clipped to [min, max], never of
 * negative or zero width. Months use the browser's locale; quarters read "Q2 '24", years "2024",
 * decades "1960s".
 */
export function ganttTicks(min: number, max: number, scale: GanttScale = ganttScale(min, max)): GanttTick[] {
    if (!(max > min)) return []
    const step = scale === 'month' ? 1 : scale === 'quarter' ? 3 : scale === 'year' ? 12 : 120
    const first = new Date(min)
    const startMonth = scale === 'month' ? first.getMonth()
        : scale === 'quarter' ? first.getMonth() - first.getMonth() % 3
        : 0
    const startYear = scale === 'decade' ? first.getFullYear() - first.getFullYear() % 10 : first.getFullYear()
    let cursor = new Date(startYear, startMonth, 1)
    const ticks: GanttTick[] = []
    while (cursor.getTime() < max) {
        const next = new Date(cursor.getFullYear(), cursor.getMonth() + step, 1)
        const from = Math.max(cursor.getTime(), min)
        const to = Math.min(next.getTime(), max)
        if (to > from) ticks.push({ label: tickLabel(cursor, scale), from, to })
        cursor = next
    }
    return ticks
}

function tickLabel(d: Date, scale: GanttScale): string {
    switch (scale) {
        case 'month': return d.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
        case 'quarter': return `Q${Math.floor(d.getMonth() / 3) + 1} '${String(d.getFullYear()).slice(-2)}`
        case 'year': return String(d.getFullYear())
        case 'decade': return `${d.getFullYear()}s`
    }
}
