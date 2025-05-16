import Message from "@mateu/shared/apiClients/dtos/Message";
import UI from "@mateu/shared/apiClients/dtos/UI";

export default interface MessageWrapper {
    message: Message | undefined,
    ui:UI | undefined
}