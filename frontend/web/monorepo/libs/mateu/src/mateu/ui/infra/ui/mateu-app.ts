import { customElement, query, state } from "lit/decorators.js";
import {css, html, nothing, PropertyValues, TemplateResult} from "lit";
import ComponentElement from "@infra/ui/ComponentElement";
import { setRestSourceCatalogue, setSampleMode } from '../http/restSourceCatalogue.ts'
import { setComponentCatalogue } from '../http/componentCatalogue.ts'
import { announceCapabilityMismatch } from '../capabilities/capabilities.ts'
import { fetchExternalJson } from '../http/externalOptions.ts'
import { appData } from "@domain/state"
import { syncCommandCenter } from "@infra/ui/commandCenterMount.ts";
import { syncAccessKeys } from "@infra/a11y/accessKeys.ts";
import { fabStyles } from "@infra/ui/layout/fabRail.ts";
import "./mateu-ux"
import './mateu-api-caller'
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import Rule from "@mateu/shared/apiClients/dtos/componentmetadata/Rule";
import {RuleAction} from "@mateu/shared/apiClients/dtos/componentmetadata/RuleAction.ts";
import { nanoid } from "nanoid";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { icon } from "@infra/ui/renderers/neutralIcon.ts";
import { publishShellMenu } from "@infra/ui/breadcrumbTrail.ts";
import { activeSection, activeTopIndex, isActiveFor, isMount, sectionHome } from "@infra/ui/navTree.ts";
import { retryUnavailableMenus } from "@infra/ui/remoteMenuRetry.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { linkStyles } from "@infra/ui/linkStyles.ts";

// DS-neutral stand-ins for the vaadin-menu-bar / vaadin-app-layout types this base class used.
export type MenuBarItem = { text?: string; route?: string; checked?: boolean; disabled?: boolean; className?: string; component?: unknown; children?: MenuBarItem[]; [key: string]: unknown }
type MenuBarItemSelectedEvent = CustomEvent<{ value: MenuBarItem }>
type AppLayout = HTMLElement & { drawerOpened?: boolean }
import {MateuChat} from "@infra/ui/mateu-chat.ts";
import {dirtyGuard} from "@infra/ui/dirtyGuard.ts";
import {mateuApiClient} from "@infra/http/AxiosMateuApiClient.ts";
import { safeLocalStorage } from '@infra/safeStorage.ts'
import { runJs } from '@infra/ui/runJs.ts'
import { runDeclaredFlow } from '@infra/ui/flowRunner.ts'
import { inAppRoute, shellActionFor } from '@infra/ui/shellFlows.ts'
import { setActionCatalogue } from '@infra/ui/actionCatalogue.ts'
import type UICommand from '@mateu/shared/apiClients/dtos/UICommand.ts'
import { applyUiLanguage, chromeText, chromeTextf } from '@infra/ui/chromeTexts.ts'

// one hit of the app's GlobalSearchSupplier, shown by the command palette under the menu results
interface GlobalSearchHit { label: string, description?: string, route: string, category?: string }

/**
 * The base an app's own content has to be fetched with.
 *
 * `homeBaseUrl` is what an app calls itself FROM ITS OWN ORIGIN. For an app aggregated by a shell
 * that is not where the browser reached it, and taking it verbatim sent that app's content back to
 * the SHELL — the "not found" you get from pasting a link to a page inside a federated app. So the
 * base the browser actually used wins, unless the app names an ABSOLUTE one: a different host,
 * which only the app can know.
 */
export const reachableBaseUrl = (app: App, reachedAt: string | undefined): string | undefined =>
    (app.homeBaseUrl ?? '').includes('://') ? app.homeBaseUrl : (reachedAt || app.homeBaseUrl)

/**
 * The app's brand accent (@App(accentColor)) as the --mateu-accent custom property on the shell —
 * the console name in the section band (light theme), the welcome hero's background — and the
 * ACCENT STRIP, Redwood's colour strip: a band drawn where Redwood draws it, not fixed under the
 * header — under a page's header (mateu-page .page-header-band), on top of a listing's results
 * (mateu-table-crud .crud-band) and at the foot of the welcome hero. The strip is the app's image
 * (@App(accentStrip)) or, when it declares none, the one the server draws from the accent
 * (generatedAccentStrip, a data:image/svg+xml;base64 URI), repeated along it; with neither (or
 * @App(accentStrip = "none")) a plain band in the accent colour. It reaches those
 * places as --mateu-page-band-h / --mateu-page-band-image, which pierce their shadow roots.
 *
 * Only what the shell set itself is ever removed: an app may set these in its own CSS instead. A
 * value that is not a plain colour, or a strip URL that would end the declaration, is ignored.
 */
export const ACCENT_STRIP_HEIGHT = '10px'

const ACCENT_PROPERTIES = ['--mateu-accent', '--mateu-page-band-h', '--mateu-page-band-image']

export const applyAccent = (host: HTMLElement & { _mateuAccent?: string }, accent: string | undefined, strip?: string) => {
    const value = accent && /^[#\w\s(),.%-]+$/.test(accent.trim()) ? accent.trim() : undefined
    const stripUrl = strip && (/^[\w\s/.:%~?&=#+,@-]+$/.test(strip.trim())
        || /^data:image\/svg\+xml;base64,[A-Za-z0-9+/]+=*$/.test(strip.trim())) ? strip.trim() : undefined
    if (value) {
        host.style.setProperty('--mateu-accent', value)
        host.style.setProperty('--mateu-page-band-h', ACCENT_STRIP_HEIGHT)
        host.style.setProperty('--mateu-page-band-image',
            stripUrl ? `url("${stripUrl}")` : `linear-gradient(${value}, ${value})`)
        host._mateuAccent = value
    } else if (host._mateuAccent) {
        ACCENT_PROPERTIES.forEach(property => host.style.removeProperty(property))
        host._mateuAccent = undefined
    }
}

@customElement('mateu-app')
export class MateuApp extends ComponentElement {

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        // Light DOM (DS renderers like redwood-spectra render mateu-app in light DOM): Lit's static
        // `styles` are only adopted into a shadow root, so the shell's class-based CSS (.mateu-nav-item,
        // .side-nav-link, .app-navbar, …) would never apply. Inject it once into document.head.
        MateuApp.injectLightDomStyles()
        return this;
    }

    private static lightDomStylesInjected = false
    private static injectLightDomStyles() {
        if (MateuApp.lightDomStylesInjected || typeof document === 'undefined') return
        MateuApp.lightDomStylesInjected = true
        if (document.getElementById('mateu-app-light-styles')) return
        const s = MateuApp.styles as unknown
        const cssText = Array.isArray(s)
            ? s.map(x => (x as { cssText?: string })?.cssText ?? '').join('\n')
            : ((s as { cssText?: string })?.cssText ?? '')
        if (!cssText) return
        const el = document.createElement('style')
        el.id = 'mateu-app-light-styles'
        el.textContent = cssText
        document.head.appendChild(el)
    }

    @state()
    filter: string = ''

    @state()
    instant: string | undefined = undefined

    @state()
    selectedConsumedRoute: string | undefined = undefined

    @state()
    selectedRoute: string | undefined = undefined

    @state()
    selectedUriPrefix: string | undefined = undefined

    @state()
    selectedBaseUrl: string | undefined = undefined

    @state()
    selectedServerSideType: string | undefined = undefined

    @state()
    selectedParams: unknown = undefined

    @state()
    tilesMenuOption: MenuOption | null = null

    @state()
    railOpenOption: MenuOption | null = null

    // HAMBURGER_SECTIONS: whether the hamburger's panel of sections is open. It opens over the
    // content and closes once a section is chosen, like Opera's.
    @state()
    sectionsOpen = false

    @state()
    commandPaletteOpen = false

    @state()
    commandPaletteQuery = ''

    @state()
    commandPaletteSelectedIndex = 0

    // entity hits from the app's GlobalSearchSupplier (the _globalsearch app-level action):
    // fetched debounced while the user types, shown under the menu results grouped by category
    @state()
    commandPaletteDataHits: GlobalSearchHit[] = []

    private _globalSearchTimer: ReturnType<typeof setTimeout> | undefined

    // the app-scope data source already fetched, so the boot fetch runs once (not on every update)
    private _fetchedAppDataRef: string | undefined = undefined

    private fetchGlobalSearch(query: string) {
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        if (!metadata?.globalSearchEnabled) return
        clearTimeout(this._globalSearchTimer)
        if (!query) {
            this.commandPaletteDataHits = []
            return
        }
        this._globalSearchTimer = setTimeout(async () => {
            try {
                const increment = await mateuApiClient.runAction(this.baseUrl ?? '',
                    metadata.rootRoute ?? '', '', '_globalsearch', 'cmd-palette', undefined,
                    metadata.serverSideType, {}, { searchText: query }, this, true)
                const data = increment?.fragments?.map(f => f.data).find(d => d && (d as Record<string, unknown>)['_globalsearch'])
                this.commandPaletteDataHits =
                    ((data as Record<string, unknown> | undefined)?.['_globalsearch'] as GlobalSearchHit[]) ?? []
            } catch {
                this.commandPaletteDataHits = []
            }
        }, 250)
    }

    private openDataHit = (hit: { route: string }) => {
        if (!dirtyGuard.confirmLeave()) return
        this.commandPaletteOpen = false
        this.commandPaletteQuery = ''
        this.commandPaletteDataHits = []
        // same uniform navigation pair the shells use for local menu options
        this.dispatchEvent(new CustomEvent('route-changed', {
            detail: { route: hit.route }, bubbles: true, composed: true
        }))
        this.dispatchEvent(new CustomEvent('navigate-to-requested', {
            detail: { route: hit.route }, bubbles: true, composed: true
        }))
    }

    private _commandPaletteHandler: ((e: KeyboardEvent) => void) | null = null

    @state()
    pageCompact = false

    private _compactHandler = (e: Event) => {
        this.pageCompact = (e as CustomEvent).detail?.compact ?? false
    }

    @query("mateu-chat")
    chat: MateuChat | undefined

    connectedCallback() {
        super.connectedCallback()
        this.isDark = document.documentElement.getAttribute('theme') === 'dark'
        this._commandPaletteHandler = (e: KeyboardEvent) => {
            // HAMBURGER_SECTIONS: Escape closes the hamburger's sections, wherever the focus is
            if (e.key === 'Escape' && this.sectionsOpen) this.sectionsOpen = false
            // When the command center is on it owns ⌘K and the full-screen palette; stand down.
            if (((this.component as ClientSideComponent)?.metadata as App)?.commandCenterEnabled) return
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                this.commandPaletteOpen = !this.commandPaletteOpen
                this.commandPaletteQuery = ''
                this.commandPaletteSelectedIndex = 0
            }
            if (e.key === 'Escape' && this.commandPaletteOpen) {
                this.commandPaletteOpen = false
                this.commandPaletteQuery = ''
            }
        }
        document.addEventListener('keydown', this._commandPaletteHandler)
        dirtyGuard.install()
        this.addEventListener('compact-changed', this._compactHandler)
        // The command center's "Ask AI" row opens the assistant panel.
        this.addEventListener('mateu-open-ai', this._openAiHandler)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        if (this._commandPaletteHandler) {
            document.removeEventListener('keydown', this._commandPaletteHandler)
        }
        this.removeEventListener('compact-changed', this._compactHandler)
        this.removeEventListener('mateu-open-ai', this._openAiHandler)
    }

    private _openAiHandler = () => {
        if (!this.chatOpen) this.showHideIa()
    }

    @state()
    isDark: boolean = document.documentElement.getAttribute('theme') === 'dark'

    @state()
    chatOpen: boolean = false

    toggleTheme = () => {
        this.isDark = !this.isDark
        const theme = this.isDark ? 'dark' : 'light'
        document.documentElement.setAttribute('theme', theme)
        safeLocalStorage.set('mateu-theme', theme)
    }

    showHideIa = () => {
        if (this.chat) {
            this.chatOpen = !this.chatOpen
            this.chat.slot = this.chatOpen ? 'detail' : 'detail-hidden'
        }
    }

    runAction = (actionId: string, ownedByShell = false) => {
        const root = this.renderRoot as Element | ShadowRoot
        const comp = root.querySelector?.('mateu-component') as HTMLElement | null
        if (comp) {
            comp.dispatchEvent(new CustomEvent('action-requested', {
                // an id the SHELL declares (a server action of its own) must not be answered by the
                // action catalogue on the way: owner first
                detail: ownedByShell ? { actionId, skipCatalogue: true } : { actionId },
                bubbles: true,
                composed: true
            }))
        }
    }

    /**
     * Applies one command of a shell flow. A `Navigate` to a route of the app moves the shell there
     * exactly as a menu RouteLink does (mount-relative, through the dirty guard); a `RunAction` with
     * no target is the menu's app-level action dispatch; the rest is the common command applier.
     */
    applyShellCommand = (command: UICommand) => {
        if (command.type === 'NavigateTo') {
            const route = inAppRoute(command.data)
            if (route !== undefined) {
                const app = (this.component as ClientSideComponent | undefined)?.metadata as App | undefined
                const root = (app?.rootRoute ?? '').replace(/\/+$/, '')
                this.selectRoute(root, root + '/' + route, undefined, undefined, undefined, undefined)
                return
            }
        }
        if (command.type === 'RunAction') {
            const data = command.data as { actionId?: string, targetComponentId?: string } | undefined
            if (data?.actionId && !data.targetComponentId) {
                this.runShellAction(data.actionId)
                return
            }
        }
        this.applyCommand(command)
    }

    /**
     * Runs an action a menu leaf (or a shell flow's RunAction step) names, OWNER FIRST: a flow the
     * shell declares — or, failing that, one of the app's ACTION catalogue — runs HERE, in the
     * browser. Anything else (the shell's own server action, a catalogue REST call, an id nobody
     * declares) goes to the on-screen component, which runs a catalogue REST call itself and sends
     * the rest to the server, as before.
     */
    runShellAction = (actionId: string) => {
        const app = (this.component as ClientSideComponent | undefined)?.metadata as App | undefined
        const resolved = shellActionFor(app, actionId)
        if (runDeclaredFlow(resolved, this.applyShellCommand)) return
        const ownedByShell = !!app?.actions?.some((a) => a && a.id === actionId)
        this.runAction(actionId, ownedByShell)
    }

    // A menu leaf is either a route or a rule. When it carries rules, clicking it RUNS them instead
    // of navigating. Only the app-level rule actions make sense here: RunAction dispatches the action
    // (same path as a FAB/header action), RunJS evaluates a statement. The state-mutating rules have
    // no component target at menu scope and are ignored.
    runMenuRules = (rules: Rule[]) => {
        for (const rule of rules) {
            if (rule.action === RuleAction.RunAction && rule.actionId) {
                this.runShellAction(rule.actionId)
            } else if (rule.action === RuleAction.RunJS && rule.value != null) {
                try {
                    runJs(String(rule.value))
                } catch (e) {
                    console.error('menu RunJS rule failed', e)
                }
            }
        }
    }

        getSelectedOption = (options: MenuOption[]): MenuOption | null => {
        if (options) {
            for (let i = 0; i < options.length; i++) {
                const option = options[i]
                // tras una navegación en cliente manda la ruta seleccionada; el flag del
                // wire refleja solo el momento en que se construyó el App
                if (this.selectedRoute ? this.isActiveOption(option) : option.selected) {
                    return option
                }
                const foundInChildren = this.getSelectedOption(option.submenus)
                if (foundInChildren) {
                    return foundInChildren
                }
            }
        }
        return null
    }

    itemSelected = (e: MenuBarItemSelectedEvent) => {
        const v = e.detail.value as any
        // a remote section whose remote did not answer: nothing to open — ask it again instead
        if (v.unavailable) {
            retryUnavailableMenus()
            return
        }
        this.selectRoute(v.consumedRoute, v.route, v.actionId, v.baseUrl, v.serverSideType, v.uriPrefix, v.rules)
    }

    itemSelectedTiles = (e: MenuBarItemSelectedEvent) => {
        const option: MenuOption = (e.detail.value as any)._menuOption
        if (option.submenus && option.submenus.length > 0) {
            this.tilesMenuOption = option
        } else {
            this.tilesMenuOption = null
            this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix, option.rules)
        }
    }

    mapItemsForTiles = (options: MenuOption[]): MenuBarItem[] => {
        return options.map(option => ({
            text: option.label,
            consumedRoute: option.consumedRoute,
            route: option.route,
            baseUrl: option.baseUrl,
            serverSideType: option.serverSideType,
            uriPrefix: option.uriPrefix,
            actionId: option.actionId,
            selected: option.selected,
            _menuOption: option,
        }))
    }

    flattenMenuForPalette = (menu: MenuOption[], breadcrumb: string): Array<{label: string, breadcrumb: string, consumedRoute: string | undefined, route: string | undefined, actionId: string | undefined, baseUrl: string | undefined, serverSideType: string | undefined, uriPrefix: string | undefined}> => {
        const result: ReturnType<typeof this.flattenMenuForPalette> = []
        for (const option of menu) {
            if (option.separator) continue
            if (option.submenus && option.submenus.length > 0) {
                const childBreadcrumb = breadcrumb ? `${breadcrumb} › ${option.label}` : option.label
                result.push(...this.flattenMenuForPalette(option.submenus, childBreadcrumb))
            } else {
                result.push({
                    label: option.label,
                    breadcrumb,
                    consumedRoute: option.consumedRoute,
                    route: option.route,
                    actionId: option.actionId,
                    baseUrl: option.baseUrl,
                    serverSideType: option.serverSideType,
                    uriPrefix: option.uriPrefix,
                })
            }
        }
        return result
    }

    handleCommandPaletteKeydown = (e: KeyboardEvent, filtered: ReturnType<typeof this.flattenMenuForPalette>) => {
        // the navigable list = up to 10 menu results followed by up to 8 entity hits
        const menuCount = Math.min(filtered.length, 10)
        const totalCount = menuCount + Math.min(this.commandPaletteDataHits.length, 8)
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.commandPaletteSelectedIndex = Math.min(this.commandPaletteSelectedIndex + 1, totalCount - 1)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.commandPaletteSelectedIndex = Math.max(this.commandPaletteSelectedIndex - 1, 0)
        } else if (e.key === 'Enter') {
            if (this.commandPaletteSelectedIndex >= menuCount) {
                const hit = this.commandPaletteDataHits[this.commandPaletteSelectedIndex - menuCount]
                if (hit) this.openDataHit(hit)
                return
            }
            const item = filtered[this.commandPaletteSelectedIndex]
            if (item) {
                this.selectRoute(item.consumedRoute, item.route, item.actionId, item.baseUrl, item.serverSideType, item.uriPrefix)
                this.commandPaletteOpen = false
                this.commandPaletteQuery = ''
            }
        }
    }

    renderCommandPalette = (): TemplateResult | typeof nothing => {
        if (!this.commandPaletteOpen) return nothing
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        if (metadata?.commandCenterEnabled) return nothing
        if (!metadata?.menu) return nothing

        const allItems = this.flattenMenuForPalette(metadata.menu, '')
        const query = this.commandPaletteQuery.toLowerCase()
        const filtered = query
            ? allItems.filter(item =>
                item.label.toLowerCase().includes(query) ||
                item.breadcrumb.toLowerCase().includes(query))
            : allItems

        return html`
            <div class="cmd-backdrop" @click=${() => { this.commandPaletteOpen = false; this.commandPaletteQuery = '' }}>
                <div class="cmd-palette" @click=${(e: Event) => e.stopPropagation()}>
                    <div class="cmd-search-wrapper">
                        ${icon('vaadin:search', undefined, 'cmd-search-icon')}
                        <input
                            class="cmd-input"
                            placeholder="${chromeText('goTo')}"
                            .value=${this.commandPaletteQuery}
                            @input=${(e: InputEvent) => {
                                this.commandPaletteQuery = (e.target as HTMLInputElement).value
                                this.commandPaletteSelectedIndex = 0
                                this.fetchGlobalSearch(this.commandPaletteQuery)
                            }}
                            @keydown=${(e: KeyboardEvent) => this.handleCommandPaletteKeydown(e, filtered)}
                        >
                    </div>
                    <div class="cmd-results">
                        ${filtered.slice(0, 10).map((item, idx) => html`
                            <div class="cmd-result ${idx === this.commandPaletteSelectedIndex ? 'cmd-result--selected' : ''}"
                                @click=${() => {
                                    this.selectRoute(item.consumedRoute, item.route, item.actionId, item.baseUrl, item.serverSideType, item.uriPrefix)
                                    this.commandPaletteOpen = false
                                    this.commandPaletteQuery = ''
                                }}
                                @mouseenter=${() => { this.commandPaletteSelectedIndex = idx }}
                            >
                                <span class="cmd-result-label">${item.label}</span>
                                ${item.breadcrumb ? html`<span class="cmd-result-breadcrumb">${item.breadcrumb}</span>` : nothing}
                            </div>
                        `)}
                        ${query && this.commandPaletteDataHits.length > 0 ? html`
                            ${this.commandPaletteDataHits.slice(0, 8).map((hit, hitIndex) => {
                                const idx = Math.min(filtered.length, 10) + hitIndex
                                const previous = this.commandPaletteDataHits[hitIndex - 1]
                                return html`
                                    ${hit.category && hit.category !== previous?.category ? html`
                                        <div class="cmd-category">${hit.category}</div>` : nothing}
                                    <div class="cmd-result ${idx === this.commandPaletteSelectedIndex ? 'cmd-result--selected' : ''}"
                                         @click=${() => this.openDataHit(hit)}
                                         @mouseenter=${() => { this.commandPaletteSelectedIndex = idx }}
                                    >
                                        <span class="cmd-result-label">${hit.label}</span>
                                        ${hit.description ? html`<span class="cmd-result-breadcrumb">${hit.description}</span>` : nothing}
                                    </div>`
                            })}` : nothing}
                        ${filtered.length === 0 && this.commandPaletteDataHits.length === 0 ? html`<div class="cmd-empty">${chromeTextf('noResultsFor', { query: this.commandPaletteQuery })}</div>` : nothing}
                    </div>
                </div>
            </div>
        `
    }

    renderRail = (menu: MenuOption[]): TemplateResult => {
        return html`
            <div class="nav-rail">
                ${menu.map(option => this.renderRailItem(option))}
            </div>
        `
    }

    renderRailItem = (option: MenuOption): TemplateResult => {
        const isActive = option.submenus?.length > 0
            ? this.railOpenOption?.label === option.label
            : option.selected
        return html`
            <div class="rail-item ${isActive ? 'rail-item--active' : ''}"
                @click=${() => {
                    if (option.submenus && option.submenus.length > 0) {
                        this.railOpenOption = this.railOpenOption?.label === option.label ? null : option
                    } else {
                        this.railOpenOption = null
                        this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix, option.rules)
                    }
                }}
            >
                ${option.icon
                    ? icon(option.icon, undefined, 'rail-icon')
                    : html`<div class="rail-icon-placeholder">${option.label.charAt(0).toUpperCase()}</div>`
                }
                <span class="rail-label">${option.label}</span>
            </div>
        `
    }

    renderRailSubPanel = (option: MenuOption): TemplateResult => {
        return html`
            <div class="rail-sub-panel">
                <div class="rail-sub-title">${option.label}</div>
                ${option.submenus.map(sub => html`
                    <div class="rail-sub-item ${sub.selected ? 'rail-sub-item--active' : ''}"
                        @click=${() => {
                            if (sub.submenus && sub.submenus.length > 0) {
                                this.railOpenOption = sub
                            } else {
                                this.selectRoute(sub.consumedRoute, sub.route, sub.actionId, sub.baseUrl, sub.serverSideType, sub.uriPrefix, sub.rules)
                            }
                        }}
                    >${sub.label}</div>
                `)}
            </div>
        `
    }

    renderTilesHub = (option: MenuOption): TemplateResult => {
        return html`
            <div style="padding: 2rem;">
                <h2 style="margin-top: 0; margin-bottom: 1.5rem;">${option.label}</h2>
                <div class="tiles-hub-grid">
                    ${option.submenus.map(sub => html`
                        <div class="nav-tile"
                            @click=${() => {
                                if (sub.submenus && sub.submenus.length > 0) {
                                    this.tilesMenuOption = sub
                                } else {
                                    this.tilesMenuOption = null
                                    this.selectRoute(sub.consumedRoute, sub.route, sub.actionId, sub.baseUrl, sub.serverSideType, sub.uriPrefix, sub.rules)
                                }
                            }}
                        >
                            ${sub.icon ? icon(sub.icon, 'font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;') : nothing}
                            <div class="nav-tile-title">${sub.label}</div>
                            ${sub.description ? html`<div class="nav-tile-desc">${sub.description}</div>` : nothing}
                        </div>
                    `)}
                </div>
            </div>
        `
    }

    goHome = () => {
        // la HOME real del app la resuelve el SERVIDOR para la ruta raíz (@HomeRoute) — el
        // homeRoute del wire es relativo a la petición con que se construyó el App (en
        // /reservas vale /reservas), así que la vuelta a casa es una navegación de URL a la
        // raíz, idéntica a cargar '/' (y con el dirty guard del router)
        if (!dirtyGuard.confirmLeave()) {
            return
        }
        window.history.pushState(null, '', '/')
        window.dispatchEvent(new PopStateEvent('popstate', { state: null }))
    }

    selectRoute = (consumedRoute: string | undefined, route: string | undefined, _actionId: string | undefined, _baseUrl: string | undefined, serverSideType: string | undefined, uriPrefix: string | undefined, rules?: Rule[] ) => {
        if (rules && rules.length > 0) {
            this.runMenuRules(rules)
            return
        }
        if (!dirtyGuard.confirmLeave()) {
            return
        }
        this._selectRoute(consumedRoute, route, _actionId, _baseUrl, serverSideType, uriPrefix)
    }

    _selectRoute = (consumedRoute: string | undefined, route: string | undefined, _actionId: string | undefined, _baseUrl: string | undefined, serverSideType: string | undefined, uriPrefix: string | undefined ) => {
        if (true) {
            this.selectedConsumedRoute = consumedRoute
            this.selectedBaseUrl = _baseUrl
            this.selectedRoute = route
            this.selectedServerSideType = serverSideType
            this.selectedUriPrefix = uriPrefix;
            this.instant = nanoid()
            if (this.state && this.state._route != undefined) {
                this.state._route = undefined
            }
            let baseUrl = this.baseUrl??''
            if (baseUrl.indexOf('://') < 0) {
                if (!baseUrl.startsWith('/')) {
                    baseUrl = '/' + baseUrl
                }
                baseUrl = window.location.origin + baseUrl
            }
            if (baseUrl.endsWith('/') && (route??'').startsWith('/')) {
                route = (route??'').substring(1)
            }
            let targetUrl = new URL(baseUrl + route)
            if (consumedRoute && targetUrl.pathname.startsWith(consumedRoute)) {
                const pathAfterConsumed = targetUrl.pathname.substring(consumedRoute.length)
                // the query is part of where we are going (a listing's filters): keep it
                targetUrl = new URL(targetUrl.origin + (pathAfterConsumed || '/') + targetUrl.search)
            }
            // The same path with another query is another place: /bookings?status=Cancelled is not
            // /bookings. Comparing paths alone left the address bar on the old query, and the
            // listing — which reads its filters off the URL — showed the old rows.
            if ((window.location.pathname || targetUrl.pathname)
                && (window.location.pathname != targetUrl.pathname || window.location.search != targetUrl.search)) {
                let pathname = targetUrl.pathname
                if (targetUrl.search) {
                    pathname += targetUrl.search
                }
                if (pathname && !pathname.startsWith('/')) {
                    pathname = '/' + pathname
                }
                if (this.baseUrl && pathname.startsWith(this.baseUrl)) {
                    pathname = pathname.substring(this.baseUrl.length)
                }


                let effectiveRoute = pathname
                if (this.selectedUriPrefix) {
                    if (effectiveRoute.startsWith('/') && this.selectedUriPrefix.endsWith('/')) {
                        effectiveRoute = this.selectedUriPrefix + effectiveRoute.substring(1)
                    } else if (!effectiveRoute.startsWith('/') && !this.selectedUriPrefix.endsWith('/')) {
                        effectiveRoute = this.selectedUriPrefix + '/' + effectiveRoute
                    } else {
                        effectiveRoute = this.selectedUriPrefix + effectiveRoute
                    }
                }
                if (effectiveRoute == '/_page') {
                    effectiveRoute = ''
                }

                this.dispatchEvent(new CustomEvent('route-changed', {
                    detail: {
                        route: effectiveRoute,
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
    }

    // el flag selected del wire refleja la ruta en el MOMENTO de construir el App; tras una
    // navegación en cliente manda la ruta seleccionada actual
    //
    // The rule itself is navTree's (isActiveFor): a remote section that has not answered yet is
    // active by the prefix its screens live under, a group by what it holds.
    private isActiveOption = (option: MenuOption): boolean => {
        if (!this.selectedRoute) {
            return !!option.selected || (isMount(option) && isActiveFor(option, window.location.pathname))
        }
        return isActiveFor(option, this.selectedRoute)
    }

    mapItems = (options: MenuOption[], filter: string): MenuBarItem[] => {
        return (options.map(option => {
            if (option.submenus && option.submenus.length > 0) {
                let children = this.mapItems(option.submenus, filter)
                if (filter && option.label.toLowerCase().includes(filter)) {
                    children = this.mapItems(option.submenus, '')
                }
                if (children && children.length > 0) {
                    return {
                        consumedRoute: option.consumedRoute,
                        text: option.label,
                        route: option.route,
                        baseUrl: option.baseUrl,
                        serverSideType: option.serverSideType,
                        uriPrefix: option.uriPrefix,
                        actionId: option.actionId,
                        selected: filter || this.isActiveOption(option),
                        // card menus: the group opens as cards; title/description/icon/image of
                        // a card that has its own children (its actions)
                        display: option.display ?? undefined,
                        description: option.description,
                        icon: option.icon,
                        image: option.image ?? undefined,
                        children
                    }
                }
                return undefined
            }
            if (option.separator) {
                return filter?undefined:{
                    component: 'hr'
                }
            }
            if (!filter || option.label.toLowerCase().includes(filter)) {
                return {
                    // a remote section whose remote did not answer: there, but not to be opened
                    // Not `disabled`: a disabled menu-bar button takes no pointer events, so its
                    // tooltip never shows. Dimmed instead, and a click asks the remote again.
                    ...(option.unavailable ? {
                        unavailable: true,
                        className: 'mateu-nav-unavailable',
                        tooltip: option.description,
                        title: option.description,
                    } : {}),
                    consumedRoute: option.consumedRoute,
                    text: option.label,
                    route: option.route,
                    baseUrl: option.baseUrl,
                    serverSideType: option.serverSideType,
                    uriPrefix: option.uriPrefix,
                    actionId: option.actionId,
                    selected: filter || this.isActiveOption(option),
                    description: option.unavailable ? undefined : option.description,
                    icon: option.icon,
                    image: option.image ?? undefined,
                    // a rule leaf (RuleLink): itemSelected hands these to selectRoute, which RUNS
                    // them instead of navigating — without them the click went to the label path
                    rules: option.rules,
                }
            } else return undefined
        }) as Array<MenuBarItem | undefined>).filter((option): option is MenuBarItem => option != null)
    }

    getSelectedIndex = (menu: MenuOption[] | null) => {
        if (!menu) {
            return NaN
        }
        // The server-provided `option.selected` flag is computed once at app-metadata build
        // time and never updated after a client-side navigation, so it can't drive the active
        // tab. Derive it from the live current route instead (updated on every selectRoute),
        // matching by exact route or route prefix (so deep routes keep their top tab active).
        const norm = (r: string | undefined) => {
            let s = (r ?? '').trim()
            if (s.length > 1 && s.endsWith('/')) s = s.slice(0, -1)
            return s
        }
        // The longest prefix wins, the home tab never does (it would match everything), and a
        // remote section counts by its prefix before its remote has answered (navTree).
        const bestIdx = activeTopIndex(menu, norm(this.selectedRoute ?? window.location.pathname))
        if (!Number.isNaN(bestIdx)) {
            return bestIdx
        }
        // fall back to the server flag (initial render / home route with no matching tab)
        const selectedOption = this.getSelectedOption(menu)
        return selectedOption ? menu.indexOf(selectedOption) : NaN
    }

    /**
     * HAMBURGER_SECTIONS: the section on screen — the top-level option holding the current route,
     * by the same rule (and the same fallback to the server's flag) as the active tab.
     *
     * The address bar first: it is the shell's route. `selectedRoute` is not always — on a deep link
     * into a remote it is the route WITHIN the remote (/things for /remote/things), which no
     * section's prefix covers until the remote's own entries have arrived.
     */
    activeSectionOf = (menu: MenuOption[] | null | undefined): MenuOption | undefined => {
        if (!menu) return undefined
        const byRoute = activeSection(menu, window.location.pathname)
            ?? (this.selectedRoute ? activeSection(menu, this.selectedRoute) : undefined)
        if (byRoute) return byRoute
        const index = this.getSelectedIndex(menu)
        return Number.isNaN(index) ? undefined : menu[index]
    }

    /**
     * HAMBURGER_SECTIONS: a section chosen in the hamburger goes to the section's home (its first
     * entry, see navTree.sectionHome), as in Opera, and the panel closes. A remote section that did
     * not answer has nothing to open: it is asked again instead. One that has not answered YET stays
     * where it is (the panel too), and its entries arrive in a moment.
     */
    selectSection = (section: MenuOption) => {
        if (section.unavailable) {
            retryUnavailableMenus()
            return
        }
        const home = sectionHome(section)
        if (!home) return
        this.sectionsOpen = false
        this.selectRoute(home.consumedRoute, home.route, home.actionId, home.baseUrl, home.serverSideType, home.uriPrefix, home.rules)
    }

    renderOptionOnLeftMenu = (option: MenuOption): TemplateResult => {
        if (option.submenus && option.submenus.length > 0) {
            return html`
                <details open class="left-menu-group">
                    <summary>${option.label}</summary>
                    <div class="left-menu-children">
                        ${option.submenus.map(child => html`${this.renderOptionOnLeftMenu(child)}`)}
                    </div>
                </details>
`
        }
        return html`<button class="left-menu-item"
                @click="${() => this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix, option.rules)}"
        >${option.label}</button>`
    }

    @query('.mateu-app-layout')
    vaadinAppLayout: AppLayout | undefined

    navItemSelected = (e: Event & {
        consumedRoute: string | undefined
        path: string | undefined
        actionId: string | undefined
        baseUrl: string | undefined
        serverSideType: string | undefined
        uriPrefix: string | undefined
    }) => {
        if (e.path == this.selectedRoute && e.consumedRoute == this.selectedConsumedRoute && e.baseUrl == this.selectedBaseUrl &&  e.serverSideType == this.selectedServerSideType) {
            const uxElement = this.shadowRoot?.querySelector('mateu-ux');
            if (uxElement) {
                uxElement.setAttribute("instant", nanoid())
            }
        } else {
            this.selectRoute(e.consumedRoute, e.path, e.actionId, e.baseUrl, e.serverSideType, e.uriPrefix)
        }
        if (((this.component as ClientSideComponent).metadata as App).drawerClosed) {
            if (this.vaadinAppLayout) {
                this.vaadinAppLayout.drawerOpened = false
            }
        }
    }

    renderSideNav = (items: Array<MenuBarItem> | undefined, _slot: string | undefined): TemplateResult | typeof nothing => {
        return items?html`
            ${items.map((rawItem) => {
                const item = rawItem as MenuBarItem & {
                    route: string | undefined
                    icon: string | undefined
                    selected: boolean | undefined
                }
                return html`

                        ${item.component == 'hr'?html`<hr/>`:html`
                                <div class="side-nav-item ${item.selected?'side-nav-item--active':''}">
                                    <button class="side-nav-link"
                                            @click="${() => { if (item.route && !item.children) this.selectRoute(undefined, item.route as string, undefined, this.baseUrl, undefined, undefined) }}">
                                        ${item.icon ? icon('vaadin:dashboard', 'margin-right:.5rem;') : nothing}${item.text}
                                    </button>
                                    ${item.children ? html`<div class="side-nav-children">${this.renderSideNav(item.children as MenuBarItem[] | undefined, 'children')}</div>` : nothing}
                                </div>
                        `}

                            `})}`:nothing
    }

    updateRoute: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        var detail = (e as CustomEvent).detail
        this.selectRoute(detail.consumedRoute, detail.route, detail.actionId, detail.baseUrl, detail.serverSideType, detail.uriPrefix, detail.rules)
    }

    // The page language must be right BEFORE this render: the chrome draws its words from it.
    protected willUpdate(changed: PropertyValues) {
        super.willUpdate(changed)
        if (changed.has('component')) {
            applyUiLanguage(((this.component as ClientSideComponent | undefined)?.metadata as App | undefined)?.locale)
        }
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        syncCommandCenter(this);
        if (this.component) {
            const clientSideComponent = this.component as ClientSideComponent
            const metadata = clientSideComponent.metadata
            if (metadata) {
                const app = metadata as App
                // @App(accessKeys): holding Alt shows the keys of the visible buttons and tabs
                syncAccessKeys(!!app.accessKeys)
                // The menu the automatic breadcrumb trail walks (breadcrumbTrail): published again
                // when the remote sections have been fetched and the menu grows.
                // The whole tree (navMenu): hidden sections are not drawn, but a page under one
                // still has its trail.
                publishShellMenu(this, app.navMenu ?? app.menu, app.noBreadcrumbs, (option, route) =>
                    this.selectRoute(option.consumedRoute, route, option.actionId, option.baseUrl,
                        option.serverSideType, option.uriPrefix))
                // The app's REST source catalogue, published for the fetch layer: a surface carries
                // only a source's name, so the lookup table has to be in place before it fetches.
                setRestSourceCatalogue(app.restSources)
                // The ACTION catalogue: an id a page or the shell names but does not declare runs
                // the catalogue's flow / REST call before going to the server.
                setActionCatalogue(app.actionCatalogue)
                // Sample mode is only ever switched ON by the app (the server opted in with
                // mateu.sources.mock=true); an app without the flag leaves it as it is.
                if (app.mockSources) setSampleMode(true)
                // The business-component catalogue (coherence-plan #13): a ComponentRef carries only
                // a name, so the compositions have to be in place before anything renders one.
                setComponentCatalogue(app.components)
                // The app-scope data source: fetch it ONCE (deduped by ref) into the app-data store,
                // after the catalogue is published so the ref resolves. Shared across routes.
                if (app.appDataSource) {
                    const ref = app.appDataSource.ref || app.appDataSource.url
                    if (ref && ref !== this._fetchedAppDataRef) {
                        this._fetchedAppDataRef = ref
                        fetchExternalJson(app.appDataSource)
                            .then(json => {
                                if (json && typeof json === 'object') {
                                    appData.value = { ...appData.value, ...(json as Record<string, unknown>) }
                                    this.dispatchEvent(new CustomEvent('app-data-updated', { bubbles: true, composed: true }))
                                }
                            })
                            .catch(e => console.error('app-scope data source fetch failed', e))
                    }
                }
                applyAccent(this, app.accentColor, app.accentStrip || app.generatedAccentStrip)
                if (app.favicon) {
                    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null
                    if (!link) {
                        link = document.createElement('link') as HTMLLinkElement
                        link.rel = 'icon'
                        document.head.appendChild(link)
                    }
                    link.href = app.favicon
                }
                if (_changedProperties.has('component')) {
                    // Capability handshake: warn + emit `mateu-capability-mismatch` if this build
                    // does not provide everything the app requires (compat by capability, not
                    // version). Never blocks rendering — a degraded screen the host is told about
                    // beats a silent broken one.
                    announceCapabilityMismatch(app.requiredCapabilities, this)
                    this.selectedRoute = app.homeRoute
                    this.selectedConsumedRoute = app.homeConsumedRoute
                    this.selectedServerSideType = app.homeServerSideType
                    this.selectedBaseUrl = reachableBaseUrl(app, this.baseUrl)
                    this.selectedUriPrefix = app.homeUriPrefix
                }
            }
        }
        if (_changedProperties.has('commandPaletteOpen') && this.commandPaletteOpen) {
            setTimeout(() => {
                const input = this.renderRoot.querySelector('.cmd-input') as HTMLInputElement
                input?.focus()
            }, 0)
        }
    }

    render() {
        return componentRenderer.get()?.renderAppComponent(this, this.component as ClientSideComponent, this.baseUrl, this.state, this.data, this.appState, this.appData)
    }

    static styles = [css`
        /* DS-neutral app chrome (replaces vaadin-app-layout / menu-bar / tabs / side-nav). */
        .m-hl { display: flex; flex-direction: row; }
        .m-vl { display: flex; flex-direction: column; }
        .m-scroll { overflow: auto; }
        .m-md { display: flex; width: 100%; height: 100%; }
        .m-md > .m-scroll { flex: 1; min-width: 0; }
        /* The agent's chat panel: shown when open (slot="detail"), hidden when closed. It opens on
           the content row's START (order -1: the left), under the header, which it never covers
           or moves; the header's chat toggle (appRenderer, renderChatToggle) opens and closes it.
           On a wide viewport it pushes the content aside; on a narrow one it covers the content
           area, full width (in either mode) — a side column would leave the page nothing. */
        mateu-chat[slot="detail-hidden"] { display: none; }
        mateu-chat[slot="detail"] { display: flex; flex-direction: column; flex: 0 0 var(--mateu-chat-width, 460px); min-width: 0; max-width: calc(100% - 20rem); order: -1; box-sizing: border-box; padding-top: 0.5rem; border-inline-end: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff); }
        /* its width is the user's (mateu-chat: 460px by default, 320–720 dragging its edge,
           remembered); ⤢ widens it to ~60% of the viewport, the page still beside it */
        mateu-chat[slot="detail"][expanded] { flex-basis: var(--mateu-chat-wide, 60vw); max-width: none; }
        /* pushed aside, a fixed-width page fills what is left and would touch the panel: keep a gutter */
        @media (min-width: 601px) {
            .m-md:has(> mateu-chat[slot="detail"]) > .m-scroll { padding-inline: var(--lumo-space-m, 1rem); }
        }
        @media (max-width: 600px) {
            .m-md:has(> mateu-chat[slot="detail"]) { position: relative; }
            mateu-chat[slot="detail"] { position: absolute; inset: 0; z-index: 1000; width: 100%; max-width: none; border-inline-end: none; }
        }
        /* The header's icon buttons (appRenderer, renderHeaderIconButton: the chat and theme toggles —
           a tertiary icon vaadin-button in the Vaadin renderer, .app-chrome-icon-btn otherwise). One
           icon style for the whole header: outline glyphs at --lumo-icon-size-m, in
           --mateu-header-icon-color (an app can set it on mateu-app; default the secondary text
           colour). A two-state button reads as pressed (aria-pressed) in the primary colours. */
        .mateu-header-icon-btn, .app-chrome-icon-btn { color: var(--mateu-header-icon-color, var(--lumo-secondary-text-color, #5a6573)); flex-shrink: 0; margin: 0; }
        .mateu-header-icon-btn > vaadin-icon { width: var(--lumo-icon-size-m, 1.5rem); height: var(--lumo-icon-size-m, 1.5rem); }
        .mateu-header-icon-btn:hover { color: var(--lumo-body-text-color, #1a1a1a); }
        /* (Lumo forces a tertiary button's background through --vaadin-button-tertiary-background) */
        .mateu-header-icon-btn[aria-pressed="true"], .app-chrome-icon-btn[aria-pressed="true"] { color: var(--lumo-primary-text-color, #1676f3); --vaadin-button-tertiary-background: var(--lumo-primary-color-10pct, rgba(22,118,243,.1)); background-color: var(--lumo-primary-color-10pct, rgba(22,118,243,.1)); }
        .app-chrome-icon-btn:focus-visible { outline: 2px solid var(--lumo-primary-color-50pct, rgba(22,118,243,.5)); outline-offset: 1px; }
        .m-app-layout { display: flex; flex-direction: column; width: 100%; height: 100vh; overflow: hidden; }
        .m-app-layout > .app-navbar { display: flex; align-items: center; gap: .5rem; height: 4rem; flex-shrink: 0; padding: 0 .75rem; border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); background: var(--lumo-base-color, #fff); }
        .m-app-layout > .app-body { display: flex; flex: 1; min-height: 0; }
        .app-drawer { width: 16rem; flex-shrink: 0; overflow: auto; border-right: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); padding: .5rem 0; }
        .m-app-layout:not(.drawer-open) > .app-body > .app-drawer { display: none; }
        .drawer-toggle { border: none; background: transparent; font-size: 1.2rem; cursor: pointer; padding: .3rem .5rem; border-radius: var(--lumo-border-radius-m, 6px); }
        .drawer-toggle:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .drawer-search { padding: .4rem .6rem; border: 1px solid var(--lumo-contrast-20pct, rgba(0,0,0,.2)); border-radius: var(--lumo-border-radius-m, 6px); box-sizing: border-box; font: inherit; }

        /* The app header's row (.mateu-app-header, see appRenderer) on a narrow viewport. The brand
           and the widgets may shrink, and the menu takes what is left with room kept for at least its
           overflow button: vaadin-menu-bar moves what does not fit into "···" by itself, so a width
           to measure is all it needs. Before, brand and widgets would not shrink, the menu was left
           0px wide and the widgets ran off the right edge. */
        .mateu-app-header > .mateu-app-brand { flex: 0 1 auto; min-width: 0; }
        .mateu-app-header > .menu-on-top { flex: 1 1 0; min-width: var(--lumo-size-m, 2.25rem); }
        .mateu-app-header > .mateu-app-widgets { flex: 0 1 auto; min-width: 0; }
        /* One spacing between everything in the widget zone — the chat toggle, the app's own widgets
           (slotted: a slot is display: contents, so they are items of this row too), the context
           pickers and actions, the theme toggle. Each used to bring its own margin, or none: the
           app's widgets and the pickers had none and sat against each other. */
        .mateu-app-widgets { gap: var(--lumo-space-m, 1rem); }
        /* The app's widgets are often raw HTML (a Text with an <a>…). Text in them is header text,
           and a bare link reads as header text too, not as the browser's link blue: the shared link
           rule (linkStyles.ts) takes --mateu-link-color, which inherits into the widgets' own shadow
           roots. An app can set --mateu-header-link-color on mateu-app to have them stand out. */
        .mateu-app-widgets { --mateu-link-color: var(--mateu-header-link-color, var(--lumo-body-text-color, #1a1a1a)); }
        .mateu-app-widgets ::slotted(*) { color: var(--lumo-body-text-color, #1a1a1a); }
        /* Below 600px the title goes (the logo still says whose app this is) and the header turns
           compact. What a widget shows then is the widget's to say, and a class could not reach it —
           widgets are other components, in shadow roots of their own — but a custom property is
           inherited through those, so the header sets two:
             display: var(--mateu-header-wide-only, inline)   shown except when compact
             display: var(--mateu-header-narrow-only, none)   shown only when compact (inline-flex, what a vaadin-icon needs to keep its size and place) */
        @media (max-width: 600px) {
            .mateu-app-header .mateu-app-title { display: none; }
            .mateu-app-header { --mateu-header-wide-only: none; --mateu-header-narrow-only: inline-flex; }
            /* compact header: every pixel of the row is the menu's */
            .mateu-app-widgets { gap: var(--lumo-space-s, .5rem); }
        }

        /* MENU_ON_TOP in two bands (appRenderer): band 1 = logo + widgets, band 2 = the app title
           then the menu bar. Band 2's start lines up with the content gutter below it. Below 600px
           the menu folds into a ☰ button before the title. Band 1 takes the same gutter as band 2
           and the content, so the logo, the band-2 title and the page share one left edge (24px,
           16px on a phone); on the end, the last widget's own padding makes up the difference. */
        .mateu-app-band1 {
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            box-sizing: border-box;
            padding-inline: var(--mateu-content-gutter, 24px) calc(var(--mateu-content-gutter, 24px) - var(--lumo-space-s, .5rem));
        }
        .mateu-app-band1 > .mateu-app-header { align-items: center !important; }
        .mateu-app-band1 .mateu-app-brand > .m-hl { align-items: center !important; }
        .mateu-app-band2 {
            display: flex;
            align-items: center;
            gap: var(--lumo-space-s, .5rem);
            flex-shrink: 0;
            width: 100%;
            box-sizing: border-box;
            min-height: 2.75rem;
            padding-inline: var(--mateu-content-gutter, 24px) calc(var(--mateu-content-gutter, 24px) - var(--lumo-space-s, .5rem));
            background-color: var(--lumo-base-color);
            color: var(--lumo-body-text-color);
            border-bottom: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            /* (no accent line here: the app's accent is a strip drawn where Redwood draws its
               colour strip — under the page header, on top of a listing — see applyAccent) */
        }
        /* home / section links are buttons (no href="javascript:…", which a strict CSP blocks):
           reset to look like the links they replace */
        :where(button.mateu-app-brand, button.mateu-app-band-title) {
            background: none; border: none; padding: 0; margin: 0; font: inherit; color: inherit;
            cursor: pointer; text-align: inherit;
        }
        .mateu-app-band-title {
            flex: 0 0 auto;
            margin-inline-end: var(--lumo-space-m, 1rem);
            font-size: var(--lumo-font-size-l, 1.125rem);
            font-weight: 600;
            color: var(--lumo-header-text-color, inherit);
            /* the app's accent (@App(accentColor) → --mateu-accent) in the light theme only: on the
               dark base a brand red loses contrast, so there it stays the header text colour */
            color: light-dark(var(--mateu-accent, var(--lumo-header-text-color, currentColor)), var(--lumo-header-text-color, currentColor));
            text-decoration: none;
            white-space: nowrap;
        }
        .mateu-app-band2 > .menu-band { flex: 1 1 0; min-width: 0; }
        /* The menu band is navigation, not a row of links: its items in the body text colour (the
           Vaadin adapter draws it as a tertiary contrast vaadin-menu-bar), and the section on screen
           marked quietly — the primary text colour and a 2px underline, as vaadin-tabs marks its
           selected tab, with no fill. The ☰ button of a narrow viewport is header text too. */
        .mateu-app-band2 vaadin-menu-bar-button { color: var(--lumo-body-text-color, #1a1a1a); font-weight: 500; }
        .mateu-app-band2 vaadin-menu-bar-button:hover { color: var(--lumo-header-text-color, #000); }
        .mateu-app-band2 .menu-band vaadin-menu-bar-button.mateu-nav-active,
        .mateu-app-band2 .sections-band vaadin-menu-bar-button.mateu-nav-active {
            color: var(--lumo-primary-text-color, #1676f3);
            border-radius: var(--lumo-border-radius-m, 6px) var(--lumo-border-radius-m, 6px) 0 0;
            box-shadow: inset 0 -2px 0 0 var(--lumo-primary-color, #1676f3);
        }
        .mateu-app-menu-button { display: none; flex: 0 0 auto; margin-inline-start: calc(-1 * var(--lumo-space-s, .5rem)); }
        /* The content gutter of this shell (it has no padded .app-content): the page's content view
           takes it (mateu-ux data-page-width fixed/full), the RDS 24px — 16px on a phone. */
        .mateu-content-gutter { --mateu-content-gutter: 24px; --mateu-shell-gutter: 24px; }
        /* …and the two header bands take the same gutter, so the header's edges line up with it */
        .mateu-app-band1, .mateu-app-band2 { --mateu-content-gutter: 24px; }
        @media (max-width: 600px) {
            .mateu-app-band2 > .menu-band { display: none; }
            .mateu-app-menu-button { display: inline-flex; }
            .mateu-app-band-title { overflow: hidden; text-overflow: ellipsis; min-width: 0; flex: 0 1 auto; }
            .mateu-content-gutter { --mateu-content-gutter: 16px; --mateu-shell-gutter: 16px; }
            .mateu-app-band1, .mateu-app-band2 { --mateu-content-gutter: 16px; }
        }

        /* HAMBURGER_SECTIONS (appRenderer), Opera Cloud's navigation. Band 1 = hamburger, brand and
           widgets; band 2 = the section on screen (its name, as MENU_ON_TOP's band title) and its
           entries. Unlike MENU_ON_TOP's band the entries stay on a narrow viewport: the menu bar
           moves what does not fit into its own "···". The hamburger opens the sections over the
           content, under band 1, with a scrim that closes it. */
        .mateu-app-band2 > .sections-band { flex: 1 1 0; min-width: 0; }
        /* the hamburger is one more header icon button (renderSectionsToggle): the header's icon colour
           and size like the chat, bell and theme toggles; its glyph lines up with the gutter */
        .mateu-sections-toggle { align-self: center; margin-inline: calc(-1 * var(--lumo-space-s, .5rem)) var(--lumo-space-s, .5rem); }
        /* Band 2 holds the section on screen. With none (the home) it has nothing to say, so it
           folds away — and comes back when a section is chosen — sliding and fading rather than
           jumping (no motion for whoever asks the system for less). */
        .mateu-section-band {
            max-height: 4rem;
            transition: max-height .22s ease, min-height .22s ease, opacity .18s ease, border-bottom-width .22s step-end;
        }
        .mateu-section-band.mateu-section-band--empty {
            max-height: 0; min-height: 0; opacity: 0; overflow: hidden;
            border-bottom-width: 0;
            transition: max-height .22s ease, min-height .22s ease, opacity .18s ease, border-bottom-width .22s step-start;
        }
        @media (prefers-reduced-motion: reduce) {
            .mateu-section-band, .mateu-section-band.mateu-section-band--empty { transition: none; }
        }
        .mateu-sections-scrim { position: absolute; inset: 3.5rem 0 0 0; z-index: 199; background: var(--lumo-shade-20pct, rgba(0,0,0,.2)); }
        .mateu-sections-panel {
            position: absolute; top: 3.5rem; bottom: 0; left: 0; z-index: 200;
            width: 18rem; max-width: calc(100% - 3rem); overflow-y: auto; box-sizing: border-box;
            display: flex; flex-direction: column; padding: var(--lumo-space-s, .5rem) 0;
            background: var(--lumo-base-color, #fff);
            border-inline-end: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1));
            box-shadow: var(--lumo-box-shadow-m, 0 4px 12px rgba(0,0,0,.15));
        }
        .mateu-section-link {
            display: flex; align-items: center; gap: var(--lumo-space-s, .5rem);
            border: none; background: transparent; font: inherit; text-align: start; cursor: pointer;
            padding: .65rem var(--mateu-content-gutter, 24px); color: var(--lumo-body-text-color, #1a1a1a);
            border-inline-start: 3px solid transparent;
        }
        .mateu-section-link:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .mateu-section-link:focus-visible { outline: 2px solid var(--lumo-primary-color-50pct, rgba(22,118,243,.5)); outline-offset: -2px; }
        .mateu-section-link--active { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; border-inline-start-color: var(--lumo-primary-color, #1676f3); }

        /* top nav (menu-on-top) */
        .app-nav { display: flex; flex-wrap: wrap; align-items: center; gap: .15rem; }
        .app-nav-item { border: none; background: transparent; font: inherit; padding: .4rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); cursor: pointer; color: var(--lumo-body-text-color, #1a1a1a); white-space: nowrap; }
        .app-nav-item:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .app-nav-item.active { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; }
        .app-nav-group { position: relative; }
        .app-nav-group > summary { list-style: none; cursor: pointer; }
        .app-nav-group[open] > summary::after { content: ''; }
        .app-nav-dropdown { position: absolute; z-index: 50; display: flex; flex-direction: column; min-width: 11rem; padding: .3rem; background: var(--lumo-base-color, #fff); border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 8px); box-shadow: var(--lumo-box-shadow-s, 0 2px 8px rgba(0,0,0,.15)); }
        .app-nav-dropdown .app-nav-item { text-align: left; }

        /* header action buttons + icon buttons */
        .app-action-btn { font: inherit; font-weight: 600; padding: .35rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); border: 1px solid transparent; cursor: pointer; }
        .app-action-btn.primary { background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); }
        .app-icon-btn { border: none; background: transparent; cursor: pointer; font-size: 1.1rem; padding: .3rem .5rem; border-radius: var(--lumo-border-radius-m, 6px); line-height: 1; }
        .app-icon-btn:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }

        /* tabs variant */
        .app-tabs { display: flex; gap: .1rem; align-items: flex-end; }
        .app-tab { border: none; background: transparent; font: inherit; padding: .6rem 1rem; cursor: pointer; border-bottom: 2px solid transparent; color: var(--lumo-secondary-text-color, #667); }
        .app-tab.active { color: var(--lumo-primary-text-color, #1676f3); border-bottom-color: var(--lumo-primary-color, #1676f3); font-weight: 600; }

        /* side nav (hamburger drawer) + left menu (tiles) */
        .side-nav-item { display: flex; flex-direction: column; }
        .side-nav-link { text-align: left; border: none; background: transparent; font: inherit; padding: .5rem 1rem; cursor: pointer; color: inherit; }
        .side-nav-link:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .side-nav-item--active > .side-nav-link { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; }
        .side-nav-children { padding-left: 1rem; }
        .left-menu-item { display: block; width: 100%; text-align: left; border: none; background: transparent; font: inherit; padding: .5rem .75rem; cursor: pointer; border-radius: var(--lumo-border-radius-m, 6px); color: inherit; }
        .left-menu-item:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .left-menu-group > summary { cursor: pointer; padding: .5rem .75rem; font-weight: 600; }

        .app-content {
            --mateu-content-gutter: 0px;
            padding-left: 2rem;
            padding-right: 2rem;
            padding-top: 1.5rem;
            width: calc(100% - 4rem);
            height: calc(100vh - 6rem);
            overflow-y: auto;
        }

        .app-content.no-padding {
            padding: 0;
            width: 100%;
        }

        /* Native top navigation (was a vaadin-menu-bar). */
        .mateu-nav { display: flex; align-items: center; gap: .1rem; flex-grow: 1; min-width: 0; overflow: visible; }
        .mateu-nav-item { border: none; background: transparent; font: inherit; cursor: pointer; padding: .5rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); color: inherit; white-space: nowrap; }
        .mateu-nav-item:hover, .mateu-nav-group > summary:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .mateu-nav-item--active { color: var(--lumo-primary-text-color, #1676f3); font-weight: 600; }
        /* a remote section whose remote did not answer: there, dimmed, its tooltip says why */
        .mateu-nav-unavailable { opacity: .55; cursor: help; }
        .mateu-nav-group { position: relative; }
        .mateu-nav-group > summary { list-style: none; cursor: pointer; padding: .5rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); white-space: nowrap; }
        .mateu-nav-group > summary::-webkit-details-marker { display: none; }
        .mateu-nav-panel { position: absolute; top: 100%; left: 0; z-index: 100; min-width: 12rem; display: flex; flex-direction: column; padding: .25rem; background: var(--lumo-base-color, #fff); border: 1px solid var(--lumo-contrast-10pct, rgba(0,0,0,.1)); border-radius: var(--lumo-border-radius-m, 6px); box-shadow: var(--lumo-box-shadow-m, 0 4px 12px rgba(0,0,0,.15)); }
        .mateu-nav-panel .mateu-nav-item { text-align: left; }
        .left-menu-children { padding-left: .75rem; }
        .left-menu-group > summary { list-style: none; }
        .left-menu-group > summary::-webkit-details-marker { display: none; }
        /* Native tab strip (TABS variant, was vaadin-tabs). */
        .mateu-tabs { display: flex; align-items: stretch; gap: .1rem; overflow-x: auto; }
        .mateu-tab { border: none; background: transparent; font: inherit; cursor: pointer; padding: .85rem 1rem; color: var(--lumo-secondary-text-color, #667); border-bottom: 2px solid transparent; white-space: nowrap; }
        .mateu-tab:hover { color: var(--lumo-body-text-color, #161513); }
        .mateu-tab--active { color: var(--lumo-primary-text-color, #1676f3); border-bottom-color: var(--lumo-primary-color, #1676f3); font-weight: 600; }
        /* App-header chrome buttons (theme toggle, header actions). */
        .app-chrome-icon-btn { border: none; background: transparent; cursor: pointer; font: inherit; padding: .4rem; border-radius: var(--lumo-border-radius-m, 6px); display: inline-flex; align-items: center; justify-content: center; min-width: var(--lumo-size-m, 2.25rem); min-height: var(--lumo-size-m, 2.25rem); box-sizing: border-box; }
        .app-chrome-icon-btn:hover { background: var(--lumo-contrast-5pct, rgba(0,0,0,.05)); }
        .app-header-action-btn { display: inline-flex; align-items: center; gap: .3rem; border: none; cursor: pointer; font: inherit; font-weight: 500; padding: .4rem .8rem; border-radius: var(--lumo-border-radius-m, 6px); background: var(--lumo-primary-color, #1676f3); color: var(--lumo-primary-contrast-color, #fff); list-style: none; }
        .app-header-action-btn::-webkit-details-marker { display: none; }

        .tiles-hub-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
            gap: 1.5rem;
        }

        .nav-tile {
            border: 1px solid var(--lumo-contrast-10pct);
            border-radius: var(--lumo-border-radius-l);
            padding: 1.5rem;
            cursor: pointer;
            transition: box-shadow 0.2s, border-color 0.2s;
        }

        .nav-tile:hover {
            box-shadow: 0 4px 12px var(--lumo-contrast-20pct);
            border-color: var(--lumo-primary-color-50pct);
        }

        .nav-tile-title {
            font-size: var(--lumo-font-size-l);
            font-weight: 600;
            margin-bottom: 0.35rem;
        }

        .nav-tile-desc {
            color: var(--lumo-secondary-text-color);
            font-size: var(--lumo-font-size-s);
        }

        .nav-rail {
            width: 72px;
            min-height: 100vh;
            border-right: 1px solid var(--lumo-contrast-10pct);
            display: flex;
            flex-direction: column;
            align-items: center;
            padding-top: 0.75rem;
            gap: 0.25rem;
            flex-shrink: 0;
        }

        .rail-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 64px;
            padding: 0.5rem 0;
            cursor: pointer;
            border-radius: var(--lumo-border-radius-m);
            transition: background-color 0.2s;
            gap: 0.2rem;
        }

        .rail-item:hover {
            background-color: var(--lumo-contrast-5pct);
        }

        .rail-item--active {
            background-color: var(--lumo-primary-color-10pct);
            color: var(--lumo-primary-color);
        }

        .rail-icon {
            font-size: 1.4rem;
        }

        .rail-icon-placeholder {
            width: 1.6rem;
            height: 1.6rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
            font-weight: 600;
            border-radius: 50%;
            background-color: var(--lumo-contrast-10pct);
        }

        .rail-label {
            font-size: 0.6rem;
            text-align: center;
            max-width: 64px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .rail-sub-panel {
            width: 200px;
            min-height: 100vh;
            border-right: 1px solid var(--lumo-contrast-10pct);
            padding: 0.75rem 0;
            flex-shrink: 0;
        }

        .rail-sub-title {
            font-size: var(--lumo-font-size-xs);
            font-weight: 600;
            color: var(--lumo-secondary-text-color);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            padding: 0.25rem 1rem 0.5rem;
        }

        .rail-sub-item {
            padding: 0.5rem 1rem;
            cursor: pointer;
            border-radius: var(--lumo-border-radius-m);
            margin: 0.1rem 0.5rem;
            transition: background-color 0.2s;
            font-size: var(--lumo-font-size-s);
        }

        .rail-sub-item:hover {
            background-color: var(--lumo-contrast-5pct);
        }

        .rail-sub-item--active {
            background-color: var(--lumo-primary-color-10pct);
            color: var(--lumo-primary-color);
            font-weight: 600;
        }

        .cmd-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding-top: 15vh;
            z-index: 1000;
        }

        .cmd-palette {
            background: var(--lumo-base-color);
            border-radius: var(--lumo-border-radius-l);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: min(560px, 90vw);
            overflow: hidden;
        }

        .cmd-search-wrapper {
            display: flex;
            align-items: center;
            padding: 0 1rem;
            border-bottom: 1px solid var(--lumo-contrast-10pct);
            gap: 0.75rem;
        }

        .cmd-search-icon {
            color: var(--lumo-secondary-text-color);
            flex-shrink: 0;
        }

        .cmd-input {
            flex: 1;
            border: none;
            outline: none;
            background: transparent;
            font-size: var(--lumo-font-size-l);
            color: var(--lumo-body-text-color);
            padding: 1rem 0;
            font-family: var(--lumo-font-family);
        }

        .cmd-results {
            max-height: 340px;
            overflow-y: auto;
            padding: 0.5rem;
        }

        .cmd-result {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.6rem 0.75rem;
            border-radius: var(--lumo-border-radius-m);
            cursor: pointer;
            gap: 1rem;
        }

        .cmd-result--selected {
            background: var(--lumo-primary-color-10pct);
        }

        .cmd-result-label {
            font-size: var(--lumo-font-size-m);
        }

        .cmd-result-breadcrumb {
            font-size: var(--lumo-font-size-xs);
            color: var(--lumo-secondary-text-color);
            white-space: nowrap;
        }

        .cmd-category {
            padding: 0.35rem 1rem 0.15rem;
            font-size: var(--lumo-font-size-xs, 0.75rem);
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--lumo-secondary-text-color, #777);
        }
        .cmd-empty {
            padding: 1.5rem;
            text-align: center;
            color: var(--lumo-secondary-text-color);
            font-size: var(--lumo-font-size-s);
        }

        /* The FABs' look and place are the rail's (layout/fabRail.ts): Lumo buttons, square, in the
           column the page width picks. The agent's chat has none: its toggle is in the header. */


  `, fabStyles('.app-fab, .page-fab'), linkStyles]
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app': MateuApp
    }
}


