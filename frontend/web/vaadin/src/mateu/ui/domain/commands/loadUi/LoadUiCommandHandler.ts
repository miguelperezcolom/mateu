import {LoadUiCommand} from "./LoadUiCommand";
import Menu from "../../../../shared/apiClients/dtos/Menu";
import {MenuBarItem} from "@vaadin/menu-bar";
import {MenuType} from "../../../../shared/apiClients/dtos/MenuType";
import UI from "../../../../shared/apiClients/dtos/UI";
import {MateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

export class LoadUiCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: LoadUiCommand): Promise<{ui: UI,items: any, journeyTypeId: string | undefined}> {
        const ui = await mateuApiClient.fetchUi(command.uiId)
        const menu = await this.hydrate(mateuApiClient, ui?.menu)
        return {
            ui: ui,
            items: menu?.filter(m => m.visible).map(m => this.mapToMenuBarItem(m)),
            journeyTypeId: command.journeyTypeId
        };
    }

    private mapToMenuBarItem(m: Menu): {
        journeyTypeId: string | undefined
        baseUrl: string | undefined
        uiId: string | undefined
        children: MenuBarItem[] | undefined
        text: string
    } {
        return {
            journeyTypeId: m.journeyTypeId,
            baseUrl: m.remoteBaseUrl,
            uiId: m.remoteUiId,
            text: m.caption,
            children: m.type == MenuType.Submenu?m
                .submenus!.filter(s => s.visible).map(s =>
                    this.mapToMenuBarItem(s)):undefined
        }
    }

    private async hydrate(mateuApiClient: MateuApiClient, menu: Menu[] | undefined): Promise<Menu[]> {
        if (menu) {
            const hydratedMenu: Menu[] = []
            for (const m of menu) {
                let hydratedItem: Menu | undefined = m
                if (MenuType.Remote == m.type) {
                    hydratedItem = await this.fetchMenu(mateuApiClient, m)
                }
                if (hydratedItem) {
                    if (hydratedItem?.submenus) {
                        hydratedItem.submenus = await this.hydrate(mateuApiClient, hydratedItem.submenus)
                        hydratedItem.submenus.forEach(x => {
                            x.remoteBaseUrl = m.remoteBaseUrl
                            x.remoteUiId = m.remoteUiId
                        })
                    }
                    hydratedMenu.push({...hydratedItem, remoteBaseUrl: m.remoteBaseUrl, remoteUiId: m.remoteUiId})
                } else {
                    hydratedMenu.push({
                        ...m,
                        caption: m.caption + ' (Unresolved)'
                    } as Menu)
                }
            }

            return hydratedMenu
        }
        return []
    }

    private async fetchMenu(mateuApiClient:MateuApiClient, m: Menu): Promise<Menu | undefined> {
        try {
            const ui = await mateuApiClient.fetchRemoteUi(m.remoteBaseUrl!, m.remoteUiId!)
            if (ui.menu) {
                return ui.menu!.find(x => x.journeyTypeId == m.remoteMenuId)
            }
            console.log('Not able to resolve ' + m.remoteBaseUrl + ' ' + m.remoteUiId, ui)
        } catch (e) {
            console.log('Not able to resolve ' + m.remoteBaseUrl + ' ' + m.remoteUiId, e)
        }
        return undefined
    }
}

export const loadUiCommandHandler = new LoadUiCommandHandler()