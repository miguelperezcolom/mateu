import ComponentMetadata from "./ComponentMetadata";
import {ResultType} from "./ResultType";
import Destination from "./Destination";
import {ServerSideObject} from "./ServerSideObject";

export default interface Result extends ComponentMetadata {
    title: string
    resultType: ResultType
    message: string
    interestingLinks: Destination[]
    nowTo: Destination
    leftSideImage: string,
    actionHandler: ServerSideObject
}
