import {UICommandType} from "./UICommandType";

export default interface UICommand {
    type: UICommandType
    data: unknown
}