package io.mateu.core.application.runaction;

import io.mateu.core.application.ResolvedRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

final class RouteSegmentUtils {

  static List<String> createRoutes(RunActionCommand command) {
    List<String> routes = new ArrayList<>();
    StringBuilder currentRoute = new StringBuilder();
    var completeRoute = command.route();
    if ("/".equals(completeRoute)) {
      return List.of("");
    }
    for (String token : completeRoute.split("/")) {
      var nextRoute = currentRoute + token;
      if ("_empty".equals(command.consumedRoute())
          || (!nextRoute.isEmpty() && nextRoute.length() >= command.consumedRoute().length())) {
        if (!command.baseUrl().equals(command.consumedRoute()) || !"".equals(nextRoute)) {
          if (!nextRoute.equals(command.consumedRoute())) {
            routes.add(nextRoute);
          }
        }
      }
      currentRoute.append(token).append("/");
    }
    return routes;
  }

  static Map<String, Object> addParameterValues(
      Map<String, Object> data,
      String route,
      ResolvedRoute matchingRoute,
      HttpRequest httpRequest) {
    var newData = new HashMap<>(data != null ? data : Map.of());
    var tokens = matchingRoute.pattern().split("/");
    var slugs = route.split("/");
    for (int i = 0; i < tokens.length && i < slugs.length; i++) {
      var token = tokens[i];
      var slug = slugs[i];
      if (token.startsWith(":")) {
        var fieldName = token.substring(1);
        try {
          if (!newData.containsKey(fieldName)) {
            newData.put(fieldName, slug);
          }
        } catch (Exception ignored) {
        }
      }
    }
    if (httpRequest != null) {
      httpRequest
          .getParameterNames()
          .forEach(
              fieldName -> {
                try {
                  if (!newData.containsKey(fieldName)) {
                    newData.put(fieldName, httpRequest.getParameterValue(fieldName));
                  }
                } catch (Exception ignored) {
                }
              });
    }

    // The registry entry's parameters sit at the two ENDS of the precedence order, which is why
    // the entry travels whole instead of as one merged map:
    //
    //   fixed  >  client state  >  path  >  query  >  defaults
    //
    // Defaults only fill what nobody else supplied. Fixed ones are re-applied here, on the server,
    // over everything — including the state the client sent back. Resolution runs in the browser
    // too (a statically deployed mount has no server to ask), so a "fixed" parameter enforced only
    // there would be a suggestion: flipping one via the query string or a doctored component state
    // would widen the scope the route was pinned to.
    var entry = matchingRoute.entry();
    if (entry != null) {
      entry.defaultParams().forEach(newData::putIfAbsent);
      newData.putAll(entry.fixedParams());
    }
    return newData;
  }
}
