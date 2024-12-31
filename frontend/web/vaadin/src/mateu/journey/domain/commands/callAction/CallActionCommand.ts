export interface CallActionCommand {
    baseUrl: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    componentId: string
    actionId: string
    componentType: string
    data: unknown
}