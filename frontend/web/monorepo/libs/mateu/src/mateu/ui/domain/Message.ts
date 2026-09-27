import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import UI from "@mateu/shared/apiClients/dtos/UI";
import UICommand from "@mateu/shared/apiClients/dtos/UICommand.ts";

export default interface Message {
    command: UICommand | undefined,
    fragment: UIFragment | undefined,
    ui:UI | undefined,
    error: undefined,
    callbackToken: string
    /** The element whose request this message answers, when it answers one: the callback token
     *  only guards that element (see callbackTokenGuard). */
    initiator?: HTMLElement
}