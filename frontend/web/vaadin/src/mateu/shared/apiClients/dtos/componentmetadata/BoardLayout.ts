import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface BoardLayoutItem extends ComponentMetadata {
    boardCols: number | undefined
}

export default interface BoardLayoutRow extends ComponentMetadata {

}

export default interface BoardLayout extends ComponentMetadata {

}
