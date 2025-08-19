import {RuleAction} from "./RuleAction";
import {RuleResult} from "./RuleResult";

export default interface Rule {

    filter: string
    action: RuleAction
    data: unknown
    result: RuleResult

}
