import {RuleAction} from "./RuleAction";
import {RuleResult} from "./RuleResult";
import { RuleFieldAttribute } from "@mateu/shared/apiClients/dtos/componentmetadata/RuleFieldAttribute.ts";

export default interface Rule {

    filter: string
    action: RuleAction
    fieldName: string
    fieldAttribute: RuleFieldAttribute
    value: unknown
    expression: string | undefined
    result: RuleResult
    actionId: string

}
