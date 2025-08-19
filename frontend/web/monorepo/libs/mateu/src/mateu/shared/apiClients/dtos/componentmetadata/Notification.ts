import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Notification extends ComponentMetadata {

    title: string
    text: string

}