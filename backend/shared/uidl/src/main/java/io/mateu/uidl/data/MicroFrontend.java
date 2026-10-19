package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** Embeds a UI served from another backend ({@code baseUrl}) or route inside the current page. */
@Builder
public record MicroFrontend(
    String baseUrl,
    String route,
    String consumedRoute,
    String style,
    String cssClasses,
    String serverSideType,
    Object appState,
    String actionId)
    implements Component {}
