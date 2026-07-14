import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface ComparisonCard extends ComponentMetadata {
    title?: string
    leftLabel?: string
    leftValue?: string
    rightLabel?: string
    rightValue?: string
    delta?: string
    trend?: string
}
