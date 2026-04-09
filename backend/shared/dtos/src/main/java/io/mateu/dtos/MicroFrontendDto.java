package io.mateu.dtos;

/** Metadata for building a journey starter */
public record MicroFrontendDto(
    String baseUrl,
    String route,
    String consumedRoute,
    String style,
    String cssClasses,
    String appServerSideType,
    Object appState,
    String actionId)
    implements ComponentMetadataDto {}
