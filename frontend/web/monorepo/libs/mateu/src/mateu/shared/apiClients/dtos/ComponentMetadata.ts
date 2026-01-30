import {ComponentMetadataType} from "@mateu/shared/apiClients/dtos/ComponentMetadataType";

export default interface ComponentMetadata {

    type: ComponentMetadataType
    attributes?: Record<string, any> | undefined

}