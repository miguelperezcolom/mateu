package io.mateu.mdd.demoadminpanel.infra.in.ui.planning;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PlanningBlock;
import io.mateu.uidl.data.PlanningBoard;
import io.mateu.uidl.data.PlanningResource;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.Callable;

/**
 * Demo of the {@link PlanningBoard} component (tape chart): rooms × days with bookings as colored
 * blocks. Clicking a booking runs {@code openBooking}; dragging a booking to another room/day runs
 * {@code moveBooking}, which mutates the (static) demo data and re-renders the board.
 */
@UI("/planning-demo")
@Title("Room planning")
public class RoomPlanning {

  /** Mutable demo booking (static store, shared across requests). */
  static final class Booking {
    String id;
    String room;
    LocalDate start;
    LocalDate end;
    String guest;
    String color;
    String status;

    Booking(String id, String room, int startOffset, int nights, String guest, String color, String status) {
      this.id = id;
      this.room = room;
      this.start = base().plusDays(startOffset);
      this.end = this.start.plusDays(nights - 1);
      this.guest = guest;
      this.color = color;
      this.status = status;
    }
  }

  static LocalDate base() {
    return LocalDate.now().minusDays(3);
  }

  static final List<Booking> BOOKINGS =
      java.util.Collections.synchronizedList(
          new java.util.ArrayList<>(
              List.of(
                  new Booking("b1", "101", 0, 5, "Ada Lovelace", "#3b82f6", "confirmed"),
                  new Booking("b2", "101", 8, 4, "Alan Turing", "#8b5cf6", "confirmed"),
                  new Booking("b3", "102", 2, 7, "Grace Hopper", "#10b981", "checked-in"),
                  new Booking("b4", "103", 5, 3, "Linus Torvalds", "#f59e0b", "tentative"),
                  new Booking("b5", "201", 1, 10, "Margaret Hamilton", "#3b82f6", "confirmed"),
                  new Booking("b6", "202", 12, 6, "Katherine Johnson", "#ef4444", "unpaid"),
                  new Booking("b7", "203", 4, 2, "Dennis Ritchie", "#10b981", "checked-in"),
                  new Booking("b8", "203", 14, 5, "Barbara Liskov", "#8b5cf6", "confirmed"))));

  @Section("Tape chart")
  @Label("")
  Callable<Component> board =
      () ->
          PlanningBoard.builder()
              .id("roomPlanning")
              .from(base())
              .to(base().plusDays(20))
              .resources(
                  List.of(
                      PlanningResource.builder().id("101").label("Room 101 · Double").group("Floor 1").build(),
                      PlanningResource.builder().id("102").label("Room 102 · Double").group("Floor 1").build(),
                      PlanningResource.builder().id("103").label("Room 103 · Single").group("Floor 1").build(),
                      PlanningResource.builder().id("201").label("Room 201 · Suite").group("Floor 2").build(),
                      PlanningResource.builder().id("202").label("Room 202 · Double").group("Floor 2").build(),
                      PlanningResource.builder().id("203").label("Room 203 · Single").group("Floor 2").build()))
              .blocks(
                  BOOKINGS.stream()
                      .map(
                          b ->
                              PlanningBlock.builder()
                                  .id(b.id)
                                  .resourceId(b.room)
                                  .start(b.start)
                                  .end(b.end)
                                  .label(b.guest)
                                  .color(b.color)
                                  .status(b.status)
                                  .build())
                      .toList())
              .moveActionId("moveBooking")
              .selectActionId("openBooking")
              .build();

  @Action
  Object moveBooking(HttpRequest httpRequest) {
    var params = httpRequest.runActionRq().parameters();
    var blockId = String.valueOf(params.get("_blockId"));
    var booking =
        BOOKINGS.stream().filter(b -> Objects.equals(b.id, blockId)).findFirst().orElse(null);
    if (booking == null) {
      return new Message("Booking " + blockId + " not found");
    }
    booking.room = String.valueOf(params.get("_resourceId"));
    booking.start = LocalDate.parse(String.valueOf(params.get("_start")));
    booking.end = LocalDate.parse(String.valueOf(params.get("_end")));
    return List.of(
        new State(this),
        new Message(
            booking.guest + " moved to room " + booking.room + " (" + booking.start + " → "
                + booking.end + ")"));
  }

  @Action
  Object openBooking(HttpRequest httpRequest) {
    var blockId = String.valueOf(httpRequest.runActionRq().parameters().get("_blockId"));
    var booking =
        BOOKINGS.stream().filter(b -> Objects.equals(b.id, blockId)).findFirst().orElse(null);
    if (booking == null) {
      return new Message("Booking " + blockId + " not found");
    }
    return new Message(
        booking.guest + " · room " + booking.room + " · " + booking.start + " → " + booking.end
            + " · " + booking.status);
  }
}
