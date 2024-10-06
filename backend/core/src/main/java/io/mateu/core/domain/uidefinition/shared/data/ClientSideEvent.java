package io.mateu.core.domain.uidefinition.shared.data;

import java.util.Collections;
import java.util.Map;

public record ClientSideEvent(String eventName, Map<String, Object> details) {

  public ClientSideEvent {
    details = Collections.unmodifiableMap(details);
  }

  @Override
  public Map<String, Object> details() {
    return Collections.unmodifiableMap(details);
  }
}
