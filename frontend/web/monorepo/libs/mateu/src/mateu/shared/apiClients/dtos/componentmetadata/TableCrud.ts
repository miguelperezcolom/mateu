import Table from "@mateu/shared/apiClients/dtos/componentmetadata/Table";
import Crud from "@mateu/shared/apiClients/dtos/componentmetadata/Crud";

export default interface TableCrud extends Crud {

    table: Table
    wrapCellContent: boolean
    compact: boolean
    noBorder: boolean
    noRowBorder: boolean
    columnBorders: boolean
    rowStripes: boolean
    vaadinGridCellBackground: string
    vaadinGridCellPadding: string

}