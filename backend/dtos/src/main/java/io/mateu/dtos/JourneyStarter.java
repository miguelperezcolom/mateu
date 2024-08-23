package io.mateu.dtos;

/**
 * Metadata for building a journey starter
 *
 * @param baseUrl The base url for the api
 * @param journeyTypeId The journey type id
 */
public record JourneyStarter(
        String baseUrl,
        String journeyTypeId
) implements ComponentMetadata {

}
