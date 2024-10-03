import {BadgeTheme} from "./BadgeTheme";
import {BadgeStyle} from "./BadgeStyle";
import {BadgeIconPosition} from "./BadgeIconPosition";

export default interface Badge {

    theme: BadgeTheme
    message: string | undefined
    icon: string
    badgeStyle: BadgeStyle
    iconPosition: BadgeIconPosition

}
