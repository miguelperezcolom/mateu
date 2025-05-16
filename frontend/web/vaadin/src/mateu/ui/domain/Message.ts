import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";
import UI from "@mateu/shared/apiClients/dtos/UI";

export default interface Message {
    fragment: UIFragment | undefined,
    ui:UI | undefined
}