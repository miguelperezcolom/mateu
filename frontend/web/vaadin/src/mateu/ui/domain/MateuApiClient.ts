import UI from "../../shared/apiClients/dtos/UI";

export interface MateuApiClient {

    fetchUi(baseUrl: string, contextData: any, initiator: HTMLElement): Promise<UI>

}
