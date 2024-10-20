import ComponentMetadata from "./ComponentMetadata";
import Action from "./Action";
import Section from "./Section";
import Badge from "./Badge";
import Tab from "./Tab";
import Status from "./Status";
import {Banner} from "./Banner";
import Validation from "./Validation";
import Rule from "./Rule";


export default interface Form extends ComponentMetadata {

    icon: string
    title: string
    readOnly: boolean
    subtitle: string
    status: Status
    badges: Badge[]
    tabs: Tab[]
    banners: Banner[]
    sections: Section[]
    actions: Action[]
    mainActions: Action[]
    validations: Validation[]
    rules: Rule[]

}
