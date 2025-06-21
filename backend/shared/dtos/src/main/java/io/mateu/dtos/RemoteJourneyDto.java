package io.mateu.dtos;

/**
 * Remote journey
 *
 * @param remoteBaseUrl the remote journey base url
 * @param remoteUiId the remote journey UI fieldId
 * @param remoteJourneyType the remote journey dataType
 * @param contextData the context data to send to the remote journey
 */
public record RemoteJourneyDto(
    String remoteBaseUrl, String remoteUiId, String remoteJourneyType, String contextData)
    implements ComponentMetadataDto {}
