import {css, html, nothing, TemplateResult} from "lit";
import {customElement, state} from 'lit/decorators.js';
import Drawer from "@mateu/shared/apiClients/dtos/componentmetadata/Drawer";
import {renderComponent} from "@infra/ui/renderers/renderComponent.ts";
import ComponentElement from "@infra/ui/ComponentElement.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import { interpolateNested } from "@infra/ui/interpolation.ts";

@customElement('mateu-drawer')
export class MateuDrawer extends ComponentElement {

    // Starts closed and flips to open on the next frame so the slide-in transition runs.
    @state()
    opened = false

    // How many times the user pressed Maximize — each step bumps the drawer one standard size up.
    @state()
    private maximizeSteps = 0

    // Bottom drawer: collapsed to its header strip (toggled by the handle when `collapsible`).
    @state()
    private collapsed = false

    // Standard Redwood drawer widths (s→m→l→xl). An explicit `width` overrides these.
    private static readonly SIZE_LADDER = ['s', 'm', 'l', 'xl'] as const
    private static readonly SIZE_WIDTHS: Record<string, string> = {
        s: '464px', m: '648px', l: '968px', xl: '90vw',
    }

    // The effective width: explicit `width` wins; otherwise the named `size` bumped up by any
    // Maximize presses; falls back to the CSS default when neither is set.
    private effectiveWidth(metadata: Drawer): string | undefined {
        if (metadata.width) return metadata.width
        if (!metadata.size) return undefined
        const ladder = MateuDrawer.SIZE_LADDER
        const start = Math.max(0, ladder.indexOf(metadata.size))
        const idx = Math.min(ladder.length - 1, start + this.maximizeSteps)
        return MateuDrawer.SIZE_WIDTHS[ladder[idx]]
    }

    private canMaximize(metadata: Drawer): boolean {
        if (!metadata.maximizable) return false
        const ladder = MateuDrawer.SIZE_LADDER
        const start = Math.max(0, ladder.indexOf(metadata.size ?? 'm'))
        return start + this.maximizeSteps < ladder.length - 1
    }

    firstUpdated() {
        requestAnimationFrame(() => this.opened = true)
    }

    close = () => {
        this.opened = false
        // let the slide-out transition finish before detaching
        setTimeout(() => this.parentElement?.removeChild(this), 300)
    }

    applyFragment(fragment: UIFragment) {
        super.applyFragment(fragment)
        const millis = fragment.state?.['_closeAfterMillis'] as number | undefined
        if (millis) {
            setTimeout(() => this.close(), millis)
        }
    }

    updated(_changedProperties: any) {
        super.updated(_changedProperties);
        if (_changedProperties.has('component') && this.component) {
            const metadata = (this.component as ClientSideComponent).metadata as Drawer
            this.state = metadata.initialData
        }
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('keydown', this._escListener)
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this._escListener)
        super.disconnectedCallback()
    }

    // Esc closes only the topmost overlay in this drawer's root, so nested overlays unwind one
    // at a time instead of all at once.
    private _escListener = (e: KeyboardEvent) => {
        if (e.key !== 'Escape') {
            return
        }
        const root = this.getRootNode() as Document | ShadowRoot
        const overlays = root.querySelectorAll('mateu-drawer, mateu-dialog')
        if (overlays[overlays.length - 1] === this) {
            e.stopPropagation()
            this.close()
        }
    }

    render(): TemplateResult {

        const metadata = (this.component as ClientSideComponent).metadata as Drawer

        const position = metadata.position ?? 'end'
        const title = interpolateNested(
            metadata.headerTitle, this.state, this.data, this.appState, this.appData)
        const subtitle = interpolateNested(
            metadata.subtitle, this.state, this.data, this.appState, this.appData)
        const width = this.effectiveWidth(metadata)
        const peerNav = metadata.peerNav && (metadata.peerNav.prevRoute || metadata.peerNav.nextRoute)
            ? metadata.peerNav : undefined

        return html`
        ${metadata.modeless ? nothing : html`
            <div class="backdrop ${this.opened ? 'open' : ''}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${position} ${this.opened ? 'open' : ''} ${this.collapsed ? 'collapsed' : ''} ${this.component?.cssClasses ?? ''}"
                role="dialog"
                aria-modal="${!metadata.modeless}"
                aria-label="${title ?? nothing}"
                style="${width && position !== 'bottom' ? `width: ${width};` : ''}${this.component?.style ?? ''}"
        >
            <header>
                ${title
                    ? html`<div class="titles"><h3>${title}</h3>${subtitle ? html`<span class="subtitle">${subtitle}</span>` : nothing}</div>`
                    : html`<span class="spacer"></span>`}
                ${metadata.header ? html`
                    <mateu-event-interceptor .target="${this}">${renderComponent(this, metadata.header, this.baseUrl, this.state, this.data, this.appState, this.appData)}</mateu-event-interceptor>
                ` : nothing}
                ${peerNav ? html`
                    <button class="drawer-icon" aria-label="${peerNav.prevLabel ?? 'Previous'}" title="${peerNav.prevLabel ?? 'Previous'}"
                            ?disabled="${!peerNav.prevRoute}" @click="${() => { if (peerNav.prevRoute) window.location.href = peerNav.prevRoute! }}">‹</button>
                    <button class="drawer-icon" aria-label="${peerNav.nextLabel ?? 'Next'}" title="${peerNav.nextLabel ?? 'Next'}"
                            ?disabled="${!peerNav.nextRoute}" @click="${() => { if (peerNav.nextRoute) window.location.href = peerNav.nextRoute! }}">›</button>
                ` : nothing}
                ${metadata.collapsible ? html`
                    <button class="drawer-icon" aria-label="${this.collapsed ? 'Expand' : 'Collapse'}" title="${this.collapsed ? 'Expand' : 'Collapse'}"
                            @click="${() => this.collapsed = !this.collapsed}">${this.collapsed ? '▴' : '▾'}</button>
                ` : nothing}
                ${this.canMaximize(metadata) ? html`
                    <button class="drawer-icon" aria-label="Maximize" title="Maximize" @click="${() => this.maximizeSteps++}">⤢</button>
                ` : nothing}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
            ${this.collapsed ? nothing : html`
            <div class="content ${metadata.noPadding ? 'no-padding' : ''}">
                ${metadata.content ? html`
                    <mateu-event-interceptor .target="${this}" style="--mateu-section-border: none; width: 100%;">${renderComponent(this, metadata.content, this.baseUrl, this.state, this.data, this.appState, this.appData)}</mateu-event-interceptor>
                ` : nothing}
            </div>
            ${metadata.footer ? html`
                <footer>
                    <mateu-event-interceptor .target="${this}" style="width: 100%;">${renderComponent(this, metadata.footer, this.baseUrl, this.state, this.data, this.appState, this.appData)}</mateu-event-interceptor>
                </footer>
            ` : nothing}
            `}
        </section>
       `
    }

    static styles = css`
        .drawer-close {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 1rem;
            line-height: 1;
            padding: .35rem .5rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--lumo-secondary-text-color, #555);
        }
        .drawer-close:hover {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.05));
        }

        .backdrop {
            position: fixed;
            inset: 0;
            background: var(--mateu-drawer-backdrop, rgba(0, 0, 0, 0.35));
            opacity: 0;
            transition: opacity 0.25s ease;
            z-index: 1000;
        }
        .backdrop.open {
            opacity: 1;
        }
        .panel {
            position: fixed;
            top: 0;
            bottom: 0;
            width: var(--mateu-drawer-width, 26rem);
            max-width: 92vw;
            background: var(--lumo-base-color, #fff);
            color: var(--lumo-body-text-color, #1a1a1a);
            box-shadow: var(--lumo-box-shadow-l, 0 8px 24px rgba(0, 0, 0, 0.25));
            display: flex;
            flex-direction: column;
            transition: transform 0.25s ease;
            z-index: 1001;
        }
        .panel.end {
            right: 0;
            transform: translateX(100%);
        }
        .panel.start {
            left: 0;
            transform: translateX(-100%);
        }
        .panel.open {
            transform: translateX(0);
        }
        /* Bottom drawer: docked at the bottom edge, full width, slides up (the Redwood
           "Bottom Drawer" template). Height defaults to half the viewport; collapsing (via the
           handle) shrinks it to the header strip. */
        .panel.bottom {
            top: auto;
            left: 0;
            right: 0;
            width: auto;
            max-width: 100vw;
            height: var(--mateu-drawer-height, 50vh);
            max-height: 90vh;
            transform: translateY(100%);
            border-top-left-radius: var(--lumo-border-radius-l, 12px);
            border-top-right-radius: var(--lumo-border-radius-l, 12px);
        }
        .panel.bottom.open {
            transform: translateY(0);
        }
        .panel.bottom.collapsed {
            height: auto;
        }
        header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, 0.5rem);
            padding: var(--mateu-drawer-header-padding, var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem));
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
        header .titles {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
        }
        header h3 {
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        header .subtitle {
            font-size: var(--lumo-font-size-s, .875rem);
            color: var(--lumo-secondary-text-color, #6b7280);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        header .spacer {
            flex: 1;
        }
        .drawer-icon {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 1.1rem;
            line-height: 1;
            padding: .35rem .5rem;
            border-radius: var(--lumo-border-radius-m, 6px);
            color: var(--lumo-secondary-text-color, #555);
        }
        .drawer-icon:hover:not(:disabled) {
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.05));
        }
        .drawer-icon:disabled {
            opacity: .35;
            cursor: default;
        }
        .content {
            flex: 1;
            overflow: auto;
            padding: var(--mateu-drawer-content-padding, var(--lumo-space-m, 1rem));
        }
        .content.no-padding {
            padding: 0;
        }
        /* Footer holds the drawer's actions — right-aligned with a top divider, the standard
           (and RDS "Create and Edit - Drawer") footer treatment. The action row inside is a
           HorizontalLayout, so stretch it and push its buttons to the trailing edge. */
        footer {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: var(--lumo-space-s, 0.5rem);
            padding: var(--mateu-drawer-footer-padding, var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem));
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
        footer > * {
            display: flex;
            justify-content: flex-end;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-drawer': MateuDrawer
    }
}
