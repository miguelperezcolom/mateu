import { css, html, LitElement, nothing, PropertyValues } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import QueueGroup from "@mateu/shared/apiClients/dtos/componentmetadata/QueueGroup";
import { chipStyles } from "@infra/ui/uxShared.ts";

/**
 * Grouped work-queue rail (e.g. today's arrivals/departures): groups with a small-caps label and
 * cards showing title, muted caption and badges. Clicking a card selects it locally (accent border
 * + tint, seeded from the wire `selected` flags) and dispatches the component-level actionId with
 * the item id. DS-neutral, dark-mode aware.
 */
@customElement('mateu-task-queue')
export class MateuTaskQueue extends LitElement {

    @property() actionId: string | undefined
    @property({ type: Array }) groups: QueueGroup[] = []

    @state() private selectedId: string | undefined

    static styles = [chipStyles, css`
        :host { display: block; width: 100%; }
        .rail { display: flex; flex-direction: column; gap: var(--lumo-space-m, 1rem); }
        .group { display: flex; flex-direction: column; gap: .45rem; }
        .group-label {
            font-size: var(--lumo-font-size-xxs, .7rem); font-weight: 600; letter-spacing: .05em;
            text-transform: uppercase; color: var(--lumo-tertiary-text-color, #999);
        }
        .card {
            display: flex; flex-direction: column; gap: .25rem;
            padding: .6rem .8rem; cursor: pointer;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-radius: var(--lumo-border-radius-l, 12px);
            background: var(--lumo-base-color, transparent);
            transition: border-color .15s ease, background .15s ease;
        }
        .card:hover { border-color: var(--lumo-contrast-30pct, rgba(0,0,0,.25)); }
        .card.selected {
            border-color: var(--lumo-primary-color, #1a73e8);
            background: var(--lumo-primary-color-10pct, rgba(26,115,232,.08));
        }
        .title {
            font-size: var(--lumo-font-size-s, .875rem); font-weight: 600;
            color: var(--lumo-body-text-color, #222);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .meta { display: flex; align-items: center; gap: .45rem; flex-wrap: wrap; }
        .caption {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-secondary-text-color, #888);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
    `]

    protected willUpdate(changed: PropertyValues) {
        if (changed.has('groups')) {
            this.selectedId = this.groups
                .flatMap(group => group.items ?? [])
                .find(item => item.selected)?.id
        }
    }

    private select(id: string | undefined) {
        this.selectedId = id
        if (!this.actionId) return
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: this.actionId, parameters: { _item: id } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="rail">
                ${this.groups.map(group => html`
                    <div class="group">
                        ${group.label ? html`<span class="group-label">${group.label}</span>` : nothing}
                        ${(group.items ?? []).map(item => html`
                            <div class="card ${item.id === this.selectedId ? 'selected' : ''}"
                                 @click="${() => this.select(item.id)}">
                                <span class="title">${item.title}</span>
                                <div class="meta">
                                    ${item.caption ? html`<span class="caption">${item.caption}</span>` : nothing}
                                    ${(item.badges ?? []).map(badge => html`<span class="chip ${badge.color ?? ''}">${badge.label}</span>`)}
                                </div>
                            </div>
                        `)}
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-task-queue": MateuTaskQueue
    }
}
