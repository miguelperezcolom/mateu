package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record MicroFrontend(String baseUrl, String route, String consumedRoute)
    implements Component {}
