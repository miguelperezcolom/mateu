import UI from "../../shared/apiClients/dtos/UI";
import UIIncrement from "@mateu/shared/apiClients/dtos/UIIncrement";

export interface MateuApiClient {

    fetchUi(baseUrl: string, config: any, initiator: HTMLElement): Promise<UI>

    runAction(baseUrl: string, journeyTypeId: string,
              actionId: string, initiatorComponentId: string,
              config: any, serverSideType: string,
              data: any, initiator: HTMLElement): Promise<UIIncrement>

}
