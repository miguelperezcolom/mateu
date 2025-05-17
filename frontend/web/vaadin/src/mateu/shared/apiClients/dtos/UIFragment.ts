import Component from "@mateu/shared/apiClients/dtos/Component";

export default interface UIFragment {
    targetComponentId: string | undefined
    component: Component | undefined
    data: any | undefined
}