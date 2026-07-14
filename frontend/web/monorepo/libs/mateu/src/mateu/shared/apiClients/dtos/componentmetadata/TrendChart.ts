import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface TrendChart extends ComponentMetadata {
    title?: string
    values?: number[]
    labels?: string[]
    color?: string
    area?: boolean
}
