import {LoadUiCommand} from "./LoadUiCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import Menu from "../../../../shared/apiClients/dtos/Menu";
import {MenuBarItem} from "@vaadin/menu-bar";
import {MenuType} from "../../../../shared/apiClients/dtos/MenuType";
import UI from "../../../../shared/apiClients/dtos/UI";

export class LoadUiCommandHandler {

    public async handle(command: LoadUiCommand): Promise<{ui: UI,items: any, journeyTypeId: string | undefined}> {
        const ui = await mateuApiClient.fetchUi(command.uiId)
        return {
            ui: ui,
            items: ui?.menu?.map(m => this.mapToMenuBarItem(m)),
            journeyTypeId: command.journeyTypeId
        };
    }

    private mapToMenuBarItem(m: Menu): {
        journeyTypeId: string | undefined
        children: MenuBarItem[] | undefined
        text: string
    } {
        return {
            journeyTypeId: m.journeyTypeId,
            text: m.caption,
            children: m.type == MenuType.Submenu?m.submenus?.map(s => this.mapToMenuBarItem(s)):undefined
        }
    }

}

export const loadUiCommandHandler = new LoadUiCommandHandler()