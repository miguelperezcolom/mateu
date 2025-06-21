import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Avatar extends ComponentMetadata {

    name: string
    abbreviation: string
    image: string

}