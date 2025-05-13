import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface MicroFrontend extends ComponentMetadata {
    uiId: string
    baseUrl: string
    journeyTypeId: string
    overrides: string
}