package io.mateu.dtos;

/**
 * Remote journey
 *
 * @param remoteBaseUrl the remote journey base url
 * @param remoteUiId the remote journey UI fieldId
 * @param remoteJourneyType the remote journey dataType
 * @param contextData the context data to send to the remote journey
 * @deprecated nothing produces or reads it: a leftover of the pre-3.0 wire, reachable from no live
 *     DTO. No replacement; it will be removed.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record RemoteJourneyDto(
    String remoteBaseUrl, String remoteUiId, String remoteJourneyType, String contextData)
    implements ComponentMetadataDto {}
