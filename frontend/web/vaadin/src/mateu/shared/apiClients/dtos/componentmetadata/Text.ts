import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";

export default interface Text extends ComponentMetadata {

    container: TextContainer
    text: string

}