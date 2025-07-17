import Component from "@mateu/shared/apiClients/dtos/Component";
import { UIFragmentAction } from "@mateu/shared/apiClients/dtos/UIFragmentAction";

export default interface UIFragment {
    targetComponentId: string | undefined
    component: Component | undefined
    data: any | undefined
    state: any | undefined
    action: UIFragmentAction | undefined
}