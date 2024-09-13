package io.mateu.dtos;

/**
 * Metadata for building a journey starter
 *
 * @param uiId The UI targetId
 * @param baseUrl The base url for the api
 * @param journeyTypeId The journey type targetId
 * @param contextData The context data to send to the backend
 */
public record JourneyStarter(String uiId, String baseUrl, String journeyTypeId, String contextData)
    implements ComponentMetadata {}
