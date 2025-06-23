import ComponentMetadata from "@mateu/shared/apiClients/dtos/ComponentMetadata";

export default interface MicroFrontend extends ComponentMetadata {
    baseUrl: string
    route: string
    consumedRoute: string
}