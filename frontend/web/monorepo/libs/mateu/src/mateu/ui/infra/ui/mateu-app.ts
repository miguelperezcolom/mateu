import { customElement, query, state } from "lit/decorators.js";
import {css, html, nothing, PropertyValues, TemplateResult} from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/grid"
import '@vaadin/details'
import '@vaadin/scroller'
import '@vaadin/side-nav';
import ComponentElement from "@infra/ui/ComponentElement";
import "./mateu-ux"
import './mateu-api-caller'
import { MenuBarItem, MenuBarItemSelectedEvent } from "@vaadin/menu-bar";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { nanoid } from "nanoid";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { AppLayout } from "@vaadin/app-layout";
import {MateuChat} from "@infra/ui/mateu-chat.ts";
import {dirtyGuard} from "@infra/ui/dirtyGuard.ts";

@customElement('mateu-app')
export class MateuApp extends ComponentElement {

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        if (componentRenderer.mustUseShadowRoot()) {
            return super.createRenderRoot()
        }
        return this;
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

    @state()
    commandPaletteOpen = false

    @state()
    commandPaletteQuery = ''

    @state()
    commandPaletteSelectedIndex = 0

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
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        if (this._commandPaletteHandler) {
            document.removeEventListener('keydown', this._commandPaletteHandler)
        }
        this.removeEventListener('compact-changed', this._compactHandler)
    }

    @state()
    isDark: boolean = document.documentElement.getAttribute('theme') === 'dark'

    @state()
    chatOpen: boolean = false

    toggleTheme = () => {
        this.isDark = !this.isDark
        const theme = this.isDark ? 'dark' : 'light'
        document.documentElement.setAttribute('theme', theme)
        localStorage.setItem('mateu-theme', theme)
    }

    showHideIa = () => {
        if (this.chat) {
            this.chatOpen = !this.chatOpen
            this.chat.slot = this.chatOpen ? 'detail' : 'detail-hidden'
        }
    }

    runAction = (actionId: string) => {
        const root = this.renderRoot as Element | ShadowRoot
        const comp = root.querySelector?.('mateu-component') as HTMLElement | null
        if (comp) {
            comp.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId },
                bubbles: true,
                composed: true
            }))
        }
    }

        getSelectedOption = (options: MenuOption[]): MenuOption | null => {
        if (options) {
            for (let i = 0; i < options.length; i++) {
                const option = options[i]
                if (option.selected) {
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
        this.selectRoute(v.consumedRoute, v.route, v.actionId, v.baseUrl, v.serverSideType, v.uriPrefix)
    }

    itemSelectedTiles = (e: MenuBarItemSelectedEvent) => {
        const option: MenuOption = (e.detail.value as any)._menuOption
        if (option.submenus && option.submenus.length > 0) {
            this.tilesMenuOption = option
        } else {
            this.tilesMenuOption = null
            this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)
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
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            this.commandPaletteSelectedIndex = Math.min(this.commandPaletteSelectedIndex + 1, Math.min(filtered.length, 10) - 1)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            this.commandPaletteSelectedIndex = Math.max(this.commandPaletteSelectedIndex - 1, 0)
        } else if (e.key === 'Enter') {
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
                        <vaadin-icon icon="vaadin:search" class="cmd-search-icon"></vaadin-icon>
                        <input
                            class="cmd-input"
                            placeholder="Go to…"
                            .value=${this.commandPaletteQuery}
                            @input=${(e: InputEvent) => {
                                this.commandPaletteQuery = (e.target as HTMLInputElement).value
                                this.commandPaletteSelectedIndex = 0
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
                        ${filtered.length === 0 ? html`<div class="cmd-empty">No results for "${this.commandPaletteQuery}"</div>` : nothing}
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
                        this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)
                    }
                }}
            >
                ${option.icon
                    ? html`<vaadin-icon icon="${option.icon}" class="rail-icon"></vaadin-icon>`
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
                                this.selectRoute(sub.consumedRoute, sub.route, sub.actionId, sub.baseUrl, sub.serverSideType, sub.uriPrefix)
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
                                    this.selectRoute(sub.consumedRoute, sub.route, sub.actionId, sub.baseUrl, sub.serverSideType, sub.uriPrefix)
                                }
                            }}
                        >
                            ${sub.icon ? html`<vaadin-icon icon="${sub.icon}" style="font-size: 2rem; color: var(--lumo-primary-color); display: block; margin-bottom: 0.75rem;"></vaadin-icon>` : nothing}
                            <div class="nav-tile-title">${sub.label}</div>
                            ${sub.description ? html`<div class="nav-tile-desc">${sub.description}</div>` : nothing}
                        </div>
                    `)}
                </div>
            </div>
        `
    }

    goHome = () => {
        const metadata = (this.component as ClientSideComponent).metadata as App;
        this.selectRoute(metadata.route, '_page', '', undefined, undefined, undefined)
    }

    selectRoute = (consumedRoute: string | undefined, route: string | undefined, _actionId: string | undefined, _baseUrl: string | undefined, serverSideType: string | undefined, uriPrefix: string | undefined ) => {
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
                targetUrl = new URL(targetUrl.origin + (pathAfterConsumed || '/'))
            }
            if ((window.location.pathname || targetUrl.pathname) && window.location.pathname != targetUrl.pathname) {
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
                        selected: filter || option.selected,
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
                    consumedRoute: option.consumedRoute,
                    text: option.label,
                    route: option.route,
                    baseUrl: option.baseUrl,
                    serverSideType: option.serverSideType,
                    uriPrefix: option.uriPrefix,
                    actionId: option.actionId,
                    selected: filter || option.selected,
                }
            } else return undefined
        }) as Array<MenuBarItem | undefined>).filter((option): option is MenuBarItem => option != null)
    }

    getSelectedIndex = (menu: MenuOption[] | null) => {
        if (menu) {
            const selectedOption = this.getSelectedOption(menu)
            if (selectedOption) {
                return menu.indexOf(selectedOption)
            }
        }
        return NaN
    }

    renderOptionOnLeftMenu = (option: MenuOption): TemplateResult => {
        if (option.submenus && option.submenus.length > 0) {
            return html`
                <vaadin-details summary="${option.label}" theme="reverse">
                    <vaadin-vertical-layout>
                        ${option.submenus.map(child => html`${this.renderOptionOnLeftMenu(child)}`)}
                    </vaadin-vertical-layout>
                </vaadin-details>
`
        }
        return html`<vaadin-button theme="tertiary" 
                @click="${() => this.selectRoute(option.consumedRoute, option.route, option.actionId, option.baseUrl, option.serverSideType, option.uriPrefix)}"
        >${option.label}</vaadin-button>`
    }

    @query('vaadin-app-layout')
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

    renderSideNav = (items: Array<MenuBarItem> | undefined, slot: string | undefined): TemplateResult | typeof nothing => {
        return items?html`
            ${items.map((rawItem) => {
                const item = rawItem as MenuBarItem & {
                    route: string | undefined
                    icon: string | undefined
                    selected: boolean | undefined
                }
                return html`

                        ${item.component == 'hr'?html`<hr slot="children"/>`:html`
                                <vaadin-side-nav-item
                                .path="${(item.route && !item.children)?item.route:undefined}"
                                .pathAliases="${[this.baseUrl + (item.route?item.route:'')]}"
                                slot="${slot}"
                                ?expanded="${item.selected}"
                                >
                                    ${item.icon?html`
                                        <vaadin-icon icon="vaadin:dashboard" slot="prefix"></vaadin-icon>
                                    `:nothing}
                                    ${item.text}
                                    ${this.renderSideNav(item.children as MenuBarItem[] | undefined, 'children')}
                                </vaadin-side-nav-item>
                        `}

                            `})}`:nothing
    }

    updateRoute: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        var detail = (e as CustomEvent).detail
        this.selectRoute(detail.consumedRoute, detail.route, detail.actionId, detail.baseUrl, detail.serverSideType, detail.uriPrefix)
    }

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (this.component) {
            const clientSideComponent = this.component as ClientSideComponent
            const metadata = clientSideComponent.metadata
            if (metadata) {
                const app = metadata as App
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
                    this.selectedRoute = app.homeRoute
                    this.selectedConsumedRoute = app.homeConsumedRoute
                    this.selectedServerSideType = app.homeServerSideType
                    this.selectedBaseUrl = app.homeBaseUrl
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

    static styles = css`

        .app-content {
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

        .menu vaadin-menu-bar-button {
            background-color: var(--lumo-base-color);
        }

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

        .cmd-empty {
            padding: 1.5rem;
            text-align: center;
            color: var(--lumo-secondary-text-color);
            font-size: var(--lumo-font-size-s);
        }

        .app-fab, .page-fab {
            position: fixed;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            background: var(--lumo-primary-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            z-index: 900;
            transition: background 0.2s, transform 0.1s;
            font-size: 1rem;
        }

        .app-fab:hover, .page-fab:hover {
            background: var(--lumo-primary-color-50pct);
            transform: scale(1.08);
        }

        .ai-fab {
            position: fixed;
            bottom: 1.5rem;
            right: 1.5rem;
            width: 3.5rem;
            height: 3.5rem;
            border-radius: 50%;
            background: var(--lumo-primary-color);
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
            z-index: 900;
            transition: background 0.2s, transform 0.1s;
            font-size: 1rem;
        }

        .ai-fab:hover {
            background: var(--lumo-primary-color-50pct);
            transform: scale(1.08);
        }

  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app': MateuApp
    }
}


