import {ResultType} from "./ResultType";

export default interface Message {

    type: ResultType
    title: string
    text: string
    duration: number

}
