package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.collectiondetail.CollectionDetail;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.EmptyStateDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TaskQueueDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * CollectionDetail archetype (the Redwood "Collection Detail" template): a searchable card list on
 * the left, the selected item's detail re-rendered in place on the right.
 */
class CollectionDetailSyncTest {

  record Hotel(String id, String name, String city, int rooms) {}

  static final List<Hotel> HOTELS =
      List.of(
          new Hotel("h1", "Riu Palace", "Palma", 350),
          new Hotel("h2", "Riu Plaza", "Madrid", 500),
          new Hotel("h3", "Riu Playa", "Cancún", 420));

  @UI("/hotel-directory")
  @Title("Hotels")
  public static class HotelDirectory extends CollectionDetail<Hotel> {

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
          .content(Text.builder().text(hotel.city() + " · " + hotel.rooms()).build())
          .style("flex: 1;")
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(HotelDirectory.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private UIIncrementDto run(
      String actionId, Map<String, Object> state, Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/hotel-directory")
            .consumedRoute("/hotel-directory")
            .serverSideType(HotelDirectory.class.getName())
            .actionId(actionId)
            .initiatorComponentId("c1_app")
            .componentState(state)
            .parameters(parameters)
            .build());
  }

  @Test
  void initialRenderShowsTheFullListAndTheEmptyDetail() {
    var increment = mateu.sync("/hotel-directory");
    var root = increment.fragments().get(0).component();
    var queues = FieldKindsSyncTest.collect(root, TaskQueueDto.class);
    assertThat(queues).hasSize(1);
    assertThat(queues.get(0).groups().get(0).items())
        .extracting(item -> item.title())
        .containsExactly("Riu Palace", "Riu Plaza", "Riu Playa");
    assertThat(queues.get(0).groups().get(0).label()).isEqualTo("3 items");
    assertThat(FieldKindsSyncTest.collect(root, EmptyStateDto.class)).isNotEmpty();
  }

  @Test
  void selectingAnItemRendersItsDetailAndMarksTheCard() {
    var increment = run("selectCollectionItem", Map.of(), Map.of("_item", "h2"));
    var root = increment.fragments().get(0).component();
    var queues = FieldKindsSyncTest.collect(root, TaskQueueDto.class);
    assertThat(queues.get(0).groups().get(0).items())
        .filteredOn(item -> item.selected())
        .extracting(item -> item.title())
        .containsExactly("Riu Plaza");
    assertThat(FieldKindsSyncTest.collect(root, EmptyStateDto.class)).isEmpty();
    var texts = FieldKindsSyncTest.collect(root, io.mateu.dtos.TextDto.class);
    assertThat(texts).anySatisfy(text -> assertThat(text.text()).isEqualTo("Madrid · 500"));
  }

  @Test
  void typingInTheSearchBoxFiltersTheListThroughTheAutoSaveTrigger() {
    var increment = run("filterCollection", Map.of("search", "cancún"), Map.of());
    var root = increment.fragments().get(0).component();
    var queues = FieldKindsSyncTest.collect(root, TaskQueueDto.class);
    assertThat(queues.get(0).groups().get(0).items())
        .extracting(item -> item.title())
        .containsExactly("Riu Playa");
  }
}
