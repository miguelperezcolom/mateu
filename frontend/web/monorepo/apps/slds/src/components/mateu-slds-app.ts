import { customElement, property } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import MetadataDrivenElement from '@infra/ui/MetadataDrivenElement'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts'

/**
 * SLDS 2 application shell: a global header plus a vertical navigation built from the app menu, and
 * the routed content embedded via <mateu-ux>. Renders in the light DOM so the global SLDS
 * stylesheet (slds-* classes) applies to its markup.
 */
@customElement('mateu-slds-app')
export class MateuSldsApp extends MetadataDrivenElement {

    @property()
    baseUrl = ''

    @property()
    route = ''

    @property()
    consumedRoute = ''

    // Render in light DOM: SLDS ships global CSS, which cannot cross a shadow boundary.
    createRenderRoot() {
        return this
    }

    private navigateTo = (path: string | undefined) => {
        if (!path) return
        this.route = path
        let baseUrl = this.baseUrl ?? ''
        if (baseUrl.indexOf('://') < 0) {
            if (!baseUrl.startsWith('/')) {
                baseUrl = '/' + baseUrl
            }
            baseUrl = window.location.origin + baseUrl
        }
        const targetUrl = new URL(baseUrl + path)
        if (window.location.pathname != targetUrl.pathname) {
            let pathname = targetUrl.pathname
            if (pathname && !pathname.startsWith('/')) {
                pathname = '/' + pathname
            }
            this.dispatchEvent(new CustomEvent('update-route', {
                detail: { route: pathname },
                bubbles: true,
                composed: true,
            }))
        }
        this.requestUpdate()
    }

    private isActive = (option: MenuOption): boolean => {
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        if (this.route === option.path) return true
        return this.route === this.consumedRoute && option.path === metadata?.homeRoute
    }

    private renderNavItem = (option: MenuOption): TemplateResult => {
        if (option.submenus && option.submenus.length > 0) {
            return html`
                <li class="slds-nav-vertical__item">
                    <div class="slds-nav-vertical__title slds-text-title_caps">${option.label}</div>
                    <ul>
                        ${option.submenus.map(sub => this.renderNavItem(sub))}
                    </ul>
                </li>
            `
        }
        return html`
            <li class="slds-nav-vertical__item ${this.isActive(option) ? 'slds-is-active' : ''}">
                <a href="javascript:void(0)"
                   class="slds-nav-vertical__action"
                   aria-current="${this.isActive(option) ? 'page' : nothing}"
                   @click="${() => this.navigateTo(option.path)}">
                    ${option.label}
                </a>
            </li>
        `
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        if (!metadata) return nothing
        const contentRoute = this.route != this.consumedRoute ? this.route : metadata.homeRoute

        return html`
            <div class="slds-grid slds-grid_vertical" style="height: 100vh;">
                <header class="slds-global-header_container">
                    <div class="slds-global-header slds-grid slds-grid_align-spread slds-p-horizontal_medium">
                        <div class="slds-global-header__item">
                            ${metadata.logo
                                ? html`<img src="${metadata.logo}" alt="" style="height: 1.75rem; margin-right: .75rem;" />`
                                : nothing}
                            <span class="slds-text-heading_small">${metadata.title ?? ''}</span>
                        </div>
                        ${metadata.subtitle
                            ? html`<div class="slds-global-header__item slds-text-body_small">${metadata.subtitle}</div>`
                            : nothing}
                    </div>
                </header>

                <div class="slds-grid" style="flex: 1; min-height: 0;">
                    <nav class="slds-nav-vertical slds-p-around_medium"
                         aria-label="${metadata.title ?? 'Navigation'}"
                         style="width: 16rem; flex: 0 0 auto; overflow: auto; border-right: 1px solid var(--slds-g-color-border-base-1, #e5e5e5);">
                        <div class="slds-nav-vertical__section">
                            <ul>
                                ${(metadata.menu ?? []).map(option => this.renderNavItem(option))}
                            </ul>
                        </div>
                    </nav>

                    <main class="slds-col slds-p-around_medium"
                          style="flex: 1; min-width: 0; overflow: auto;">
                        <mateu-api-caller style="width: 100%;">
                            <mateu-ux
                                    route="${contentRoute}"
                                    id="ux_${this.id}"
                                    baseUrl="${this.baseUrl}"
                                    consumedRoute="${metadata.route}"
                            ></mateu-ux>
                        </mateu-api-caller>
                    </main>
                </div>
            </div>
        `
    }
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-slds-app': MateuSldsApp
    }
}
