import { LitElement, html, css, nothing, TemplateResult, PropertyValues } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { mateuApiClient } from "@infra/http/AxiosMateuApiClient.ts";
import { listRecentRoutes, pushRecentRoute } from "@infra/recentRoutesStore.ts";

// One hit of the app's GlobalSearchSupplier, mirrored from mateu-app's command palette.
interface GlobalSearchHit { label: string, description?: string, route: string, category?: string }

// A flattened, navigable menu leaf.
interface FlatItem { label: string, breadcrumb: string, route: string }

/**
 * The command center — Mateu's take on the "Ask Oracle" pattern. A single always-present FAB
 * (bottom-right) opens a full-screen palette that unifies EVERYTHING the user can do in the app
 * from anywhere: jump to any menu screen, search entities across the whole app (when the app class
 * implements GlobalSearchSupplier), reopen recent screens, and hand off to the AI assistant. It is
 * the discoverable, touch-friendly, chrome-replacing sibling of the ⌘K palette — opening on the FAB
 * OR on ⌘K / Ctrl+K.
 *
 * Design-system neutral: Lumo custom properties with hard fallbacks, so it renders on every shell
 * (Vaadin, Redwood, SAP UI5, PatternFly, SLDS). Navigation is emitted as the same
 * `route-changed` + `navigate-to-requested` event pair every shell already honors, so this element
 * needs no shell-specific glue — a shell just drops `<mateu-command-center .app .baseUrl>` once.
 */
@customElement('mateu-command-center')
export class MateuCommandCenter extends LitElement {

    @property({ attribute: false }) app: App | undefined
    @property() baseUrl = ''

    @state() private open = false
    @state() private queryText = ''
    @state() private dataHits: GlobalSearchHit[] = []
    @state() private loading = false
    @state() private selectedIndex = 0

    @query('.cc-input') private inputEl?: HTMLInputElement

    private searchTimer: ReturnType<typeof setTimeout> | undefined
    private keydownHandler: ((e: KeyboardEvent) => void) | null = null

    connectedCallback() {
        super.connectedCallback()
        this.keydownHandler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
                e.preventDefault()
                this.toggle()
            } else if (e.key === 'Escape' && this.open) {
                this.close()
            }
        }
        document.addEventListener('keydown', this.keydownHandler)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        if (this.keydownHandler) document.removeEventListener('keydown', this.keydownHandler)
        clearTimeout(this.searchTimer)
    }

    updated(changed: PropertyValues) {
        if (changed.has('open') && this.open) {
            // focus the search field once the overlay is in the DOM
            requestAnimationFrame(() => this.inputEl?.focus())
        }
    }

    private toggle() {
        this.open ? this.close() : this.openCenter()
    }

    private openCenter() {
        this.open = true
        this.queryText = ''
        this.dataHits = []
        this.selectedIndex = 0
    }

    private close() {
        this.open = false
        this.queryText = ''
        this.dataHits = []
        clearTimeout(this.searchTimer)
    }

    // ---- data -------------------------------------------------------------

    private flattenMenu(menu: MenuOption[] | undefined, breadcrumb: string): FlatItem[] {
        const out: FlatItem[] = []
        for (const option of menu ?? []) {
            if ((option as unknown as { separator?: boolean }).separator) continue
            if (option.submenus && option.submenus.length > 0) {
                const child = breadcrumb ? `${breadcrumb} › ${option.label}` : option.label
                out.push(...this.flattenMenu(option.submenus, child))
            } else if (option.route !== undefined && option.route !== null) {
                out.push({ label: option.label, breadcrumb, route: option.route })
            }
        }
        return out
    }

    private onInput(value: string) {
        this.queryText = value
        this.selectedIndex = 0
        const query = value.trim()
        clearTimeout(this.searchTimer)
        if (!query || !this.app?.globalSearchEnabled) {
            this.dataHits = []
            this.loading = false
            return
        }
        this.loading = true
        this.searchTimer = setTimeout(() => this.fetchGlobalSearch(query), 250)
    }

    private async fetchGlobalSearch(query: string) {
        const app = this.app
        if (!app?.globalSearchEnabled) { this.loading = false; return }
        try {
            const increment = await mateuApiClient.runAction(
                this.baseUrl ?? '', app.rootRoute ?? '', '', '_globalsearch',
                'command-center', undefined, app.serverSideType, {},
                { searchText: query }, this, true)
            const data = increment?.fragments?.map(f => f.data)
                .find(d => d && (d as Record<string, unknown>)['_globalsearch'])
            this.dataHits = ((data as Record<string, unknown> | undefined)?.['_globalsearch'] as GlobalSearchHit[]) ?? []
        } catch {
            this.dataHits = []
        } finally {
            this.loading = false
        }
    }

    // ---- navigation -------------------------------------------------------

    private navigateTo(route: string, label: string) {
        pushRecentRoute(this.app?.serverSideType ?? '', { route, label })
        this.close()
        for (const type of ['route-changed', 'navigate-to-requested']) {
            this.dispatchEvent(new CustomEvent(type, {
                detail: { route }, bubbles: true, composed: true,
            }))
        }
    }

    private askAi() {
        const query = this.queryText.trim()
        this.close()
        this.dispatchEvent(new CustomEvent('mateu-open-ai', {
            detail: { query }, bubbles: true, composed: true,
        }))
    }

    /** Flat list of currently-navigable entries, for keyboard arrow navigation. */
    private visibleTargets(menuMatches: FlatItem[]): Array<{ route: string, label: string }> {
        if (!this.queryText.trim()) {
            const tiles = this.flattenMenu(this.app?.menu, '').map(i => ({ route: i.route, label: i.label }))
            const recents = listRecentRoutes(this.app?.serverSideType ?? '')
            return [...tiles, ...recents]
        }
        return [
            ...menuMatches.map(i => ({ route: i.route, label: i.label })),
            ...this.dataHits.map(h => ({ route: h.route, label: h.label })),
        ]
    }

    private onKeydown(e: KeyboardEvent, targets: Array<{ route: string, label: string }>) {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.selectedIndex = Math.min(this.selectedIndex + 1, targets.length - 1)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0)
        } else if (e.key === 'Enter') {
            const t = targets[this.selectedIndex]
            if (t) this.navigateTo(t.route, t.label)
        }
    }

    // ---- render -----------------------------------------------------------

    render() {
        return html`
            <button class="cc-fab" @click=${() => this.openCenter()} title="Buscar y navegar (⌘K)" aria-label="Command center">
                ${this.fabIcon()}
            </button>
            ${this.open ? this.renderOverlay() : nothing}
        `
    }

    private fabIcon() {
        return html`<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>`
    }

    private renderOverlay(): TemplateResult {
        const query = this.queryText.trim().toLowerCase()
        const menuMatches = query
            ? this.flattenMenu(this.app?.menu, '').filter(i =>
                i.label.toLowerCase().includes(query) || i.breadcrumb.toLowerCase().includes(query))
            : []
        const targets = this.visibleTargets(menuMatches)
        return html`
            <div class="cc-backdrop" @click=${() => this.close()}>
                <div class="cc-panel" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="cc-bar">
                        <button class="cc-icon-btn" @click=${() => this.queryText ? this.onInput('') : this.close()} title="${this.queryText ? 'Borrar' : 'Cerrar'}">
                            ${this.queryText ? this.backIcon() : this.searchGlyph()}
                        </button>
                        <input class="cc-input" .value=${this.queryText} placeholder="Buscar pantallas, datos y acciones…"
                            @input=${(e: InputEvent) => this.onInput((e.target as HTMLInputElement).value)}
                            @keydown=${(e: KeyboardEvent) => this.onKeydown(e, targets)}>
                        ${this.queryText ? html`<button class="cc-icon-btn" @click=${() => this.onInput('')} title="Limpiar">${this.clearIcon()}</button>` : nothing}
                    </div>
                    <div class="cc-body">
                        ${query ? this.renderResults(menuMatches) : this.renderDefault()}
                    </div>
                </div>
                <button class="cc-close" @click=${() => this.close()} title="Cerrar">${this.clearIcon()}</button>
            </div>
        `
    }

    private renderDefault(): TemplateResult {
        const tiles = this.flattenMenu(this.app?.menu, '')
        const recents = listRecentRoutes(this.app?.serverSideType ?? '')
        let idx = -1
        return html`
            <div class="cc-columns">
                <div class="cc-col">
                    <div class="cc-section-title">Ir a</div>
                    <div class="cc-tiles">
                        ${tiles.map(t => { idx++; const i = idx; return html`
                            <button class="cc-tile ${i === this.selectedIndex ? 'cc-sel' : ''}"
                                @click=${() => this.navigateTo(t.route, t.label)}
                                @mouseenter=${() => { this.selectedIndex = i }}>
                                <span class="cc-tile-label">${t.label}</span>
                                ${t.breadcrumb ? html`<span class="cc-sub">${t.breadcrumb}</span>` : nothing}
                            </button>`})}
                        ${tiles.length === 0 ? html`<div class="cc-empty">Sin opciones de menú.</div>` : nothing}
                    </div>
                </div>
                ${recents.length > 0 ? html`
                    <div class="cc-col cc-col--recent">
                        <div class="cc-section-title">Recientes</div>
                        ${recents.map(r => { idx++; const i = idx; return html`
                            <button class="cc-row ${i === this.selectedIndex ? 'cc-sel' : ''}"
                                @click=${() => this.navigateTo(r.route, r.label)}
                                @mouseenter=${() => { this.selectedIndex = i }}>
                                <span class="cc-tile-label">${r.label}</span>
                            </button>`})}
                    </div>` : nothing}
            </div>
        `
    }

    private renderResults(menuMatches: FlatItem[]): TemplateResult {
        if (this.loading && this.dataHits.length === 0 && menuMatches.length === 0) {
            return html`<div class="cc-list">${[0, 1, 2, 3].map(() => html`<div class="cc-skeleton"></div>`)}</div>`
        }
        const noResults = menuMatches.length === 0 && this.dataHits.length === 0
        return html`
            <div class="cc-list">
                ${this.app?.sseUrl ? html`
                    <button class="cc-row cc-ask-ai" @click=${() => this.askAi()}>
                        ${this.aiIcon()}<span class="cc-tile-label">Preguntar a la IA: “${this.queryText.trim()}”</span>
                    </button>` : nothing}
                ${menuMatches.length > 0 ? html`<div class="cc-section-title">Pantallas</div>` : nothing}
                ${menuMatches.map((m, k) => html`
                    <button class="cc-row ${k === this.selectedIndex ? 'cc-sel' : ''}"
                        @click=${() => this.navigateTo(m.route, m.label)}
                        @mouseenter=${() => { this.selectedIndex = k }}>
                        <span class="cc-tile-label">${m.label}</span>
                        ${m.breadcrumb ? html`<span class="cc-sub">${m.breadcrumb}</span>` : nothing}
                    </button>`)}
                ${this.renderDataHits(menuMatches.length)}
                ${noResults ? html`<div class="cc-empty">No encontramos coincidencias para “${this.queryText.trim()}”.</div>` : nothing}
            </div>
        `
    }

    private renderDataHits(offset: number): TemplateResult | typeof nothing {
        if (this.dataHits.length === 0) return nothing
        let lastCategory: string | undefined
        return html`${this.dataHits.map((hit, k) => {
            const i = offset + k
            const showCat = hit.category && hit.category !== lastCategory
            lastCategory = hit.category
            return html`
                ${showCat ? html`<div class="cc-section-title">${hit.category}</div>` : nothing}
                <button class="cc-row ${i === this.selectedIndex ? 'cc-sel' : ''}"
                    @click=${() => this.navigateTo(hit.route, hit.label)}
                    @mouseenter=${() => { this.selectedIndex = i }}>
                    <span class="cc-tile-label">${hit.label}</span>
                    ${hit.description ? html`<span class="cc-sub">${hit.description}</span>` : nothing}
                </button>`
        })}`
    }

    // ---- inline icons (DS-neutral, no icon-set dependency) ----------------
    private searchGlyph() { return html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>` }
    private backIcon() { return html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>` }
    private clearIcon() { return html`<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>` }
    private aiIcon() { return html`<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 2l1.9 4.7L19 8.5l-4.1 2.3L12 15l-1.9-4.2L6 8.5l5.1-1.8z"></path></svg>` }

    static styles = css`
        :host { --cc-accent: var(--lumo-primary-color, #3b82f6); }

        .cc-fab {
            position: fixed; bottom: 1.5rem; right: 1.5rem;
            width: 3.5rem; height: 3.5rem; border-radius: 50%;
            background: var(--cc-accent); color: #fff; border: none; cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25); z-index: 950;
            transition: background 0.2s, transform 0.1s;
        }
        .cc-fab:hover { background: var(--lumo-primary-color-50pct, #2563eb); transform: scale(1.08); }

        .cc-backdrop {
            position: fixed; inset: 0; background: rgba(15, 23, 33, 0.72);
            display: flex; flex-direction: column; align-items: center;
            padding: 8vh 1rem 1rem; z-index: 1100; overflow: auto;
        }
        .cc-panel {
            width: min(920px, 96vw);
            display: flex; flex-direction: column; gap: 0;
        }
        .cc-bar {
            display: flex; align-items: center; gap: 0.5rem;
            background: var(--lumo-base-color, #fff);
            border-radius: 999px; padding: 0.35rem 0.75rem;
            box-shadow: 0 12px 40px rgba(0,0,0,0.35);
        }
        .cc-input {
            flex: 1; border: none; outline: none; background: transparent;
            font-size: var(--lumo-font-size-l, 1.125rem);
            color: var(--lumo-body-text-color, #1a1a1a);
            padding: 0.75rem 0.25rem; font-family: var(--lumo-font-family, inherit);
        }
        .cc-icon-btn {
            display: flex; align-items: center; justify-content: center;
            width: 2rem; height: 2rem; border: none; background: transparent;
            color: var(--lumo-secondary-text-color, #667); cursor: pointer; border-radius: 50%;
        }
        .cc-icon-btn:hover { background: var(--lumo-contrast-10pct, rgba(0,0,0,0.06)); }

        .cc-body { margin-top: 1rem; }
        .cc-columns { display: flex; gap: 1.5rem; align-items: flex-start; }
        .cc-col { flex: 1 1 0; min-width: 0; }
        .cc-col--recent { flex: 0 0 min(320px, 40%); }
        @media (max-width: 720px) { .cc-columns { flex-direction: column; } .cc-col--recent { flex: 1 1 auto; width: 100%; } }

        .cc-section-title {
            padding: 0.5rem 0.25rem 0.35rem;
            font-size: var(--lumo-font-size-xs, 0.75rem); text-transform: uppercase;
            letter-spacing: 0.05em; color: rgba(255,255,255,0.55); font-weight: 600;
        }
        .cc-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem; }

        .cc-tile, .cc-row {
            display: flex; flex-direction: column; align-items: flex-start; gap: 0.15rem;
            text-align: left; width: 100%;
            background: rgba(255,255,255,0.06); color: #fff;
            border: 1px solid rgba(255,255,255,0.08); border-radius: var(--lumo-border-radius-m, 0.5rem);
            padding: 0.7rem 0.85rem; cursor: pointer; transition: background 0.12s;
        }
        .cc-row { flex-direction: row; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem; }
        .cc-tile:hover, .cc-row:hover, .cc-sel { background: rgba(255,255,255,0.16); border-color: rgba(255,255,255,0.24); }
        .cc-tile-label { font-size: var(--lumo-font-size-m, 1rem); color: #fff; }
        .cc-sub { font-size: var(--lumo-font-size-xs, 0.75rem); color: rgba(255,255,255,0.6); }
        .cc-ask-ai { background: rgba(59,130,246,0.18); border-color: rgba(59,130,246,0.4); }
        .cc-ask-ai svg { color: var(--cc-accent); flex-shrink: 0; }

        .cc-list { display: flex; flex-direction: column; }
        .cc-empty { padding: 1.5rem; text-align: center; color: rgba(255,255,255,0.6); font-size: var(--lumo-font-size-s, 0.875rem); }

        .cc-skeleton {
            height: 2.75rem; margin-bottom: 0.5rem; border-radius: var(--lumo-border-radius-m, 0.5rem);
            background: linear-gradient(90deg, rgba(255,255,255,0.06) 25%, rgba(255,255,255,0.14) 37%, rgba(255,255,255,0.06) 63%);
            background-size: 400% 100%; animation: cc-shimmer 1.2s ease-in-out infinite;
        }
        @keyframes cc-shimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }

        .cc-close {
            position: fixed; bottom: 1.5rem; right: 1.5rem;
            width: 3.5rem; height: 3.5rem; border-radius: 50%;
            background: rgba(0,0,0,0.55); color: #fff; border: 1px solid rgba(255,255,255,0.2);
            display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 1110;
        }
        .cc-close:hover { background: rgba(0,0,0,0.75); }
    `
}

declare global {
    interface HTMLElementTagNameMap { 'mateu-command-center': MateuCommandCenter }
}
