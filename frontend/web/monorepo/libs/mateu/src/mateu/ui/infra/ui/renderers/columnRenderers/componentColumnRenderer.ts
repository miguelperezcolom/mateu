import type { GridItemModel, GridColumnElement as VaadinGridColumn } from "@infra/ui/renderers/columnRenderers/gridColumnTypes.ts";
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { LitElement } from "lit";

export const renderComponentCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                    container: LitElement,
                                    baseUrl: string | undefined,
                                    state: any,
                                    data: any, appState: any, appData: any
) => {
    const component = item[column.path!]
    return renderComponent(container, component, baseUrl, state, data, appState, appData)
}