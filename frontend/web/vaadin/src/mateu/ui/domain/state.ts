import UI from "../../shared/apiClients/dtos/UI";
import {MyMenuBarItem} from "../application/my-menu-bar-item";

export class State {
    ui: UI | undefined = undefined
    journeyTypeId: string | undefined
    loading: boolean = false
    items: MyMenuBarItem[] | undefined
    selectedItem?: MyMenuBarItem
    notificationOpened: boolean = false
    notificationMessage: string = ''
}

export const state = new State()