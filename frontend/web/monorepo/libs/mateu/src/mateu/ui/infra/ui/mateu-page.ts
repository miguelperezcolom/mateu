import { css, html, LitElement, nothing, PropertyValues, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/card'
import '@vaadin/button'
import '@vaadin/icon'
import '@vaadin/icons'
import '@vaadin/master-detail-layout'
import { customElement, property, state } from 'lit/decorators.js';
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import './mateu-content-header'
import { ComponentState, ComponentData } from "@infra/ui/renderers/types"
import { Banner } from "@mateu/shared/apiClients/dtos/componentmetadata/Banner.ts"

@customElement('mateu-page')
export class MateuPage extends LitElement {

    @property()
    component?: ClientSideComponent

    @property()
    baseUrl?: string

    @property()
    state?: ComponentState

    @property()
    data?: ComponentData

    @property()
    appState: ComponentState = {}

    @property()
    appData: ComponentData = {}

    @property()
    value?: unknown

    @property({ type: Boolean })
    standalone = false

    @state()
    actionBanners: Banner[] = []

    @state()
    dismissedStaticBannerIndices: Set<number> = new Set()

    private _actionBannerTimers: ReturnType<typeof setTimeout>[] = []
    private _staticBannerTimers: ReturnType<typeof setTimeout>[] = []

    private _bannersHandler = (e: Event) => {
        const detail = (e as CustomEvent).detail
        const newBanners: Banner[] = detail.banners ?? []
        const append: boolean = detail.append ?? false
        if (!append) {
            this._clearActionBannerTimers()
            this.actionBanners = newBanners
        } else {
            this.actionBanners = [...this.actionBanners, ...newBanners]
        }
        const baseIndex = append ? this.actionBanners.length - newBanners.length : 0
        newBanners.forEach((banner, i) => {
            if (banner.timeoutSeconds && banner.timeoutSeconds > 0) {
                const targetIndex = baseIndex + i
                this._actionBannerTimers.push(setTimeout(() => {
                    this.actionBanners = this.actionBanners.filter((_, idx) => idx !== targetIndex)
                }, banner.timeoutSeconds * 1000))
            }
        })
    }

    connectedCallback() {
        super.connectedCallback()
        document.addEventListener('page-banners-received', this._bannersHandler)
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        document.removeEventListener('page-banners-received', this._bannersHandler)
        this._clearAllTimers()
    }

    updated(changedProperties: PropertyValues) {
        super.updated(changedProperties)
        if (changedProperties.has('component') && changedProperties.get('component') !== undefined) {
            this._clearAllTimers()
            this.actionBanners = []
            this.dismissedStaticBannerIndices = new Set()
        }
        if (changedProperties.has('component')) {
            this._scheduleStaticBannerTimeouts()
        }
    }

    private _scheduleStaticBannerTimeouts() {
        this._staticBannerTimers.forEach(t => clearTimeout(t))
        this._staticBannerTimers = []
        const metadata = this.component?.metadata as PageComponent
        const staticBanners: Banner[] = (metadata as any)?.banners ?? []
        staticBanners.forEach((banner, i) => {
            if (banner.timeoutSeconds && banner.timeoutSeconds > 0) {
                this._staticBannerTimers.push(setTimeout(() => {
                    this.dismissedStaticBannerIndices = new Set([...this.dismissedStaticBannerIndices, i])
                }, banner.timeoutSeconds * 1000))
            }
        })
    }

    private _clearActionBannerTimers() {
        this._actionBannerTimers.forEach(t => clearTimeout(t))
        this._actionBannerTimers = []
    }

    private _clearAllTimers() {
        this._clearActionBannerTimers()
        this._staticBannerTimers.forEach(t => clearTimeout(t))
        this._staticBannerTimers = []
    }

    private _dismissActionBanner(index: number) {
        this.actionBanners = this.actionBanners.filter((_, i) => i !== index)
    }

    private _dismissStaticBanner(index: number) {
        this.dismissedStaticBannerIndices = new Set([...this.dismissedStaticBannerIndices, index])
    }

    bannerThemeClass(banner: Banner): string {
        const t = banner.theme?.toLowerCase() ?? 'info'
        return t === 'none' ? '' : t
    }

    private _evalBannerText(text: string | undefined): string | undefined {
        if (!text?.includes('${')) return text
        return new Function('state', 'data', 'return `' + text + '`')(this.state ?? {}, this.data ?? {})
    }

    private _renderBanner(banner: Banner, onDismiss: () => void): TemplateResult {
        const title = this._evalBannerText(banner.title)
        const description = this._evalBannerText(banner.description)
        return html`
            <vaadin-card class="page-banner page-banner--${this.bannerThemeClass(banner)}">
                ${title ? html`
                    <div slot="title" style="display: flex; align-items: center; justify-content: space-between; color: #1a1a1a; width: 100%;">
                        <span>${title}</span>
                        ${banner.hasCloseButton ? html`
                            <vaadin-button theme="icon tertiary small" class="banner-close" @click=${onDismiss} title="Dismiss">
                                <vaadin-icon icon="vaadin:close"></vaadin-icon>
                            </vaadin-button>
                        ` : nothing}
                    </div>
                ` : banner.hasCloseButton ? html`
                    <vaadin-button slot="title" theme="icon tertiary small" class="banner-close" style="margin-left: auto;" @click=${onDismiss} title="Dismiss">
                        <vaadin-icon icon="vaadin:close"></vaadin-icon>
                    </vaadin-button>
                ` : nothing}
                ${description ? html`<p>${description}</p>` : nothing}
            </vaadin-card>
        `
    }

    render(): TemplateResult {
        const metadata = this.component?.metadata as PageComponent
        const allStaticBanners: Banner[] = (metadata as any)?.banners ?? []
        const visibleStaticBanners = allStaticBanners
            .map((b, i) => ({ banner: b, index: i }))
            .filter(({ index }) => !this.dismissedStaticBannerIndices.has(index))
        const banners = [
            ...visibleStaticBanners.map(({ banner, index }) => ({ banner, onDismiss: () => this._dismissStaticBanner(index) })),
            ...this.actionBanners.map((banner, i) => ({ banner, onDismiss: () => this._dismissActionBanner(i) }))
        ]
        const inner = html`
            <mateu-content-header
                .metadata="${metadata}"
                .baseUrl="${this.baseUrl}"
                .state="${this.state}"
                .data="${this.data}"
                .appState="${this.appState}"
                .appData="${this.appData}"
            ></mateu-content-header>
            ${banners.length > 0 ? html`
                <div class="page-banners">
                    ${banners.map(({ banner, onDismiss }) => this._renderBanner(banner, onDismiss))}
                </div>
            ` : nothing}
            <div class="form-content">
                <slot></slot>
                <vaadin-horizontal-layout theme="spacing" class="form-buttons">
                    <slot name="buttons"></slot>
                </vaadin-horizontal-layout>
            </div>
            <div class="form-footer">
                ${metadata?.footer?.map(component => renderComponent(this, component, this.baseUrl, this.state ?? {}, this.data ?? {}, this.appState, this.appData))}
            </div>
        `
        return (false && this.standalone)
            ? html`<vaadin-card style="width: 100%;">${inner}</vaadin-card>`
            : html`<vaadin-vertical-layout style="width: 100%;">${inner}</vaadin-vertical-layout>`
    }

    static styles = css`
        :host {
            width: 100%;
        }

        .form-content {
            width: 100%;
        }

        .page-banners {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem 0 0.5rem;
            width: 100%;
            box-sizing: border-box;
        }

        .page-banner {
            width: 100%;
            color: #1a1a1a;
        }

        .page-banner p {
            margin: 0;
            color: #1a1a1a;
        }

        .banner-close {
            color: #1a1a1a;
            flex-shrink: 0;
        }

        .page-banner--info {
            --vaadin-card-background: #e8f4fd;
            border-leftx: 4px solid var(--lumo-primary-color);
        }

        .page-banner--success {
            --vaadin-card-background: #eafaf1;
            border-leftx: 4px solid var(--lumo-success-color);
        }

        .page-banner--warning {
            --vaadin-card-background: #fef9e7;
            border-leftx: 4px solid var(--lumo-warning-color, #f59e0b);
        }

        .page-banner--danger {
            --vaadin-card-background: #fdf2f2;
            border-leftx: 4px solid var(--lumo-error-color);
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-page': MateuPage
    }
}
