import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import UI from "@mateu/shared/apiClients/dtos/UI";
import UICommand from "@mateu/shared/apiClients/dtos/UICommand.ts";

export default interface Message {
    command: UICommand | undefined,
    fragment: UIFragment | undefined,
    ui:UI | undefined,
    error: undefined
}