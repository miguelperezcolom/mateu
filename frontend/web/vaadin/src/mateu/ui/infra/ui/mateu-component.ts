import { customElement, property } from "lit/decorators.js";
import { css, html, unsafeCSS } from "lit";
import { badge } from '@vaadin/vaadin-lumo-styles/badge.js';
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/split-layout'
import '@vaadin/master-detail-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/tabsheet'
import "@vaadin/menu-bar"
import "@vaadin/progress-bar"
import "@vaadin/scroller"
import "@vaadin/accordion"
import "@vaadin/avatar"
import "@vaadin/avatar-group"
import "@vaadin/charts"
import "@vaadin/combo-box"
import "@vaadin/radio-group"
import "@vaadin/checkbox-group"
import "@vaadin/select"
import "@vaadin/multi-select-combo-box"
import "@vaadin/confirm-dialog"
import "@vaadin/context-menu"
import "@vaadin/cookie-consent"
import "@vaadin/dialog"
import "@vaadin/map"
import "@vaadin/markdown"
import "@vaadin/notification"
import "@vaadin/popover"
import "@vaadin/tooltip"
import "@vaadin/message-input"
import "@vaadin/message-list"
import "@vaadin/custom-field"
import "@vaadin/grid"
import '@vaadin/grid/vaadin-grid-tree-column.js';
import "@vaadin/virtual-list"
import "@vaadin/board"
import './mateu-form'
import './mateu-field'
import './mateu-table'
import './mateu-table-crud'
import './mateu-card'
import './mateu-app'
import './mateu-api-caller'
import './mateu-ux'
import ComponentElement from "@infra/ui/ComponentElement";
import { renderComponent } from "@infra/ui/renderComponents";
import ServerSideComponent from "@mateu/shared/apiClients/dtos/ServerSideComponent";

@customElement('mateu-component')
export class MateuComponent extends ComponentElement {

    @property()
    baseUrl: string | undefined


    valueChangedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const detail = e.detail as {
                value: any,
                fieldId: string
            }
            if (e.type == 'value-changed') {
                this.values[detail.fieldId] = detail.value
            }
        }
    }

    actionRequestedListener: EventListenerOrEventListenerObject = (e: Event) => {
        e.preventDefault()
        e.stopPropagation()
        if (e instanceof CustomEvent) {
            const detail = e.detail as {
                actionId: string
            }
            if (e.type == 'action-requested') {
                const serverSideComponent = this.component as ServerSideComponent
                this.dispatchEvent(new CustomEvent('server-side-action-requested', {
                    detail: {
                        userData: {...this.values},
                        actionId: detail.actionId,
                        serverSideType: serverSideComponent.serverSideType,
                        initiatorComponentId: serverSideComponent.id,
                        initiator: this
                    },
                    bubbles: true,
                    composed: true
                }))
            }
        }
    }

    render() {
        console.log('values', this.values)
        return html`
            <mateu-api-caller @value-changed="${this.valueChangedListener}" @action-requested="${this.actionRequestedListener}">
            ${this.component?.children?.map(child => renderComponent(child, this.baseUrl, this.values))}
            </mateu-api-caller>
        `
    }

    static styles = css`
        :host {
            width: 100%;
        }

        ${unsafeCSS(badge.cssText)}
        
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-component': MateuComponent
    }
}


