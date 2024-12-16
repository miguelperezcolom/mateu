import {MenuBarItem} from "@vaadin/menu-bar";

export interface MyMenuBarItem extends MenuBarItem {

    baseUrl: string | undefined
    uiId: string | undefined
    journeyTypeId: string | undefined

}