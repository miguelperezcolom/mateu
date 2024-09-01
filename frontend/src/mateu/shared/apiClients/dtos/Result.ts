import ComponentMetadata from "./ComponentMetadata";
import {ResultType} from "./ResultType";
import Destination from "./Destination";

export default interface Result extends ComponentMetadata {
    resultType: ResultType
    message: string
    interestingLinks: Destination[]
    nowTo: Destination
    leftSideImage: string
}
