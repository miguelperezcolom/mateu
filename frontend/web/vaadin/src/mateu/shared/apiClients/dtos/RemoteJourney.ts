import ComponentMetadata from "./ComponentMetadata";

export default interface RemoteJourney extends ComponentMetadata {
    remoteBaseUrl: string
    remoteUiId: string
    remoteJourneyType: string
    contextData: string
}
