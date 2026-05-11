package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record NavigationRequestedPayload(
    String route,
    String consumedRoute,
    String actionId,
    String baseUrl,
    String serverSideType,
    String uriPrefix) {}
