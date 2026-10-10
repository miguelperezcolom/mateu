package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A street map: tiles centred on {@code position} ("lat, lon") at {@code zoom}, with optional
 * {@code markers}. With markers and no position, the view fits them all. When {@code
 * markerActionId} is set, clicking a marker runs that action with the marker's id in {@code
 * parameters._markerId} (the view needs a method of that name, see "Actions referenced by
 * components").
 */
@Builder
public record Map(
    String id,
    String position,
    String zoom,
    List<MapMarker> markers,
    String markerActionId,
    String style,
    String cssClasses)
    implements Component {

  public Map(String position, String zoom, String style, String cssClasses) {
    this(null, position, zoom, List.of(), null, style, cssClasses);
  }

  public Map {
    markers = markers != null ? markers : List.of();
  }
}
