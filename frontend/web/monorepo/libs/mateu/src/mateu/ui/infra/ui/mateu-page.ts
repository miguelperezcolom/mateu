import { css, html, LitElement, TemplateResult } from "lit";
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
import "@vaadin/card"
import { customElement, property } from 'lit/decorators.js';
import PageComponent from "@mateu/shared/apiClients/dtos/componentmetadata/PageComponent.ts";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";


@customElement('mateu-page')
export class MateuPage extends LitElement {

    @property()
    component?: ClientSideComponent

    @property()
    baseUrl?: string

    @property()
    state?: any

    @property()
    data?: any

    @property()
    value?: any


    render(): TemplateResult {
        const metadata = this.component?.metadata as PageComponent
        const mainContent = metadata.mainContent as ClientSideComponent

        if (mainContent.metadata?.type == ComponentMetadataType.Form) {
            return html`
                <div><h2>PAGE ${metadata.pageTitle} ${mainContent.metadata?.type}</h2></div>
                <div>${renderComponent(this, metadata.mainContent, this.baseUrl, this.state, this.data)}</div>
        `
        }
        if (mainContent.metadata?.type == ComponentMetadataType.Crud) {
            return html`
                <div>
                    <div>
                        <h2>PAGE ${metadata.pageTitle} ${mainContent.metadata?.type}</h2>
                        
                    </div>
                    <div>
                            ${renderComponent(this, metadata.mainContent, this.baseUrl, this.state, this.data)}
                    </div>
                    
                </div>
        `
        }
        if (mainContent.metadata?.type == ComponentMetadataType.App) {
            return html`
                <div><h2>PAGE ${metadata.pageTitle} ${mainContent.metadata?.type}</h2></div>
                <div>${renderComponent(this, metadata.mainContent, this.baseUrl, this.state, this.data)}</div>
        `
        }

        return html`
                <div><h2>PAGE ${metadata.pageTitle} ${mainContent.metadata?.type}</h2></div>
                <div>${renderComponent(this, metadata.mainContent, this.baseUrl, this.state, this.data)}</div>
        `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-page': MateuPage
    }
}


