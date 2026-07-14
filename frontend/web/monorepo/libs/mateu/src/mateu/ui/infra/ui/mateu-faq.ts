import { css, html, LitElement } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import FaqItem from "@mateu/shared/apiClients/dtos/componentmetadata/FaqItem";

/**
 * Dependency-free FAQ accordion: click a question to expand/collapse its answer. Items marked `open`
 * start expanded. Open/closed state is local (no server round-trip). DS-neutral, dark-mode aware.
 */
@customElement('mateu-faq')
export class MateuFaq extends LitElement {

    @property({ type: Array }) items: FaqItem[] = []
    @state() private openSet = new Set<number>()

    private seeded = false

    static styles = css`
        :host { display: block; width: 100%; font-size: var(--lumo-font-size-m, 1rem); }
        .list {
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            overflow: hidden;
        }
        .item + .item { border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08)); }
        .q {
            display: flex; align-items: center; justify-content: space-between; gap: 1rem;
            padding: .9rem 1.1rem; cursor: pointer; font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            background: var(--lumo-base-color, #fff);
        }
        .q:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.02)); }
        .chevron { transition: transform .2s; color: var(--lumo-secondary-text-color, #888); }
        .item.open .chevron { transform: rotate(90deg); }
        .a {
            padding: 0 1.1rem 1rem;
            color: var(--lumo-secondary-text-color, #555);
            line-height: 1.55;
        }
        @media (prefers-color-scheme: dark) { .q { background: var(--lumo-contrast-5pct, #2a2a2a); } }
    `

    private seed() {
        if (this.seeded) {
            return
        }
        this.seeded = true
        this.items.forEach((it, i) => { if (it.open) this.openSet.add(i) })
    }

    private toggle(i: number) {
        if (this.openSet.has(i)) {
            this.openSet.delete(i)
        } else {
            this.openSet.add(i)
        }
        this.requestUpdate()
    }

    render() {
        this.seed()
        return html`
            <div class="list">
                ${this.items.map((item, i) => {
                    const open = this.openSet.has(i)
                    return html`
                        <div class="item ${open ? 'open' : ''}">
                            <div class="q" @click="${() => this.toggle(i)}">
                                <span>${item.question}</span>
                                <span class="chevron">›</span>
                            </div>
                            ${open ? html`<div class="a">${item.answer}</div>` : ''}
                        </div>
                    `
                })}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-faq": MateuFaq
    }
}
