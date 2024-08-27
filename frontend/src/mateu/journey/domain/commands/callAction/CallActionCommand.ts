export interface CallActionCommand {
    baseUrl: string
    uiId: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    componentId: string
    actionId: string
    componentType: string
    data: unknown
}