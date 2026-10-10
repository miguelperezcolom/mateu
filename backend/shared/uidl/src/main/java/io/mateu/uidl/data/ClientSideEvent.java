package io.mateu.uidl.data;

import java.util.Collections;
import java.util.Map;

/**
 * @deprecated nothing reads it. Emit an event with {@link UICommand#dispatchEvent(String, Object)}
 *     and react to it with {@link io.mateu.uidl.annotations.SubscribeTo}.
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record ClientSideEvent(String eventName, Map<String, Object> details) {

  public ClientSideEvent {
    details = Collections.unmodifiableMap(details);
  }

  @Override
  public Map<String, Object> details() {
    return Collections.unmodifiableMap(details);
  }
}
