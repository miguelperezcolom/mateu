package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.KanbanDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanCard;
import io.mateu.uidl.data.KanbanColumn;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Kanban drag and drop: a board with a {@code moveActionId} advertises it, a drop runs it with the
 * card, its source and target columns and its new position, and a LIVE board (rowsSource + column
 * field + card template + colours + route) carries everything the renderer needs to draw the cards
 * from the items itself.
 */
class KanbanMoveSyncTest {

  /** The last move the page received (one static page per test class). */
  static final List<Map<String, Object>> moves = new ArrayList<>();

  @SuppressWarnings("unused")
  @UI("/kanban-move")
  @Title("Tasks")
  public static class BoardPage {
    @Label("")
    Callable<Component> board =
        () ->
            Kanban.builder()
                .id("board")
                .columns(
                    List.of(
                        new KanbanColumn(
                            "todo",
                            "To do",
                            null,
                            List.of(
                                KanbanCard.builder().id("t1").title("Write").build(),
                                KanbanCard.builder().id("t2").title("Review").build())),
                        new KanbanColumn("done", "Done", null, List.of())))
                .moveActionId("moveTask")
                .build();

    // a plain public method: the board naming it is what advertises it
    public Object moveTask(HttpRequest httpRequest) {
      var rq = httpRequest.runActionRq();
      moves.add(rq != null && rq.parameters() != null ? rq.parameters() : Map.of());
      return null;
    }
  }

  @SuppressWarnings("unused")
  @UI("/kanban-live")
  public static class LiveBoardPage {
    @Label("")
    Callable<Component> board =
        () ->
            Kanban.builder()
                .id("live")
                .columns(
                    List.of(
                        new KanbanColumn("backlog", "Backlog", "#6b7280", List.of()),
                        new KanbanColumn("done", "Done", null, List.of())))
                .rowsSource(RestDataSource.builder().url("/api/tasks").itemsPath("content").build())
                .columnField("status")
                .card(
                    KanbanCard.builder()
                        .id("${row.id}")
                        .title("${row.title}")
                        .badge("${row.priority}")
                        .color("${row.priority}")
                        .build())
                .cardColors(Map.of("urgent", "#dc2626"))
                .cardRoute("tasks/${row.id}")
                .moveActionId("moveTask")
                .build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(BoardPage.class, LiveBoardPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static KanbanDto boardOf(String route) {
    var boards =
        FieldKindsSyncTest.collect(
            mateu.sync(route).fragments().get(0).component(), KanbanDto.class);
    assertThat(boards).hasSize(1);
    return boards.get(0);
  }

  @Test
  void theMoveActionTravelsAndIsAdvertised() {
    assertThat(boardOf("/kanban-move").moveActionId()).isEqualTo("moveTask");
    var component =
        (io.mateu.dtos.ServerSideComponentDto)
            mateu.sync("/kanban-move").fragments().get(0).component();
    // the web client only sends an action its component advertises
    assertThat(component.actions().stream().map(io.mateu.dtos.ActionDto::id)).contains("moveTask");
  }

  @Test
  void aDropRunsTheMoveActionWithTheCardAndWhereItWent() {
    moves.clear();
    mateu.run(
        RunActionRqDto.builder()
            .route("kanban-move")
            .serverSideType(BoardPage.class.getName())
            .actionId("moveTask")
            .parameters(
                Map.of(
                    "_cardId", "t1", "_fromColumnId", "todo", "_toColumnId", "done", "_toIndex", 0))
            .componentState(Map.of())
            .build());
    assertThat(moves).hasSize(1);
    assertThat(moves.get(0))
        .containsEntry("_cardId", "t1")
        .containsEntry("_fromColumnId", "todo")
        .containsEntry("_toColumnId", "done")
        .containsEntry("_toIndex", 0);
  }

  @Test
  void aLiveBoardCarriesItsSourceCardTemplateColoursAndRoute() {
    var board = boardOf("/kanban-live");
    assertThat(board.rowsSource().url()).isEqualTo("/api/tasks");
    assertThat(board.rowsSource().itemsPath()).isEqualTo("content");
    assertThat(board.columnField()).isEqualTo("status");
    assertThat(board.card().title()).isEqualTo("${row.title}");
    assertThat(board.card().color()).isEqualTo("${row.priority}");
    assertThat(board.cardColors()).containsEntry("urgent", "#dc2626");
    assertThat(board.cardRoute()).isEqualTo("tasks/${row.id}");
    assertThat(board.columns()).extracting(c -> c.id()).containsExactly("backlog", "done");
  }

  @Test
  void aBoardWithoutTheNewAttributesStaysAsItWas() {
    var plain = new Kanban("k", List.of(), null, null);
    assertThat(plain.moveActionId()).isNull();
    assertThat(plain.rowsSource()).isNull();
  }
}
