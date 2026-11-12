/**
 * The text alternative of a chart (WCAG 1.1.1): a canvas or an SVG drawing says nothing to a screen
 * reader, so every chart carries an accessible NAME (its title, else its series labels) and the
 * numbers it draws as a visually-hidden data table. Pure: no DOM, no lit.
 */
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

export interface ChartTable {
    /** first header = the category column, then one per series */
    headers: string[]
    rows: string[][]
}

export interface ChartAlternative {
    name: string
    table: ChartTable
}

const textOf = (v: unknown): string => {
    if (v === null || v === undefined) return ''
    if (Array.isArray(v)) return v.map(textOf).join(' ')
    if (typeof v === 'object') {
        const o = v as Record<string, unknown>
        // chart.js point shapes: {x, y} / {x, y, r}
        if ('y' in o) return textOf(o.y)
        return JSON.stringify(o)
    }
    return String(v)
}

/** The title chart.js would draw (options.plugins.title.text), if any. */
export const chartTitleOf = (options: unknown): string | undefined => {
    const title = (options as { plugins?: { title?: { text?: unknown, display?: boolean } } } | undefined)?.plugins?.title
    const text = title?.text
    if (Array.isArray(text)) return text.join(' ') || undefined
    return typeof text === 'string' && text.trim() ? text : undefined
}

/** chart.js data → name + table (categories as rows, one column per dataset). */
export function chartAlternativeOf(data: unknown, options?: unknown, type?: string): ChartAlternative {
    const d = (data ?? {}) as { labels?: unknown[], datasets?: { label?: string, data?: unknown[] }[] }
    const datasets = Array.isArray(d.datasets) ? d.datasets : []
    const labels = Array.isArray(d.labels) ? d.labels : []
    const length = Math.max(labels.length, ...datasets.map((s) => (Array.isArray(s.data) ? s.data.length : 0)), 0)
    const seriesNames = datasets.map((s, i) => s.label || `${chromeText('chartSeries')} ${i + 1}`)
    const rows: string[][] = []
    for (let i = 0; i < length; i++) {
        const first = labels[i] !== undefined ? textOf(labels[i])
            : textOf((datasets[0]?.data?.[i] as { x?: unknown } | undefined)?.x ?? i + 1)
        rows.push([first, ...datasets.map((s) => textOf(s.data?.[i]))])
    }
    const titled = chartTitleOf(options)
    const name = titled || (datasets.length ? seriesNames.join(', ') : '') || chromeText('chartUntitled')
    void type
    return { name, table: { headers: ['', ...seriesNames], rows } }
}

/** One sentence for a single-series trend: count, first/last, lowest/highest. */
export function trendSummaryOf(heading: string | undefined, values: number[], labels: string[] = []): string {
    const name = heading?.trim() || chromeText('chartUntitled')
    if (!values?.length) return name
    const min = Math.min(...values), max = Math.max(...values)
    const at = (i: number) => (labels[i] ? `${labels[i]} (${values[i]})` : String(values[i]))
    return chromeTextf('chartTrend', {
        name, count: values.length, first: at(0), last: at(values.length - 1),
        min: at(values.indexOf(min)), max: at(values.indexOf(max)),
    })
}
