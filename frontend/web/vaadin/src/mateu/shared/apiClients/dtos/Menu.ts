import {MenuType} from "./MenuType";

export default interface Menu {

    type: MenuType
    icon: string | undefined
    caption: string
    journeyTypeId: string | undefined
    useJourneyTypeForId: boolean | undefined
    submenus: Menu[] | undefined
    visible: boolean | undefined
    remoteBaseUrl: string | undefined
    remoteUiId: string | undefined
    remoteMenuId: string | undefined

}
