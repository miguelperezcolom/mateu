import Component from "@mateu/shared/apiClients/dtos/Component";
import { UIFragmentAction } from "@mateu/shared/apiClients/dtos/UIFragmentAction";

export default interface UIFragment {
    targetComponentId: string | undefined
    component: Component | undefined
    data: Record<string, unknown> | undefined
    state: Record<string, unknown> | undefined
    action: UIFragmentAction | undefined
    containerId: string | undefined
}