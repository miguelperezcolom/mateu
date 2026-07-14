package io.mateu.mdd.demoadminpanel.infra.in.ui.kanban;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanCard;
import io.mateu.uidl.data.KanbanColumn;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link Kanban} component: a sprint board with columns of cards. */
@UI("/kanban-demo")
@Title("Sprint board")
public class SprintBoard {

  @Section("Sprint 24")
  Component board =
      Kanban.builder()
          .columns(
              List.of(
                  KanbanColumn.builder()
                      .title("Backlog")
                      .color("#94a3b8")
                      .cards(
                          List.of(
                              KanbanCard.builder()
                                  .title("Refactor auth module")
                                  .description("Split the monolithic AuthService")
                                  .badge("5 pts")
                                  .build(),
                              KanbanCard.builder()
                                  .title("Dark mode for reports")
                                  .badge("3 pts")
                                  .build()))
                      .build(),
                  KanbanColumn.builder()
                      .title("In progress")
                      .color("#3b82f6")
                      .cards(
                          List.of(
                              KanbanCard.builder()
                                  .title("Kanban component")
                                  .description("Ship the new board widget")
                                  .badge("8 pts")
                                  .color("#3b82f6")
                                  .build(),
                              KanbanCard.builder()
                                  .title("Fix upload CORS")
                                  .badge("2 pts")
                                  .build()))
                      .build(),
                  KanbanColumn.builder()
                      .title("Review")
                      .color("#f59e0b")
                      .cards(
                          List.of(
                              KanbanCard.builder()
                                  .title("Section buttons → small")
                                  .description("Vaadin small variant")
                                  .badge("1 pt")
                                  .color("#f59e0b")
                                  .build()))
                      .build(),
                  KanbanColumn.builder()
                      .title("Done")
                      .color("#10b981")
                      .cards(
                          List.of(
                              KanbanCard.builder()
                                  .title("Chat file upload")
                                  .description("Filesystem MCP for the agent")
                                  .badge("13 pts")
                                  .color("#10b981")
                                  .build(),
                              KanbanCard.builder()
                                  .title("@Tab(open) default tab")
                                  .badge("2 pts")
                                  .color("#10b981")
                                  .build()))
                      .build()))
          .build();
}
