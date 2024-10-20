import ComponentMetadata from "./ComponentMetadata";

export default interface JourneyStarter extends ComponentMetadata {
    uiId: string
    baseUrl: string
    journeyTypeId: string
    contextData: string
}
