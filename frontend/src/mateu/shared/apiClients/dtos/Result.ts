import ViewMetadata from "./ViewMetadata";
import {ResultType} from "./ResultType";
import Destination from "./Destination";

export default interface Result extends ViewMetadata {
    resultType: ResultType
    message: string
    interestingLinks: Destination[]
    nowTo: Destination

}
