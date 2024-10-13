import ComponentMetadata from "./ComponentMetadata";
import {CardLayout} from "./CardLayout";
import Action from "./Action";
import {ServerSideObject} from "./ServerSideObject";

export default interface Card extends ComponentMetadata {

    layout: CardLayout
    thumbnail: string
    headerText: string
    subhead: string
    media: string
    supportingText: string
    buttons: Action[]
    icons: Action[]
    actionHandler: ServerSideObject

}
