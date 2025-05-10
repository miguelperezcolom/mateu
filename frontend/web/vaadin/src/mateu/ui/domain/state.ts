import UI from "../../shared/apiClients/dtos/UI";

export class State {
    ui: UI | undefined = undefined
    loading: boolean = false
}

export const state = new State()