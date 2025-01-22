package io.mateu.dtos;

/**
 * Metadata for building a journey starter
 *
 * @param baseUrl The base url for the api
 * @param journeyTypeId The journey type targetId
 * @param contextData The context data to send to the backend
 */
public record MicroFrontendDto(String baseUrl, String journeyTypeId, String contextData)
    implements ComponentMetadataDto {}
