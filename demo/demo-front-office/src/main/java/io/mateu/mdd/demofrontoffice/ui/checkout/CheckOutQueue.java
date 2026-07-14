package io.mateu.mdd.demofrontoffice.ui.checkout;

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

/** Check-Out landing: today's departures queue, grouped in-hotel first, then pending. */
@Route(value = "/checkout", parentRoute = "")
@Title("Check-Out")
public class CheckOutQueue {

  // left rail: the departures work queue; right: the empty-state placeholder
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
                                  .label("En hotel · late check-out primero")
                                  .items(
                                      List.of(
                                          QueueItem.builder()
                                              .id("carlos")
                                              .title("Carlos Mendoza")
                                              .caption("Hab 1108 · 7N")
                                              .badges(
                                                  List.of(
                                                      Chip.builder()
                                                          .label("LATE · 18:00")
                                                          .color("warning")
                                                          .build(),
                                                      Chip.builder()
                                                          .label("GOLD")
                                                          .color("contrast")
                                                          .build()))
                                              .build(),
                                          QueueItem.builder()
                                              .id("yuki")
                                              .title("Yuki Tanaka")
                                              .caption("Hab 703 · 4N")
                                              .badges(
                                                  List.of(
                                                      Chip.builder()
                                                          .label("EN HOTEL")
                                                          .color("success")
                                                          .build()))
                                              .build()))
                                  .build(),
                              QueueGroup.builder()
                                  .label("Salida pendiente")
                                  .items(
                                      List.of(
                                          QueueItem.builder()
                                              .id("sophie")
                                              .title("Sophie Laurent")
                                              .caption("Hab 901")
                                              .badges(
                                                  List.of(
                                                      Chip.builder()
                                                          .label("PLATINUM")
                                                          .color("contrast")
                                                          .build()))
                                              .build(),
                                          QueueItem.builder()
                                              .id("emma")
                                              .title("Emma Richardson")
                                              .caption("Hab 1015")
                                              .badges(
                                                  List.of(
                                                      Chip.builder()
                                                          .label("SILVER")
                                                          .color("contrast")
                                                          .build()))
                                              .build()))
                                  .build()))
                      .build(),
                  EmptyState.builder()
                      .icon("🧳")
                      .title("Selecciona un huésped")
                      .description("Elige una salida de la lista para revisar su folio y cobrar.")
                      .style("flex: 1; margin-top: 3rem;")
                      .build()))
          .build();

  @Action
  Object openGuest(HttpRequest httpRequest) {
    var item = httpRequest.runActionRq().parameters().get("_item");
    return URI.create("/checkout/" + item);
  }
}
