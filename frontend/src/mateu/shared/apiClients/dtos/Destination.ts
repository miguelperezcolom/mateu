import {DestinationType} from "./DestinationType";

export default interface Destination {

    id: string
    type: DestinationType
    description: string
    value: string

}
