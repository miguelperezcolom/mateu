package io.mateu.core.application.runaction;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collections;
import java.util.Map;
import lombok.With;

@With
public record RunActionCommand(
    String baseUrl,
    String uiId,
    String route,
    String consumedRoute,
    String actionId,
    Map<String, Object> componentState,
    Map<String, Object> appState,
    String initiatorComponentId,
    HttpRequest httpRequest,
    String serverSideType,
    String serverSideComponentRoute) {

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

  /**
   * Names the command without the VALUES of its states: they carry whatever the user typed
   * (passwords, personal data), and the record's default toString put all of it in the request log.
   */
  @Override
  public String toString() {
    return "RunActionCommand[route="
        + route
        + ", consumedRoute="
        + consumedRoute
        + ", actionId="
        + actionId
        + ", serverSideType="
        + serverSideType
        + ", serverSideComponentRoute="
        + serverSideComponentRoute
        + ", initiatorComponentId="
        + initiatorComponentId
        + ", baseUrl="
        + baseUrl
        + ", uiId="
        + uiId
        + ", componentState="
        + io.mateu.dtos.RunActionRqDto.redacted(componentState)
        + ", appState="
        + io.mateu.dtos.RunActionRqDto.redacted(appState)
        + "]";
  }
}
