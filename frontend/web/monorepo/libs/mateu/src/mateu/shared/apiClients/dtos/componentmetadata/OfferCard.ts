import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface OfferCard extends ComponentMetadata {
    tag?: string
    title?: string
    subtitle?: string
    image?: string
    features?: string[]
    priceLabel?: string
    actionLabel?: string
    actionId?: string
    current?: boolean
    currentLabel?: string
}
