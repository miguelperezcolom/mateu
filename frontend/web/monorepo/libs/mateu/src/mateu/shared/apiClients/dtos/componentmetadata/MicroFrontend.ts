import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { ComponentState } from "@infra/ui/renderers/types.ts";

export default interface MicroFrontend extends ComponentMetadata {
    baseUrl: string
    route: string
    consumedRoute: string
    style: string
    cssClasses: string
    serverSideType: string
    appState: ComponentState
    actionId: string
}