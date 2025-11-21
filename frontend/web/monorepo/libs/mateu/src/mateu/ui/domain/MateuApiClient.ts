import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export interface MateuApiClient {

    runAction(baseUrl: string, route: string, consumedRoute: string,
              actionId: string,
              initiatorComponentId: string,
              appState: any,
              serverSideType: string,
              appServerSideType: string,
              componentState: any,
              parameters: any,
              initiator: HTMLElement,
              background: boolean): Promise<UIIncrement>

}
