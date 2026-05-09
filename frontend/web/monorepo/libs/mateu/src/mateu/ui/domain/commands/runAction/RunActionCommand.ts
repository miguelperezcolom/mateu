export interface RunActionCommand {
    baseUrl: string
    route: string
    consumedRoute: string
    appState: any
    actionId: any
    componentState: any
    parameters: any
    serverSideType: string
    initiatorComponentId: string
    initiator: HTMLElement
    background: boolean
}