import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import CalendarEvent from "@mateu/shared/apiClients/dtos/componentmetadata/CalendarEvent";
import type { CalendarDay, CalendarViewName } from "@mateu/shared/apiClients/dtos/componentmetadata/Calendar";
import { onActivate } from '@infra/a11y/activate.ts';
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts';
import {
    agendaOf, datesBetween, dayOf, eventsOn, monthWeeks, periodOf, timeRangeOf, todayIso, toneClassOf,
} from '@infra/ui/calendarModel.ts';
import { chromeText } from '@infra/ui/chromeTexts.ts'

/**
 * Dependency-free calendar with four views — the month grid (Mon–Sun), the week (seven columns,
 * timed events), a single day, and the list (the month's agenda by date). `views` with more than
 * one entry shows a switcher that changes the view in place; `days` put a label and a tone in each
 * date's cell, and `dayActionId` makes the cells clickable (the action gets `_date`). An event with
 * an actionId is clickable and dispatches the standard action-requested event. DS-neutral,
 * dark-mode aware.
 */
@customElement('mateu-calendar')
export class MateuCalendar extends LitElement {

    /** the anchor date */
    @property() month: string | undefined
    @property({ type: Array }) events: CalendarEvent[] = []
    @property() view: CalendarViewName | undefined
    @property({ type: Array }) views: CalendarViewName[] = []
    @property({ type: Array }) days: CalendarDay[] = []
    @property() dayActionId: string | undefined
    @state() shown: CalendarViewName | undefined

    willUpdate(changed: Map<string, unknown>) {
        // a new view from the server wins over the one picked locally
        if (changed.has('view') || !this.shown) this.shown = this.view || 'month'
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .head { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-bottom: .5rem; }
        .title {
            font-weight: 700;
            font-size: 1.05rem;
            color: var(--lumo-body-text-color, #222);
        }
        .switcher { display: inline-flex; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); border-radius: var(--lumo-border-radius-m, 6px); overflow: hidden; }
        .switcher button {
            font: inherit; font-size: var(--lumo-font-size-s, .85rem); border: 0; padding: .3rem .7rem; cursor: pointer;
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #222);
        }
        .switcher button + button { border-left: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); }
        .switcher button[aria-pressed="true"] { background: var(--lumo-primary-color, #1a73e8); color: var(--lumo-primary-contrast-color, #fff); }
        .grid {
            display: grid;
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 1px;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-m, 8px);
            overflow: hidden;
        }
        .grid.day { grid-template-columns: 1fr; }
        .dow {
            background: var(--lumo-contrast-5pct, #f7f7f8);
            padding: .35rem .5rem;
            font-weight: 600;
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-body-text-color, #1a1a1a);
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
        .grid.week .cell { min-height: 12rem; }
        .grid.day .cell { min-height: 10rem; }
        .cell.blank {
            background: var(--lumo-contrast-5pct, #fafafa);
        }
        .cell.clickable { cursor: pointer; }
        .cell.clickable:hover { box-shadow: inset 0 0 0 2px var(--lumo-primary-color-50pct, rgba(26,115,232,.5)); }
        .top { display: flex; justify-content: space-between; align-items: center; gap: .25rem; }
        .label { font-size: var(--lumo-font-size-xs, .72rem); font-weight: 600; color: var(--lumo-secondary-text-color, #555); }
        .num {
            font-size: var(--lumo-font-size-xs, .72rem);
            color: var(--lumo-secondary-text-color, #888);
            margin-left: auto;
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
        .grid.week .chip, .grid.day .chip, .agenda .chip { white-space: normal; }
        .time { font-variant-numeric: tabular-nums; opacity: .8; margin-right: .25rem; }
        .chip.clickable { cursor: pointer; }
        .chip.clickable:hover { filter: brightness(.95); }
        .agenda { border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); border-radius: var(--lumo-border-radius-m, 8px); }
        .agenda .date { padding: .5rem .75rem; font-weight: 600; background: var(--lumo-contrast-5pct, #f7f7f8); display: flex; justify-content: space-between; }
        .agenda .entries { padding: .4rem .75rem; display: flex; flex-direction: column; gap: .3rem; }
        .empty { padding: 1rem; color: var(--lumo-secondary-text-color, #888); }
        .tone-info { background-color: rgba(0, 110, 200, .08); }
        .tone-success { background-color: rgba(30, 140, 60, .10); }
        .tone-warning { background-color: rgba(220, 140, 0, .16); }
        .tone-danger { background-color: rgba(200, 40, 30, .10); }
        .tone-danger .label { color: var(--lumo-error-text-color, #b3261e); }
        .tone-neutral { background-color: var(--lumo-contrast-5pct, rgba(0,0,0,.04)); }

        ${activatableFocusStyles}
    `

    private clickEvent(event: CalendarEvent, e?: Event) {
        e?.stopPropagation()
        if (!event.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: event.actionId, parameters: { _clickedEvent: event } },
            bubbles: true,
            composed: true
        }))
    }

    private clickDay(date: string) {
        if (!this.dayActionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.dayActionId, parameters: { _date: date } },
            bubbles: true,
            composed: true
        }))
    }

    private chip(ev: CalendarEvent, withTime: boolean) {
        const time = withTime ? timeRangeOf(ev) : ''
        return html`
            <span role="button" tabindex="0" class="chip ${ev.actionId ? 'clickable' : ''}"
                  style="${ev.color ? `--mateu-cal-accent: ${ev.color};` : ''}"
                  title="${(time ? time + ' ' : '') + (ev.title ?? '')}"
                  @click="${(e: Event) => this.clickEvent(ev, e)}"
                  @keydown="${onActivate(() => this.clickEvent(ev))}">${time ? html`<span class="time">${time}</span>` : nothing}${ev.title}</span>`
    }

    private dayCell(date: string, withTime: boolean, showNum = true) {
        const info = dayOf(this.days, date)
        const clickable = !!this.dayActionId
        const evs = eventsOn(this.events, date)
        const label = new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
            + (info?.label ? ', ' + info.label : '') + (evs.length ? ', ' + evs.length + ' event' + (evs.length > 1 ? 's' : '') : '')
        return html`
            <div class="cell ${date === todayIso() ? 'today' : ''} ${toneClassOf(info?.tone)} ${clickable ? 'clickable' : ''}"
                 role="${clickable ? 'button' : nothing}" tabindex="${clickable ? '0' : nothing}"
                 aria-label="${clickable ? label : nothing}"
                 @click="${clickable ? () => this.clickDay(date) : nothing}"
                 @keydown="${clickable ? onActivate(() => this.clickDay(date)) : nothing}">
                <div class="top">
                    ${info?.label ? html`<span class="label">${info.label}</span>` : nothing}
                    ${showNum ? html`<span class="num">${Number(date.slice(8))}</span>` : nothing}
                </div>
                ${evs.map((ev) => this.chip(ev, withTime))}
            </div>`
    }

    private renderMonth(anchor: string) {
        const dows = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        return html`
            <div class="grid month">
                ${dows.map(d => html`<div class="dow">${d}</div>`)}
                ${monthWeeks(anchor).flat().map((date) => date ? this.dayCell(date, false) : html`<div class="cell blank"></div>`)}
            </div>`
    }

    private renderWeek(anchor: string) {
        const { from, to } = periodOf('week', anchor)
        const dates = datesBetween(from, to)
        return html`
            <div class="grid week">
                ${dates.map((d) => html`<div class="dow">${new Date(d + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' })}</div>`)}
                ${dates.map((d) => this.dayCell(d, true, false))}
            </div>`
    }

    private renderDay(anchor: string) {
        return html`
            <div class="grid day">
                <div class="dow">${new Date(anchor + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                ${this.dayCell(anchor, true, false)}
            </div>`
    }

    private renderList(anchor: string) {
        const { from, to } = periodOf('list', anchor)
        const agenda = agendaOf(this.events, from, to)
        if (!agenda.length) return html`<div class="agenda"><div class="empty">${chromeText('noEvents')}</div></div>`
        return html`
            <div class="agenda">
                ${agenda.map(({ date, events }) => {
                    const info = dayOf(this.days, date)
                    return html`
                        <div class="date ${toneClassOf(info?.tone)}">
                            <span>${new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                            ${info?.label ? html`<span class="label">${info.label}</span>` : nothing}
                        </div>
                        <div class="entries">${events.map((ev) => this.chip(ev, true))}</div>`
                })}
            </div>`
    }

    private titleOf(view: CalendarViewName, anchor: string) {
        const d = new Date(anchor + 'T00:00:00')
        if (view === 'day') return d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
        if (view === 'week') {
            const { from, to } = periodOf('week', anchor)
            const f = new Date(from + 'T00:00:00'), t = new Date(to + 'T00:00:00')
            return f.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' – '
                + t.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
        }
        return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    }

    render() {
        const anchor = this.month || todayIso()
        const view = this.shown || 'month'
        return html`
            <div class="head">
                <div class="title">${this.titleOf(view, anchor)}</div>
                ${this.views && this.views.length > 1 ? html`
                    <div class="switcher" role="group" aria-label="${chromeText('calendarView')}">
                        ${this.views.map((v) => html`<button type="button" aria-pressed="${v === view ? 'true' : 'false'}"
                            @click="${() => { this.shown = v }}">${v.charAt(0).toUpperCase() + v.slice(1)}</button>`)}
                    </div>` : nothing}
            </div>
            ${view === 'week' ? this.renderWeek(anchor)
                : view === 'day' ? this.renderDay(anchor)
                : view === 'list' ? this.renderList(anchor)
                : this.renderMonth(anchor)}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-calendar": MateuCalendar
    }
}
