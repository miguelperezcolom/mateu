import { css, html, LitElement, nothing, TemplateResult } from "lit";
import { customElement, property } from 'lit/decorators.js';
import OrgNode from "@mateu/shared/apiClients/dtos/componentmetadata/OrgNode";

/**
 * Dependency-free top-down org chart: each node is a card; its children sit in a row below,
 * connected by CSS pseudo-element lines (classic org-chart connectors). A node with an actionId is
 * clickable and dispatches the standard action-requested event. DS-neutral, dark-mode aware,
 * horizontally scrollable.
 */
@customElement('mateu-org-chart')
export class MateuOrgChart extends LitElement {

    @property({ attribute: false })
    root: OrgNode | undefined

    static styles = css`
        :host {
            display: block;
            width: 100%;
            overflow-x: auto;
            font-size: var(--lumo-font-size-s, .875rem);
        }
        .tree {
            display: inline-flex;
            padding: .5rem 1rem 1rem;
            min-width: 100%;
            justify-content: center;
        }
        ul {
            display: flex;
            padding-top: 1.1rem;
            position: relative;
            list-style: none;
            margin: 0;
        }
        li {
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            padding: 1.1rem .4rem 0;
        }
        /* vertical line down from a parent */
        li::before {
            content: '';
            position: absolute;
            top: 0;
            height: 1.1rem;
            width: 2px;
            background: var(--lumo-contrast-20pct, #cbd5e1);
        }
        /* horizontal connectors between siblings */
        li::after {
            content: '';
            position: absolute;
            top: 0;
            height: 2px;
            width: 50%;
            right: 50%;
            background: var(--lumo-contrast-20pct, #cbd5e1);
        }
        li:only-child::before, li:only-child::after { display: none; }
        li:first-child::after { display: none; }
        li:last-child::before {
            /* the last child needs the connector on its left */
        }
        ul > li:not(:only-child)::after { left: 50%; right: auto; }
        ul > li:not(:only-child):last-child::after { display: none; }
        ul > li:not(:only-child):first-child::before { display: none; }
        /* the connecting bar spanning the children row */
        ul::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            width: 0;
        }
        .node {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: .1rem;
            padding: .5rem .75rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-top: 3px solid var(--mateu-org-accent, var(--lumo-primary-color, #1a73e8));
            border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-base-color, #fff);
            min-width: 7rem;
            box-shadow: 0 1px 2px rgba(0,0,0,.05);
            text-align: center;
        }
        .node.clickable { cursor: pointer; }
        .node.clickable:hover { border-color: var(--lumo-primary-color, #1a73e8); }
        .avatar {
            width: 1.7rem;
            height: 1.7rem;
            border-radius: 50%;
            background: var(--lumo-contrast-10pct, #eee);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .9rem;
            overflow: hidden;
        }
        .avatar img { width: 100%; height: 100%; object-fit: cover; }
        .title { font-weight: 600; color: var(--lumo-body-text-color, #222); }
        .subtitle { color: var(--lumo-secondary-text-color, #888); font-size: var(--lumo-font-size-xs, .72rem); }
        @media (prefers-color-scheme: dark) {
            .node { background: var(--lumo-contrast-5pct, #2a2a2a); }
        }
    `

    private clickNode(node: OrgNode) {
        if (!node.actionId) {
            return
        }
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: { actionId: node.actionId, parameters: { _clickedNode: node } },
            bubbles: true,
            composed: true
        }))
    }

    private renderNode(node: OrgNode): TemplateResult {
        const avatar = node.avatar
        const isImg = avatar && (avatar.startsWith('http') || avatar.startsWith('data:'))
        return html`
            <li>
                <div class="node ${node.actionId ? 'clickable' : ''}"
                     style="${node.color ? `--mateu-org-accent: ${node.color};` : ''}"
                     @click="${() => this.clickNode(node)}">
                    ${avatar ? html`<span class="avatar">${isImg ? html`<img src="${avatar}" alt="">` : avatar}</span>` : nothing}
                    <span class="title">${node.title}</span>
                    ${node.subtitle ? html`<span class="subtitle">${node.subtitle}</span>` : nothing}
                </div>
                ${node.children && node.children.length
                    ? html`<ul>${node.children.map(child => this.renderNode(child))}</ul>`
                    : nothing}
            </li>
        `
    }

    render() {
        if (!this.root) {
            return html``
        }
        return html`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-org-chart": MateuOrgChart
    }
}
