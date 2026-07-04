import { css, html, LitElement } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import FoldoutPanelInfo from "@mateu/shared/apiClients/dtos/componentmetadata/FoldoutPanelInfo";

/**
 * Redwood-style foldout: a fixed overview panel on the left plus lateral fold-out panels.
 * Closed panels render as a narrow vertical strip with the rotated title; clicking folds them
 * out. Open panels sit side by side and the row scrolls horizontally when it overflows.
 * Content arrives through light-DOM slots: slot="overview" and slot="panel-N".
 */
@customElement('mateu-foldout')
export class MateuFoldout extends LitElement {

    @property({ type: Array })
    panels: FoldoutPanelInfo[] = []

    @state()
    private openPanels: Set<number> = new Set()

    private initialized = false

    protected willUpdate() {
        if (!this.initialized && this.panels.length) {
            this.openPanels = new Set(this.panels.map((p, i) => p.open ? i : -1).filter(i => i >= 0))
            this.initialized = true
        }
    }

    private toggle(index: number) {
        const next = new Set(this.openPanels)
        if (next.has(index)) {
            next.delete(index)
        } else {
            next.add(index)
        }
        this.openPanels = next
    }

    static styles = css`
        :host {
            display: flex;
            gap: var(--lumo-space-m, 1rem);
            align-items: stretch;
            min-height: 24rem;
        }
        .overview {
            flex: 0 0 20rem;
            min-width: 0;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: var(--lumo-space-m, 1rem);
            box-sizing: border-box;
            overflow: auto;
        }
        .rail {
            display: flex;
            gap: var(--lumo-space-s, .5rem);
            flex: 1;
            min-width: 0;
            overflow-x: auto;
            align-items: stretch;
        }
        .panel {
            flex: 1 1 22rem;
            min-width: 18rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            padding: var(--lumo-space-m, 1rem);
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            gap: .5rem;
            overflow: auto;
        }
        .panel-header {
            display: flex;
            align-items: baseline;
            justify-content: space-between;
            gap: .5rem;
        }
        .panel-header h3 {
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
        }
        .panel-header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
        }
        .strip {
            flex: 0 0 2.75rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: var(--lumo-space-s, .5rem) 0;
            gap: .5rem;
        }
        .strip:hover {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .strip span {
            writing-mode: vertical-rl;
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #666);
            white-space: nowrap;
        }
        button.fold {
            border: none;
            background: none;
            cursor: pointer;
            color: var(--lumo-secondary-text-color, #666);
            font-size: 1rem;
            padding: 0;
            line-height: 1;
        }
    `

    render() {
        return html`
            <div class="overview" part="overview">
                <slot name="overview"></slot>
            </div>
            <div class="rail" part="rail">
                ${this.panels.map((panel, index) => this.openPanels.has(index) ? html`
                    <div class="panel" part="panel">
                        <div class="panel-header">
                            <div>
                                <h3>${panel.title}</h3>
                                ${panel.subtitle ? html`<div class="subtitle">${panel.subtitle}</div>` : ''}
                            </div>
                            <button class="fold" title="Fold" @click="${() => this.toggle(index)}">⟨</button>
                        </div>
                        <div style="flex: 1; min-height: 0;">
                            <slot name="panel-${index}"></slot>
                        </div>
                    </div>
                ` : html`
                    <div class="strip" role="button" title="${panel.title}" @click="${() => this.toggle(index)}">
                        <button class="fold" tabindex="-1">⟩</button>
                        <span>${panel.title}</span>
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-foldout": MateuFoldout
    }
}
