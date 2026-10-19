import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Image extends ComponentMetadata {

    src: string

    /** The text alternative read by assistive technology; absent = none declared. */
    alt?: string

}