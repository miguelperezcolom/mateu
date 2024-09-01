import View from "../../shared/apiClients/dtos/View";
import Component from "../../shared/apiClients/dtos/Component";
import UICommand from "../../shared/apiClients/dtos/UICommand";
import Message from "../../shared/apiClients/dtos/Message";
import {ActionTarget} from "../../shared/apiClients/dtos/ActionTarget";
import {Content} from "../../shared/apiClients/dtos/Content";

export class State {
    error: boolean | undefined = undefined
    view: View | undefined = undefined
    content: Content | undefined = undefined
    components: Record<string, Component> = {}
    commands: UICommand[] = []
    messages: Message[] = []
    target: ActionTarget = ActionTarget.View
    modalStyle: string | undefined = undefined
}
