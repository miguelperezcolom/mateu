import { customElement, property } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import MetadataDrivenElement from '@infra/ui/MetadataDrivenElement'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts'

/**
 * PatternFly 6 application shell: a masthead + a sidebar nav built from the app menu, with the
 * routed content embedded via <mateu-ux>. Light DOM so the global PatternFly stylesheet applies.
 */
@customElement('mateu-redhat-app')
export class MateuRedhatApp extends MetadataDrivenElement {

    @property() baseUrl = ''
    @property() route = ''
    @property() consumedRoute = ''

    createRenderRoot() { return this }

    private navigateTo = (path: string | undefined) => {
        if (!path) return
        this.route = path
        let baseUrl = this.baseUrl ?? ''
        if (baseUrl.indexOf('://') < 0) {
            if (!baseUrl.startsWith('/')) baseUrl = '/' + baseUrl
            baseUrl = window.location.origin + baseUrl
        }
        const targetUrl = new URL(baseUrl + path)
        if (window.location.pathname != targetUrl.pathname) {
            let pathname = targetUrl.pathname
            if (pathname && !pathname.startsWith('/')) pathname = '/' + pathname
            this.dispatchEvent(new CustomEvent('update-route', { detail: { route: pathname }, bubbles: true, composed: true }))
        }
        this.requestUpdate()
    }

    private isActive = (o: MenuOption): boolean => {
        const md = (this.component as ClientSideComponent)?.metadata as App
        if (this.route === o.path) return true
        return this.route === this.consumedRoute && o.path === md?.homeRoute
    }

    private renderItem = (o: MenuOption): TemplateResult => {
        if (o.submenus && o.submenus.length > 0) {
            return html`
                <li class="pf-v6-c-nav__item">
                    <section class="pf-v6-c-nav__subnav">
                        <h2 class="pf-v6-c-nav__subnav-title">${o.label}</h2>
                        <ul class="pf-v6-c-nav__list">${o.submenus.map(s => this.renderItem(s))}</ul>
                    </section>
                </li>`
        }
        return html`
            <li class="pf-v6-c-nav__item">
                <a class="pf-v6-c-nav__link ${this.isActive(o) ? 'pf-m-current' : ''}" href="javascript:void(0)"
                   aria-current="${this.isActive(o) ? 'page' : nothing}"
                   @click="${() => this.navigateTo(o.path)}">${o.label}</a>
            </li>`
    }

    render() {
        const md = (this.component as ClientSideComponent)?.metadata as App
        if (!md) return nothing
        const contentRoute = this.route != this.consumedRoute ? this.route : md.homeRoute
        return html`
            <div class="pf-v6-c-page" style="min-height:100vh;">
                <header class="pf-v6-c-masthead">
                    <div class="pf-v6-c-masthead__main">
                        ${md.logo ? html`<img src="${md.logo}" alt="" style="height:1.75rem; margin-right:.75rem;" />` : nothing}
                        <span class="pf-v6-c-title pf-m-lg">${md.title ?? ''}</span>
                    </div>
                    ${md.subtitle ? html`<div class="pf-v6-c-masthead__content"><span class="pf-v6-c-content">${md.subtitle}</span></div>` : nothing}
                </header>
                <div style="display:flex; flex:1; min-height:0;">
                    <div class="pf-v6-c-page__sidebar" style="flex:0 0 18rem;">
                        <div class="pf-v6-c-page__sidebar-body">
                            <nav class="pf-v6-c-nav" aria-label="Global">
                                <ul class="pf-v6-c-nav__list">${(md.menu ?? []).map(o => this.renderItem(o))}</ul>
                            </nav>
                        </div>
                    </div>
                    <main class="pf-v6-c-page__main" style="flex:1; min-width:0; overflow:auto;">
                        <section class="pf-v6-c-page__main-section">
                            <mateu-api-caller style="width:100%;">
                                <mateu-ux route="${contentRoute}" id="ux_${this.id}" baseUrl="${this.baseUrl}" consumedRoute="${md.route}"></mateu-ux>
                            </mateu-api-caller>
                        </section>
                    </main>
                </div>
            </div>`
    }
}

declare global { interface HTMLElementTagNameMap { 'mateu-redhat-app': MateuRedhatApp } }
