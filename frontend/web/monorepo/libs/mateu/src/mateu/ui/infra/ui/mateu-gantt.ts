import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import GanttTask from "@mateu/shared/apiClients/dtos/componentmetadata/GanttTask";

const DAY = 24 * 60 * 60 * 1000;

/**
 * Dependency-free Gantt/timeline: one row per task, bars positioned on a shared time axis by
 * percentage, per-task progress fill, month headers and a today marker.
 */
@customElement('mateu-gantt')
export class MateuGantt extends LitElement {

    @property({ type: Array })
    tasks: GanttTask[] = []

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .frame {
            display: grid;
            grid-template-columns: minmax(9rem, 14rem) 1fr;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .label, .lane, .head {
            padding: .45rem .75rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            box-sizing: border-box;
        }
        .head {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .months {
            display: flex;
            padding: 0;
        }
        .month {
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            padding: .45rem 0 .45rem .5rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            box-sizing: border-box;
        }
        .label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .lane {
            position: relative;
            padding: .45rem 0;
        }
        .bar {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.15rem;
            border-radius: .6rem;
            background: var(--mateu-gantt-bar, var(--lumo-contrast-20pct, #cbd5e1));
            overflow: hidden;
            min-width: 4px;
        }
        .fill {
            height: 100%;
            background: var(--mateu-gantt-fill, var(--lumo-primary-color, #1a73e8));
            border-radius: .6rem 0 0 .6rem;
        }
        .today {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--lumo-error-color, #e11d48);
            opacity: .55;
        }
    `

    private range(): { min: number, max: number } | null {
        const dates = this.tasks
            .flatMap(t => [t.start, t.end])
            .filter(d => !!d)
            .map(d => new Date(d + 'T00:00:00').getTime())
        if (!dates.length) {
            return null
        }
        // one day of padding on each side so the first/last bars don't touch the edges
        return { min: Math.min(...dates) - DAY, max: Math.max(...dates) + 2 * DAY }
    }

    private months(min: number, max: number) {
        const months: { label: string, from: number, to: number }[] = []
        const cursor = new Date(min)
        cursor.setDate(1)
        while (cursor.getTime() <= max) {
            const from = Math.max(cursor.getTime(), min)
            const next = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1)
            const to = Math.min(next.getTime(), max)
            months.push({
                label: cursor.toLocaleDateString(undefined, { month: 'short', year: '2-digit' }),
                from, to
            })
            cursor.setMonth(cursor.getMonth() + 1)
        }
        return months
    }

    render() {
        const range = this.range()
        if (!range) {
            return html``
        }
        const span = range.max - range.min
        const pct = (t: number) => (t - range.min) / span * 100
        const now = Date.now()
        return html`
            <div class="frame">
                <div class="head">Task</div>
                <div class="head months">
                    ${this.months(range.min, range.max).map(month => html`
                        <div class="month" style="width: ${(month.to - month.from) / span * 100}%;">${month.label}</div>
                    `)}
                </div>
                ${this.tasks.map(task => {
                    const start = new Date(task.start + 'T00:00:00').getTime()
                    const end = new Date(task.end + 'T00:00:00').getTime() + DAY
                    return html`
                        <div class="label" title="${task.title}">${task.title}</div>
                        <div class="lane">
                            ${now >= range.min && now <= range.max ? html`<div class="today" style="left: ${pct(now)}%;"></div>` : nothing}
                            <div class="bar"
                                 title="${task.title} · ${task.start} → ${task.end}${task.progress ? ` · ${task.progress}%` : ''}"
                                 style="left: ${pct(start)}%; width: ${(end - start) / span * 100}%; ${task.color ? `--mateu-gantt-fill: ${task.color};` : ''}">
                                <div class="fill" style="width: ${task.progress ?? 0}%;"></div>
                            </div>
                        </div>
                    `
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-gantt": MateuGantt
    }
}
