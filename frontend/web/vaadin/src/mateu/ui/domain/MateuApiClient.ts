import UI from "../../shared/apiClients/dtos/UI";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export interface MateuApiClient {

    fetchUi(baseUrl: string, path: string | undefined, config: any, initiator: HTMLElement): Promise<UI>

    runAction(baseUrl: string, route: string, consumedRoute: string,
              actionId: string,
              initiatorComponentId: string,
              appState: any,
              serverSideType: string,
              componentState: any,
              parameters: any,
              initiator: HTMLElement,
              background: boolean): Promise<UIIncrement>

}
