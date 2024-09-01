import Pair from "./Pair";

export default interface Column {

    id: string
    type: string
    stereotype: string
    caption: string
    description: string
    width: string
    attributes: Pair[]

}
