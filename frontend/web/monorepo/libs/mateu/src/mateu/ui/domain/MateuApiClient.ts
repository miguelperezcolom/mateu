import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";
import { ComponentState } from "@infra/ui/renderers/types.ts";

export interface MateuApiClient {

    runAction(baseUrl: string, route: string, consumedRoute: string,
              actionId: string,
              initiatorComponentId: string,
              appState: ComponentState | undefined,
              serverSideType: string | undefined,
              componentState: ComponentState | undefined,
              parameters: Record<string, unknown> | undefined,
              initiator: HTMLElement,
              background: boolean): Promise<UIIncrement>

}
