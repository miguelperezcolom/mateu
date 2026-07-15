package io.mateu.mdd.demofrontoffice.ui.checkout;

import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/** Check-Out landing: the in-house guests due to depart, today's departures first. */
@Route(value = "/checkout", parentRoute = "")
@Title("Check-Out")
public class CheckOutQueue {

  // left rail: the departures work queue; right: the empty-state placeholder
  @Label("")
  Component contenido = build();

  static Component build() {
    var today = LocalDate.now();
    var inHouse = FrontOffice.stays().findInHouse();
    var hoy = inHouse.stream().filter(s -> !s.checkOut().isAfter(today)).toList();
    var proximas = inHouse.stream().filter(s -> s.checkOut().isAfter(today)).toList();
    var groups = new ArrayList<QueueGroup>();
    if (!hoy.isEmpty()) {
      groups.add(
          QueueGroup.builder()
              .label("Salida hoy")
              .items(hoy.stream().map(s -> item(s, true)).toList())
              .build());
    }
    if (!proximas.isEmpty()) {
      groups.add(
          QueueGroup.builder()
              .label("Próximas salidas")
              .items(proximas.stream().map(s -> item(s, false)).toList())
              .build());
    }
    return HorizontalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .style("align-items: flex-start; gap: 1.5rem; width: 100%;")
        .content(
            List.of(
                TaskQueue.builder()
                    .actionId("openGuest")
                    .style("flex: 0 0 26%; min-width: 300px;")
                    .groups(groups)
                    .build(),
                EmptyState.builder()
                    .icon("🧳")
                    .title("Selecciona un huésped")
                    .description("Elige una salida de la lista para revisar su folio y cobrar.")
                    .style("flex: 1; margin-top: 3rem;")
                    .build()))
        .build();
  }

  static QueueItem item(Stay stay, boolean departingToday) {
    var guest = FrontOffice.guests().findById(stay.guestId()).orElseThrow();
    var badges = new ArrayList<Chip>();
    if (departingToday) {
      badges.add(Chip.builder().label("SALIDA HOY").color("warning").build());
    }
    badges.add(Chip.builder().label(guest.tier().name()).color("contrast").build());
    return QueueItem.builder()
        .id(stay.id())
        .title(guest.name())
        .caption("Hab " + stay.roomNumber() + " · " + stay.nights() + "N")
        .badges(badges)
        .build();
  }

  @Action
  Object openGuest(HttpRequest httpRequest) {
    var item = httpRequest.runActionRq().parameters().get("_item");
    return URI.create("/checkout/" + item);
  }
}
