import ComponentMetadata from "./ComponentMetadata";
import {CardLayout} from "./CardLayout";
import Action from "./Action";

export default interface Card extends ComponentMetadata {

    cardLayout: CardLayout
    thumbnail: string
    buttons: Action[]
    icons: Action[]

}
