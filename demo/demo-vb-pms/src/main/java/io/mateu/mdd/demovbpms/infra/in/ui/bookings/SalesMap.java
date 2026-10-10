package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.Map;
import io.mateu.uidl.data.MapMarker;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The map view of the Look to Book Sales Screen (OPERA Cloud 26.3 user guide, 003 "Using Look to
 * Book Sales Screen"): the chain's properties around Palma on a street map, coloured by tonight's
 * availability; clicking one opens its availability summary. The hotels and figures are made up.
 */
@UI("/sales-map")
@Title("Sales map")
public class SalesMap implements ComponentTreeSupplier {

  record Property(
      String id, String name, double lat, double lon, int rooms, int available, String bar) {

    String color() {
      if (available == 0) return "#c74634"; // sold out
      if (available * 10 < rooms) return "#ac630c"; // under 10% left
      return "#508223";
    }
  }

  static final List<Property> PROPERTIES =
      List.of(
          new Property("PMI01", "Mateu Palma Centre", 39.5715, 2.6490, 180, 22, "145 €"),
          new Property("PMI02", "Mateu Paseo Marítimo", 39.5627, 2.6302, 240, 9, "189 €"),
          new Property("PMI03", "Mateu Portixol", 39.5580, 2.6735, 96, 0, "—"),
          new Property("PMI04", "Mateu Son Vida Golf", 39.5951, 2.6100, 160, 41, "210 €"),
          new Property("PMI05", "Mateu Playa de Palma", 39.5260, 2.7390, 320, 57, "119 €"),
          new Property("PMI06", "Mateu Illetes Beach", 39.5390, 2.5880, 140, 3, "235 €"));

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                new Text(
                    "salesMapIntro",
                    "Tonight's availability across the chain. Green has rooms, amber under 10% left,"
                        + " red sold out. Click a property for its summary."),
                Map.builder()
                    .id("properties")
                    .markers(
                        PROPERTIES.stream()
                            .map(
                                p ->
                                    MapMarker.builder()
                                        .id(p.id())
                                        .latitude(p.lat())
                                        .longitude(p.lon())
                                        .label(p.name())
                                        .description(p.available() + " of " + p.rooms() + " rooms free · BAR " + p.bar())
                                        .color(p.color())
                                        .build())
                            .toList())
                    .markerActionId("openProperty")
                    .style("height: 34rem;")
                    .build()))
        .style("width: 100%;")
        .build();
  }

  /** A marker clicked: the property's availability summary in a drawer. */
  public Object openProperty(HttpRequest rq) {
    var id = String.valueOf(rq.runActionRq().parameters().get("_markerId"));
    var p = PROPERTIES.stream().filter(x -> x.id().equals(id)).findFirst().orElseThrow();
    return Drawer.builder()
        .headerTitle(p.name())
        .subtitle("Property " + p.id())
        .size(DrawerSize.s)
        .content(
            EntityHeader.builder()
                .title(p.name())
                .subtitle(p.available() == 0 ? "Sold out tonight" : "Rooms available tonight")
                .facts(
                    List.of(
                        new Fact("Rooms", String.valueOf(p.rooms())),
                        new Fact("Available", String.valueOf(p.available())),
                        new Fact("Best available rate", p.bar())))
                .build())
        .build();
  }
}
