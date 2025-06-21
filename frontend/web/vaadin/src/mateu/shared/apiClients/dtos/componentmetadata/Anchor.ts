import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Anchor extends ComponentMetadata {

    id: string
    text: string
    url: string

}
