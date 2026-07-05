import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
import { interpolate } from './interpolation'
// side-effect element registrations kept from the previous incarnation of this bar — other
// templates may rely on this module having registered them
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import '@vaadin/popover'
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { badge } from "@vaadin/vaadin-lumo-styles";

/**
 * Smart-search filter bar, after the Redwood Smart Search pattern: ONE search field hosting both
 * the free-text keyword search and the structured filters. Focusing the field opens a panel
 * listing the crud's filters (each with a type-specific widget: option list for selects, Yes/No
 * for booleans, an input for text/number); every applied condition becomes a chip in the bar with
 * its own remove button; Enter commits the typed text as a keyword chip. Chips add/remove re-run
 * the search.
 *
 * The wire contract with the host crud is unchanged: `value-changed` {fieldId, value} per applied
 * condition, `search-requested` to run the search, `filter-reset-requested` {fieldIds} on clear
 * all. Styled with Lumo CSS vars (with fallbacks) so every design system that shares this bar
 * themes it through its own var overrides.
 */
@customElement('mateu-filter-bar')
export class MateuFilterBar extends LitElement {

    @property()
    metadata: Crud | undefined

    @property()
    baseUrl = ''

    @state()
    state: Record<string, any> = {}

    @state()
    data: Record<string, any> = {}

    @property()
    appState: Record<string, any> = {}

    @property()
    appData: Record<string, any> = {}

    // Kept for API compatibility with the two crud layout variants: the smart bar already IS a
    // single search field, so both variants render the same thing.
    @property({ type: Boolean })
    searchOnly = false

    @state()
    private panelOpened = false

    @state()
    private activeFilter: FormField | undefined

    // Uncommitted free text (committed text lives in state.searchText, shown as a chip)
    @state()
    private draftText = ''

    private outsideClick: ((e: Event) => void) | undefined

    disconnectedCallback() {
        super.disconnectedCallback();
        this.detachOutsideClick()
    }

    private get filters(): FormField[] {
        return (this.metadata?.filters ?? []) as unknown as FormField[]
    }

    // ── panel open/close ─────────────────────────────────────────────────────

    private detachOutsideClick() {
        if (this.outsideClick) {
            document.removeEventListener('mousedown', this.outsideClick)
            this.outsideClick = undefined
        }
    }

    private openPanel = () => {
        if (this.panelOpened || this.filters.length === 0) return
        this.panelOpened = true
        this.outsideClick = (e: Event) => {
            if (!e.composedPath().includes(this)) this.closePanel()
        }
        document.addEventListener('mousedown', this.outsideClick)
    }

    private closePanel = () => {
        this.detachOutsideClick()
        this.panelOpened = false
        this.activeFilter = undefined
    }

    // ── applying/removing conditions ─────────────────────────────────────────

    private requestSearch() {
        this.closePanel()
        this.dispatchEvent(new CustomEvent('search-requested', {
            detail: {},
            bubbles: true,
            composed: true
        }))
    }

    private emitValueChanged(fieldId: string, value: unknown) {
        // local echo so the chips update immediately; the host mirrors it into the crud state
        this.state = { ...this.state, [fieldId]: value }
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: { value, fieldId },
            bubbles: true,
            composed: true
        }))
    }

    private applyFilter(fieldId: string, value: unknown) {
        this.emitValueChanged(fieldId, value)
        this.requestSearch()
    }

    private removeChip(fieldId: string) {
        this.emitValueChanged(fieldId, fieldId === 'searchText' ? '' : undefined)
        this.requestSearch()
    }

    private commitText(input: HTMLInputElement) {
        this.emitValueChanged('searchText', input.value)
        this.draftText = ''
        input.value = ''
        this.requestSearch()
    }

    private clearAllFilters = () => {
        const cleared: Record<string, any> = { searchText: undefined }
        this.filters.forEach(filter => { cleared[filter.fieldId] = undefined })
        this.state = { ...this.state, ...cleared }
        this.dispatchEvent(new CustomEvent('filter-reset-requested', {
            detail: { fieldIds: this.filters.map(filter => filter.fieldId) },
            bubbles: true,
            composed: true
        }))
        this.requestSearch()
    }

    // ── filter typing helpers ────────────────────────────────────────────────

    private isBooleanFilter(field: FormField): boolean {
        return field.dataType === 'boolean' || field.stereotype === 'checkbox' || field.stereotype === 'toggle'
    }

    private isNumericFilter(field: FormField): boolean {
        return ['integer', 'decimal', 'number', 'money'].includes(field.dataType ?? '')
    }

    private hasOptions(field: FormField): boolean {
        return (field.options?.length ?? 0) > 0
    }

    private isSet(field: FormField): boolean {
        const value = this.state[field.fieldId]
        return value !== undefined && value !== null && value !== '' && !Number.isNaN(value)
    }

    private getFilterDisplayValue(field: FormField, value: any): string {
        if (field.options?.length) {
            const option = field.options.find(o => o.value === String(value))
            if (option) return option.label ?? option.value
        }
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        return String(value)
    }

    private labelOf(field: FormField): string {
        return interpolate(field.label, this.state, this.data) || field.fieldId
    }

    // ── rendering ────────────────────────────────────────────────────────────

    // panel rows preventDefault on mousedown so the search input keeps focus (and the
    // document-level outside-click handler never sees a click that would close the panel)
    private keepFocus = (e: Event) => e.preventDefault()

    private panelRow(label: unknown, onPick: () => void, cssClass = 'panel-row'): TemplateResult {
        return html`
            <div class="${cssClass}" @mousedown="${this.keepFocus}" @click="${onPick}">${label}</div>`
    }

    private renderActiveFilterWidget(field: FormField): TemplateResult {
        if (this.hasOptions(field)) {
            return html`${field.options!.map(option =>
                this.panelRow(option.label ?? option.value, () => this.applyFilter(field.fieldId, option.value)))}`
        }
        if (this.isBooleanFilter(field)) {
            return html`
                ${this.panelRow('Yes', () => this.applyFilter(field.fieldId, true))}
                ${this.panelRow('No', () => this.applyFilter(field.fieldId, false))}`
        }
        const numeric = this.isNumericFilter(field)
        const apply = (input: HTMLInputElement) => {
            if (input.value === '') return
            this.applyFilter(field.fieldId, numeric ? Number(input.value) : input.value)
        }
        return html`
            <div class="panel-input-row">
                <input type="${numeric ? 'number' : 'text'}"
                       placeholder="${field.placeholder || this.labelOf(field)}"
                       @mousedown="${(e: Event) => e.stopPropagation()}"
                       @keydown="${(e: KeyboardEvent) => {
                           if (e.key === 'Enter') apply(e.target as HTMLInputElement)
                           if (e.key === 'Escape') this.closePanel()
                       }}"/>
                <button class="apply-button"
                        @mousedown="${this.keepFocus}"
                        @click="${(e: Event) => apply((e.target as HTMLElement).previousElementSibling as HTMLInputElement)}">Apply</button>
            </div>`
    }

    private renderPanel(): TemplateResult | typeof nothing {
        if (!this.panelOpened || this.filters.length === 0) return nothing
        if (this.activeFilter) {
            const field = this.activeFilter
            return html`
                <div class="panel">
                    <div class="panel-row panel-header"
                         @mousedown="${this.keepFocus}"
                         @click="${() => { this.activeFilter = undefined }}">
                        <span aria-hidden="true">←</span> ${this.labelOf(field)}
                    </div>
                    ${this.renderActiveFilterWidget(field)}
                </div>`
        }
        const anySet = !!this.state.searchText || this.filters.some(field => this.isSet(field))
        return html`
            <div class="panel">
                <div class="panel-caption">Filter by</div>
                ${this.filters.map(field => this.panelRow(html`
                    ${this.labelOf(field)}
                    ${this.isSet(field)
                        ? html`<span class="current-value">${this.getFilterDisplayValue(field, this.state[field.fieldId])}</span>`
                        : nothing}
                `, () => { this.activeFilter = field }))}
                ${anySet ? this.panelRow('Clear filters', this.clearAllFilters, 'panel-row panel-footer') : nothing}
            </div>`
    }

    render(): TemplateResult {
        const chips: { fieldId: string, label: string, display: string }[] = []
        if (this.state.searchText) {
            chips.push({ fieldId: 'searchText', label: 'Text', display: String(this.state.searchText) })
        }
        this.filters.forEach(field => {
            if (this.isSet(field)) {
                chips.push({
                    fieldId: field.fieldId,
                    label: this.labelOf(field),
                    display: this.getFilterDisplayValue(field, this.state[field.fieldId])
                })
            }
        })
        return html`
            <div class="smart-search">
                <div class="bar"
                     @click="${(e: Event) => {
                         const bar = e.currentTarget as HTMLElement
                         ;(bar.querySelector('input.free-text') as HTMLInputElement)?.focus()
                         this.openPanel()
                     }}">
                    <svg aria-hidden="true" class="magnifier" width="16" height="16" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z"/>
                    </svg>
                    ${chips.map(chip => html`
                        <span theme="badge contrast pill" class="chip">
                            <span class="chip-label">${chip.label}:</span> ${chip.display}
                            <button class="chip-remove" aria-label="Remove filter ${chip.label}"
                                    @mousedown="${this.keepFocus}"
                                    @click="${(e: Event) => { e.stopPropagation(); this.removeChip(chip.fieldId) }}">✕</button>
                        </span>`)}
                    ${this.metadata?.searchable !== false ? html`
                        <input class="free-text" type="text" id="searchText"
                               placeholder="${chips.length === 0 ? 'Search' : ''}"
                               autofocus="${this.metadata?.autoFocusOnSearchText ? true : nothing}"
                               .value="${this.draftText ?? ''}"
                               @input="${(e: Event) => {
                                   this.draftText = (e.target as HTMLInputElement).value
                                   // open on typing (and on the bar click below) rather than on
                                   // focus: autoFocusOnSearchText would pop the panel on page load
                                   this.openPanel()
                               }}"
                               @keydown="${(e: KeyboardEvent) => {
                                   if (e.key === 'Enter') this.commitText(e.target as HTMLInputElement)
                                   if (e.key === 'Escape') this.closePanel()
                               }}"/>
                    ` : nothing}
                </div>
                ${this.renderPanel()}
            </div>
            <slot></slot>
        `
    }

    static styles = css`
        ${badge}
        :host {
            width: 100%;
        }
        .smart-search {
            position: relative;
            padding: var(--lumo-space-xs, 0.25rem) 0;
        }
        .bar {
            display: flex;
            align-items: center;
            gap: 0.35rem;
            flex-wrap: wrap;
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.3rem 0.6rem;
            cursor: text;
        }
        .bar:focus-within {
            box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct, rgba(0, 100, 200, 0.5));
        }
        .magnifier {
            flex: none;
            opacity: 0.6;
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .chip {
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            white-space: nowrap;
        }
        .chip-label {
            opacity: 0.7;
        }
        .chip-remove {
            border: none;
            background: transparent;
            cursor: pointer;
            font-size: 0.7rem;
            line-height: 1;
            padding: 0.1rem 0.2rem;
            color: inherit;
            opacity: 0.6;
        }
        .chip-remove:hover {
            opacity: 1;
        }
        .free-text {
            flex: 1 1 8rem;
            min-width: 7rem;
            border: none;
            outline: none;
            background: transparent;
            font: inherit;
            font-size: var(--lumo-font-size-m, 1rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            padding: 0.25rem 0;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            left: 0;
            min-width: 20rem;
            max-width: 100%;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 200;
            overflow: hidden;
            padding: 0.25rem 0;
        }
        .panel-caption {
            padding: 0.35rem 0.75rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
        .panel-row {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.45rem 0.75rem;
            cursor: pointer;
            color: var(--lumo-body-text-color, #1a1a1a);
            font-size: var(--lumo-font-size-s, 0.875rem);
        }
        .panel-row:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .panel-header {
            font-weight: 600;
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
        }
        .panel-footer {
            border-top: 1px solid var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.08));
            color: var(--lumo-primary-text-color, rgb(0, 100, 200));
        }
        .current-value {
            margin-left: auto;
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
            font-size: var(--lumo-font-size-xs, 0.8125rem);
        }
        .panel-input-row {
            display: flex;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
        }
        .panel-input-row input {
            flex: 1;
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3));
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.35rem 0.5rem;
            outline: none;
        }
        .apply-button {
            font: inherit;
            font-size: var(--lumo-font-size-s, 0.875rem);
            background: var(--lumo-primary-color, rgb(0, 100, 200));
            color: var(--lumo-primary-contrast-color, #fff);
            border: 1px solid transparent;
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.35rem 0.75rem;
            cursor: pointer;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-filter-bar': MateuFilterBar
    }
}
