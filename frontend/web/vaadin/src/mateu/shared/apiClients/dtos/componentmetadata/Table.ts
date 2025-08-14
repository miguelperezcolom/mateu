import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

export default interface Table extends ComponentMetadata {

    columns: ClientSideComponent[]
    rows: number | undefined
    emptyStateMessage: string
    allRowsVisible: boolean
    lazyLoading: boolean
    lazyColumnRendering: boolean
    infiniteScrolling: boolean
    useButtonForDetail: boolean
    actionIdOnSelectionChanged: string
    columnReorderingAllowed: boolean
    serverSideOrdering: boolean

}