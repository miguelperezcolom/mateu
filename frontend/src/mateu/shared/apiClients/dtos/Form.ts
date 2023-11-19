import ViewMetadata from "./ViewMetadata";
import Action from "./Action";
import Section from "./Section";
import Badge from "./Badge";
import Tab from "./Tab";


export default interface Form extends ViewMetadata {

    title: string;

    readOnly: boolean;

    subtitle: string;

    status: Badge;

    badges: Badge[];

    tabs: Tab[];

    sections: Section[];

    actions: Action[];

    mainActions: Action[];

}
