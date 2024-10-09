import ComponentMetadata from "./ComponentMetadata";
import Tab from "../../../../../types/shared/apiClients/dtos/Tab";

export default interface TabLayout extends ComponentMetadata {

    tabs: Tab[]

}
