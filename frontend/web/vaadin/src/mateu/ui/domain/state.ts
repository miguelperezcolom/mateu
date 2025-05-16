import UI from "../../shared/apiClients/dtos/UI";
import { Subject } from "rxjs";
import Message from "@domain/Message";

export class State {
    ui: UI | undefined = undefined
    loading: boolean = false

    config: Record<string, any> = {}

    sharedData: Record<string, any> = {}
    userData: Record<string, any> = {}
    appData: Record<string, any> = {}

    runtimeData: Record<string, any> = {}
}
export interface Store {
    state: State
}
export const store: Store = {
    state: new State()
}
export const upstream = new Subject<Message>()