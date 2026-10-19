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
