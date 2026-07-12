import { customElement } from 'lit/decorators.js'
import { html, nothing, type TemplateResult } from 'lit'
import { MateuRendererApp } from '@infra/ui/MateuRendererApp.ts'
import '@infra/ui/mateu-app-context-picker.ts'
import ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import App from '@mateu/shared/apiClients/dtos/componentmetadata/App.ts'
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
                            ${(metadata.contextSelectors ?? []).map(selector => html`
                                <mateu-app-context-picker style="margin-right: .75rem;" .selector="${selector}" .app="${metadata}" .baseUrl="${''}"></mateu-app-context-picker>`)}
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
