import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface DropZone extends ComponentMetadata {
    /** the drag type it accepts (a listing marked @DragRows(type)) */
    accept?: string
    actionId?: string
    parameters?: Record<string, unknown>
    title?: string
    subtitle?: string
}
