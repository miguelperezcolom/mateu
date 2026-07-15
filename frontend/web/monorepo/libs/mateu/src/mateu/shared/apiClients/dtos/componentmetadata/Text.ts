import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";
import { TextContainer } from "@mateu/shared/apiClients/dtos/componentmetadata/TextContainer";

export default interface Text extends ComponentMetadata {

    container: TextContainer
    text: string
    /** Font size: xl | l | m | s | xs. m (or absent) applies nothing. */
    size?: string
    /** Drops the container's block margins (margin-block-start/end: 0). Independent of size. */
    noMargins?: boolean

}