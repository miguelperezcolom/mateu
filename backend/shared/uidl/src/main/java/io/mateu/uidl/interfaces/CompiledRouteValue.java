package io.mateu.uidl.interfaces;

import java.util.regex.Pattern;
import lombok.Builder;

@Builder
public record CompiledRouteValue(
    String route, String parentRoute, Pattern routeRegex, Pattern parentRouteRegex) {}
