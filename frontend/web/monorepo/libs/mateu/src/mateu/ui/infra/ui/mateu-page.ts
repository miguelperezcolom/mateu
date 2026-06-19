import { css, html, LitElement, nothing, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/card'
import '@vaadin/master-detail-layout'
import { customElement, property } from 'lit/decorators.js';
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

    bannerThemeClass(banner: Banner): string {
        const t = banner.theme?.toLowerCase() ?? 'info'
        return t === 'none' ? '' : t
    }

    render(): TemplateResult {
        const metadata = this.component?.metadata as PageComponent
        const banners: Banner[] = (metadata as any)?.banners ?? []
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
                    ${banners.map(banner => html`
                        <vaadin-card class="page-banner page-banner--${this.bannerThemeClass(banner)}">
                            ${banner.title ? html`<span slot="title">${banner.title}</span>` : nothing}
                            ${banner.description ? html`<p>${banner.description}</p>` : nothing}
                        </vaadin-card>
                    `)}
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
        }

        .page-banner p {
            margin: 0;
        }

        .page-banner--info {
            --vaadin-card-background: #e8f4fd;
            border-left: 4px solid var(--lumo-primary-color);
        }

        .page-banner--success {
            --vaadin-card-background: #eafaf1;
            border-left: 4px solid var(--lumo-success-color);
        }

        .page-banner--warning {
            --vaadin-card-background: #fef9e7;
            border-left: 4px solid var(--lumo-warning-color, #f59e0b);
        }

        .page-banner--danger {
            --vaadin-card-background: #fdf2f2;
            border-left: 4px solid var(--lumo-error-color);
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-page': MateuPage
    }
}
