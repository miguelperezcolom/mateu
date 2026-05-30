import { ComponentState } from "@infra/ui/renderers/types"

export interface RunActionCommand {
    baseUrl: string
    route: string
    consumedRoute: string
    appState: ComponentState
    actionId: string
    componentState: ComponentState
    parameters: Record<string, unknown>
    serverSideType: string
    initiatorComponentId: string
    initiator: HTMLElement
    background: boolean
}