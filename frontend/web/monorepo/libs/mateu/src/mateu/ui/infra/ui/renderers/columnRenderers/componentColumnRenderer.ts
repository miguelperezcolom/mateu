import type { GridItemModel } from "@vaadin/grid/src/vaadin-grid";
import type { GridColumn as VaadinGridColumn } from '@vaadin/grid/vaadin-grid-column';
import { renderComponent } from "@infra/ui/renderers/renderComponent.ts";
import { LitElement } from "lit";

export const renderComponentCell = (item: any,
                                 _model: GridItemModel<any>,
                                 column: VaadinGridColumn,
                                    container: LitElement,
                                    baseUrl: string | undefined,
                                    state: any,
                                    data: any
) => {
    const component = item[column.path!]
    return renderComponent(container, component, baseUrl, state, data)
}