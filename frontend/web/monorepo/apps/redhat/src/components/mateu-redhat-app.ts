import { customElement } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import { MateuRendererApp } from '@infra/ui/MateuRendererApp.ts'
import '@infra/ui/mateu-app-context-picker.ts'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import { AppVariant } from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts'
import MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts'

/**
 * PatternFly 6 application shell: a masthead + a sidebar nav built from the app menu, with the
 * routed content embedded via {@link MateuRendererApp.renderContent} (which carries the shared
 * CRUD/server-driven navigation). Light DOM so the global PatternFly stylesheet applies.
 */
@customElement('mateu-redhat-app')
export class MateuRedhatApp extends MateuRendererApp {

    createRenderRoot() { return this }

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
                   @click="${() => this.navigate(o)}">${o.label}</a>
            </li>`
    }

    render() {
        const md = (this.component as ClientSideComponent)?.metadata as App
        if (!md) return nothing
        // Embedded MEDIATOR shells (e.g. the crud mediator inside a listing route) are
        // chrome-less: no masthead, no sidebar — just the routed content.
        if (md.variant === AppVariant.MEDIATOR) {
            return this.renderContent()
        }
        const hasMenu = (md.menu ?? []).length > 0
        // Plain flex layout (not pf-v6-c-page, which is a CSS grid with fixed grid-areas that
        // conflicts with an extra wrapper) — pf classes are kept only for visual styling.
        return html`
            <div style="display:flex; flex-direction:column; min-height:100vh;">
                <header class="pf-v6-c-masthead" style="flex:0 0 auto; display:flex;">
                    <!-- explicit flex row: without the PF grid styles the masthead collapsed to
                         ~1ch and the title rendered one character per line -->
                    <div class="pf-v6-c-masthead__main" style="display:flex; align-items:center; flex:1 1 auto; width:100%; padding:.5rem 1rem;">
                        ${md.logo ? html`<img src="${md.logo}" alt="" style="height:1.75rem; margin-right:.75rem;" />` : nothing}
                        <span class="pf-v6-c-title pf-m-lg" style="white-space:nowrap;">${md.title ?? ''}</span>
                        <div style="margin-left:auto; display:flex; align-items:center;">
                            ${(md.contextSelectors ?? []).map(selector => html`
                                <mateu-app-context-picker style="margin-right:.75rem;" .selector="${selector}" .app="${md}" .baseUrl="${''}"></mateu-app-context-picker>`)}
                        </div>
                    </div>
                    ${md.subtitle ? html`<div class="pf-v6-c-masthead__content"><span class="pf-v6-c-content">${md.subtitle}</span></div>` : nothing}
                </header>
                <div style="display:flex; flex:1 1 auto; min-height:0;">
                    ${hasMenu ? html`
                        <div class="pf-v6-c-page__sidebar" style="flex:0 0 16rem; overflow:auto;">
                            <div class="pf-v6-c-page__sidebar-body">
                                <nav class="pf-v6-c-nav" aria-label="Global">
                                    <ul class="pf-v6-c-nav__list">${md.menu.map(o => this.renderItem(o))}</ul>
                                </nav>
                            </div>
                        </div>` : nothing}
                    <main style="flex:1 1 auto; min-width:0; overflow:auto; padding:1.5rem;">
                        ${this.renderContent()}
                    </main>
                </div>
            </div>`
    }
}

declare global { interface HTMLElementTagNameMap { 'mateu-redhat-app': MateuRedhatApp } }
