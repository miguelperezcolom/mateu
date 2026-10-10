package io.mateu.mdd.demovbpms.infra.in.ui.inventory;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Floor plan (OPERA Cloud 26.3 user guide, 005 "Housekeeping": an image of the floor with the
 * rooms coloured by status; clicking a room opens its details). Built with the official escape
 * hatch: a third-party web component (served by this app, /pms/floor-plan.js) mounted as an
 * {@link Element}, one per floor inside tabs; its {@code room-selected} event runs
 * {@link #roomSelected} on the server.
 */
@UI("/floor-plan")
@Title("Floor plan")
public class FloorPlan implements ComponentTreeSupplier, io.mateu.uidl.fluent.TriggersSupplier {

  /** How often the plan refreshes itself (housekeeping changes room statuses all day long). */
  static final int REFRESH_MILLIS = 10_000;

  static final java.util.concurrent.atomic.AtomicInteger REFRESHES =
      new java.util.concurrent.atomic.AtomicInteger();

  /** First refresh after the wait, and each refresh that succeeds schedules the next one. */
  @Override
  public List<io.mateu.uidl.fluent.Trigger> triggers(HttpRequest httpRequest) {
    return List.of(
        new io.mateu.uidl.fluent.OnLoadTrigger("refreshRooms", REFRESH_MILLIS, 1, null, true),
        new io.mateu.uidl.fluent.OnSuccessTrigger(
            "refreshRooms", "refreshRooms", "", REFRESH_MILLIS, true));
  }

  /** A housekeeping round: a few rooms change status, and the plan re-renders in place. */
  @Action
  public Object refreshRooms() {
    var random = new java.util.Random();
    var cycle = List.of(Hotel.HousekeepingStatus.DI, Hotel.HousekeepingStatus.PU, Hotel.HousekeepingStatus.CL, Hotel.HousekeepingStatus.IP);
    for (int i = 0; i < 3; i++) {
      var room = Hotel.ROOMS.get(random.nextInt(Hotel.ROOMS.size()));
      if (room.outOfOrder()) continue;
      var next = cycle.get((cycle.indexOf(room.status()) + 1 + cycle.size()) % cycle.size());
      Hotel.replaceRoom(new Hotel.Room(room.number(), room.floor(), room.type(), room.typeLabel(), next, false));
    }
    REFRESHES.incrementAndGet();
    return this;
  }


  private static final ObjectMapper JSON = new ObjectMapper();

  @Override
  public Component component(HttpRequest httpRequest) {
    List<Tab> tabs =
        List.of(1, 2, 3, 4).stream()
            .map(floor -> new Tab("Floor " + floor, floor(floor)))
            .toList();
    return VerticalLayout.builder()
        .content(
            List.of(
                new Text(
                    "floorHint",
                    "Click a room to see its housekeeping status. Refreshes every "
                        + REFRESH_MILLIS / 1000
                        + " s · last refreshed "
                        + java.time.LocalTime.now().withNano(0)
                        + " ("
                        + REFRESHES.get()
                        + " refreshes)"),
                TabLayout.builder().id("floors").tabs(tabs).build()))
        .build();
  }

  private Element floor(int floor) {
    List<Map<String, String>> rooms =
        Hotel.ROOMS.stream()
            .filter(r -> r.floor() == floor)
            .map(
                r ->
                    Map.of(
                        "number", r.number(),
                        "type", r.type(),
                        "status", r.status().name(),
                        "statusLabel", r.status().label))
            .toList();
    try {
      return Element.builder()
          .name("pms-floor-plan")
          .attributes(
              Map.of("import", "/pms/floor-plan.js", "rooms", JSON.writeValueAsString(rooms)))
          .on(Map.of("room-selected", "roomSelected"))
          .content("")
          .style("")
          .cssClasses("")
          .build();
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  @Action
  @SuppressWarnings("unchecked")
  public Message roomSelected(HttpRequest httpRequest) {
    Object event = httpRequest.runActionRq().parameters().get("event");
    String number = event instanceof Map<?, ?> m ? String.valueOf(m.get("room")) : "?";
    return Hotel.room(number)
        .map(
            r ->
                new Message(
                    "Room " + r.number() + " · " + r.typeLabel() + " · " + r.status().label))
        .orElse(new Message("Unknown room " + number));
  }
}
