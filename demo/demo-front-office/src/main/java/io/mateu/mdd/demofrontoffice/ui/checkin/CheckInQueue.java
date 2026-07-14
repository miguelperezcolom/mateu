package io.mateu.mdd.demofrontoffice.ui.checkin;

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
import java.util.List;

/** Check-In landing: today's arrivals queue on the left, pick a guest to start the wizard. */
@Route(value = "/checkin", parentRoute = "")
@Title("Check-In")
public class CheckInQueue {

  // left rail: the arrivals work queue; right: the empty-state placeholder
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
                                  .label("Llegadas hoy")
                                  .items(
                                      HotelData.arrivals().stream()
                                          .map(
                                              a ->
                                                  QueueItem.builder()
                                                      .id(a.id())
                                                      .title(a.name())
                                                      .caption(
                                                          "Hab "
                                                              + a.room()
                                                              + " · "
                                                              + a.nights()
                                                              + "N")
                                                      .badges(
                                                          List.of(
                                                              Chip.builder()
                                                                  .label(a.tier())
                                                                  .color("contrast")
                                                                  .build()))
                                                      .build())
                                          .toList())
                                  .build()))
                      .build(),
                  EmptyState.builder()
                      .icon("🛎")
                      .title("Selecciona un huésped")
                      .description("Elige una llegada de la lista para iniciar su check-in.")
                      .style("flex: 1; margin-top: 3rem;")
                      .build()))
          .build();

  @Action
  Object openGuest(HttpRequest httpRequest) {
    var item = httpRequest.runActionRq().parameters().get("_item");
    return URI.create("/checkin/" + item);
  }
}
