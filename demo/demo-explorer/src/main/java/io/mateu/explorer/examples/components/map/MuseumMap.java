package io.mateu.explorer.examples.components.map;

import io.mateu.uidl.data.Map;
import io.mateu.uidl.data.MapMarker;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * A map whose markers act: {@code markerActionId} names the method a marker click runs, with the
 * marker's id in {@code _markerId}.
 */
public class MuseumMap implements ComponentTreeSupplier {

  static final List<MapMarker> MUSEUMS =
      List.of(
          new MapMarker("louvre", 48.8606, 2.3376, "Louvre", "35,000 works on display", null),
          new MapMarker("orsay", 48.8600, 2.3266, "Musée d'Orsay", "Impressionism", "#2563eb"),
          new MapMarker("pompidou", 48.8607, 2.3522, "Centre Pompidou", "Modern art", "#dc2626"));

  @Override
  public Component component(HttpRequest httpRequest) {
    return Map.builder()
        .markers(MUSEUMS)
        .markerActionId("museumClicked")
        .style("height: 22rem; width: 100%;")
        .build();
  }

  public Message museumClicked(HttpRequest httpRequest) {
    var id = httpRequest.runActionRq().parameters().get("_markerId");
    var museum = MUSEUMS.stream().filter(m -> m.id().equals(id)).findFirst().orElseThrow();
    return new Message(museum.label() + " — " + museum.description());
  }
}
