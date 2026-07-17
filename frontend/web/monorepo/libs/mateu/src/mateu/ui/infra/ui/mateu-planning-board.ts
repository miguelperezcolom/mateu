import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import PlanningResource from "@mateu/shared/apiClients/dtos/componentmetadata/PlanningResource";
import PlanningBlock from "@mateu/shared/apiClients/dtos/componentmetadata/PlanningBlock";

interface DragState {
    blockId: string
    duration: number            // days
    grabOffsetDays: number      // days between the block start and the grabbed day
    originResourceId: string
    originStartIdx: number
    targetResourceId: string
    targetStartIdx: number
    moved: boolean              // pointer moved beyond the click threshold
}

/**
 * Dependency-free planning board / tape chart: rows = resources (with optional group swimlane
 * captions), columns = days, colored blocks spanning date ranges. Clicking a block dispatches the
 * standard action-requested event with the board's selectActionId; dragging a block to another
 * row/day dispatches moveActionId with the new resource and dates (Escape cancels the drag).
 * DS-neutral (Lumo vars with fallbacks), dark-mode aware.
 */
@customElement('mateu-planning-board')
export class MateuPlanningBoard extends LitElement {

    @property({ type: Array })
    resources: PlanningResource[] = []

    @property({ type: Array })
    blocks: PlanningBlock[] = []

    @property()
    from: string | undefined

    @property()
    to: string | undefined

    @property()
    moveActionId: string | undefined

    @property()
    selectActionId: string | undefined

    @state()
    private drag: DragState | null = null

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .frame {
            display: grid;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow-x: auto;
        }
        .corner, .label, .group, .day-head {
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            box-sizing: border-box;
        }
        .corner, .label, .group {
            position: sticky;
            left: 0;
            z-index: 3;
            background: var(--lumo-base-color, #fff);
        }
        .corner, .day-head {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .corner {
            padding: .45rem .75rem;
            background: var(--lumo-base-color, #fff);
        }
        .day-head {
            text-align: center;
            padding: .3rem .1rem;
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            white-space: nowrap;
            overflow: hidden;
            font-weight: 400;
            line-height: 1.15;
        }
        .day-head .dow {
            display: block;
            font-size: .7em;
            text-transform: uppercase;
            color: var(--lumo-tertiary-text-color, #999);
        }
        .day-head .num {
            font-weight: 600;
        }
        .day-head.weekend {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .day-head.today .num {
            color: var(--lumo-primary-text-color, var(--lumo-primary-color, #1a73e8));
        }
        .group {
            grid-column: 1 / -1;
            padding: .3rem .75rem;
            font-weight: 600;
            font-size: .8em;
            text-transform: uppercase;
            letter-spacing: .04em;
            color: var(--lumo-secondary-text-color, #666);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .label {
            padding: .55rem .75rem;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            border-right: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .lane {
            grid-column: 2 / -1;
            position: relative;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06));
            min-height: 2.2rem;
            box-sizing: border-box;
        }
        .cells {
            position: absolute;
            inset: 0;
            display: grid;
            grid-auto-flow: column;
            grid-auto-columns: 1fr;
        }
        .cell {
            border-left: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.05));
        }
        .cell.weekend {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
        }
        .today-line {
            position: absolute;
            top: 0;
            bottom: 0;
            width: 2px;
            background: var(--lumo-error-color, #e11d48);
            opacity: .45;
            pointer-events: none;
        }
        .block {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.5rem;
            line-height: 1.5rem;
            border-radius: .5rem;
            background: var(--mateu-planning-block, var(--lumo-primary-color, #1a73e8));
            color: var(--lumo-primary-contrast-color, #fff);
            padding: 0 .5rem;
            box-sizing: border-box;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            min-width: 4px;
            user-select: none;
            -webkit-user-select: none;
            touch-action: none;
        }
        .block.clickable {
            cursor: pointer;
        }
        .block.draggable {
            cursor: grab;
        }
        .block.dragging {
            opacity: .35;
            cursor: grabbing;
        }
        .ghost {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            height: 1.5rem;
            border-radius: .5rem;
            border: 2px dashed var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.12));
            box-sizing: border-box;
            pointer-events: none;
            z-index: 2;
        }
    `

    // --- date helpers (all local-time, no UTC conversions) ---------------------------------

    private static parse(date: string): Date {
        return new Date(date + 'T00:00:00')
    }

    private static iso(date: Date): string {
        const pad = (n: number) => String(n).padStart(2, '0')
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
    }

    private static addDays(date: Date, days: number): Date {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
    }

    private static daysBetween(from: Date, to: Date): number {
        return Math.round((to.getTime() - from.getTime()) / 86400000)
    }

    /** The visible window: explicit from/to, or derived from the blocks. */
    private window(): { from: Date, days: number } | null {
        if (this.from && this.to) {
            const from = MateuPlanningBoard.parse(this.from)
            const days = MateuPlanningBoard.daysBetween(from, MateuPlanningBoard.parse(this.to)) + 1
            return days > 0 ? { from, days } : null
        }
        const dates = this.blocks
            .flatMap(b => [b.start, b.end])
            .filter(d => !!d)
            .map(d => MateuPlanningBoard.parse(d!))
        if (!dates.length) {
            return null
        }
        const from = new Date(Math.min(...dates.map(d => d.getTime())))
        const to = new Date(Math.max(...dates.map(d => d.getTime())))
        return { from, days: MateuPlanningBoard.daysBetween(from, to) + 1 }
    }

    // --- drag & drop ------------------------------------------------------------------------

    private dragStartX = 0
    private dragStartY = 0
    private laneRects: { resourceId: string, rect: DOMRect }[] = []

    private onBlockPointerDown(e: PointerEvent, block: PlanningBlock, startIdx: number) {
        if (!this.moveActionId && !this.selectActionId) {
            return
        }
        e.preventDefault()
        const target = e.currentTarget as HTMLElement
        target.setPointerCapture(e.pointerId)
        this.dragStartX = e.clientX
        this.dragStartY = e.clientY
        const win = this.window()
        if (!win) {
            return
        }
        const start = MateuPlanningBoard.parse(block.start!)
        const end = MateuPlanningBoard.parse(block.end!)
        const duration = Math.max(1, MateuPlanningBoard.daysBetween(start, end) + 1)
        this.laneRects = [...this.renderRoot.querySelectorAll<HTMLElement>('.lane[data-resource-id]')]
            .map(lane => ({ resourceId: lane.dataset.resourceId!, rect: lane.getBoundingClientRect() }))
        const grabbedDay = this.dayAt(block.resourceId!, e.clientX) ?? startIdx
        this.drag = {
            blockId: block.id!,
            duration,
            grabOffsetDays: grabbedDay - startIdx,
            originResourceId: block.resourceId!,
            originStartIdx: startIdx,
            targetResourceId: block.resourceId!,
            targetStartIdx: startIdx,
            moved: false
        }
        window.addEventListener('keydown', this.onDragKeydown)
    }

    private dayAt(resourceId: string, clientX: number): number | null {
        const lane = this.laneRects.find(l => l.resourceId === resourceId)
        const win = this.window()
        if (!lane || !win || lane.rect.width === 0) {
            return null
        }
        const idx = Math.floor((clientX - lane.rect.left) / lane.rect.width * win.days)
        return Math.max(0, Math.min(win.days - 1, idx))
    }

    private onBlockPointerMove(e: PointerEvent) {
        if (!this.drag) {
            return
        }
        if (!this.drag.moved
            && Math.abs(e.clientX - this.dragStartX) < 4
            && Math.abs(e.clientY - this.dragStartY) < 4) {
            return
        }
        if (!this.moveActionId) {
            return // click-only board: never enter drag mode
        }
        const win = this.window()
        if (!win) {
            return
        }
        const lane = this.laneRects.find(l => e.clientY >= l.rect.top && e.clientY <= l.rect.bottom)
            ?? this.laneRects.find(l => l.resourceId === this.drag!.targetResourceId)
        if (!lane) {
            return
        }
        const day = this.dayAt(lane.resourceId, e.clientX)
        if (day == null) {
            return
        }
        const startIdx = Math.max(0, Math.min(win.days - this.drag.duration, day - this.drag.grabOffsetDays))
        this.drag = { ...this.drag, moved: true, targetResourceId: lane.resourceId, targetStartIdx: startIdx }
    }

    private onBlockPointerUp(block: PlanningBlock) {
        const drag = this.drag
        this.endDrag()
        if (!drag) {
            return
        }
        if (!drag.moved) {
            // a plain click
            if (this.selectActionId) {
                this.dispatchEvent(new CustomEvent('action-requested', {
                    detail: { actionId: this.selectActionId, parameters: { _blockId: block.id } },
                    bubbles: true,
                    composed: true
                }))
            }
            return
        }
        if (!this.moveActionId) {
            return
        }
        if (drag.targetResourceId === drag.originResourceId && drag.targetStartIdx === drag.originStartIdx) {
            return // dropped where it started: no-op
        }
        const win = this.window()
        if (!win) {
            return
        }
        const start = MateuPlanningBoard.addDays(win.from, drag.targetStartIdx)
        const end = MateuPlanningBoard.addDays(start, drag.duration - 1)
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId: this.moveActionId,
                parameters: {
                    _blockId: drag.blockId,
                    _resourceId: drag.targetResourceId,
                    _start: MateuPlanningBoard.iso(start),
                    _end: MateuPlanningBoard.iso(end)
                }
            },
            bubbles: true,
            composed: true
        }))
    }

    private onDragKeydown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && this.drag) {
            e.stopPropagation()
            this.endDrag()
        }
    }

    private endDrag() {
        this.drag = null
        window.removeEventListener('keydown', this.onDragKeydown)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        window.removeEventListener('keydown', this.onDragKeydown)
    }

    // --- rendering ---------------------------------------------------------------------------

    render() {
        const win = this.window()
        if (!win || !this.resources.length) {
            return html``
        }
        const days = [...Array(win.days).keys()].map(i => MateuPlanningBoard.addDays(win.from, i))
        const now = new Date()
        const todayIdx = MateuPlanningBoard.daysBetween(
            win.from, new Date(now.getFullYear(), now.getMonth(), now.getDate()))
        const todayVisible = todayIdx >= 0 && todayIdx < win.days
        const rows: unknown[] = []
        let lastGroup: string | undefined = undefined
        this.resources.forEach(resource => {
            if (resource.group && resource.group !== lastGroup) {
                rows.push(html`<div class="group">${resource.group}</div>`)
            }
            lastGroup = resource.group
            rows.push(this.renderRow(resource, win, days, todayVisible ? todayIdx : null))
        })
        return html`
            <div class="frame" style="grid-template-columns: minmax(8rem, 12rem) repeat(${win.days}, minmax(2.2rem, 1fr));">
                <div class="corner">Resource</div>
                ${days.map((day, i) => html`
                    <div class="day-head ${this.isWeekend(day) ? 'weekend' : ''} ${i === todayIdx ? 'today' : ''}">
                        <span class="dow">${day.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                        <span class="num">${day.getDate()}</span>
                    </div>
                `)}
                ${rows}
            </div>
        `
    }

    private isWeekend(day: Date): boolean {
        return day.getDay() === 0 || day.getDay() === 6
    }

    private renderRow(resource: PlanningResource, win: { from: Date, days: number }, days: Date[], todayIdx: number | null) {
        const pctPerDay = 100 / win.days
        const blocks = this.blocks.filter(b => b.resourceId === resource.id && b.start && b.end)
        const ghost = this.drag?.moved && this.drag.targetResourceId === resource.id ? this.drag : null
        return html`
            <div class="label" title="${resource.label ?? ''}">${resource.label}</div>
            <div class="lane" data-resource-id="${resource.id}">
                <div class="cells">
                    ${days.map(day => html`<div class="cell ${this.isWeekend(day) ? 'weekend' : ''}"></div>`)}
                </div>
                ${todayIdx != null ? html`<div class="today-line" style="left: ${(todayIdx + .5) * pctPerDay}%;"></div>` : nothing}
                ${blocks.map(block => {
                    const startIdx = MateuPlanningBoard.daysBetween(win.from, MateuPlanningBoard.parse(block.start!))
                    const endIdx = MateuPlanningBoard.daysBetween(win.from, MateuPlanningBoard.parse(block.end!))
                    if (endIdx < 0 || startIdx >= win.days) {
                        return nothing
                    }
                    const visibleStart = Math.max(0, startIdx)
                    const visibleEnd = Math.min(win.days - 1, endIdx)
                    const dragging = this.drag?.moved && this.drag.blockId === block.id
                    return html`
                        <div class="block ${this.selectActionId ? 'clickable' : ''} ${this.moveActionId ? 'draggable' : ''} ${dragging ? 'dragging' : ''}"
                             title="${block.label ?? ''} · ${block.start} → ${block.end}${block.status ? ` · ${block.status}` : ''}"
                             style="left: ${visibleStart * pctPerDay}%; width: ${(visibleEnd - visibleStart + 1) * pctPerDay}%; ${block.color ? `--mateu-planning-block: ${block.color};` : ''}"
                             @pointerdown="${(e: PointerEvent) => this.onBlockPointerDown(e, block, startIdx)}"
                             @pointermove="${(e: PointerEvent) => this.onBlockPointerMove(e)}"
                             @pointerup="${() => this.onBlockPointerUp(block)}"
                             @pointercancel="${() => this.endDrag()}"
                        >${block.label}</div>
                    `
                })}
                ${ghost ? html`
                    <div class="ghost"
                         style="left: ${ghost.targetStartIdx * pctPerDay}%; width: ${Math.min(ghost.duration, win.days - ghost.targetStartIdx) * pctPerDay}%;"></div>
                ` : nothing}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-planning-board": MateuPlanningBoard
    }
}
