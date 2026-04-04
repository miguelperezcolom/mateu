package io.mateu.uidl.interfaces;

public record RouteValue(
    String route, String parentRoute, String routeRegex, String parentRouteRegex) {}
