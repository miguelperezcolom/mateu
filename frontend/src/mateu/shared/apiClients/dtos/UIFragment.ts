import {ActionTarget} from "./ActionTarget";
import {Content} from "./Content";
import Component from "./Component";

export interface UIFragment {

    target: ActionTarget
    targetId: string
    modalStyle: string | undefined
    content: Content
    components: Record<string, Component>

}