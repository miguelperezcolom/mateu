import ComponentMetadata from "./ComponentMetadata";

export default interface JourneyStarter extends ComponentMetadata {
    baseUrl: string
    journeyTypeId: string
    journeyId: string
    stepId: string
    actionId: string
}
