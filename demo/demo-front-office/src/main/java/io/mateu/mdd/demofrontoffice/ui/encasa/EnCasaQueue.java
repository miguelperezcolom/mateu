package io.mateu.mdd.demofrontoffice.ui.encasa;

import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
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
import java.util.ArrayList;
import java.util.List;

/** En Casa landing: the in-house guests queue — pick one to open their guest 360. */
@Route(value = "/encasa", parentRoute = "")
@Title("En Casa")
public class EnCasaQueue {

  // left rail: the in-house guests; right: the empty-state placeholder
  @Label("")
  Component contenido = build();

  static Component build() {
    var inHouse = FrontOffice.stays().findInHouse();
    return HorizontalLayout.builder()
        .spacing(true)
        .fullWidth(true)
        .style("align-items: flex-start; gap: 1.5rem; width: 100%;")
        .content(
            List.of(
                TaskQueue.builder()
                    .actionId("openGuest")
                    .style("flex: 0 0 26%; min-width: 300px;")
                    .groups(
                        List.of(
                            QueueGroup.builder()
                                .label("En casa — " + inHouse.size() + " huéspedes")
                                .items(inHouse.stream().map(EnCasaQueue::item).toList())
                                .build()))
                    .build(),
                EmptyState.builder()
                    .icon("🏡")
                    .title("Selecciona un huésped")
                    .description(
                        "Elige un huésped en casa para ver su 360: cuenta, incidencias e"
                            + " histórico.")
                    .style("flex: 1; margin-top: 3rem;")
                    .build()))
        .build();
  }

  static QueueItem item(Stay stay) {
    var guest = FrontOffice.guests().findById(stay.guestId()).orElseThrow();
    var badges = new ArrayList<Chip>();
    badges.add(Chip.builder().label(guest.tier().name()).color("contrast").build());
    if (stay.wishesTotal() > 0) {
      badges.add(Chip.builder().label(GuestHeaders.wishes(stay)).color("success").build());
    }
    if (stay.vipNote() != null) {
      badges.add(Chip.builder().label("VIP").color("warning").build());
    }
    if (stay.openIncidents() > 0) {
      badges.add(Chip.builder().label("Incidencia").color("error").build());
    }
    return QueueItem.builder()
        .id(stay.id())
        .title(guest.name())
        .caption("Hab " + stay.roomNumber() + " · " + stay.roomType())
        .badges(badges)
        .build();
  }

  @Action
  Object openGuest(HttpRequest httpRequest) {
    var item = httpRequest.runActionRq().parameters().get("_item");
    return URI.create("/encasa/" + item);
  }
}
