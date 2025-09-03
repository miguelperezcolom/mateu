package io.mateu.dtos;

import java.util.Map;

public record RemoteCoordinatesDto(
    String baseUrl,
    String route,
    String consumedRoute,
    String action,
    Map<String, Object> params) {}
