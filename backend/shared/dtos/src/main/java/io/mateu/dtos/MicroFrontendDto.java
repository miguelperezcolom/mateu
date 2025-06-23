package io.mateu.dtos;

/** Metadata for building a journey starter */
public record MicroFrontendDto(String baseUrl, String route, String consumedRoute)
    implements ComponentMetadataDto {}
