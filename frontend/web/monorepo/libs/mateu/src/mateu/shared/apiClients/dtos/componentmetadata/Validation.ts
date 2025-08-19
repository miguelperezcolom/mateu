import {ValidationType} from "./ValidationType";

export default interface Validation {

    type: ValidationType
    message: string
    data: unknown

}
