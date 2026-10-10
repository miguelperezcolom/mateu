package io.mateu.uidl.data;

import java.util.Map;

/**
 * @deprecated nothing reads it. Navigate with {@link UICommand#navigateTo(String)} (or return a
 *     {@link java.net.URI} from an action).
 */
@Deprecated(since = "3.0-alpha.410", forRemoval = true)
public record Destination(String path, Map<String, Object> parameters) {

  public Destination(String path) {
    this(path, Map.of());
  }
}
