import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface Message {
    targetComponentId: string | undefined
    component: Component | undefined
    appData: {} | undefined
}