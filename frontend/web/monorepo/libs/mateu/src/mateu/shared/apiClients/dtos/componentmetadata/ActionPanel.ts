import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export interface ActionPanelItem {
    label?: string
    actionId?: string
    parameters?: Record<string, unknown> | null
    count?: number | null
    populated?: boolean
    disabled?: boolean
}

export interface ActionPanelCategory {
    title?: string
    actions?: ActionPanelItem[]
}

export default interface ActionPanel extends ComponentMetadata {
    label?: string
    shortcut?: string | null
    categories?: ActionPanelCategory[]
    maxPerCategory?: number
    hideUnpopulatedToggle?: boolean
}
