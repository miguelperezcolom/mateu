import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Tab extends ComponentMetadata {

    label: string

    shortcut?: string

    /** When true this tab is the one selected when the strip first renders. */
    active?: boolean

}