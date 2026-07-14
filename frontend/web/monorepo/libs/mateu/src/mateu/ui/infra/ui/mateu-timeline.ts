import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from 'lit/decorators.js';
import TimelineItem from "@mateu/shared/apiClients/dtos/componentmetadata/TimelineItem";

/**
 * Dependency-free vertical timeline / activity feed: a rail of dots down the left, each entry with a
 * title, optional description, timestamp label and icon. An entry with an actionId is clickable and
 * dispatches the standard action-requested event. Design-system neutral, dark-mode aware.
 */
@customElement('mateu-timeline')
export class MateuTimeline extends LitElement {

    @property({ type: Array })
    items: TimelineItem[] = []

    static styles = css`
        :host {
            display: block;
            width: 100%;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .feed {
            display: flex;
            flex-direction: column;
        }
        .item {
            display: grid;
            grid-template-columns: 1.6rem 1fr;
            gap: .6rem;
            padding-bottom: .1rem;
        }
        .rail {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .dot {
            width: 1.6rem;
            height: 1.6rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .8rem;
            background: var(--mateu-timeline-dot, var(--lumo-primary-color, #1a73e8));
            color: #fff;
            flex: 0 0 auto;
        }
        .line {
            flex: 1 1 auto;
            width: 2px;
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            margin: .15rem 0;
            min-height: .5rem;
        }
        .body {
            padding-bottom: 1rem;
        }
        .item:last-child .line {
            display: none;
        }
        .head {
            display: flex;
            align-items: baseline;
            gap: .5rem;
            flex-wrap: wrap;
        }
        .title {
            font-weight: 600;
            color: var(--lumo-body-text-color, #222);
        }
        .clickable .title {
            cursor: pointer;
        }
        .clickable:hover .title {
            color: var(--lumo-primary-color, #1a73e8);
            text-decoration: underline;
        }
        .time {
            color: var(--lumo-secondary-text-color, #888);
            font-size: var(--lumo-font-size-xs, .75rem);
        }
        .desc {
            color: var(--lumo-secondary-text-color, #666);
            margin-top: .15rem;
        }
    `

    private clickItem(item: TimelineItem) {
        if (!item.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: item.actionId, parameters: { _clickedItem: item } },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        return html`
            <div class="feed">
                ${this.items.map(item => html`
                    <div class="item ${item.actionId ? 'clickable' : ''}">
                        <div class="rail">
                            <div class="dot" style="${item.color ? `--mateu-timeline-dot: ${item.color};` : ''}">${item.icon ?? ''}</div>
                            <div class="line"></div>
                        </div>
                        <div class="body" @click="${() => this.clickItem(item)}">
                            <div class="head">
                                <span class="title">${item.title}</span>
                                ${item.timestamp ? html`<span class="time">${item.timestamp}</span>` : nothing}
                            </div>
                            ${item.description ? html`<div class="desc">${item.description}</div>` : nothing}
                        </div>
                    </div>
                `)}
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-timeline": MateuTimeline
    }
}
