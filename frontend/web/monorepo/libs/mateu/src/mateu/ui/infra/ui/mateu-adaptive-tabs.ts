import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from 'lit/decorators.js';
import { AdaptiveTabsMode, modeForWidth } from "./adaptiveTabsMode.ts";

/**
 * Adaptive disclosure wrapper for tab layouts whose metadata says adaptable=true: it measures its
 * own container width with a ResizeObserver and renders the normal tab strip when wide, or
 * degrades to a vertical accordion (one expandable panel per tab, exclusive) when narrow — the
 * disclosure semantics (one group visible at a time) are preserved either way.
 *
 * Content arrives through light-DOM slots so the same child nodes are reused across mode switches:
 * slot="tabs" carries the tab strip (e.g. a vaadin-tabs with vaadin-tab items — kept in the light
 * DOM so tab keyboard shortcuts querying 'vaadin-tab[data-shortcut]' keep working) and
 * slot="panel-N" carries each tab's content. Accordion headers come from the tabLabels property.
 * The selected tab / open panel index is kept across mode switches.
 *
 * Design-system neutral: themed with Lumo CSS vars with fallbacks (like mateu-drawer/mateu-foldout).
 */
@customElement('mateu-adaptive-tabs')
export class MateuAdaptiveTabs extends LitElement {

    @property({ type: Array })
    tabLabels: string[] = []

    @state()
    private mode: AdaptiveTabsMode = 'tabs'

    @state()
    private selected = 0

    private resizeObserver: ResizeObserver | undefined
    private slottedTabs: HTMLElement | undefined

    connectedCallback() {
        super.connectedCallback();
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                this.mode = modeForWidth(entry.contentRect.width)
            }
        })
        this.resizeObserver.observe(this)
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect()
        this.resizeObserver = undefined
        this.detachTabsListener()
    }

    private selectedChangedListener = (e: Event) => {
        const value = (e as CustomEvent).detail?.value
        if (typeof value == 'number' && value >= 0) {
            this.selected = value
        }
    }

    private detachTabsListener() {
        this.slottedTabs?.removeEventListener('selected-changed', this.selectedChangedListener)
        this.slottedTabs = undefined
    }

    private tabsSlotChanged(e: Event) {
        this.detachTabsListener()
        const slot = e.target as HTMLSlotElement
        const tabs = slot.assignedElements().find(el => 'selected' in el) as HTMLElement | undefined
        if (tabs) {
            this.slottedTabs = tabs
            tabs.addEventListener('selected-changed', this.selectedChangedListener);
            (tabs as any).selected = this.selected
        }
    }

    private select(index: number) {
        this.selected = index
        if (this.slottedTabs) {
            (this.slottedTabs as any).selected = index
        }
    }

    protected updated() {
        // keep the (possibly hidden) slotted tab strip in sync when coming back from accordion mode
        if (this.slottedTabs && (this.slottedTabs as any).selected != this.selected) {
            (this.slottedTabs as any).selected = this.selected
        }
    }

    static styles = css`
        :host {
            display: block;
        }
        .strip[hidden] {
            display: none;
        }
        .panel[hidden] {
            display: none;
        }
        .accordion {
            display: flex;
            flex-direction: column;
            border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
            border-radius: var(--lumo-border-radius-m, 8px);
            overflow: hidden;
        }
        .acc-item + .acc-item {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.08));
        }
        .acc-header {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: .5rem;
            border: none;
            background: var(--lumo-contrast-5pct, rgba(0,0,0,.03));
            cursor: pointer;
            font: inherit;
            font-weight: 500;
            color: var(--lumo-body-text-color, #1a1a1a);
            padding: var(--lumo-space-s, .5rem) var(--lumo-space-m, 1rem);
            text-align: start;
        }
        .acc-header:hover {
            background: var(--lumo-contrast-10pct, rgba(0,0,0,.06));
        }
        .acc-header[aria-expanded="true"] {
            background: var(--lumo-base-color, #fff);
        }
        .acc-header .chevron {
            color: var(--lumo-secondary-text-color, #666);
            font-size: var(--lumo-font-size-s, .875rem);
            transition: transform .15s ease-in-out;
        }
        .acc-header[aria-expanded="true"] .chevron {
            transform: rotate(90deg);
        }
        .acc-body {
            padding: 0 var(--lumo-space-m, 1rem);
        }
        .acc-body[hidden] {
            display: none;
        }
    `

    render() {
        return html`
            <div class="strip" ?hidden="${this.mode != 'tabs'}">
                <slot name="tabs" @slotchange="${this.tabsSlotChanged}"></slot>
            </div>
            ${this.mode == 'tabs' ? html`
                ${this.tabLabels.map((_, index) => html`
                    <div class="panel" ?hidden="${index != this.selected}">
                        <slot name="panel-${index}"></slot>
                    </div>
                `)}
            ` : html`
                <div class="accordion" part="accordion">
                    ${this.tabLabels.map((label, index) => html`
                        <div class="acc-item">
                            <button class="acc-header"
                                    aria-expanded="${index == this.selected}"
                                    aria-controls="acc-body-${index}"
                                    @click="${() => this.select(index)}"
                            >
                                <span>${label ?? nothing}</span>
                                <span class="chevron">⟩</span>
                            </button>
                            <div class="acc-body" id="acc-body-${index}" ?hidden="${index != this.selected}">
                                <slot name="panel-${index}"></slot>
                            </div>
                        </div>
                    `)}
                </div>
            `}
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "mateu-adaptive-tabs": MateuAdaptiveTabs
    }
}
