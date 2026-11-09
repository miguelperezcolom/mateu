package io.mateu.explorer.examples.components.planningboard;

import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PlanningBlock;
import io.mateu.uidl.data.PlanningBoard;
import io.mateu.uidl.data.PlanningResource;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * A planning board (a "tape chart"): resources down the side, days across, blocks on top. Drag a
 * block to another gallery or day: {@code moveActionId} runs with {@code _blockId}, {@code
 * _resourceId}, {@code _start} and {@code _end}. Click a block: {@code selectActionId} runs with
 * {@code _blockId}.
 *
 * <p>The bookings are this view's STATE (the {@code bookings} field), so every visitor plans on a
 * board of their own.
 */
public class GalleryPlanning implements ComponentTreeSupplier {

  static final LocalDate FROM = LocalDate.of(2026, 11, 2);

  /** One booking of a gallery: who uses it, from when, until when (inclusive). */
  public static class Booking {
    public String id;
    public String gallery;
    public LocalDate start;
    public LocalDate end;
    public String what;
    public String color;

    public Booking() {}

    Booking(String id, String gallery, int from, int days, String what, String color) {
      this.id = id;
      this.gallery = gallery;
      this.start = FROM.plusDays(from);
      this.end = this.start.plusDays(days - 1);
      this.what = what;
      this.color = color;
    }
  }

  List<Booking> bookings =
      new ArrayList<>(
          List.of(
              new Booking("b1", "g1", 0, 6, "Impressionism", "#2563eb"),
              new Booking("b2", "g2", 2, 4, "School workshop", "#16a34a"),
              new Booking("b3", "g3", 5, 8, "Photography fair", "#7c3aed"),
              new Booking("b4", "g1", 9, 3, "Private event", "#dc2626")));

  @Override
  public Component component(HttpRequest httpRequest) {
    return PlanningBoard.builder()
        .from(FROM)
        .to(FROM.plusDays(13))
        .resources(
            List.of(
                PlanningResource.builder().id("g1").label("Gallery 1 · Main hall").group("Ground floor").build(),
                PlanningResource.builder().id("g2").label("Gallery 2 · Education").group("Ground floor").build(),
                PlanningResource.builder().id("g3").label("Gallery 3 · Annex").group("First floor").build()))
        .blocks(
            bookings.stream()
                .map(
                    b ->
                        PlanningBlock.builder()
                            .id(b.id)
                            .resourceId(b.gallery)
                            .start(b.start)
                            .end(b.end)
                            .label(b.what)
                            .color(b.color)
                            .build())
                .toList())
        .moveActionId("moveBooking")
        .selectActionId("openBooking")
        .build();
  }

  public Object moveBooking(HttpRequest httpRequest) {
    var p = httpRequest.runActionRq().parameters();
    var booking = find((String) p.get("_blockId"));
    booking.gallery = (String) p.get("_resourceId");
    booking.start = LocalDate.parse((String) p.get("_start"));
    booking.end = LocalDate.parse((String) p.get("_end"));
    return List.of(this, Message.success(booking.what + " moved: " + booking.start + " → " + booking.end));
  }

  public Message openBooking(HttpRequest httpRequest) {
    var booking = find((String) httpRequest.runActionRq().parameters().get("_blockId"));
    return new Message(booking.what + " · " + booking.start + " → " + booking.end);
  }

  Booking find(String id) {
    return bookings.stream().filter(b -> b.id.equals(id)).findFirst().orElseThrow();
  }
}
