package io.mateu.core.application.runaction;

import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collections;
import java.util.Map;

public record RunActionCommand(
    String baseUrl,
    String componentId,
    String actionId,
    String componentType,
    Map<String, Object> data,
    Map<String, Object> appData,
    HttpRequest httpRequest) {

  public RunActionCommand {
    data = data != null ? Collections.unmodifiableMap(data) : Map.of();
    appData = appData != null ? Collections.unmodifiableMap(appData) : Map.of();
  }

  @Override
  public Map<String, Object> data() {
    return Collections.unmodifiableMap(data);
  }

  @Override
  public Map<String, Object> appData() {
    return Collections.unmodifiableMap(appData);
  }
}
