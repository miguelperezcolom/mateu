import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
import Option from "@mateu/shared/apiClients/dtos/componentmetadata/Option.ts";

/**
 * A select whose dropdown is a TREE (stereotype `treeSelect`, see @TreeSelect): the options carry
 * `children` and nodes expand/collapse in place. Selecting a node commits its value through the
 * standard `value-changed` event — with `leavesOnly` intermediate nodes only expand. Styled with
 * Lumo vars with fallbacks (design-system neutral).
 */
@customElement('mateu-tree-select')
export class MateuTreeSelect extends LitElement {

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
    private expanded = new Set<string>()

    private outsideClick: ((e: Event) => void) | undefined

    disconnectedCallback() {
        super.disconnectedCallback();
        this.detachOutsideClick()
    }

    private detachOutsideClick() {
        if (this.outsideClick) {
            document.removeEventListener('mousedown', this.outsideClick)
            this.outsideClick = undefined
        }
    }

    private open() {
        if (this.opened) return
        this.opened = true
        // start with the path to the current value expanded, so the selection is visible
        this.expanded = new Set(this.pathTo(this.value ?? '', this.options) ?? [])
        this.outsideClick = (e: Event) => {
            if (!e.composedPath().includes(this)) this.close()
        }
        document.addEventListener('mousedown', this.outsideClick)
    }

    private close() {
        this.detachOutsideClick()
        this.opened = false
    }

    private pick(option: Option) {
        this.close()
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value: option.value, fieldId: this.fieldId },
            bubbles: true,
            composed: true
        }))
    }

    private clear() {
        this.close()
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value: undefined, fieldId: this.fieldId },
            bubbles: true,
            composed: true
        }))
    }

    /** Values of the ancestors of `value` (for initial expansion), or null when not found. */
    private pathTo(value: string, options: Option[]): string[] | null {
        for (const option of options) {
            if (String(option.value) === value) return []
            const sub = this.pathTo(value, option.children ?? [])
            if (sub != null) return [String(option.value), ...sub]
        }
        return null
    }

    private labelOf(value: string, options: Option[]): string | null {
        for (const option of options) {
            if (String(option.value) === value) return option.label
            const sub = this.labelOf(value, option.children ?? [])
            if (sub != null) return sub
        }
        return null
    }

    private toggle(option: Option) {
        const key = String(option.value)
        const next = new Set(this.expanded)
        if (next.has(key)) next.delete(key); else next.add(key)
        this.expanded = next
    }

    private renderNode(option: Option, depth: number): TemplateResult {
        const hasChildren = (option.children?.length ?? 0) > 0
        const isExpanded = this.expanded.has(String(option.value))
        const selectable = !this.leavesOnly || !hasChildren
        const isSelected = String(option.value) === String(this.value ?? '')
        return html`
            <div class="node ${isSelected ? 'node--selected' : ''} ${selectable ? '' : 'node--group'}"
                 style="padding-left: ${0.5 + depth * 1.1}rem;"
                 @mousedown="${(e: Event) => e.preventDefault()}"
                 @click="${() => selectable ? this.pick(option) : this.toggle(option)}">
                ${hasChildren ? html`
                    <span class="caret" @click="${(e: Event) => { e.stopPropagation(); this.toggle(option) }}"
                    >${isExpanded ? '▾' : '▸'}</span>` : html`<span class="caret caret--empty"></span>`}
                ${option.label}
            </div>
            ${hasChildren && isExpanded
                ? option.children!.map(child => this.renderNode(child, depth + 1))
                : nothing}`
    }

    render(): TemplateResult {
        const currentLabel = this.value ? (this.labelOf(String(this.value), this.options) ?? String(this.value)) : ''
        return html`
            <div class="root">
                <button class="control" @click="${() => this.opened ? this.close() : this.open()}">
                    <span class="${currentLabel ? '' : 'placeholder'}">${currentLabel || '—'}</span>
                    <span class="chevron" aria-hidden="true">▾</span>
                </button>
                ${this.opened ? html`
                    <div class="panel">
                        ${this.value ? html`
                            <div class="node node--clear"
                                 @mousedown="${(e: Event) => e.preventDefault()}"
                                 @click="${this.clear}">— (clear)</div>` : nothing}
                        ${this.options.map(option => this.renderNode(option, 0))}
                    </div>` : nothing}
            </div>`
    }

    static styles = css`
        :host {
            display: block;
            min-width: 12rem;
        }
        .root {
            position: relative;
        }
        .control {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 0.5rem;
            font: inherit;
            font-size: var(--lumo-font-size-m, 1rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.45rem 0.75rem;
            cursor: pointer;
            text-align: left;
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
            max-height: 18rem;
            overflow-y: auto;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
            padding: 0.25rem 0;
        }
        .node {
            display: flex;
            align-items: center;
            gap: 0.25rem;
            padding: 0.35rem 0.75rem;
            cursor: pointer;
            color: var(--lumo-body-text-color, #1a1a1a);
            font-size: var(--lumo-font-size-s, 0.875rem);
            white-space: nowrap;
        }
        .node:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .node--selected {
            font-weight: 600;
        }
        .node--group {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.65));
        }
        .node--clear {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        .caret {
            width: 1rem;
            flex: none;
            text-align: center;
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
        .caret--empty::before {
            content: '';
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-tree-select': MateuTreeSelect
    }
}
