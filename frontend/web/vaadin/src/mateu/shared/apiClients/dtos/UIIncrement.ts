import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";

export default interface UIIncrement {

    commands: []
    fragments: UIFragment[]
    sharedData: Record<string, any>
    appData: Record<string, any>

}
