import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface BulletedList extends ComponentMetadata {
    items?: string[]
}
