import { customElement, state } from "lit/decorators.js";
import { css, html, nothing, PropertyValues } from "lit";
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
import ComponentElement from "@infra/ui/ComponentElement";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App";
import { AppVariant } from "@mateu/shared/apiClients/dtos/componentmetadata/AppVariant";
import "./mateu-ux"
import './mateu-api-caller'
import { MenuBarItemSelectedEvent } from "@vaadin/menu-bar";
import MenuOption from "@mateu/shared/apiClients/dtos/componentmetadata/MenuOption";
import { nanoid } from "nanoid";


@customElement('mateu-app')
export class MateuApp extends ComponentElement {

    @state()
    selectedJourneyTypeId: string | undefined = undefined

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        if (_changedProperties.has('metadata')) {
            this.selectedJourneyTypeId = this.getInitialJourneyTypeId((this.metadata as App).options)
        }
    }

    getSelectedOption = (options: MenuOption[]): MenuOption | null => {
        if (options) {
            for (let i = 0; i < options.length; i++) {
                const option = options[i]
                if (option.selected) {
                    return option
                }
                const foundInChildren = this.getSelectedOption(option.children)
                if (foundInChildren) {
                    return foundInChildren
                }
            }
        }
        return null
    }

    getInitialJourneyTypeId = (options: MenuOption[]): string | undefined => {
        const selectedOption = this.getSelectedOption(options)
        if (selectedOption) {
            return selectedOption.journeyTypeId
        }
        return undefined;
    }

    itemSelected = (e: MenuBarItemSelectedEvent) => {
        // @ts-ignore
        this.selectedJourneyTypeId = e.detail.value.journeyTypeId
    }

    mapItems = (options: MenuOption[]): any => {
        return options.map(option => {
            if (option.children) {
                return {
                    text: option.label,
                    journeyTypeId: option.journeyTypeId,
                    children: this.mapItems(option.children)
                }
            }
            return {
                text: option.label,
                journeyTypeId: option.journeyTypeId,
            }
        })
    }

    render() {
        const metadata = this.metadata as App

        const items = this.mapItems(metadata.options)
        return html`

            <h5>selectedJourneyTypeId: ${this.selectedJourneyTypeId}</h5>
            
            ${metadata.variant == AppVariant.MENU_ON_TOP?html`

                <vaadin-vertical-layout>
                    <vaadin-menu-bar
                            .items="${items}"
                            @item-selected="${this.itemSelected}">
                    </vaadin-menu-bar>
                    <mateu-api-caller>
                        <mateu-ux route="${this.selectedJourneyTypeId}" id="${nanoid()}"></mateu-ux>
                    </mateu-api-caller>
                </vaadin-vertical-layout>
                
            `:nothing}

            ${metadata.variant == AppVariant.MENU_ON_LEFT?html`

                <vaadin-horizontal-layout>
                    <vaadin-vertical-layout>
                        ${metadata.options.map(option => html`
                                <vaadin-button @click="${() => this.selectedJourneyTypeId = option.journeyTypeId}">${option.label}</vaadin-button>
                            `)}
                    </vaadin-vertical-layout>
                    <mateu-api-caller>
                        <mateu-ux route="${this.selectedJourneyTypeId}" id="${nanoid()}"></mateu-ux>
                    </mateu-api-caller>
                </vaadin-horizontal-layout>

                
            `:nothing}

            ${metadata.variant == AppVariant.TABS?html`

                <vaadin-vertical-layout>
                    <vaadin-tabs>
                        ${metadata.options.map(option => html`
                                <vaadin-tab @click="${() => this.selectedJourneyTypeId = option.journeyTypeId}">${option.label}</vaadin-tab>
                            `)}
                    </vaadin-tabs>
                    <mateu-api-caller>
                        <mateu-ux route="${this.selectedJourneyTypeId}" id="${nanoid()}"></mateu-ux>
                    </mateu-api-caller>
                </vaadin-vertical-layout>
            
            `:nothing}

            <slot></slot>
       `
    }

    static styles = css`
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-app': MateuApp
    }
}


