import {LoadUiCommand} from "./LoadUiCommand";
import Menu from "../../../../shared/apiClients/dtos/Menu";
import {MenuBarItem} from "@vaadin/menu-bar";
import {MenuType} from "../../../../shared/apiClients/dtos/MenuType";
import UI from "../../../../shared/apiClients/dtos/UI";
import {MateuApiClient} from "../../../../shared/apiClients/MateuApiClient";

export class LoadUiCommandHandler {

    public async handle(mateuApiClient: MateuApiClient, command: LoadUiCommand): Promise<{ui: UI,items: any, journeyTypeId: string | undefined}> {
        const ui = await mateuApiClient.fetchUi()
        try {
            mateuApiClient.contextData = ui?.contextData?JSON.parse(ui?.contextData!):{}
        } catch (e) {
            console.log('error when parsing context data', e)
        }
        const menu = await this.hydrate(mateuApiClient, ui?.menu)
        return {
            ui: ui,
            items: menu?.filter(m => m.visible).map(m => this.mapToMenuBarItem(m)),
            journeyTypeId: command.journeyTypeId
        };
    }

    private mapToMenuBarItem(m: Menu): {
        journeyTypeId: string | undefined
        remoteJourneyTypeId: string | undefined
        baseUrl: string | undefined
        children: MenuBarItem[] | undefined
        text: string
    } {
        return {
            journeyTypeId: m.journeyTypeId,
            remoteJourneyTypeId: m.remoteMenuId,
            baseUrl: this.clean(m.remoteBaseUrl),
            text: m.caption,
            children: m.type == MenuType.Submenu?m
                .submenus!.filter(s => s.visible).map(s =>
                    this.mapToMenuBarItem(s)):undefined
        }
    }

    private clean(baseUrl: string | undefined): string {
        if (baseUrl) {
            if (baseUrl.includes('#')) {
                return baseUrl.substring(0, baseUrl.indexOf('#'))
            }
            return baseUrl
        }
        return ''
    }

    private prependJourneyTypeId(hydratedItem: Menu, prefix: string, baseUrl: string | undefined) {
        hydratedItem.remoteMenuId = hydratedItem.journeyTypeId
        hydratedItem.journeyTypeId = prefix + hydratedItem.journeyTypeId
        let cleanBaseUrl = baseUrl?baseUrl:'';
        if (cleanBaseUrl.includes('#')) {
            cleanBaseUrl = cleanBaseUrl.substring(0, cleanBaseUrl.indexOf('#'))
        }
        hydratedItem.remoteBaseUrl = cleanBaseUrl
        if (hydratedItem.submenus) {
            hydratedItem.submenus.forEach(s => this.prependJourneyTypeId(s, prefix, baseUrl))
        }
    }

    private async hydrate(mateuApiClient: MateuApiClient, menu: Menu[] | undefined): Promise<Menu[]> {
        if (menu) {
            const hydratedMenu: Menu[] = []
            for (const m of menu) {
                let item: Menu | undefined = m
                if (item) {
                    let hydratedItems: Menu[] | undefined = [m]
                    if (MenuType.Remote == m.type) {
                        hydratedItems = await this.fetchMenu(mateuApiClient, m)
                        hydratedItems?.forEach(hydratedItem => {
                            this.prependJourneyTypeId(hydratedItem, m.journeyTypeId + '_', m.remoteBaseUrl)
                        })
                    }
                    if (hydratedItems) {
                        for (const hydratedItem of hydratedItems) {
                            if (hydratedItem?.submenus) {
                                hydratedItem.submenus = await this.hydrate(mateuApiClient, hydratedItem.submenus)
                            }
                            hydratedMenu.push({...hydratedItem, remoteBaseUrl: m.remoteBaseUrl})
                        }
                    } else {
                        hydratedMenu.push({
                            ...m,
                            caption: m.caption + ' (Unresolved)'
                        } as Menu)
                    }
                } else {
                    hydratedMenu.push({
                        ...m,
                        caption: m.caption + ' (Empty)'
                    } as Menu)
                }
            }

            return hydratedMenu
        }
        return []
    }

    private async fetchMenu(mateuApiClient:MateuApiClient, m: Menu): Promise<Menu[] | undefined> {
        try {
            let cleanUrl = m.remoteBaseUrl!;
            let cleanMenuId = m.remoteMenuId!;
            if (cleanUrl.includes('#')) {
                cleanUrl = cleanUrl.substring(0, cleanUrl.indexOf('#'))
                cleanMenuId = cleanUrl.substring(cleanUrl.indexOf('#') + 1)
            }
            const ui = await mateuApiClient.fetchRemoteUi(cleanUrl) // /remoteapp#cruds
            if (ui.menu) {
                return ui.menu!
                    .filter(x => !m.remoteMenuId || x.journeyTypeId == cleanMenuId)
            }
            console.log('Not able to resolve ' + m.remoteBaseUrl, ui)
        } catch (e) {
            console.log('Not able to resolve ' + m.remoteBaseUrl, e)
        }
        return undefined
    }
}

export const loadUiCommandHandler = new LoadUiCommandHandler()