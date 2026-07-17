import { customElement, state } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import { MateuRendererApp } from '@infra/ui/MateuRendererApp.ts'
import '@infra/ui/mateu-app-context-picker.ts'
import '@infra/ui/mateu-notification-bell.ts'
import { dispatchAppHeaderAction } from '@infra/ui/renderers/appHeaderActions.ts'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
import AppHeaderAction from '@mateu/shared/apiClients/dtos/componentmetadata/AppHeaderAction.ts'
import { AppVariant } from '@mateu/shared/apiClients/dtos/componentmetadata/AppVariant.ts'
import MenuOption from '@mateu/shared/apiClients/dtos/componentmetadata/MenuOption.ts'

/**
 * SLDS 2 application shell: a global header plus a vertical navigation built from the app menu, and
 * the routed content embedded via {@link MateuRendererApp.renderContent} (which carries the shared
 * CRUD/server-driven navigation). Renders in the light DOM so the global SLDS stylesheet applies.
 */
@customElement('mateu-slds-app')
export class MateuSldsApp extends MateuRendererApp {

    createRenderRoot() {
        return this
    }

    // Which app-header dropdown (grouped contextAction) is open, by its index.
    @state() private openHeaderMenu: number | undefined = undefined

    // App-header actions (App.contextActions): rendered on the global header next to the
    // @AppContext pickers. Same dispatch contract as the Vaadin shell (appHeaderActions.ts),
    // SLDS widgets here — the shell is light DOM so the global SLDS stylesheet applies.
    private runHeaderAction = async (metadata: App, actionId: string | undefined) => {
        if (!actionId) return
        try {
            await dispatchAppHeaderAction(metadata, this, actionId)
        } catch (e) {
            const toast = document.createElement('div')
            toast.className = 'slds-notify slds-notify_toast slds-theme_error'
            toast.style.cssText = 'position: fixed; bottom: 1rem; left: 1rem; z-index: 10000;'
                + ' background: var(--slds-g-color-error-base-40, #ba0517); color: #fff; padding: .75rem 1rem;'
                + ' border-radius: .25rem; box-shadow: 0 4px 12px rgba(0,0,0,.25); font-size: .875rem;'
            toast.textContent = 'La acción falló: ' + e
            document.body.appendChild(toast)
            setTimeout(() => toast.remove(), 6000)
        }
    }

    private renderContextActions = (metadata: App): TemplateResult => html`
        ${(metadata.contextActions ?? []).map((action: AppHeaderAction, index: number) => (action.children?.length ?? 0) > 0 ? html`
            <div class="slds-dropdown-trigger slds-dropdown-trigger_click ${this.openHeaderMenu === index ? 'slds-is-open' : ''}"
                 style="position: relative; margin-right: .5rem;">
                <button type="button" class="slds-button slds-button_brand" title="${action.label}"
                        aria-haspopup="true" aria-expanded="${this.openHeaderMenu === index}"
                        @click="${() => { this.openHeaderMenu = this.openHeaderMenu === index ? undefined : index }}">
                    ${action.label} ▾
                </button>
                ${this.openHeaderMenu === index ? html`
                    <div class="slds-dropdown slds-dropdown_right" style="position: absolute; right: 0; top: calc(100% + 4px); z-index: 100; min-width: 12rem;">
                        <ul class="slds-dropdown__list" role="menu">
                            ${action.children!.map(child => html`
                                <li class="slds-dropdown__item" role="presentation">
                                    <a href="javascript:void(0)" role="menuitem"
                                       @click="${() => { this.openHeaderMenu = undefined; this.runHeaderAction(metadata, child.actionId) }}">
                                        <span class="slds-truncate" title="${child.label}">${child.label}</span>
                                    </a>
                                </li>`)}
                        </ul>
                    </div>` : nothing}
            </div>` : html`
            <button type="button" class="slds-button slds-button_brand" title="${action.label}" style="margin-right: .5rem;"
                    @click="${() => this.runHeaderAction(metadata, action.actionId)}">${action.label}</button>`)}
    `

    private renderNavItem = (option: MenuOption): TemplateResult => {
        if (option.submenus && option.submenus.length > 0) {
            return html`
                <li class="slds-nav-vertical__item">
                    <div class="slds-nav-vertical__title slds-text-title_caps">${option.label}</div>
                    <ul>${option.submenus.map(sub => this.renderNavItem(sub))}</ul>
                </li>`
        }
        return html`
            <li class="slds-nav-vertical__item ${this.isActive(option) ? 'slds-is-active' : ''}">
                <a href="javascript:void(0)" class="slds-nav-vertical__action"
                   aria-current="${this.isActive(option) ? 'page' : nothing}"
                   @click="${() => this.navigate(option)}">${option.label}</a>
            </li>`
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as App
        if (!metadata) return nothing
        // Embedded MEDIATOR shells (e.g. the crud mediator inside a listing route) are
        // chrome-less: no global header, no nav — just the routed content. Rendering the header
        // here painted an empty white bar above every crud listing.
        if (metadata.variant === AppVariant.MEDIATOR) {
            return this.renderContent()
        }
        const hasMenu = (metadata.menu ?? []).length > 0

        return html`
            <div class="slds-grid slds-grid_vertical" style="height: 100vh;">
                <header class="slds-global-header_container" style="flex: 0 0 auto; position: static;">
                    <div class="slds-global-header slds-grid slds-grid_align-spread slds-p-horizontal_medium">
                        <div class="slds-global-header__item">
                            ${metadata.logo
                                ? html`<img src="${metadata.logo}" alt="" style="height: 1.75rem; margin-right: .75rem;" />`
                                : nothing}
                            <span class="slds-text-heading_small">${metadata.title ?? ''}</span>
                        </div>
                        <div class="slds-global-header__item slds-grid" style="align-items: center;">
                            ${metadata.subtitle
                                ? html`<span class="slds-text-body_small slds-m-right_medium">${metadata.subtitle}</span>`
                                : nothing}
                            ${metadata.notificationsEnabled ? html`
                                <mateu-notification-bell style="margin-right: .75rem;" .app="${metadata}" .baseUrl="${''}"></mateu-notification-bell>` : nothing}
                            ${(metadata.contextSelectors ?? []).map(selector => html`
                                <mateu-app-context-picker style="margin-right: .75rem;" .selector="${selector}" .app="${metadata}" .baseUrl="${''}"></mateu-app-context-picker>`)}
                            ${this.renderContextActions(metadata)}
                        </div>
                    </div>
                </header>

                <div class="slds-grid" style="flex: 1; min-height: 0;">
                    ${hasMenu ? html`
                        <nav class="slds-nav-vertical slds-p-around_medium"
                             aria-label="${metadata.title ?? 'Navigation'}"
                             style="width: 16rem; flex: 0 0 auto; overflow: auto; border-right: 1px solid var(--slds-g-color-border-base-1, #e5e5e5);">
                            <div class="slds-nav-vertical__section">
                                <ul>${metadata.menu.map(option => this.renderNavItem(option))}</ul>
                            </div>
                        </nav>` : nothing}

                    <main class="slds-col slds-p-around_medium" style="flex: 1; min-width: 0; overflow: auto;">
                        ${this.renderContent()}
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
