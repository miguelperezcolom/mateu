import { css, html, LitElement } from "lit";
import { customElement, property } from 'lit/decorators.js';
import CalendarEvent from "@mateu/shared/apiClients/dtos/componentmetadata/CalendarEvent";

/**
 * Dependency-free month-grid calendar: a 7-column grid (Mon–Sun) with the days of the given month,
 * each cell listing that day's events as small chips. An event with an actionId is clickable and
 * dispatches the standard action-requested event. DS-neutral, dark-mode aware.
 */
@customElement('mateu-calendar')
export class MateuCalendar extends LitElement {

    @property() month: string | undefined
    @property({ type: Array }) events: CalendarEvent[] = []

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .title {
            font-weight: 700;
            font-size: 1.05rem;
            margin-bottom: .5rem;
            color: var(--lumo-body-text-color, #222);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 1px;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-m, 8px);
            overflow: hidden;
        }
        .dow {
            background: var(--lumo-contrast-5pct, #f7f7f8);
            padding: .35rem .5rem;
            font-weight: 600;
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-secondary-text-color, #888);
            text-align: center;
            text-transform: uppercase;
        }
        .cell {
            background: var(--lumo-base-color, #fff);
            min-height: 4.4rem;
            padding: .25rem;
            display: flex;
            flex-direction: column;
            gap: .15rem;
        }
        .cell.blank {
            background: var(--lumo-contrast-5pct, #fafafa);
        }
        .num {
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-secondary-text-color, #888);
            align-self: flex-end;
        }
        .cell.today .num {
            background: var(--lumo-primary-color, #1a73e8);
            color: #fff;
            border-radius: 50%;
            width: 1.25rem;
            height: 1.25rem;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .chip {
            font-size: var(--lumo-font-size-xs, .7rem);
            padding: .05rem .3rem;
            border-radius: 4px;
            background: var(--mateu-cal-chip, var(--lumo-primary-color-10pct, rgba(26,115,232,.12)));
            color: var(--mateu-cal-chip-text, var(--lumo-primary-text-color, #1a73e8));
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-left: 3px solid var(--mateu-cal-accent, var(--lumo-primary-color, #1a73e8));
        }
        .chip.clickable { cursor: pointer; }
        .chip.clickable:hover { filter: brightness(.95); }
        @media (prefers-color-scheme: dark) {
            .cell { background: var(--lumo-contrast-5pct, #2a2a2a); }
            .dow { background: var(--lumo-contrast-10pct, #333); }
        }
    `

    private clickEvent(event: CalendarEvent) {
        if (!event.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: event.actionId, parameters: { _clickedEvent: event } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const base = this.month ? new Date(this.month + 'T00:00:00') : new Date()
        const year = base.getFullYear(), mon = base.getMonth()
        const first = new Date(year, mon, 1)
        // Monday-first offset
        const startOffset = (first.getDay() + 6) % 7
        const daysInMonth = new Date(year, mon + 1, 0).getDate()
        const today = new Date()
        const isToday = (d: number) =>
            today.getFullYear() === year && today.getMonth() === mon && today.getDate() === d
        const eventsByDay: Record<number, CalendarEvent[]> = {}
        for (const ev of this.events) {
            if (!ev.date) continue
            const d = new Date(ev.date + 'T00:00:00')
            if (d.getFullYear() === year && d.getMonth() === mon) {
                (eventsByDay[d.getDate()] ??= []).push(ev)
            }
        }
        const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        const cells = []
        for (let i = 0; i < startOffset; i++) cells.push(html`<div class="cell blank"></div>`)
        for (let d = 1; d <= daysInMonth; d++) {
            cells.push(html`
                <div class="cell ${isToday(d) ? 'today' : ''}">
                    <span class="num">${d}</span>
                    ${(eventsByDay[d] ?? []).map(ev => html`
                        <span class="chip ${ev.actionId ? 'clickable' : ''}"
                              style="${ev.color ? `--mateu-cal-accent: ${ev.color};` : ''}"
                              title="${ev.title ?? ''}"
                              @click="${() => this.clickEvent(ev)}">${ev.title}</span>
                    `)}
                </div>
            `)
        }
        const monthLabel = first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
        return html`
            <div class="title">${monthLabel}</div>
            <div class="grid">
                ${dows.map(d => html`<div class="dow">${d}</div>`)}
                ${cells}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-calendar": MateuCalendar
    }
}
