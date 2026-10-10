package io.mateu.uidl.data;

import java.util.Map;
import lombok.Builder;

/**
 * An action of an {@link ActionPanel}. {@code populated} marks an action with data behind it
 * (listed first and emphasised); a {@code count} greater than zero implies it and is shown next to
 * the label ("Traces (3)").
 */
@Builder
public record ActionPanelItem(
    String label,
    String actionId,
    Map<String, Object> parameters,
    Integer count,
    boolean populated,
    boolean disabled) {

  public ActionPanelItem(String label, String actionId) {
    this(label, actionId, null, null, false, false);
  }
}
