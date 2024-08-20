import ViewMetadata from "./ViewMetadata";

export default interface JourneyStarter extends ViewMetadata {
    baseUrl: string
    journeyType: string
}
