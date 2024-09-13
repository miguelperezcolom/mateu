import UICommand from "./UICommand";
import Message from "./Message";
import {UIFragment} from "./UIFragment";

export default interface UIIncrement {

    commands: UICommand[]
    messages: Message[]
    uiFragments: UIFragment[]

}
