package io.mateu.mdd.demoadminpanel.infra.in.ui.collectiondetail;

import io.mateu.core.infra.declarative.orchestrators.collectiondetail.CollectionDetail;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Demo of the {@link CollectionDetail} archetype (the Redwood "Collection Detail" template): a
 * searchable hotel list on the left, the selected hotel's record card on the right, selection and
 * search both re-rendering in place.
 */
@UI("/collection-detail-demo")
@Title("Hotel directory")
public class HotelDirectory extends CollectionDetail<HotelDirectory.Hotel> {

  public record Hotel(String id, String name, String city, int rooms, double occupancy) {}

  private static final List<Hotel> HOTELS =
      List.of(
          new Hotel("h1", "Riu Palace Palmeras", "Palma", 350, 0.93),
          new Hotel("h2", "Riu Plaza España", "Madrid", 585, 0.88),
          new Hotel("h3", "Riu Cancún", "Cancún", 569, 0.97),
          new Hotel("h4", "Riu Plaza Berlin", "Berlín", 357, 0.81),
          new Hotel("h5", "Riu Palace Maldivas", "Maldivas", 176, 0.99));

  @Override
  protected List<Hotel> rows(String searchText, HttpRequest httpRequest) {
    if (searchText == null || searchText.isBlank()) {
      return HOTELS;
    }
    var needle = searchText.toLowerCase();
    return HOTELS.stream()
        .filter(hotel -> (hotel.name() + " " + hotel.city()).toLowerCase().contains(needle))
        .toList();
  }

  @Override
  protected String idOf(Hotel hotel) {
    return hotel.id();
  }

  @Override
  protected String titleOf(Hotel hotel) {
    return hotel.name();
  }

  @Override
  protected String captionOf(Hotel hotel) {
    return hotel.city() + " · " + hotel.rooms() + " habitaciones";
  }

  @Override
  protected List<Chip> badgesOf(Hotel hotel) {
    return List.of(
        Chip.builder()
            .label(Math.round(hotel.occupancy() * 100) + "%")
            .color(hotel.occupancy() > 0.95 ? "success" : "contrast")
            .build());
  }

  @Override
  protected String listLabel(int count) {
    return count + " hoteles";
  }

  @Override
  protected Component detail(Hotel hotel, HttpRequest httpRequest) {
    return Card.builder()
        .title(Text.builder().text(hotel.name()).build())
        .content(
            VerticalLayout.builder()
                .spacing(true)
                .content(
                    List.of(
                        Text.builder().text("Ciudad: " + hotel.city()).build(),
                        Text.builder().text("Habitaciones: " + hotel.rooms()).build(),
                        Text.builder()
                            .text("Ocupación: " + Math.round(hotel.occupancy() * 100) + "%")
                            .build(),
                        Notice.builder()
                            .theme(hotel.occupancy() > 0.95 ? "warning" : "info")
                            .text(
                                hotel.occupancy() > 0.95
                                    ? "Ocupación casi completa — revisar overbooking"
                                    : "Disponibilidad normal")
                            .build()))
                .build())
        .style("flex: 1;")
        .build();
  }
}
