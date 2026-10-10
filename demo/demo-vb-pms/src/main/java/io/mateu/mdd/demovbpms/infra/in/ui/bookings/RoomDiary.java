package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Drawer;
import io.mateu.uidl.data.DrawerSize;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PlanningBlock;
import io.mateu.uidl.data.PlanningBoard;
import io.mateu.uidl.data.PlanningResource;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Room Diary (OPERA Cloud 26.3 user guide, 003 "About the Room Diary" and "Using Click, Drag and
 * Drop"): rooms with their type and housekeeping status × 1–28 days; reservation bars in their
 * colour (VIP marked), hover shows a summary, double click opens the reservation, selecting empty
 * cells offers to create one, dragging a bar moves it to another room or dates and dragging its
 * edge changes the stay. The server validates every change and rejects overlaps with a message.
 */
@UI("/room-diary")
@Title("Room Diary")
public class RoomDiary implements ComponentTreeSupplier {

  int days = 14;

  private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("d MMM");

  @Override
  public Component component(HttpRequest httpRequest) {
    LocalDate from = Hotel.businessDate().minusDays(1);
    LocalDate to = from.plusDays(days - 1);
    var resources =
        Hotel.ROOMS.stream()
            .map(
                room ->
                    PlanningResource.builder()
                        .id(room.number())
                        .label(room.number())
                        .group("Floor " + room.floor())
                        .attributes(List.of(room.type(), room.status().name()))
                        .icon(room.outOfOrder() ? "vaadin:tools" : null)
                        .build())
            .toList();
    var blocks =
        Hotel.RESERVATIONS.stream()
            .filter(r -> r.room != null && r.status != Hotel.ReservationStatus.CANCELLED)
            .filter(r -> r.arrival.isBefore(to.plusDays(1)) && r.departure.isAfter(from))
            .map(
                r ->
                    PlanningBlock.builder()
                        .id(r.id)
                        .resourceId(r.room)
                        .start(r.arrival)
                        // a stay occupies its nights: the last one is the day before departure
                        .end(r.departure.minusDays(1))
                        .label(r.guest)
                        .color(r.color)
                        .status(r.status.name())
                        .icon(r.vip ? "vaadin:star" : null)
                        .summary(
                            r.guest
                                + (r.vip ? " · VIP" : "")
                                + "\n"
                                + r.arrival.format(DAY)
                                + " → "
                                + r.departure.format(DAY)
                                + " · "
                                + r.nights()
                                + " nights\n"
                                + r.rateCode
                                + " "
                                + r.rate
                                + " € · "
                                + r.adults
                                + " adults · Conf. "
                                + r.confirmation)
                        .build())
            .toList();
    // OOO rooms show a grey bar across the window
    var ooo =
        Hotel.ROOMS.stream()
            .filter(Hotel.Room::outOfOrder)
            .map(
                room ->
                    PlanningBlock.builder()
                        .id("OOO-" + room.number())
                        .resourceId(room.number())
                        .start(from)
                        .end(to)
                        .label("Out of order")
                        .color("#8A8580")
                        .build())
            .toList();
    var all = new java.util.ArrayList<>(blocks);
    all.addAll(ooo);
    var windowButtons =
        HorizontalLayout.builder()
            .content(
                List.of(1, 7, 14, 21, 28).stream()
                    .<Component>map(n -> new Button(n + (n == 1 ? " day" : " days"), "days" + n))
                    .toList())
            .build();
    return VerticalLayout.builder()
        .content(
            List.of(
                windowButtons,
                PlanningBoard.builder()
                    .id("diary")
                    .from(from)
                    .to(to)
                    .resources(resources)
                    .blocks(all)
                    .attributeColumns(List.of("Type", "HK"))
                    .moveActionId("moveStay")
                    .resizeActionId("resizeStay")
                    .openActionId("openStay")
                    .rangeSelectActionId("newStay")
                    .build()))
        .build();
  }

  @Action
  public Object days1() {
    days = 1;
    return this;
  }

  @Action(shortcut = "ctrl+alt+7")
  public Object days7() {
    days = 7;
    return this;
  }

  @Action(shortcut = "ctrl+alt+4")
  public Object days14() {
    days = 14;
    return this;
  }

  @Action
  public Object days21() {
    days = 21;
    return this;
  }

  @Action
  public Object days28() {
    days = 28;
    return this;
  }

  private static String param(HttpRequest rq, String key) {
    Object v = rq.runActionRq().parameters().get(key);
    return v == null ? null : String.valueOf(v);
  }

  /** Drag a bar to another room or dates. Rejected when the target room is taken. */
  @Action
  public Object moveStay(HttpRequest rq) {
    return change(rq, param(rq, "_resourceId"));
  }

  /** Drag a bar's edge: a longer or shorter stay, same room. */
  @Action
  public Object resizeStay(HttpRequest rq) {
    return change(rq, param(rq, "_resourceId"));
  }

  private Object change(HttpRequest rq, String room) {
    var reservation = Hotel.reservation(param(rq, "_blockId")).orElse(null);
    if (reservation == null) return Message.error("That bar is not a reservation");
    LocalDate start = LocalDate.parse(param(rq, "_start"));
    LocalDate departure = LocalDate.parse(param(rq, "_end")).plusDays(1);
    if (Hotel.room(room).map(Hotel.Room::outOfOrder).orElse(true)) {
      return List.of(this, Message.error("Room " + room + " is out of order"));
    }
    var clash = Hotel.overlapping(room, start, departure, reservation.id);
    if (!clash.isEmpty()) {
      // rejected: the board re-renders unchanged and says why
      return List.of(
          this,
          Message.error(
              "Room " + room + " is taken by " + clash.get(0).guest + " on those dates"));
    }
    // what it was, so the toast can undo it
    Map<String, Object> before =
        Map.of(
            "_blockId", reservation.id,
            "_room", reservation.room == null ? "" : reservation.room,
            "_arrival", reservation.arrival.toString(),
            "_departure", reservation.departure.toString());
    reservation.room = room;
    reservation.arrival = start;
    reservation.departure = departure;
    return List.of(
        this,
        Message.builder()
            .variant(io.mateu.uidl.data.NotificationVariant.success)
            .text(
                reservation.guest
                    + " → room "
                    + room
                    + ", "
                    + start.format(DAY)
                    + " – "
                    + departure.format(DAY))
            .duration(10000)
            .undoLabel("Undo")
            .undoActionId("undoMove")
            .undoParameters(before)
            .build());
  }

  /** The Undo of a move or a resize: the reservation goes back where it was. */
  @Action
  public Object undoMove(HttpRequest rq) {
    var reservation = Hotel.reservation(param(rq, "_blockId")).orElse(null);
    if (reservation == null) return Message.error("Nothing to undo");
    String room = param(rq, "_room");
    reservation.room = room == null || room.isBlank() ? null : room;
    reservation.arrival = LocalDate.parse(param(rq, "_arrival"));
    reservation.departure = LocalDate.parse(param(rq, "_departure"));
    return List.of(this, Message.success("Move undone: " + reservation.guest + " is back in room " + reservation.room));
  }

  /** Double click: the reservation in a drawer. */
  @Action
  public Object openStay(HttpRequest rq) {
    var r = Hotel.reservation(param(rq, "_blockId")).orElse(null);
    if (r == null) return Message.warning("Out of order");
    return Drawer.builder()
        .headerTitle(r.guest)
        .subtitle("Confirmation " + r.confirmation)
        .size(DrawerSize.m)
        .content(
            EntityHeader.builder()
                .title(r.guest)
                .subtitle("Room " + r.room + " · " + r.roomType + " · " + r.rateCode)
                .facts(
                    List.of(
                        new Fact("Arrival", r.arrival.toString()),
                        new Fact("Departure", r.departure.toString()),
                        new Fact("Nights", String.valueOf(r.nights())),
                        new Fact("Rate", r.rate + " €")))
                .build())
        .build();
  }

  /** Empty cells selected: the start of a new reservation for that room and dates. */
  @Action
  public Object newStay(HttpRequest rq) {
    String room = param(rq, "_resourceId");
    LocalDate start = LocalDate.parse(param(rq, "_start"));
    LocalDate departure = LocalDate.parse(param(rq, "_end")).plusDays(1);
    if (!Hotel.overlapping(room, start, departure, "").isEmpty()) {
      return Message.error("Room " + room + " is not free on those dates");
    }
    return Drawer.builder()
        .headerTitle("New reservation")
        .subtitle("Room " + room + " · " + start.format(DAY) + " → " + departure.format(DAY))
        .size(DrawerSize.s)
        .content(
            new Text(
                "newStayText",
                "I want to… create a reservation, a walk-in, or set the room out of order for "
                    + (departure.toEpochDay() - start.toEpochDay())
                    + " nights."))
        .build();
  }

  public Map<String, Object> state() {
    return Map.of("days", days);
  }
}
