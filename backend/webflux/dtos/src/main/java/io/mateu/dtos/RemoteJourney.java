package io.mateu.dtos;

/**
 * Remote journey
 *
 * @param remoteBaseUrl the remote journey base url
 * @param remoteUiId the remote journey UI id
 * @param remoteJourneyType the remote journey type
 * @param contextData the context data to send to the remote journey
 */
public record RemoteJourney(
    String remoteBaseUrl, String remoteUiId, String remoteJourneyType, String contextData)
    implements ComponentMetadata {}
