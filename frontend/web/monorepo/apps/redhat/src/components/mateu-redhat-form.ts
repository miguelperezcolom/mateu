import { customElement } from "lit/decorators.js";
import { css, html, nothing } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import "@vaadin/menu-bar"
import '@vaadin/button'
import Form from "@mateu/shared/apiClients/dtos/componentmetadata/Form";
import '@infra/ui/mateu-field'
import MetadataDrivenElement from "@infra/ui/MetadataDrivenElement";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

@customElement('mateu-redhat-form')
export class MateuRedhatForm extends MetadataDrivenElement {


    handleButtonClick = (actionId: string) => {
        this.dispatchEvent(new CustomEvent('action-requested', {
            detail: {
                actionId,
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const metadata = (this.component as ClientSideComponent)?.metadata as Form
        return html`
            <ui5-dynamic-page id="page" show-footer style="width: auto; display: block;">
                
                ${metadata.noHeader?html`

                    ${metadata.toolbar?.length > 0?html`
                        <ui5-toolbar class="actionsBar" id="actionsToolbar" slot="actionsBar" design="Transparent">
                            <vaadin-horizontal-layout theme="spacing"><slot name="toolbar"></slot></vaadin-horizontal-layout>
                            <!--
                            <ui5-toolbar-button text="Create"></ui5-toolbar-button>
                            <ui5-toolbar-button id="edit-button" design="Transparent" text="Edit"></ui5-toolbar-button>
                            <ui5-toolbar-button design="Transparent" text="Paste"></ui5-toolbar-button>
                            -->
                        </ui5-toolbar>
                    `:nothing}
                
                `:html`
                    <ui5-dynamic-page-title slot="titleArea">
                        <!--
                        <ui5-breadcrumbs slot="breadcrumbs">
                            <ui5-breadcrumbs-item href="#">Man</ui5-breadcrumbs-item>
                            <ui5-breadcrumbs-item href="#">Shoes</ui5-breadcrumbs-item>
                            <ui5-breadcrumbs-item href="#">Running Shoes</ui5-breadcrumbs-item>
                        </ui5-breadcrumbs>
    -->

                        <ui5-title slot="heading">${metadata.title}</ui5-title>

                        <div slot="snappedHeading" class="snapped-title-heading">
                            <!--
                            <ui5-avatar shape="square" icon="laptop" color-scheme="Accent5" size="S"></ui5-avatar>
                            -->
                            <ui5-title wrapping-type="None">${metadata.title}</ui5-title>
                        </div>

                        ${metadata.subtitle?html`
                        <p slot="subheading" class="text">${metadata.subtitle}</p>
                        <p slot="snappedSubheading" class="text">${metadata.subtitle}</p>
                    `:nothing}

                        <!--
                        <ui5-tag color-scheme="7" wrapping-type="None">Special 157.4M EUR</ui5-tag>
                        -->

                        ${metadata.toolbar?.length > 0?html`
                        <ui5-toolbar class="actionsBar" id="actionsToolbar" slot="actionsBar" design="Transparent">
                            <vaadin-horizontal-layout theme="spacing"><slot name="toolbar"></slot></vaadin-horizontal-layout>
                            <!--
                            <ui5-toolbar-button text="Create"></ui5-toolbar-button>
                            <ui5-toolbar-button id="edit-button" design="Transparent" text="Edit"></ui5-toolbar-button>
                            <ui5-toolbar-button design="Transparent" text="Paste"></ui5-toolbar-button>
                            -->
                        </ui5-toolbar>
                    `:nothing}

                        <!--
                        <ui5-toolbar class="navigationBar" slot="navigationBar" design="Transparent">
                            <ui5-toolbar-button design="Transparent" icon="share"></ui5-toolbar-button>
                            <ui5-toolbar-button design="Transparent" icon="action-settings"></ui5-toolbar-button>
                        </ui5-toolbar>
                        -->
                    </ui5-dynamic-page-title>
                `}
                <!--
                <ui5-dynamic-page-header slot="headerArea">
                    <div class="product-info">
                        <ui5-avatar id="avatar" shape="square" icon="laptop" color-scheme="Accent5" size="L"></ui5-avatar>
                        <div class="product-info-cell">
                            <ui5-label>Availability</ui5-label>
                            <p class="text availability">In Stock</p>
                        </div>
                        <div class="product-info-cell">
                            <ui5-label>Price</ui5-label>
                            <p class="text price">379.99 USD</p>
                        </div>
                        <div class="product-info-cell">
                            <ui5-label>Product Description</ui5-label>
                            <p class="text product-description">Super-lightweight cushioning propels you forward from landing to toe-off and has a fast, snappy feel.</p>
                        </div>
                    </div>
                </ui5-dynamic-page-header>
                -->

                <!--
                <ui5-list header-text="Products (13)" mode="SingleSelect">
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="47.00 EUR">10 inch Portable DVD</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="249.00 EUR">7 inch WidescreenPortable DVD Player w MP3</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="947.00 EUR">Astro Laptop 1516</ui5-li>
                    <ui5-li description="HT-1251" icon="slim-arrow-right" icon-end additional-text="647.00 EUR">Astro Phone 6</ui5-li>
                    <ui5-li description="HT-1252" icon="slim-arrow-right" icon-end additional-text="27.99 EUR">Audio/Video Cable Kit - 4m</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="447.90 EUR">Beam Breaker B-1</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="647.50 EUR">Beam Breaker B-2</ui5-li>
                    <ui5-li description="HT-6001" icon="slim-arrow-right" icon-end additional-text="847.80 EUR">Beam Breaker B-3</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="1,250.00 EUR">Beam Breaker B-4</ui5-li>
                    <ui5-li description="HT-8001" icon="slim-arrow-right" icon-end additional-text="1,288.00 EUR">Camcorder View</ui5-li>
                    <ui5-li description="HT-2001" icon="slim-arrow-right" icon-end additional-text="996.00 EUR">Benda Laptop 1408</ui5-li>
                    <ui5-li description="HT-0003" icon="slim-arrow-right" icon-end additional-text="147.00 EUR">Cepat Tablet 10.5</ui5-li>
                    <ui5-li description="HT-1001" icon="slim-arrow-right" icon-end additional-text="87.90 EUR">Gladiator MX</ui5-li>
                </ui5-list>
                -->
                <slot></slot>

                ${metadata.buttons?.length > 0?html`
                    <ui5-bar slot="footerArea" design="FloatingFooter">
                        <vaadin-horizontal-layout theme="spacing" slot="endContent"><slot name="buttons"></slot></vaadin-horizontal-layout>
                        <!--
                        <ui5-button id="save-edit" slot="endContent" design="Emphasized">Save</ui5-button>
                        <ui5-button id="cancel-edit" slot="endContent">Close</ui5-button>
                        -->
                    </ui5-bar>
                `:nothing}
            </ui5-dynamic-page>`

        if (false) return html`
            <vaadin-vertical-layout theme="spacing">
           <h2 style="margin-block-end: 0px;">${metadata?.title}</h2>
           <span style="display: inline-block; margin-block-end: 0.83em;">${metadata?.subtitle}</span>
           
           <vaadin-horizontal-layout theme="spacing">
               ${metadata?.toolbar?.map(button => html`
                   <ui5-button
                           part="button"
                           data-action-id="${button.id}"
                           @click="${() => this.handleButtonClick(button.actionId)}"
                   >${button.label}</ui5-button>
`)}
           </vaadin-horizontal-layout>
           <slot></slot>
           <vaadin-horizontal-layout theme="spacing">
               <slot name="buttons"></slot>
           </vaadin-horizontal-layout>
            </vaadin-vertical-layout>    
       `
    }

    static styles = css`
        :host {
            width: 100%;
            height: calc(100vh - 8.3rem);
        }

        ui5-dynamic-page-title {
            padding-top: 1rem;
        }
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-redhat-form': MateuRedhatForm
    }
}
