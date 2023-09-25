import Menu from "./Menu";

export default interface UI {

    title: string;

    subtitle: string;

    menu: Menu[];

    homeJourneyTypeId: string;

    useJourneyTypeForId: boolean | undefined;

    loginUrl: string | undefined;

    logoutUrl: string | undefined;

}
