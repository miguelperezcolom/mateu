package io.mateu.core.application.runaction;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collections;
import java.util.Map;

public record RunActionCommand(
    String baseUrl,
    String uiId,
    String route,
    String consumedRoute,
    String actionId,
    String componentType,
    Map<String, Object> componentState,
    Map<String, Object> appState,
    String initiatorComponentId,
    HttpRequest httpRequest) {

  public RunActionCommand {
    componentState =
        componentState != null ? Collections.unmodifiableMap(componentState) : Map.of();
    appState = appState != null ? Collections.unmodifiableMap(appState) : Map.of();
  }

  public Map<String, Object> componentState() {
    return Collections.unmodifiableMap(componentState);
  }

  public Map<String, Object> appState() {
    return Collections.unmodifiableMap(appState);
  }
}
