package io.mateu.uidl.data;

import io.mateu.uidl.annotations.Experimental;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A street map: tiles centred on {@code position} ("lat, lon") at {@code zoom}, with optional
 * {@code markers}. With markers and no position, the view fits them all. When {@code
 * markerActionId} is set, clicking a marker runs that action with the marker's id in {@code
 * parameters._markerId} (the view needs a method of that name, see "Actions referenced by
 * components").
 *
 * <p>{@code tileUrl} (a Leaflet-style template, e.g. {@code
 * https://tiles.example.com/{z}/{x}/{y}.png}) and {@code attribution} pick the tile provider; when
 * absent the renderers use OpenStreetMap's public tiles, whose usage policy does not allow heavy
 * production traffic.
 */
@Builder
public record Map(
    String id,
    String position,
    String zoom,
    @Experimental("map markers (3.0-alpha.409)") List<MapMarker> markers,
    @Experimental("map markers (3.0-alpha.409)") String markerActionId,
    String style,
    String cssClasses,
    @Experimental("map markers (3.0-alpha.409)") String tileUrl,
    @Experimental("map markers (3.0-alpha.409)") String attribution)
    implements Component {

  public Map(String position, String zoom, String style, String cssClasses) {
    this(null, position, zoom, List.of(), null, style, cssClasses, null, null);
  }

  public Map(
      String id,
      String position,
      String zoom,
      List<MapMarker> markers,
      String markerActionId,
      String style,
      String cssClasses) {
    this(id, position, zoom, markers, markerActionId, style, cssClasses, null, null);
  }

  public Map {
    markers = markers != null ? markers : List.of();
  }
}
