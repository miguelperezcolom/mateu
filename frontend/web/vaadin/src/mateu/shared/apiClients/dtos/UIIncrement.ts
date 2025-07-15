import UIFragment from "@mateu/shared/apiClients/dtos/UIFragment";

export default interface UIIncrement {

    commands: [] | undefined
    fragments: UIFragment[] | undefined
    appData: Record<string, any> | undefined
    appState: Record<string, any> | undefined

}
