export interface RunActionCommand {
    baseUrl: string
    route: string
    consumedRoute: string
    appState: any
    actionId: any
    userData: any
    serverSideType: string
    initiatorComponentId: string
    initiator: HTMLElement
}