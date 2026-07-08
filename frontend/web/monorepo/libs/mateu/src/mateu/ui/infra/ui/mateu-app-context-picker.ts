import {customElement, property, state} from "lit/decorators.js";
import {css, html, LitElement, nothing, TemplateResult} from "lit";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import AppContextSelector from "@mateu/shared/apiClients/dtos/componentmetadata/AppContextSelector.ts";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient.ts";
import {
    installAppContextWatcher,
    readAppContext,
    readAppContextLabels,
    writeAppContext
} from "@infra/appContextStore.ts";

/**
 * One application-level context selector on the app header (an @AppContext field of the app
 * class). A button opening a SEARCHABLE panel (same shape as the lookup fields' picker): opening
 * it queries the server via the _appcontext-search-<field> action, so options created after the
 * app metadata was built still show up; typing narrows the results (debounced server search plus
 * client-side filter). Picking a value persists it client-side (the API client sends it in the
 * appState of every request) and reloads the current route. Styled with Lumo CSS vars with
 * fallbacks so every design system can theme it.
 */
@customElement('mateu-app-context-picker')
export class MateuAppContextPicker extends LitElement {

    // below this many options the panel skips the search input
    static readonly SEARCHABLE_THRESHOLD = 7

    @property()
    selector!: AppContextSelector

    @property()
    app: App | undefined

    @property()
    baseUrl = ''

    @state()
    private opened = false

    @state()
    private searchText = ''

    // server results replacing the loaded options while a remote search is active
    @state()
    private searchedOptions: { value: unknown, label: string }[] | undefined

    private searchTimer: ReturnType<typeof setTimeout> | undefined
    private outsideClick: ((e: Event) => void) | undefined

    connectedCallback() {
        super.connectedCallback();
        // reload this tab when ANOTHER tab changes the context
        installAppContextWatcher()
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.detachOutsideClick()
        if (this.searchTimer) clearTimeout(this.searchTimer)
    }

    private currentValue(): string {
        return String(readAppContext()[this.selector.fieldName] ?? '')
    }

    private currentLabel(): string {
        const value = this.currentValue()
        if (!value) return '—'
        const option = (this.searchedOptions ?? this.selector.options)
            ?.find(o => String(o.value) === value)
        if (option) return option.label
        const label = readAppContextLabels()[this.selector.fieldName]
        return label !== undefined ? String(label) : value
    }

    private pick(value: unknown, label?: string) {
        writeAppContext(this.selector.fieldName, value, label)
        window.location.reload()
    }

    // ── searchable panel ─────────────────────────────────────────────────────

    private detachOutsideClick() {
        if (this.outsideClick) {
            document.removeEventListener('mousedown', this.outsideClick)
            this.outsideClick = undefined
        }
    }

    private openPanel() {
        if (this.opened) return
        this.opened = true
        this.searchText = ''
        this.searchedOptions = undefined
        // the baked options date from when the app metadata was built — refresh on open
        this.remoteSearch()
        this.outsideClick = (e: Event) => {
            if (!e.composedPath().includes(this)) this.closePanel()
        }
        document.addEventListener('mousedown', this.outsideClick)
        this.updateComplete.then(() =>
            (this.renderRoot.querySelector('input.picker-search') as HTMLInputElement)?.focus())
    }

    private closePanel() {
        this.detachOutsideClick()
        this.opened = false
    }

    private onSearchInput(e: Event) {
        this.searchText = (e.target as HTMLInputElement).value
        if (this.searchTimer) clearTimeout(this.searchTimer)
        // the loaded options may be a truncated first page — ask the server for real matches
        this.searchTimer = setTimeout(() => this.remoteSearch(), 300)
    }

    private async remoteSearch() {
        const app = this.app
        if (!app?.serverSideType) return
        try {
            const increment = await mateuApiClient.runAction(
                this.baseUrl ?? '',
                app.rootRoute ?? app.initialRoute ?? '',
                '',
                `_appcontext-search-${this.selector.fieldName}`,
                `appcontext-${this.selector.fieldName}`,
                undefined,
                app.serverSideType,
                {},
                { searchText: this.searchText },
                this,
                true
            )
            for (const fragment of increment?.fragments ?? []) {
                const data = fragment.data as Record<string, any> | undefined
                const page = data?.[`_appcontext_${this.selector.fieldName}`]
                const content = page?.content
                if (Array.isArray(content)) {
                    this.searchedOptions = content.map((option: any) =>
                        ({ value: option.value, label: option.label ?? String(option.value) }))
                    return
                }
            }
        } catch {
            // server search unavailable: the client-side filter below still applies
        }
    }

    private visibleOptions(): { value: unknown, label: string }[] {
        const base = this.searchedOptions ?? this.selector.options ?? []
        const text = this.searchText.trim().toLowerCase()
        if (!text) return base
        return base.filter(option => option.label.toLowerCase().includes(text))
    }

    // ── rendering ────────────────────────────────────────────────────────────

    private renderPanel(): TemplateResult {
        const value = this.currentValue()
        const options = this.visibleOptions()
        const searchable = this.searchText !== ''
            || options.length > MateuAppContextPicker.SEARCHABLE_THRESHOLD
        return html`
            <div class="panel">
                ${searchable ? html`
                    <input class="picker-search" type="text" placeholder="Search"
                           .value="${this.searchText}"
                           @input="${this.onSearchInput}"
                           @keydown="${(e: KeyboardEvent) => { if (e.key === 'Escape') this.closePanel() }}"/>` : nothing}
                <div class="options">
                    ${value ? html`
                        <div class="option option--clear" @click="${() => this.pick('')}">— (clear)</div>` : nothing}
                    ${options.map(option => html`
                        <div class="option ${value === String(option.value) ? 'option--selected' : ''}"
                             @click="${() => this.pick(option.value, option.label)}">${option.label}</div>`)}
                </div>
            </div>`
    }

    render(): TemplateResult {
        if (!this.selector) return html``
        return html`
            <label class="root">
                <span class="label">${this.selector.label}</span>
                <button class="picker-button"
                        @click="${() => this.opened ? this.closePanel() : this.openPanel()}">
                    ${this.currentLabel()} <span aria-hidden="true" class="caret">▾</span>
                </button>
                ${this.opened ? this.renderPanel() : nothing}
            </label>`
    }

    static styles = css`
        :host {
            display: inline-flex;
            position: relative;
            flex-shrink: 0;
        }
        .root {
            display: inline-flex;
            align-items: center;
            gap: 0.35rem;
            margin-left: 0.5rem;
            font-size: var(--lumo-font-size-s, 0.875rem);
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.6));
        }
        .picker-select, .picker-button {
            font: inherit;
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-contrast-10pct, rgba(0, 0, 0, 0.06));
            border: none;
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            padding: 0.3rem 0.5rem;
            cursor: pointer;
            outline: none;
            white-space: nowrap;
        }
        .caret {
            opacity: 0.6;
            font-size: 0.7em;
        }
        .panel {
            position: absolute;
            top: calc(100% + 4px);
            right: 0;
            min-width: 14rem;
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-20pct, rgba(0, 0, 0, 0.15));
            border-radius: var(--lumo-border-radius-m, 0.25rem);
            box-shadow: var(--lumo-box-shadow-m, 0 6px 16px rgba(0, 0, 0, 0.15));
            z-index: 300;
            padding: 0.4rem;
        }
        .picker-search {
            width: 100%;
            box-sizing: border-box;
            font: inherit;
            color: var(--lumo-body-text-color, #1a1a1a);
            background: var(--lumo-base-color, #fff);
            border: 1px solid var(--lumo-contrast-30pct, rgba(0, 0, 0, 0.3));
            border-radius: var(--lumo-border-radius-s, 4px);
            padding: 0.3rem 0.5rem;
            outline: none;
            margin-bottom: 0.25rem;
        }
        .options {
            max-height: 16rem;
            overflow-y: auto;
        }
        .option {
            padding: 0.35rem 0.5rem;
            border-radius: var(--lumo-border-radius-s, 4px);
            cursor: pointer;
            color: var(--lumo-body-text-color, #1a1a1a);
        }
        .option:hover {
            background: var(--lumo-contrast-5pct, rgba(0, 0, 0, 0.04));
        }
        .option--selected {
            font-weight: 600;
        }
        .option--clear {
            color: var(--lumo-secondary-text-color, rgba(0, 0, 0, 0.55));
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app-context-picker': MateuAppContextPicker
    }
}
