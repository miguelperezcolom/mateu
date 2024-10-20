import ComponentMetadata from "./ComponentMetadata";
import {ComponentType} from "./ComponentType";

export default interface Component {

    componentType: ComponentType
    id: string
    className: string
    attributes: Map<string, any>
    childComponentIds: string[]
    metadata: ComponentMetadata;
    data: {
        __index: number | undefined
        __count: number | undefined
        __listId: string | undefined
    }

}
