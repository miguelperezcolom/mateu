import {LoadUiCommand} from "./LoadUiCommand";
import {mateuApiClient} from "../../../../shared/apiClients/MateuApiClient";
import {state} from "../../state";
import Menu from "../../../../shared/apiClients/dtos/Menu";
import {MenuBarItem} from "@vaadin/menu-bar";
import {MenuType} from "../../../../shared/apiClients/dtos/MenuType";

export class LoadUiCommandHandler {

    public async handle(command: LoadUiCommand): Promise<void> {
        state.ui = await mateuApiClient.fetchUi(command.uiId);
        state.items = state.ui?.menu?.map(m => this.mapToMenuBarItem(m));
        state.journeyTypeId = command.journeyTypeId
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