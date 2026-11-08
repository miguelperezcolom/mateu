import { css, html, LitElement, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import {
    blockingTask, countsOf, elapsedSeconds, formatElapsed, isFinished, listedTasks, percentOf, stepCountOf,
    taskStore, type TaskEntry, type TaskState,
} from '@infra/progress/taskStore.ts'
import { cancelTask, retryTask, runResultAction } from '@infra/progress/taskActions.ts'
import { actionLabelOf } from '@infra/notify/messageToast.ts'
import { announce } from '@infra/a11y/announcer.ts'
import { trapFocus, type FocusTrap } from '@infra/a11y/focusTrap.ts'
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts'
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

/**
 * The TASK CENTER — the web's surface for the progress pattern (design/progress-and-notifications.md).
 *
 * - A BLOCKING running task shows as a modal-looking panel over the page: title, what it is doing,
 *   a progress bar (indeterminate without a fraction), "12 of 300", the elapsed time, and Cancel /
 *   Background when the task allows them. Finished, it shows the outcome with its result actions
 *   (and Retry for a failed, retryable task) until closed — or until its closeAfterSeconds.
 * - Everything else lives in the task LIST, opened from an indicator in the bottom-start corner
 *   (away from the FAB rail at the end) that counts the running tasks: each task with its bar,
 *   elapsed time, Cancel, and once finished its outcome, actions, Retry and a dismiss.
 *
 * One per page (taskCenterMount.ts), fed by the task store, so a task the user left behind keeps
 * reporting here. Start and end are announced politely; the panel traps the focus like a dialog;
 * every control is a real button.
 *
 * Design-system neutral: plain elements with Lumo custom properties and fallbacks.
 */
@customElement('mateu-task-center')
export class MateuTaskCenter extends LitElement {

    @state() private tasks: TaskState = taskStore.state
    @state() private listOpen = false
    @state() private now = Date.now()

    private unsubscribe: (() => void) | undefined
    private ticker: ReturnType<typeof setInterval> | undefined
    private closer: ReturnType<typeof setTimeout> | undefined
    private trap: FocusTrap | undefined
    private trappedTask: string | undefined
    /** last state announced per task, so an update is not announced twice */
    private announced = new Map<string, string>()

    connectedCallback() {
        super.connectedCallback()
        this.unsubscribe = taskStore.subscribe((s) => this.onTasks(s))
        this.onTasks(taskStore.state)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this.unsubscribe?.()
        this.unsubscribe = undefined
        clearInterval(this.ticker)
        this.ticker = undefined
        clearTimeout(this.closer)
        this.releaseTrap()
    }

    private onTasks(s: TaskState) {
        this.tasks = s
        this.now = Date.now()
        for (const entry of s.entries) this.announceChange(entry)
        const running = countsOf(s).running > 0
        if (running && !this.ticker) {
            this.ticker = setInterval(() => { this.now = Date.now() }, 1000)
        } else if (!running && this.ticker) {
            clearInterval(this.ticker)
            this.ticker = undefined
        }
        this.scheduleAutoClose()
    }

    private announceChange(entry: TaskEntry) {
        const id = entry.progress.taskId
        const status = entry.progress.state ?? 'running'
        if (this.announced.get(id) === status) return
        this.announced.set(id, status)
        const title = entry.progress.title || chromeText('tasks')
        const key = status === 'running' ? 'taskStarted'
            : status === 'done' ? 'taskFinishedAnnounce'
                : status === 'failed' ? 'taskFailedAnnounce' : 'taskCancelledAnnounce'
        announce(chromeTextf(key, { title }), { politeness: 'polite' })
    }

    /** A finished blocking task with closeAfterSeconds closes on its own. */
    private scheduleAutoClose() {
        clearTimeout(this.closer)
        const pending = this.tasks.entries
            .filter((e) => e.progress.blocking && isFinished(e.progress) && e.finishedAt !== undefined
                && (e.progress.closeAfterSeconds ?? 0) > 0)
            .map((e) => e.finishedAt! + e.progress.closeAfterSeconds! * 1000 - Date.now())
            .filter((ms) => ms > 0)
        if (pending.length > 0) {
            this.closer = setTimeout(() => { this.now = Date.now(); this.scheduleAutoClose() }, Math.min(...pending) + 20)
        }
    }

    protected updated(_changed: PropertyValues) {
        const blocking = blockingTask(this.tasks, this.now)
        const panel = this.renderRoot.querySelector('.modal') as HTMLElement | null
        if (blocking && panel) {
            if (this.trappedTask !== blocking.progress.taskId) {
                this.releaseTrap()
                this.trappedTask = blocking.progress.taskId
                this.trap = trapFocus(panel)
            } else {
                this.trap?.refresh()
            }
        } else {
            this.releaseTrap()
        }
    }

    private releaseTrap() {
        this.trap?.release()
        this.trap = undefined
        this.trappedTask = undefined
    }

    // ── pieces ──────────────────────────────────────────────────────────────

    private stateLabel(entry: TaskEntry): string {
        switch (entry.progress.state) {
            case 'done': return chromeText('taskDone')
            case 'failed': return chromeText('taskFailed')
            case 'cancelled': return chromeText('taskCancelled')
            default: return chromeText('taskRunning')
        }
    }

    private renderBar(entry: TaskEntry): TemplateResult {
        const p = entry.progress
        const percent = percentOf(p)
        const finished = isFinished(p)
        const value = finished && percent === undefined ? 100 : percent
        const steps = stepCountOf(p)
        const valueText = [p.text, steps ? chromeTextf('taskStepCount', steps) : null].filter(Boolean).join(' · ')
        return html`
            <div class="bar ${value === undefined ? 'bar--indeterminate' : ''} bar--${p.state ?? 'running'}"
                 role="progressbar" aria-label="${p.title || chromeText('progress')}"
                 aria-valuemin="0" aria-valuemax="100"
                 aria-valuenow="${value === undefined ? nothing : value}"
                 aria-valuetext="${valueText || nothing}">
                <div class="bar-fill" style="${value === undefined ? '' : `width: ${value}%`}"></div>
            </div>`
    }

    private renderMeta(entry: TaskEntry): TemplateResult {
        const steps = stepCountOf(entry.progress)
        return html`
            <div class="meta">
                ${steps ? html`<span>${chromeTextf('taskStepCount', steps)}</span>` : nothing}
                <span>${chromeTextf('taskElapsed', { time: formatElapsed(elapsedSeconds(entry, this.now)) })}</span>
                <span class="state state--${entry.progress.state ?? 'running'}">${this.stateLabel(entry)}</span>
            </div>`
    }

    private renderButtons(entry: TaskEntry, inModal: boolean): TemplateResult {
        const p = entry.progress
        const id = p.taskId
        if (!isFinished(p)) {
            return html`
                <div class="buttons">
                    ${inModal && p.backgroundable ? html`
                        <button class="btn" @click="${() => taskStore.moveToBackground(id)}">${chromeText('taskBackground')}</button>` : nothing}
                    ${p.cancellable ? html`
                        <button class="btn" @click="${() => void cancelTask(id)}">${chromeText('cancel')}</button>` : nothing}
                </div>`
        }
        return html`
            <div class="buttons">
                ${(p.resultActions ?? []).map((action, i) => html`
                    <button class="btn ${i === 0 || action.style === 'primary' ? 'btn--primary' : ''}"
                            @click="${() => { runResultAction(id, action); taskStore.dismiss(id) }}">${actionLabelOf(action)}</button>`)}
                ${p.state === 'failed' && p.retryable && entry.origin?.retry ? html`
                    <button class="btn btn--primary" @click="${() => retryTask(id)}">${chromeText('retry')}</button>` : nothing}
                <button class="btn" @click="${() => taskStore.dismiss(id)}">${inModal ? chromeText('close') : chromeText('dismiss')}</button>
            </div>`
    }

    private renderTask(entry: TaskEntry, inModal: boolean): TemplateResult {
        const p = entry.progress
        return html`
            <div class="task task--${p.state ?? 'running'}">
                <div class="task-title" id="${inModal ? 'mateu-task-title' : nothing}">${p.title}</div>
                ${p.text ? html`<div class="task-text">${p.text}</div>` : nothing}
                ${p.state === 'failed' && p.error ? html`<div class="task-error" role="alert">${p.error}</div>` : nothing}
                ${this.renderBar(entry)}
                ${this.renderMeta(entry)}
                ${this.renderButtons(entry, inModal)}
            </div>`
    }

    private renderModal(entry: TaskEntry): TemplateResult {
        return html`
            <div class="backdrop"></div>
            <div class="modal" role="dialog" aria-modal="true" aria-labelledby="mateu-task-title" tabindex="-1">
                ${this.renderTask(entry, true)}
            </div>`
    }

    private renderList(listed: TaskEntry[]): TemplateResult {
        return html`
            <div class="list" role="region" aria-label="${chromeText('tasks')}">
                <div class="list-head">
                    <span class="list-title">${chromeText('tasks')}</span>
                    ${countsOf(this.tasks).finished > 0 ? html`
                        <button class="link" @click="${() => taskStore.clearFinished()}">${chromeText('tasksClearFinished')}</button>` : nothing}
                    <button class="icon" aria-label="${chromeText('close')}" @click="${() => { this.listOpen = false }}">✕</button>
                </div>
                ${listed.length === 0 ? html`<div class="empty">${chromeText('tasksNone')}</div>` : nothing}
                ${listed.map((entry) => this.renderTask(entry, false))}
            </div>`
    }

    render(): TemplateResult {
        const blocking = blockingTask(this.tasks, this.now)
        const listed = listedTasks(this.tasks).filter((e) => e !== blocking)
        const counts = countsOf(this.tasks)
        const showIndicator = listed.length > 0
        return html`
            ${blocking ? this.renderModal(blocking) : nothing}
            ${showIndicator ? html`
                <div class="dock">
                    ${this.listOpen ? this.renderList(listed) : nothing}
                    <button class="indicator ${counts.failed > 0 ? 'indicator--failed' : ''}"
                            aria-expanded="${this.listOpen ? 'true' : 'false'}"
                            aria-label="${counts.running > 0 ? chromeTextf('tasksShow', { count: counts.running }) : chromeText('tasksShowIdle')}"
                            @click="${() => { this.listOpen = !this.listOpen }}">
                        <span class="spinner ${counts.running > 0 ? 'spinner--on' : ''}" aria-hidden="true"></span>
                        <span>${counts.running > 0 ? chromeTextf('tasksRunning', { count: counts.running }) : chromeText('tasks')}</span>
                    </button>
                </div>` : nothing}`
    }

    static styles = css`
        :host { position: static; }
        .backdrop {
            position: fixed; inset: 0; z-index: 1900;
            background: var(--lumo-shade-20pct, rgba(0, 0, 0, 0.25));
        }
        .modal {
            position: fixed; z-index: 1901; top: 50%; left: 50%; transform: translate(-50%, -50%);
            width: min(28rem, calc(100vw - 2rem)); box-sizing: border-box;
            padding: var(--lumo-space-l, 1.5rem);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border-radius: var(--lumo-border-radius-l, 8px);
            box-shadow: var(--lumo-box-shadow-l, 0 8px 32px rgba(0, 0, 0, 0.25));
            outline: none;
        }
        .modal .task-title { font-size: var(--lumo-font-size-l, 1.125rem); }
        .dock {
            position: fixed; z-index: 940;
            left: var(--lumo-space-m, 1rem); bottom: var(--lumo-space-m, 1rem);
            display: flex; flex-direction: column; align-items: flex-start; gap: var(--lumo-space-s, 0.5rem);
        }
        .indicator {
            display: inline-flex; align-items: center; gap: 0.5rem;
            font: inherit; font-size: var(--lumo-font-size-s, 0.875rem);
            padding: 0.45rem 0.85rem; border-radius: 999px; cursor: pointer;
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0, 0, 0, 0.15));
        }
        .indicator--failed { border-color: var(--lumo-error-color, #c62828); }
        .spinner {
            width: 0.85rem; height: 0.85rem; border-radius: 50%;
            border: 2px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
        }
        .spinner--on {
            border-top-color: var(--lumo-primary-color, #1565c0);
            animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .list {
            width: min(24rem, calc(100vw - 2rem)); max-height: min(28rem, 70vh); overflow-y: auto;
            box-sizing: border-box; padding: var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem);
            background: var(--lumo-base-color, #fff); color: var(--lumo-body-text-color, #1a1a1a);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
            border-radius: var(--lumo-border-radius-l, 8px);
            box-shadow: var(--lumo-box-shadow-m, 0 4px 16px rgba(0, 0, 0, 0.2));
        }
        .list-head { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0; }
        .list-title { flex: 1; font-weight: 600; }
        .list .task { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08)); padding: 0.6rem 0; }
        .empty { padding: 0.75rem 0; color: var(--lumo-secondary-text-color, #5f6b7a); }
        .task { display: flex; flex-direction: column; gap: 0.35rem; }
        .task-title { font-weight: 600; }
        .task-text { font-size: var(--lumo-font-size-s, 0.875rem); }
        .task-error { font-size: var(--lumo-font-size-s, 0.875rem); color: var(--lumo-error-text-color, #c62828); }
        .bar {
            position: relative; height: 0.4rem; overflow: hidden; border-radius: 999px;
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        .bar-fill {
            height: 100%; width: 0; border-radius: inherit;
            background: var(--lumo-primary-color, #1565c0); transition: width 0.3s ease;
        }
        .bar--done .bar-fill { background: var(--lumo-success-color, #2e7d32); }
        .bar--failed .bar-fill { background: var(--lumo-error-color, #c62828); }
        .bar--cancelled .bar-fill { background: var(--lumo-contrast-50pct, #888); }
        .bar--indeterminate .bar-fill { width: 35%; animation: slide 1.4s ease-in-out infinite; }
        @keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }
        @media (prefers-reduced-motion: reduce) {
            .bar--indeterminate .bar-fill, .spinner--on { animation: none; }
        }
        .meta {
            display: flex; flex-wrap: wrap; gap: 0.75rem;
            font-size: var(--lumo-font-size-xs, 0.75rem); color: var(--lumo-secondary-text-color, #5f6b7a);
        }
        .state { margin-left: auto; }
        .state--failed { color: var(--lumo-error-text-color, #c62828); }
        .state--done { color: var(--lumo-success-text-color, #2e7d32); }
        .buttons { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 0.5rem; margin-top: 0.25rem; }
        .btn, .link, .icon {
            font: inherit; font-size: var(--lumo-font-size-s, 0.875rem); cursor: pointer;
            border-radius: var(--lumo-border-radius-m, 4px);
        }
        .btn {
            padding: 0.3rem 0.8rem; background: transparent;
            color: var(--lumo-primary-text-color, #1565c0);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.2));
        }
        .btn--primary {
            background: var(--lumo-primary-color, #1565c0); color: var(--lumo-primary-contrast-color, #fff);
            border-color: transparent;
        }
        .link { background: none; border: none; color: var(--lumo-primary-text-color, #1565c0); padding: 0.2rem; }
        .icon { background: none; border: none; color: inherit; padding: 0.2rem 0.4rem; }
        ${activatableFocusStyles}
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-task-center': MateuTaskCenter
    }
}
