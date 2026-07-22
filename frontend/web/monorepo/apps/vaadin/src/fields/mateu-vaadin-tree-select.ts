import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option.ts";
import '@vaadin/button';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-tree-column.js';

type TreeOption = Option & { children?: TreeOption[] }

/**
 * Vaadin-flavoured tree select (stereotype `treeSelect`, see @TreeSelect). The dropdown is a real
 * `vaadin-grid` with a `vaadin-grid-tree-column`, and the control/clear are `vaadin-button`s — the
 * Vaadin counterpart of the design-system-neutral `mateu-tree-select`. Same wire contract: it
 * commits the picked option through the standard `value-changed` event; with `leavesOnly` the
 * intermediate (group) nodes only expand.
 */
@customElement('mateu-vaadin-tree-select')
export class MateuVaadinTreeSelect extends LitElement {

    @property()
    fieldId = ''

    @property()
    value: string | undefined

    @property()
    options: Option[] = []

    @property({ type: Boolean })
    leavesOnly = false

    @state()
    private opened = false

    @state()
    private expandedItems: TreeOption[] = []

    private _optsSource?: Option[]
    private _normalized: TreeOption[] = []
    private outsideClick?: (e: Event) => void

    disconnectedCallback() {
        super.disconnectedCallback()
        this.detachOutsideClick()
    }

    /** vaadin-grid's item-has-children-path checks truthiness, and an empty array is truthy — so
     *  normalize leaves to carry NO children (undefined) and only real groups keep a children array. */
    private get normalized(): TreeOption[] {
        if (this._optsSource !== this.options) {
            this._optsSource = this.options
            this._normalized = this.normalizeOptions(this.options ?? [])
        }
        return this._normalized
    }

    private normalizeOptions(opts: Option[]): TreeOption[] {
        return opts.map(o => {
            const kids = o.children && o.children.length ? this.normalizeOptions(o.children) : undefined
            return { ...o, children: kids }
        })
    }

    private dataProvider = (
        params: { parentItem?: TreeOption },
        callback: (items: TreeOption[], size: number) => void,
    ) => {
        const items = params.parentItem ? (params.parentItem.children ?? []) : this.normalized
        callback(items, items.length)
    }

    private ancestorsOf(value: string, opts: TreeOption[]): TreeOption[] | null {
        for (const o of opts) {
            if (String(o.value) === value) return []
            const sub = o.children ? this.ancestorsOf(value, o.children) : null
            if (sub != null) return [o, ...sub]
        }
        return null
    }

    private labelOf(value: string, opts: TreeOption[]): string | null {
        for (const o of opts) {
            if (String(o.value) === value) return o.label
            const sub = o.children ? this.labelOf(value, o.children) : null
            if (sub != null) return sub
        }
        return null
    }

    private open() {
        if (this.opened) return
        // pre-expand the path to the current value so the selection is visible
        this.expandedItems = this.value != null
            ? (this.ancestorsOf(String(this.value), this.normalized) ?? [])
            : []
        this.opened = true
        this.outsideClick = (e: Event) => { if (!e.composedPath().includes(this)) this.close() }
        document.addEventListener('mousedown', this.outsideClick)
    }

    private close() {
        this.detachOutsideClick()
        this.opened = false
    }

    private detachOutsideClick() {
        if (this.outsideClick) {
            document.removeEventListener('mousedown', this.outsideClick)
            this.outsideClick = undefined
        }
    }

    private pick(option: TreeOption) {
        this.close()
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value: option.value, fieldId: this.fieldId },
            bubbles: true,
            composed: true,
        }))
    }

    private clear() {
        this.close()
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value: undefined, fieldId: this.fieldId },
            bubbles: true,
            composed: true,
        }))
    }

    private onActiveItemChanged(e: CustomEvent) {
        const item = e.detail.value as TreeOption | null
        if (!item) return
        const hasChildren = (item.children?.length ?? 0) > 0
        if (hasChildren && this.leavesOnly) {
            // a group is not selectable in leavesOnly mode — toggle its expansion instead
            this.expandedItems = this.expandedItems.includes(item)
                ? this.expandedItems.filter(i => i !== item)
                : [...this.expandedItems, item]
            ;(e.target as unknown as { activeItem: TreeOption | null }).activeItem = null
            return
        }
        this.pick(item)
    }

    render(): TemplateResult {
        const currentLabel = this.value != null && this.value !== ''
            ? (this.labelOf(String(this.value), this.normalized) ?? String(this.value))
            : ''
        return html`
            <div class="root">
                <vaadin-button class="control" theme="tertiary"
                               @click="${() => this.opened ? this.close() : this.open()}">
                    <span class="${currentLabel ? '' : 'placeholder'}">${currentLabel || '—'}</span>
                    <span class="chevron" slot="suffix" aria-hidden="true">▾</span>
                </vaadin-button>
                ${this.opened ? html`
                    <div class="panel">
                        ${this.value ? html`
                            <div class="clear-row">
                                <vaadin-button theme="tertiary small" @click="${this.clear}">— Clear</vaadin-button>
                            </div>` : nothing}
                        <vaadin-grid
                                theme="compact no-border no-row-borders"
                                all-rows-visible
                                .dataProvider="${this.dataProvider}"
                                .itemHasChildrenPath="${'children'}"
                                .expandedItems="${this.expandedItems}"
                                @expanded-items-changed="${(e: CustomEvent) => { this.expandedItems = e.detail.value }}"
                                @active-item-changed="${this.onActiveItemChanged}">
                            <vaadin-grid-tree-column path="label"></vaadin-grid-tree-column>
                        </vaadin-grid>
                    </div>` : nothing}
            </div>`
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
            min-width: 12rem;
        }
        .root {
            position: relative;
        }
        .control {
            width: 100%;
        }
        /* vaadin-button centres its slotted content; spread the value (left) and chevron (right). */
        .control::part(label) {
            display: flex;
            width: 100%;
            align-items: center;
            justify-content: space-between;
        }
        .placeholder {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.5));
        }
        .chevron {
            opacity: 0.6;
            font-size: 0.75em;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            min-width: 100%;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
            padding: 0.25rem;
        }
        .clear-row {
            padding-bottom: 0.25rem;
            margin-bottom: 0.25rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        vaadin-grid {
            min-width: 16rem;
            max-height: 18rem;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-vaadin-tree-select': MateuVaadinTreeSelect
    }
}
