import { ifDefined } from 'lit/directives/if-defined.js'
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import OrgNode from "@mateu/shared/apiClients/dtos/componentmetadata/OrgNode";
import { onActivate, buttonRole, tabStop } from '@infra/a11y/activate.ts';
import { activatableFocusStyles } from '@infra/a11y/focusStyles.ts';
import { announce } from '@infra/a11y/announcer.ts';
import { chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts';
import { isImageAddress } from "./avatarAddress";
import { focusView, initialFocus, initialsOf, isFocusDisplay, MAX_VISIBLE_ANCESTORS, visibleAncestors } from '@infra/ui/orgChartModel.ts';

/**
 * Dependency-free top-down org chart: each node is a card; its children sit in a row below,
 * connected by CSS pseudo-element lines (classic org-chart connectors). A node with an actionId is
 * clickable and dispatches the standard action-requested event. DS-neutral, dark-mode aware,
 * horizontally scrollable.
 *
 * With `display="focus"` it shows ONE node at a time instead (like Redwood's hierarchy viewer): its
 * chain of ancestors above (a long chain collapsed behind a "N more levels" toggle), the node as a
 * prominent card, and its children as a grid below. Clicking an ancestor or a child moves the focus
 * there client-side (the whole tree is on the wire); a node's action runs from its name.
 */
@customElement('mateu-org-chart')
export class MateuOrgChart extends LitElement {

    @property({ attribute: false })
    root: OrgNode | undefined

    /** "tree" (default; null reads as tree) | "focus". */
    @property({ attribute: false })
    display: string | undefined

    /** Id of the node a focused chart opens on (null/unknown: the root). Not `focus`: that is HTMLElement's method. */
    @property({ attribute: false })
    focusId: string | undefined

    @state()
    private focusedNode: OrgNode | undefined

    @state()
    private ancestorsExpanded = false

    /** Set when the user moved the focus: the new focused card takes the keyboard focus after rendering. */
    private moveKeyboardFocus = false

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

        /* ---- display = focus ---- */
        .focus-view {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: .5rem 1rem 1rem;
            box-sizing: border-box;
            width: 100%;
        }
        .chain {
            list-style: none;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
        }
        .chain > li, .focused-wrap.has-children {
            position: relative;
            display: flex;
            justify-content: center;
            width: 100%;
            padding: 0 0 1.1rem;
        }
        /* the vertical line joining each level to the next one */
        .chain > li::after, .focused-wrap.has-children::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 50%;
            height: 1.1rem;
            width: 2px;
            transform: translateX(-1px);
            background: var(--lumo-contrast-20pct, #cbd5e1);
        }
        .focused-wrap { display: flex; justify-content: center; width: 100%; }
        .levels {
            font: inherit;
            font-size: var(--lumo-font-size-xs, .75rem);
            color: var(--lumo-primary-text-color, var(--lumo-primary-color, #1a73e8));
            background: var(--lumo-base-color, #fff);
            border: 1px dashed var(--lumo-contrast-30pct, #94a3b8);
            border-radius: 999px;
            padding: .2rem .75rem;
            cursor: pointer;
        }
        .levels:hover { border-style: solid; }
        .card {
            position: relative;
            display: flex;
            align-items: center;
            gap: .6rem;
            box-sizing: border-box;
            padding: .5rem .75rem;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            border-left: var(--mateu-org-accent-width, 3px) solid var(--mateu-org-accent, var(--lumo-primary-color, #1a73e8));
            border-radius: var(--lumo-border-radius-m, 8px);
            background: var(--lumo-base-color, #fff);
            box-shadow: var(--lumo-box-shadow-xs, 0 1px 2px rgba(0,0,0,.05));
            text-align: left;
            min-width: 0;
        }
        .card.ancestor { width: min(100%, 20rem); }
        .card.child { width: 100%; height: 100%; }
        .card.ancestor:hover, .card.child:hover { border-color: var(--lumo-primary-color, #1a73e8); }
        .card .text { display: flex; flex-direction: column; min-width: 0; }
        .card .title, .card .subtitle, .card .count { overflow: hidden; text-overflow: ellipsis; }
        .card .count { color: var(--lumo-tertiary-text-color, #999); font-size: var(--lumo-font-size-xxs, .68rem); }
        .card.focused {
            flex-direction: column;
            text-align: center;
            gap: .3rem;
            width: min(100%, 22rem);
            padding: 1rem 1.25rem;
            border-left-width: 1px;
            border-top: var(--mateu-org-focus-accent-width, 4px) solid var(--mateu-org-accent, var(--lumo-primary-color, #1a73e8));
            box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.08));
        }
        .card.focused:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #3b5bdb);
            outline-offset: 2px;
        }
        .card.focused .text { align-items: center; }
        .card.focused .title { font-size: var(--lumo-font-size-l, 1.125rem); }
        .card.focused .subtitle { font-size: var(--lumo-font-size-s, .875rem); }
        .card .avatar { flex: none; font-size: var(--lumo-font-size-xs, .75rem); font-weight: 600; color: var(--lumo-secondary-text-color, #666); }
        .card.focused .avatar { width: 3.5rem; height: 3.5rem; font-size: var(--lumo-font-size-xl, 1.25rem); }
        /* the whole card moves the focus: a native button stretched over it */
        .hit {
            position: absolute;
            inset: 0;
            margin: 0;
            padding: 0;
            border: 0;
            background: transparent;
            border-radius: inherit;
            cursor: pointer;
        }
        .hit:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #3b5bdb);
            outline-offset: 2px;
        }
        /* the name runs the node's action: a link-style button above the stretched one */
        .title.link {
            position: relative;
            z-index: 1;
            font: inherit;
            font-weight: 600;
            text-align: inherit;
            padding: 0;
            border: 0;
            background: none;
            color: var(--lumo-primary-text-color, var(--lumo-primary-color, #1a73e8));
            cursor: pointer;
            max-width: 100%;
        }
        .card.focused .title.link { font-size: var(--lumo-font-size-l, 1.125rem); }
        .title.link:hover { text-decoration: underline; }
        .title.link:focus-visible {
            outline: 2px solid var(--lumo-primary-color, #3b5bdb);
            outline-offset: 2px;
            border-radius: var(--lumo-border-radius-s, 4px);
        }
        .reports { width: 100%; margin-top: .25rem; }
        .reports-heading {
            font-weight: 600;
            color: var(--lumo-secondary-text-color, #666);
            font-size: var(--lumo-font-size-s, .875rem);
            margin: 0 0 .5rem;
            text-align: center;
        }
        .grid {
            list-style: none;
            margin: 0;
            padding: 0;
            display: grid;
            gap: .6rem;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 13rem), 1fr));
        }
    
        ${activatableFocusStyles}
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
        const isImg = isImageAddress(avatar)
        return html`
            <li>
                <div role=${ifDefined(buttonRole(!!node.actionId))} tabindex=${ifDefined(tabStop(!!node.actionId))} class="node ${node.actionId ? 'clickable' : ''}"
                     style="${node.color ? `--mateu-org-accent: ${node.color};` : ''}"
                     @click="${() => this.clickNode(node)}" @keydown="${onActivate(() => this.clickNode(node))}">
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

    protected willUpdate(changed: Map<PropertyKey, unknown>) {
        // new data from the server (a new root or focus): start over on the requested node
        if (changed.has('root') || changed.has('focusId')) {
            this.focusedNode = initialFocus(this.root, this.focusId)
            this.ancestorsExpanded = false
        }
    }

    protected updated() {
        if (this.moveKeyboardFocus) {
            this.moveKeyboardFocus = false
            this.renderRoot.querySelector<HTMLElement>('.card.focused')?.focus()
        }
    }

    private moveFocus(node: OrgNode) {
        this.focusedNode = node
        this.ancestorsExpanded = false
        this.moveKeyboardFocus = true
        announce(chromeTextf('orgFocused', { name: node.title ?? '' }))
    }

    private renderAvatar(node: OrgNode) {
        const avatar = node.avatar
        if (isImageAddress(avatar)) {
            return html`<span class="avatar"><img src="${avatar}" alt=""></span>`
        }
        return html`<span class="avatar" aria-hidden="true">${avatar || initialsOf(node.title)}</span>`
    }

    private renderTitle(node: OrgNode) {
        return node.actionId
            ? html`<button type="button" class="title link" @click="${() => this.clickNode(node)}">${node.title}</button>`
            : html`<span class="title">${node.title}</span>`
    }

    private accent(node: OrgNode) {
        return node.color ? `--mateu-org-accent: ${node.color};` : ''
    }

    /** An ancestor or a child: the card moves the focus to it, its name runs its action. */
    private renderCard(node: OrgNode, kind: 'ancestor' | 'child') {
        const label = [node.title, node.subtitle].filter(Boolean).join(', ')
        const reports = node.children?.length ?? 0
        return html`
            <div class="card ${kind}" style="${this.accent(node)}">
                <button type="button" class="hit" aria-label="${chromeTextf('orgFocusOn', { name: label })}"
                        @click="${() => this.moveFocus(node)}"></button>
                ${this.renderAvatar(node)}
                <span class="text">
                    ${this.renderTitle(node)}
                    ${node.subtitle ? html`<span class="subtitle">${node.subtitle}</span>` : nothing}
                    ${kind === 'child' && reports ? html`<span class="count">${chromeTextf('orgReportsCount', { count: reports })}</span>` : nothing}
                </span>
            </div>
        `
    }

    private renderFocus(): TemplateResult {
        const view = focusView(this.root, this.focusedNode)!
        const { hidden, visible } = visibleAncestors(view.ancestors, this.ancestorsExpanded)
        const collapsible = view.ancestors.length > MAX_VISIBLE_ANCESTORS
        const node = view.node
        return html`
            <section class="focus-view" aria-label="${chromeText('orgHierarchy')}">
                ${view.ancestors.length ? html`
                    <ol class="chain">
                        ${collapsible ? html`
                            <li>
                                <button type="button" class="levels" aria-expanded="${this.ancestorsExpanded ? 'true' : 'false'}"
                                        @click="${() => { this.ancestorsExpanded = !this.ancestorsExpanded }}">
                                    ${this.ancestorsExpanded ? chromeText('orgFewerLevels') : chromeTextf('orgMoreLevels', { count: hidden })}
                                </button>
                            </li>` : nothing}
                        ${visible.map((a) => html`<li>${this.renderCard(a, 'ancestor')}</li>`)}
                    </ol>` : nothing}
                <div class="focused-wrap ${view.children.length ? 'has-children' : ''}">
                    <div class="card focused" tabindex="-1" aria-current="true" style="${this.accent(node)}">
                        ${this.renderAvatar(node)}
                        <span class="text">
                            ${this.renderTitle(node)}
                            ${node.subtitle ? html`<span class="subtitle">${node.subtitle}</span>` : nothing}
                        </span>
                    </div>
                </div>
                ${view.children.length ? html`
                    <div class="reports">
                        <div class="reports-heading" id="reports-heading">${chromeTextf('orgReports', { count: view.children.length })}</div>
                        <ul class="grid" aria-labelledby="reports-heading">
                            ${view.children.map((c) => html`<li>${this.renderCard(c, 'child')}</li>`)}
                        </ul>
                    </div>` : nothing}
            </section>
        `
    }

    render() {
        if (!this.root) {
            return html``
        }
        if (isFocusDisplay(this.display)) {
            return this.renderFocus()
        }
        return html`<div class="tree"><ul>${this.renderNode(this.root)}</ul></div>`
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-org-chart": MateuOrgChart
    }
}
