import Menu from "./Menu";
import App from "./App";

export default interface UI {

    favIcon: string | undefined
    logo: string | undefined
    title: string | undefined
    subtitle: string | undefined
    menu: Menu[]  | undefined
    homeJourneyTypeId: string | undefined
    loginUrl: string | undefined
    logoutUrl: string | undefined
    apps: App[] | undefined

}
