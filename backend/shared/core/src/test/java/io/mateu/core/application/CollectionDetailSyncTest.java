package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.collectiondetail.CollectionDetail;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.EmptyStateDto;
import io.mateu.dtos.ResponsiveGridDto;
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
  void theLayoutIsANamedSlotTemplateOnTheOneResponsiveGrid() {
    // coherence-plan #7/#9: the archetype's layout is a Screen = Template + slots on the grid — a
    // "list detail" template, not the bespoke ContentLayout.
    var increment = mateu.sync("/hotel-directory");
    var root = increment.fragments().get(0).component();
    var grids = FieldKindsSyncTest.collect(root, ResponsiveGridDto.class);
    assertThat(grids).hasSize(1);
    assertThat(grids.get(0).gridTemplateAreas()).isEqualTo("\"list detail\"");
    assertThat(grids.get(0).stackBelow()).isEqualTo("48rem");
    // the list and detail are placed by slot into the named areas.
    var slots = new java.util.ArrayList<String>();
    collectSlots(root, slots);
    assertThat(slots).contains("list", "detail");
  }

  private static void collectSlots(Object node, List<String> out) {
    if (node == null) {
      return;
    }
    if (node instanceof io.mateu.dtos.ClientSideComponentDto client) {
      if (client.slot() != null) {
        out.add(client.slot());
      }
      client.children().forEach(child -> collectSlots(child, out));
      if (client.metadata() != null) {
        descendMetadata(client.metadata(), out);
      }
    } else if (node instanceof io.mateu.dtos.ServerSideComponentDto server) {
      server.children().forEach(child -> collectSlots(child, out));
    }
  }

  /** A grid nested in a form field lives in the field's metadata, not its children — descend it. */
  private static void descendMetadata(Object metadata, List<String> out) {
    if (!metadata.getClass().isRecord()) {
      return;
    }
    for (var rc : metadata.getClass().getRecordComponents()) {
      Object value;
      try {
        value = rc.getAccessor().invoke(metadata);
      } catch (ReflectiveOperationException e) {
        continue;
      }
      if (value instanceof io.mateu.dtos.ComponentDto child) {
        collectSlots(child, out);
      } else if (value instanceof List<?> list) {
        list.forEach(item -> collectSlots(item, out));
      }
    }
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
