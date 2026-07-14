package io.mateu.mdd.demofrontoffice.ui.encasa;

import io.mateu.mdd.demofrontoffice.data.HotelData;
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
  Component contenido =
      HorizontalLayout.builder()
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
                                  .label(
                                      "En casa — "
                                          + HotelData.inHouseGuests().size()
                                          + " huéspedes")
                                  .items(
                                      HotelData.inHouseGuests().stream()
                                          .map(EnCasaQueue::item)
                                          .toList())
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

  static QueueItem item(HotelData.InHouse g) {
    var badges = new ArrayList<Chip>();
    badges.add(Chip.builder().label(g.tier()).color("contrast").build());
    badges.add(Chip.builder().label(g.deseos()).color("success").build());
    if (g.vip() != null) {
      badges.add(Chip.builder().label("VIP").color("warning").build());
    }
    if (!g.incidents().isEmpty()) {
      badges.add(Chip.builder().label("Incidencia").color("error").build());
    }
    return QueueItem.builder()
        .id(g.id())
        .title(g.name())
        .caption("Hab " + g.room() + " · " + g.roomType())
        .badges(badges)
        .build();
  }

  @Action
  Object openGuest(HttpRequest httpRequest) {
    var item = httpRequest.runActionRq().parameters().get("_item");
    return URI.create("/encasa/" + item);
  }
}
