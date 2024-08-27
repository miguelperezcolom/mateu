import View from "../../shared/apiClients/dtos/View";
import Component from "../../shared/apiClients/dtos/Component";
import UICommand from "../../shared/apiClients/dtos/UICommand";
import Message from "../../shared/apiClients/dtos/Message";

export class State {
    error: boolean | undefined = undefined
    view: View | undefined = undefined
    components: Record<string, Component> = {}
    commands: UICommand[] = []
    messages: Message[] = []
}
