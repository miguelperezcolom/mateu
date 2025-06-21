import { BadgeColor } from "./BadgeColor";

export default interface Badge {

    text: string
    iconOnLeft: string
    iconOnRight: string
    color: BadgeColor
    primary: boolean
    small: boolean
    pill: boolean

}
