import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface KPI extends ComponentMetadata {

    title: string
    text: string
    style: string
    /** A hoisted EntityHeader fact's action (see Fact): an icon-only button after the text. */
    actionId?: string
    icon?: string
    actionLabel?: string
    parameters?: Record<string, unknown>

}
