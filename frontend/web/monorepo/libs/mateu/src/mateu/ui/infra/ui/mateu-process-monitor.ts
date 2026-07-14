import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import ProcessItem from "@mateu/shared/apiClients/dtos/componentmetadata/ProcessItem";

/**
 * Monitored automation processes with health + fix action: a bordered row list where each process
 * shows a status dot (ok/warning/error), its name with the involved systems joined below, OK /
 * warnings / errors counters (the last two only when > 0) and an optional warning-styled button
 * dispatching the item's actionId. DS-neutral, dark-mode aware.
 */
@customElement('mateu-process-monitor')
export class MateuProcessMonitor extends LitElement {

    @property({ type: Array }) items: ProcessItem[] = []

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .row { display: flex; align-items: center; gap: .8rem; padding: .7rem .9rem; }
        .row + .row { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.06)); }
        .dot { width: .55rem; height: .55rem; border-radius: 50%; flex: 0 0 auto; }
        .dot.ok { background: var(--lumo-success-color, #12b76a); }
        .dot.warning { background: var(--lumo-warning-color, #f59e0b); }
        .dot.error { background: var(--lumo-error-color, #e11d48); }
        .body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: .1rem; }
        .name {
            font-weight: 500; color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .systems {
            font-size: var(--lumo-font-size-xs, .75rem); color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .counters { display: flex; align-items: center; gap: .8rem; flex: 0 0 auto; }
        .counter { font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600; white-space: nowrap; font-variant-numeric: tabular-nums; }
        .counter.ok { color: var(--lumo-success-text-color, #1a7f37); }
        .counter.warning { color: var(--lumo-warning-text-color, #b45309); }
        .counter.error { color: var(--lumo-error-text-color, #c5221f); }
        button {
            font: inherit; font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600;
            padding: .25rem .7rem; border-radius: var(--lumo-border-radius-m, 6px);
            border: 1px solid var(--lumo-warning-text-color, #b45309);
            background: var(--lumo-warning-color-10pct, rgba(245,158,11,.12));
            color: var(--lumo-warning-text-color, #b45309);
            cursor: pointer; white-space: nowrap; flex: 0 0 auto;
        }
        button:hover { background: var(--lumo-warning-color-10pct, rgba(245,158,11,.25)); filter: brightness(.97); }
    `

    private runAction(item: ProcessItem) {
        if (!item.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: item.actionId, parameters: {} },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="list">
                ${this.items.map(item => html`
                    <div class="row">
                        <span class="dot ${item.status ?? 'ok'}"></span>
                        <div class="body">
                            <span class="name">${item.name}</span>
                            ${item.systems?.length ? html`<span class="systems">${item.systems.join(' · ')}</span>` : nothing}
                        </div>
                        <div class="counters">
                            <span class="counter ok">✓ ${item.ok ?? 0} OK</span>
                            ${(item.warnings ?? 0) > 0 ? html`<span class="counter warning">⚠ ${item.warnings} warnings</span>` : nothing}
                            ${(item.errors ?? 0) > 0 ? html`<span class="counter error">⛔ ${item.errors} errors</span>` : nothing}
                        </div>
                        ${item.actionLabel && item.actionId
                            ? html`<button @click="${() => this.runAction(item)}">${item.actionLabel}</button>`
                            : nothing}
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-process-monitor": MateuProcessMonitor
    }
}
