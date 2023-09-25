import {StatusType} from "./StatusType";

export default interface Status {

    type: StatusType

    message: string | undefined;

}
