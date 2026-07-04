import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface MetricCard extends ComponentMetadata {

    title: string
    value: string
    unit?: string
    trend?: 'up' | 'down' | 'neutral'
    trendLabel?: string
    icon?: string
    description?: string
    actionId?: string

}
