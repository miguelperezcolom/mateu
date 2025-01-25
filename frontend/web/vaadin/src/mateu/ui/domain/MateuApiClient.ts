import UI from "../../shared/apiClients/dtos/UI";

export interface MateuApiClient {

    fetchUi(baseUrl: string): Promise<UI>

}
