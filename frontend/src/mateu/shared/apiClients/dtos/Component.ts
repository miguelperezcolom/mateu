import ViewMetadata from "./ViewMetadata";
import Rule from "./Rule";

export default interface Component {

    metadata: ViewMetadata;
    data: {
        __index: number | undefined
        __count: number | undefined
        __listId: string | undefined
    }
    rules: Rule[]

}
