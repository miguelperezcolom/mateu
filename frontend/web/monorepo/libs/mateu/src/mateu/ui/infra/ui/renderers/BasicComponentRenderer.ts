import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent.ts";
import { html, LitElement, TemplateResult } from "lit";
import { ComponentRenderer } from "./ComponentRenderer.ts";
import { renderClientSideComponent as _renderClientSideComponent } from "@infra/ui/renderers/renderClientSideComponent.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { MateuApp } from "@infra/ui/mateu-app.ts";
import { renderApp } from "@infra/ui/renderers/appRenderer.ts";
import App from "@mateu/shared/apiClients/dtos/componentmetadata/App.ts";
import { MateuTableCrud } from "../mateu-table-crud.ts";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud.ts";
import { ComponentState, ComponentData } from "@infra/ui/renderers/types.ts";
import { ComponentMetadataType } from "@mateu/shared/apiClients/dtos/ComponentMetadataType.ts";
import { isUnsupportedType, renderUnsupported } from "@infra/ui/renderers/unsupportedRenderer.ts";

export abstract class BasicComponentRenderer implements ComponentRenderer {

    renderFilterBar(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, searchOnly?: boolean): TemplateResult {
        const metadata = component?.metadata as Crud
        const onValueChanged = (e: CustomEvent) => {
            const { fieldId, value } = e.detail
            container.state = { ...container.state, [fieldId]: value }
        }
        const onFilterResetRequested = (e: CustomEvent) => {
            const { fieldIds } = e.detail as { fieldIds: string[] }
            const reset: Record<string, any> = {}
            fieldIds.forEach((id: string) => { reset[id] = undefined })
            reset['searchText'] = undefined
            container.state = { ...container.state, ...reset }
        }
        return html`
            <mateu-filter-bar
                .metadata="${metadata}"
                @search-requested="${container.search}"
                @value-changed="${onValueChanged}"
                @filter-reset-requested="${onFilterResetRequested}"
                .state="${container.state}"
                .data="${data}"
                .appState="${appState}"
                .appData="${appData}"
                ?searchOnly="${searchOnly ?? false}"
            >
                ${metadata?.header?.map(comp => renderComponent(container, comp, baseUrl, state, data, appState, appData))}
            </mateu-filter-bar>
        `
    }

    renderPagination(container: MateuTableCrud, component: ClientSideComponent | undefined): TemplateResult {
        return html`
        <mateu-pagination
                @page-changed="${container.pageChanged}"
                @fetch-more-elements="${container.fetchMoreElements}"
                .totalElements="${container.data[component?.id!]?.page?.totalElements ?? 0}"
                .pageSize="${container.data[component?.id!]?.page?.pageSize ?? 10}"
                data-testid="pagination"
                .pageNumber="${container.data[component?.id!]?.page?.pageNumber ?? 0}"
        ></mateu-pagination>
        `
    }

    renderTableComponent(container: MateuTableCrud, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, _data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult {
        return html`
        <mateu-table id="${container.id}"
                     .metadata="${component?.metadata}"
                     .data="${container.data}"
                     .state="${state}"
                     .appState="${appState}"
                     .appData="${appData}"
                     .emptyStateMessage="${state[component?.id!]?.emptyStateMessage}"
                     @sort-direction-changed="${container.directionChanged}"
                     @fetch-more-elements="${container.fetchMoreElements}"
                     baseUrl="${baseUrl}"
        ></mateu-table>
        `
    }
    /** Short renderer name for diagnostics/conformance. Subclasses should override. */
    rendererName(): string {
        return this.constructor?.name ?? 'unknown'
    }

    /**
     * Types this renderer declares it supports. Default `undefined` = full shared switch (the
     * Vaadin reference renderer, and any renderer that has not opted in yet — no behavior change).
     * Non-vaadin renderers should override and return their declared set: any other type falling
     * through their own switch to this shared fallback renders a visible <mateu-unsupported>
     * placeholder instead of broken Vaadin-flavoured components.
     */
    supportedClientSideTypes(): ReadonlySet<ComponentMetadataType> | undefined {
        return undefined
    }

    renderClientSideComponent(container: LitElement, component: ClientSideComponent | undefined, baseUrl: string | undefined, state: ComponentState, data: ComponentData, appState: ComponentState, appData: ComponentData, labelAlreadyRendered: boolean | undefined): TemplateResult {
        // Some callers pass a raw metadata object instead of a ClientSideComponent (the shared
        // switch wraps and retries), so read the type from either shape before deciding. Only a
        // value that is really a ComponentMetadataType counts (a metadata-less ClientSideComponent
        // carries a ComponentType there instead — let the shared switch handle that case).
        const rawType = component?.metadata?.type ?? (component as unknown as { type?: string })?.type
        const type = (Object.values(ComponentMetadataType) as string[]).includes(rawType as string)
            ? rawType as ComponentMetadataType : undefined
        if (isUnsupportedType(this.supportedClientSideTypes(), type)) {
            return renderUnsupported(component, type!, this.rendererName())
        }
        return _renderClientSideComponent(container, component, baseUrl, state, data, appState, appData, labelAlreadyRendered)
    }

    renderAppComponent(container: MateuApp, component: ClientSideComponent | undefined, _baseUrl: string | undefined, _state: ComponentState, _data: ComponentData, appState: ComponentState, appData: ComponentData): TemplateResult {
        return renderApp(container, component?.metadata as App, _baseUrl, _state, _data, appState, appData)
    }

}
