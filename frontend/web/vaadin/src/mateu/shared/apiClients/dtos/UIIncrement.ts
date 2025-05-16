import Message from "@mateu/shared/apiClients/dtos/Message";

export default interface UIIncrement {

    commands: []
    messages: Message[]
    sharedData: Record<string, any>
    appData: Record<string, any>

}
