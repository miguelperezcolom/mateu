import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import Message from "@mateu/shared/apiClients/dtos/Message.ts";
import UICommand from "@mateu/shared/apiClients/dtos/UICommand.ts";

export default interface UIIncrement {

    messages: Message[] | undefined
    commands: UICommand[] | undefined
    fragments: UIFragment[] | undefined
    appData: Record<string, any> | undefined
    appState: Record<string, any> | undefined

}
