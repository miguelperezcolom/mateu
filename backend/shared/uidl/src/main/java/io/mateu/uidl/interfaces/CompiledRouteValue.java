package io.mateu.uidl.interfaces;

import java.util.regex.Pattern;

public record CompiledRouteValue(
    String route, String parentRoute, Pattern routeRegex, Pattern parentRouteRegex) {}
