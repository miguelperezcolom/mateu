package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link TaskQueue} component: today's departures work queue. */
@UI("/task-queue-demo")
@Title("Salidas hoy")
public class DeparturesQueue {

  @Section("Salidas hoy")
  Component queue =
      TaskQueue.builder()
          .actionId("openGuest")
          .groups(
              List.of(
                  QueueGroup.builder()
                      .label("En hotel · late check-out primero")
                      .items(
                          List.of(
                              QueueItem.builder()
                                  .id("1108")
                                  .title("Carlos Mendoza")
                                  .caption("Hab 1108 · 7N")
                                  .badges(
                                      List.of(
                                          Chip.builder()
                                              .label("LATE · 18:00")
                                              .color("warning")
                                              .build()))
                                  .selected(true)
                                  .build(),
                              QueueItem.builder()
                                  .id("1204")
                                  .title("Emma Johnson")
                                  .caption("Hab 1204 · 3N")
                                  .badges(
                                      List.of(
                                          Chip.builder().label("ALL INC").color("success").build()))
                                  .build()))
                      .build(),
                  QueueGroup.builder()
                      .label("Salida pendiente")
                      .items(
                          List.of(
                              QueueItem.builder()
                                  .id("901")
                                  .title("Sophie Laurent")
                                  .caption("Hab 901")
                                  .badges(
                                      List.of(
                                          Chip.builder().label("GOLD").color("contrast").build()))
                                  .build()))
                      .build()))
          .build();

  @Action
  Object openGuest() {
    return new Message("This would open the selected guest's check-out");
  }
}
