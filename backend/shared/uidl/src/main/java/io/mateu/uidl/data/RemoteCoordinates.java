package io.mateu.uidl.data;

import java.util.Map;
import lombok.Builder;

@Builder
public record RemoteCoordinates(
    String baseUrl,
    String route,
    String consumedRoute,
    String action,
    Map<String, Object> params) {}
