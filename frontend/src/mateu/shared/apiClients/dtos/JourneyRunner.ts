import ViewMetadata from "./ViewMetadata";

export default interface JourneyRunner extends ViewMetadata {
    baseUrl: string
    journeyType: string
}
