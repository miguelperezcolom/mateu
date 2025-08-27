import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import ClientSideComponent from "@mateu/shared/apiClients/dtos/ClientSideComponent";

export default interface Table extends ComponentMetadata {

    columns: ClientSideComponent[]
    header: ClientSideComponent[]
    footer: ClientSideComponent[]
    emptyStateMessage: string
    allRowsVisible: boolean
    lazyLoading: boolean
    lazyColumnRendering: boolean
    infiniteScrolling: boolean
    useButtonForDetail: boolean
    onRowSelectionChangedActionId: string
    columnReorderingAllowed: boolean
    serverSideOrdering: boolean
    rowsSelectionEnabled: boolean
    wrapCellContent: boolean
    compact: boolean
    noBorder: boolean
    noRowBorder: boolean
    columnBorders: boolean
    rowStripes: boolean
    vaadinGridCellBackground: string
    vaadinGridCellPadding: string
    gridStyle: string
    detailPath: string

}