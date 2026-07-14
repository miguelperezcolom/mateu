import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import ChecklistItem from "@mateu/shared/apiClients/dtos/componentmetadata/ChecklistItem";

/**
 * Dependency-free checklist with a progress bar: a header shows how many of N items are done; each
 * row is a checkbox + label. Toggling flips the box locally and, if the item has an actionId,
 * dispatches the standard action-requested event so the server can persist it. DS-neutral,
 * dark-mode aware.
 */
@customElement('mateu-checklist')
export class MateuChecklist extends LitElement {

    @property() heading: string | undefined
    @property({ type: Array }) items: ChecklistItem[] = []
    @state() private localDone = new Map<number, boolean>()

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-s, .875rem); }
        .head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: .5rem; }
        .title { font-weight: 700; color: var(--lumo-body-text-color, #222); }
        .count { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .75rem); }
        .bar { height: 6px; border-radius: 999px; background: var(--lumo-contrast-10pct, #e5e7eb); overflow: hidden; margin-bottom: .75rem; }
        .fill { height: 100%; background: var(--lumo-success-color, #12b76a); border-radius: 999px; transition: width .2s; }
        .item { display: flex; align-items: center; gap: .6rem; padding: .35rem 0; cursor: pointer; }
        .box {
            width: 1.15rem; height: 1.15rem; border-radius: 5px; flex: 0 0 auto;
            border: 2px solid var(--lumo-contrast-30pct, #cbd5e1);
            display: flex; align-items: center; justify-content: center; color: #fff; font-size: .8rem;
        }
        .item.done .box { background: var(--lumo-success-color, #12b76a); border-color: var(--lumo-success-color, #12b76a); }
        .label { color: var(--lumo-body-text-color, #333); }
        .item.done .label { color: var(--lumo-secondary-text-color, #999); text-decoration: line-through; }
    `

    private isDone(item: ChecklistItem, i: number): boolean {
        return this.localDone.has(i) ? !!this.localDone.get(i) : !!item.done
    }

    private toggle(item: ChecklistItem, i: number) {
        const next = !this.isDone(item, i)
        this.localDone.set(i, next)
        this.requestUpdate()
        if (item.actionId) {
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: item.actionId, parameters: { _item: item, _done: next } },
                bubbles: true,
                composed: true
            }))
        }
    }

    render() {
        const total = this.items.length
        const done = this.items.filter((it, i) => this.isDone(it, i)).length
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        return html`
            <div class="head">
                ${this.heading ? html`<span class="title">${this.heading}</span>` : html`<span></span>`}
                <span class="count">${done} / ${total}</span>
            </div>
            <div class="bar"><div class="fill" style="width: ${pct}%;"></div></div>
            ${this.items.map((item, i) => {
                const d = this.isDone(item, i)
                return html`
                    <div class="item ${d ? 'done' : ''}" @click="${() => this.toggle(item, i)}">
                        <span class="box">${d ? '✓' : nothing}</span>
                        <span class="label">${item.label}</span>
                    </div>
                `
            })}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-checklist": MateuChecklist
    }
}
