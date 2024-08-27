import UICommand from "./UICommand";
import {Content} from "./Content";
import Message from "./Message";
import Component from "./Component";

export default interface UIIncrement {

    commands: UICommand[]
    content: Content
    messages: Message[]
    components: Record<string, Component>

}
