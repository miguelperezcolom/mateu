import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface CalloutCard extends ComponentMetadata {
    title?: string
    description?: string
    icon?: string
    ctaLabel?: string
    actionId?: string
    theme?: string
}
