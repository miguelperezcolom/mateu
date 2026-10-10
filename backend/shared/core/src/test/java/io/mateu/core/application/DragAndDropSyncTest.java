package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.DropZoneDto;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TextDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.DragRows;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DropZone;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Dragging listing rows onto a drop zone: {@code @DragRows(type)} makes the listing's rows
 * draggable ({@code CrudlDto.dragType}); a {@code DropZone} accepts a type and carries its action,
 * parameters and content; the drop runs that action with the dragged ids and the zone's parameters.
 */
class DragAndDropSyncTest {

  public record Charge(String id, String description, double amount) {}

  @UI("/dnd-charges")
  @DragRows("charge")
  public static class WindowCharges implements Listing<Charge> {
    @Override
    public ListingData<Charge> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of(List.of(new Charge("c1", "Minibar", 12), new Charge("c2", "Spa", 80)));
    }
  }

  @UI("/dnd-plain")
  public static class PlainCharges implements Listing<Charge> {
    @Override
    public ListingData<Charge> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of(List.of());
    }
  }

  @SuppressWarnings("unused")
  @UI("/dnd-windows")
  @Title("Windows")
  public static class Windows {
    @Label("")
    Callable<Component> window2 =
        () ->
            DropZone.builder()
                .id("window2")
                .accept("charge")
                .actionId("moveCharges")
                .parameters(Map.of("window", 2))
                .title("Window 2")
                .subtitle("Guest (cash)")
                .content(List.of(new Text("w2total", "Balance 0.00 €")))
                .build();

    @Action
    @SuppressWarnings("unchecked")
    public Object moveCharges(HttpRequest rq) {
      var p = rq.runActionRq().parameters();
      return new Message(
          p.get("_dragType") + " " + p.get("_draggedIds") + " → window " + p.get("window"));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(WindowCharges.class, PlainCharges.class, Windows.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private CrudlDto crudlOf(String route) {
    var found = new ArrayList<CrudlDto>();
    mateu
        .sync(route)
        .fragments()
        .forEach(f -> FieldKindsSyncTest.walk(f.component(), CrudlDto.class, found));
    assertThat(found).isNotEmpty();
    return found.get(0);
  }

  @Test
  void dragRowsMakesTheListingDraggable() {
    assertThat(crudlOf("/dnd-charges").dragType()).isEqualTo("charge");
    assertThat(crudlOf("/dnd-plain").dragType()).isNull();
  }

  @Test
  void aDropZoneTravelsWithItsActionParametersAndContent() {
    var increment = mateu.sync("/dnd-windows");
    var zones =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), DropZoneDto.class);
    assertThat(zones).hasSize(1);
    var zone = zones.get(0);
    assertThat(zone.accept()).isEqualTo("charge");
    assertThat(zone.actionId()).isEqualTo("moveCharges");
    assertThat(zone.parameters()).containsEntry("window", 2);
    assertThat(zone.title()).isEqualTo("Window 2");
    assertThat(FieldKindsSyncTest.collect(increment.fragments().get(0).component(), TextDto.class))
        .extracting(TextDto::text)
        .contains("Balance 0.00 €");
  }

  @Test
  void theDropRunsTheZoneActionWithTheDraggedIds() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/dnd-windows")
                .actionId("moveCharges")
                .serverSideType(Windows.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of())
                .parameters(
                    Map.of("window", 2, "_dragType", "charge", "_draggedIds", List.of("c1", "c2")))
                .build());
    assertThat(increment.messages())
        .extracting(MessageDto::text)
        .containsExactly("charge [c1, c2] → window 2");
  }
}
