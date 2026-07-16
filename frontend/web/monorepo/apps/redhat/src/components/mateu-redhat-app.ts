import { customElement, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import { MateuRendererApp } from '@infra/ui/MateuRendererApp.ts'
import '@infra/ui/mateu-app-context-picker.ts'
import { dispatchAppHeaderAction } from '@infra/ui/renderers/appHeaderActions.ts'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import AppHeaderAction from '@mateu/shared/apiClients/dtos/componentmetadata/AppHeaderAction.ts'
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

    // Which app-header dropdown (grouped contextAction) is open, by its index.
    @state() private openHeaderMenu: number | undefined = undefined

    // App-header actions (App.contextActions): rendered on the masthead next to the @AppContext
    // pickers. Same dispatch contract as the Vaadin shell (appHeaderActions.ts), PF6 widgets here.
    private runHeaderAction = async (metadata: App, actionId: string | undefined) => {
        if (!actionId) return
        try {
            await dispatchAppHeaderAction(metadata, this, actionId)
        } catch (e) {
            // PF6 danger alert as a transient toast (same idiom as renderToolbarButton: pf
            // classes + inline token styles so it looks right even without the global sheet).
            const alert = document.createElement('div')
            alert.className = 'pf-v6-c-alert pf-m-danger'
            alert.style.cssText = 'position: fixed; bottom: 1rem; left: 1rem; z-index: 10000;'
                + ' background: var(--pf-t--global--color--status--danger--default, #b1380b); color: #fff;'
                + ' padding: .75rem 1rem; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.25); font-size: .875rem;'
            alert.textContent = 'La acción falló: ' + e
            document.body.appendChild(alert)
            setTimeout(() => alert.remove(), 6000)
        }
    }

    // PF button skin (masthead is light DOM so the pf classes apply; the inline token styles keep
    // it PF6-looking when the stylesheet is not global — same belt-and-braces as renderToolbarButton).
    private headerButtonStyle = 'background: var(--pf-t--global--color--brand--default, #0066cc); color: #fff;'
        + ' border: 1px solid transparent; border-radius: 999px; height: 2rem; padding: 0 .875rem;'
        + ' font-family: inherit; font-size: .8125rem; cursor: pointer; white-space: nowrap;'

    private renderContextActions = (md: App): TemplateResult => html`
        ${(md.contextActions ?? []).map((action: AppHeaderAction, index: number) => (action.children?.length ?? 0) > 0 ? html`
            <div style="position: relative; display: inline-block; margin-right: .5rem;">
                <button type="button" class="pf-v6-c-button pf-m-primary pf-m-small" title="${action.label}"
                        style="${this.headerButtonStyle}"
                        @click="${() => { this.openHeaderMenu = this.openHeaderMenu === index ? undefined : index }}">
                    <span class="pf-v6-c-button__text">${action.label} ▾</span>
                </button>
                ${this.openHeaderMenu === index ? html`
                    <div class="pf-v6-c-menu" style="position: absolute; right: 0; top: calc(100% + 4px); z-index: 100; min-width: 12rem;
                            background: var(--pf-t--global--background--color--primary--default, #fff);
                            border: 1px solid var(--pf-t--global--border--color--default, #d2d2d2);
                            border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,.15); padding: .25rem 0;">
                        <ul class="pf-v6-c-menu__list" role="menu" style="list-style: none; margin: 0; padding: 0;">
                            ${action.children!.map(child => html`
                                <li class="pf-v6-c-menu__list-item" role="none">
                                    <button type="button" class="pf-v6-c-menu__item" role="menuitem"
                                            style="display: block; width: 100%; text-align: left; background: transparent; border: 0;
                                                   padding: .5rem 1rem; font-family: inherit; font-size: .875rem; cursor: pointer;"
                                            @click="${() => { this.openHeaderMenu = undefined; this.runHeaderAction(md, child.actionId) }}">
                                        ${child.label}
                                    </button>
                                </li>`)}
                        </ul>
                    </div>` : nothing}
            </div>` : html`
            <button type="button" class="pf-v6-c-button pf-m-primary pf-m-small" title="${action.label}"
                    style="${this.headerButtonStyle} margin-right: .5rem;"
                    @click="${() => this.runHeaderAction(md, action.actionId)}">
                <span class="pf-v6-c-button__text">${action.label}</span>
            </button>`)}
    `

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
                            ${this.renderContextActions(md)}
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
