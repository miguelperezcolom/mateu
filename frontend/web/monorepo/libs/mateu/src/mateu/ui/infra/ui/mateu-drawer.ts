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

        return html`
        ${metadata.modeless ? nothing : html`
            <div class="backdrop ${this.opened ? 'open' : ''}" @click="${this.close}"></div>
        `}
        <section
                class="panel ${position} ${this.opened ? 'open' : ''} ${this.component?.cssClasses ?? ''}"
                role="dialog"
                aria-modal="${!metadata.modeless}"
                aria-label="${title ?? nothing}"
                style="${metadata.width ? `width: ${metadata.width};` : ''}${this.component?.style ?? ''}"
        >
            <header>
                ${title ? html`<h3>${title}</h3>` : html`<span class="spacer"></span>`}
                ${metadata.header ? html`
                    <mateu-event-interceptor .target="${this}">${renderComponent(this, metadata.header, this.baseUrl, this.state, this.data, this.appState, this.appData)}</mateu-event-interceptor>
                ` : nothing}
                <button class="drawer-close" aria-label="Close" @click="${this.close}">✕</button>
            </header>
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
        header {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, 0.5rem);
            padding: var(--mateu-drawer-header-padding, var(--lumo-space-s, 0.5rem) var(--lumo-space-m, 1rem));
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.1));
        }
        header h3 {
            flex: 1;
            margin: 0;
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
        }
        header .spacer {
            flex: 1;
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
