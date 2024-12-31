import {MenuBarItem} from "@vaadin/menu-bar";

export interface MyMenuBarItem extends MenuBarItem {

    baseUrl: string | undefined
    journeyTypeId: string | undefined
    remoteJourneyTypeId: string | undefined

}