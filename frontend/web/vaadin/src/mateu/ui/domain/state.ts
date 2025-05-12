import UI from "../../shared/apiClients/dtos/UI";
import { Subject } from "rxjs";

export class State {
    ui: UI | undefined = undefined
    loading: boolean = false

    config: Record<string, any> = {}

    sharedData: Record<string, any> = {}
    userData: Record<string, any> = {}
    appData: Record<string, any> = {}

    runtimeData: Record<string, any> = {}
}

export const state = new State()
export const upstream = new Subject<State>()