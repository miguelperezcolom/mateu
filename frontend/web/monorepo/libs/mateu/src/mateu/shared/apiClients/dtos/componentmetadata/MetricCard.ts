import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface MetricCard extends ComponentMetadata {

    title: string
    value: string
    unit?: string
    trend?: 'up' | 'down' | 'neutral'
    trendLabel?: string
    /** The period the value covers ("Last 7 days", "Q3 2026"), shown under the value. Experimental. */
    timeframe?: string
    icon?: string
    description?: string
    actionId?: string

}
