package io.mateu.mdd.demovbpms.infra.in.ui.frontdesk;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.MasterDetailLayout;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/**
 * Telephone operator (OPERA Cloud 26.3 user guide, 004 "Telephone Operator", which uses the
 * Console view — 001 "Console: Displays result as a split view"): in-house guests on the left,
 * the selected guest's details on the right. A {@link MasterDetailLayout}.
 */
@UI("/telephone-console")
@Title("Telephone operator")
public class TelephoneConsole implements ComponentTreeSupplier {

  String selected;

  @Override
  public Component component(HttpRequest httpRequest) {
    List<Hotel.Reservation> inHouse =
        Hotel.RESERVATIONS.stream()
            .filter(
                r ->
                    r.status == Hotel.ReservationStatus.IN_HOUSE
                        || r.status == Hotel.ReservationStatus.DUE_OUT)
            .sorted((a, b) -> a.guest.compareTo(b.guest))
            .limit(14)
            .toList();
    if (selected == null && !inHouse.isEmpty()) selected = inHouse.get(0).id;
    var master =
        TaskQueue.builder()
            .id("guests")
            .actionId("selectGuest")
            .groups(
                List.of(
                    new QueueGroup(
                        "In house (" + inHouse.size() + ")",
                        inHouse.stream()
                            .map(
                                r ->
                                    QueueItem.builder()
                                        .id(r.id)
                                        .title(r.guest)
                                        .caption("Room " + r.room + " · until " + r.departure)
                                        .badges(r.vip ? List.of(new Chip("VIP", "warning")) : List.of())
                                        .selected(r.id.equals(selected))
                                        .build())
                            .toList())))
            .build();
    Component detail =
        Hotel.reservation(selected)
            .<Component>map(
                r ->
                    EntityHeader.builder()
                        .id("guest")
                        .title(r.guest)
                        .subtitle("Room " + r.room + " · " + r.roomType + " · " + r.rateCode)
                        .badges(List.of(new Chip(r.status.name().replace('_', ' '), "success")))
                        .facts(
                            List.of(
                                new Fact("Arrival", r.arrival.toString()),
                                new Fact("Departure", r.departure.toString()),
                                new Fact("Guests", r.adults + " adults, " + r.children + " children"),
                                new Fact("Confirmation", r.confirmation),
                                new Fact("Company", r.company.isBlank() ? "—" : r.company)))
                        .build())
            .orElse(new Text("noGuest", "Select a guest"));
    return new MasterDetailLayout(master, detail);
  }

  @Action
  public Object selectGuest(HttpRequest httpRequest) {
    Object item = httpRequest.runActionRq().parameters().get("_item");
    if (item != null) selected = String.valueOf(item);
    return this;
  }

  public Map<String, Object> state() {
    return selected == null ? Map.of() : Map.of("selected", selected);
  }
}
