import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface Separator extends ComponentMetadata {
    attributes?: Record<string, string>
}
