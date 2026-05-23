import { html, LitElement, type TemplateResult } from 'lit';
import { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer'
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent"
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { MateuTableCrud } from "@infra/ui/mateu-table-crud.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import './components/mateu-sapui5-table'
import './components/mateu-sapui5-filter-bar'
import './components/mateu-sapui5-pagination'
import { renderButton } from "@/renderers/renderButton.ts";
import { renderField } from "@/renderers/renderField.ts";
import { renderApp } from "@/renderers/renderApp.ts";
import { renderPage } from "@/renderers/renderPage.ts";
import { renderForm } from "@/renderers/renderForm.ts";
import {
    renderHorizontalLayout,
    renderVerticalLayout,
    renderFormLayout,
    renderFormRow,
    renderTabLayout,
    renderAccordionLayout,
    renderSplitLayout,
    renderScroller,
    renderFullWidth,
    renderContainer,
    renderBoardLayout,
    renderBoardLayoutRow,
    renderBoardLayoutItem
} from "@/renderers/renderLayouts.ts";
import {
    renderText,
    renderBadge,
    renderIcon,
    renderBreadcrumbs,
    renderNotification,
    renderProgressBar,
    renderDetails,
    renderImage
} from "@/renderers/renderDisplayComponents.ts";
import { MateuComponent } from "@infra/ui/mateu-component.ts";

export const changed = (event: Event) => {
    const element = event.target as HTMLInputElement
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.value,
            //@ts-ignore
            fieldId: element.id
        },
        bubbles: true,
        composed: true
    }))
}

export const checkboxChanged = (event: Event) => {
    const element = event.target as HTMLInputElement
    element.dispatchEvent(new CustomEvent('value-changed', {
        detail: {
            value: element.checked,
            //@ts-ignore
            fieldId: element.id
        },
        bubbles: true,
        composed: true
    }))
}

export const handleButtonClick = (event: Event) => {
    const actionId = (event.target as HTMLElement).dataset.actionId
    event.target?.dispatchEvent(new CustomEvent('action-requested', {
        detail: {
            actionId,
        },
        bubbles: true,
        composed: true
    }))
}

export class SapUi5ComponentRenderer extends BasicComponentRenderer implements ComponentRenderer {

    // @ts-ignore
    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any, labelAlreadyRendered: boolean | undefined): TemplateResult {

        if (ComponentMetadataType.App == component?.metadata?.type) {
            return renderApp(container as MateuComponent, component, baseUrl, state, data)
        }
        if (ComponentMetadataType.Page == component?.metadata?.type) {
            return renderPage(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Form == component?.metadata?.type) {
            return renderForm(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Button == component?.metadata?.type) {
            return renderButton(component, baseUrl, state, data)
        }
        if (ComponentMetadataType.FormField == component?.metadata?.type) {
            return renderField(component, baseUrl, state, data)
        }

        // Layouts
        if (ComponentMetadataType.HorizontalLayout == component?.metadata?.type) {
            return renderHorizontalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.VerticalLayout == component?.metadata?.type) {
            return renderVerticalLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormLayout == component?.metadata?.type) {
            return renderFormLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FormRow == component?.metadata?.type) {
            return renderFormRow(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.TabLayout == component?.metadata?.type) {
            return renderTabLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.AccordionLayout == component?.metadata?.type) {
            return renderAccordionLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.SplitLayout == component?.metadata?.type) {
            return renderSplitLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Scroller == component?.metadata?.type) {
            return renderScroller(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.FullWidth == component?.metadata?.type) {
            return renderFullWidth(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Container == component?.metadata?.type) {
            return renderContainer(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayout == component?.metadata?.type) {
            return renderBoardLayout(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayoutRow == component?.metadata?.type) {
            return renderBoardLayoutRow(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.BoardLayoutItem == component?.metadata?.type) {
            return renderBoardLayoutItem(container, component, baseUrl, state, data, appState, appData)
        }

        // Display components
        if (ComponentMetadataType.Text == component?.metadata?.type) {
            return renderText(component, state, data, appState, appData)
        }
        if (ComponentMetadataType.Badge == component?.metadata?.type) {
            return renderBadge(component, state, data)
        }
        if (ComponentMetadataType.Icon == component?.metadata?.type) {
            return renderIcon(component)
        }
        if (ComponentMetadataType.Breadcrumbs == component?.metadata?.type) {
            return renderBreadcrumbs(component)
        }
        if (ComponentMetadataType.Notification == component?.metadata?.type) {
            return renderNotification(component)
        }
        if (ComponentMetadataType.ProgressBar == component?.metadata?.type) {
            return renderProgressBar(component)
        }
        if (ComponentMetadataType.Details == component?.metadata?.type) {
            return renderDetails(container, component, baseUrl, state, data, appState, appData)
        }
        if (ComponentMetadataType.Image == component?.metadata?.type) {
            return renderImage(component)
        }

        return super.renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, data: any, appState: any, appData: any): TemplateResult {
        const metadata = component?.metadata as Crud
        return html`
            <mateu-sapui5-filter-bar
                .metadata="${metadata}"
                .state="${state}"
                .data="${data}"
                .appState="${appState}"
                .appData="${appData}"
                baseUrl="${baseUrl ?? ''}"
                @search-requested="${container.search}"
                @action-requested="${(e: CustomEvent) => {
                    e.stopPropagation()
                    container.dispatchEvent(new CustomEvent('action-requested', {
                        detail: e.detail, bubbles: true, composed: true
                    }))
                }}"
            >
                ${metadata?.header?.map(comp => renderComponent(container, comp, baseUrl, state, data, appState, appData))}
            </mateu-sapui5-filter-bar>
        `
    }

    renderPagination(container: MateuTableCrud, _component: ClientSideComponent | undefined): TemplateResult {
        const id = container.id
        return html`
            <mateu-sapui5-pagination
                totalElements="${container.data[id]?.page?.totalElements ?? 0}"
                pageSize="${container.data[id]?.page?.pageSize ?? 100}"
                pageNumber="${container.data[id]?.page?.pageNumber ?? 0}"
                @page-changed="${container.pageChanged}"
                @fetch-more-elements="${container.fetchMoreElements}"
            ></mateu-sapui5-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: any, _data: any, appState: any, appData: any): TemplateResult {
        return html`
            <mateu-sapui5-table
                id="${container.id}"
                .metadata="${component?.metadata}"
                .data="${container.data}"
                .state="${state}"
                .appState="${appState}"
                .appData="${appData}"
                .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                baseUrl="${baseUrl}"
                @sort-changed="${(e: CustomEvent) => {
                    container.state.sort = e.detail.sorts
                    container.handleSearchRequested(undefined)
                }}"
                @fetch-more-elements="${container.fetchMoreElements}"
                @action-requested="${(e: CustomEvent) => {
                    e.stopPropagation()
                    container.dispatchEvent(new CustomEvent('action-requested', {
                        detail: e.detail,
                        bubbles: true,
                        composed: true
                    }))
                }}"
            ></mateu-sapui5-table>
        `
    }

}
