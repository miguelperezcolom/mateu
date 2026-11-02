import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { ComponentState } from "@infra/ui/renderers/types.ts";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export default interface MicroFrontend extends ComponentMetadata {
    baseUrl: string
    route: string
    consumedRoute: string
    style: string
    cssClasses: string
    serverSideType: string
    appState: ComponentState
    actionId: string
    /** The remote's answer to the load, when the HOST resolved it (`resolve = SERVER`): painted
     *  instead of asking the remote. Absent = the island asks, as always. */
    resolved?: UIIncrement
    /** NONE | COMPACT | PAGE when it is EMBEDDED in this page (a block, not a page of its own): its
     *  window commands are not applied, it draws no breadcrumb, and its page header is hidden (NONE),
     *  reduced to its actions (COMPACT) or kept (PAGE). Absent = a top-level micro frontend. */
    chrome?: string
}