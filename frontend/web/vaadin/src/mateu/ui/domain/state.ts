import UI from "../../shared/apiClients/dtos/UI";
import {MenuBarItem} from "@vaadin/menu-bar";

export class State {
    ui: UI | undefined = undefined
    journeyTypeId: string | undefined
    loading: boolean = false
    items: MenuBarItem[] | undefined
    selectedItem?: MenuBarItem
    notificationOpened: boolean = false
    notificationMessage: string = ''
}

export const state = new State()