package io.mateu.uidl.interfaces;

import lombok.Builder;

@Builder
public record RouteValue(
    String route, String parentRoute, String routeRegex, String parentRouteRegex) {}
