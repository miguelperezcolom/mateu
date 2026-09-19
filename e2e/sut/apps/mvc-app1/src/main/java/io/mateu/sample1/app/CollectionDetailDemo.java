package io.mateu.sample1.app;

import io.mateu.core.infra.declarative.orchestrators.collectiondetail.CollectionDetail;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The CollectionDetail archetype, now composed as a Screen = Template + slots on the one responsive
 * grid (coherence-plan #7/#9). Backs the layout e2e (layout-sizing.spec.ts): a "list detail"
 * template whose list stacks above the detail on a narrow container.
 */
@UI("/collection-detail")
@Title("Hotels")
public class CollectionDetailDemo extends CollectionDetail<CollectionDetailDemo.Hotel> {

  public record Hotel(String id, String name, String city, int rooms) {}

  private static final List<Hotel> HOTELS =
      List.of(
          new Hotel("h1", "Riu Palace", "Palma", 350),
          new Hotel("h2", "Riu Plaza", "Madrid", 500),
          new Hotel("h3", "Riu Playa", "Cancún", 420));

  @Override
  protected List<Hotel> rows(String searchText, HttpRequest httpRequest) {
    if (searchText == null || searchText.isBlank()) {
      return HOTELS;
    }
    var needle = searchText.toLowerCase();
    return HOTELS.stream()
        .filter(h -> (h.name() + " " + h.city()).toLowerCase().contains(needle))
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
    return hotel.city();
  }

  @Override
  protected List<Chip> badgesOf(Hotel hotel) {
    return List.of(Chip.builder().label(hotel.rooms() + " rooms").color("contrast").build());
  }

  @Override
  protected Component detail(Hotel hotel, HttpRequest httpRequest) {
    return Card.builder()
        .title(Text.builder().text(hotel.name()).build())
        .content(Text.builder().text(hotel.city() + " · " + hotel.rooms() + " rooms").build())
        .style("flex: 1;")
        .build();
  }
}
