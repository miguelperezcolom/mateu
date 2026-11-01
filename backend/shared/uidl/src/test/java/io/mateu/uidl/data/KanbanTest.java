package io.mateu.uidl.data;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/** A board built the old way stays static; the new attributes make it movable and live. */
class KanbanTest {

  @Test
  void theFourArgumentBoardNeitherMovesNorReadsASource() {
    var board =
        new Kanban(
            "k",
            List.of(
                new KanbanColumn(
                    "todo", "To do", null, List.of(KanbanCard.builder().id("c").build()))),
            null,
            null);
    assertThat(board.moveActionId()).isNull();
    assertThat(board.rowsSource()).isNull();
    assertThat(board.columnField()).isNull();
    assertThat(board.card()).isNull();
    assertThat(board.cardColors()).isNull();
    assertThat(board.cardRoute()).isNull();
    assertThat(board.columns().get(0).cards()).hasSize(1);
  }

  @Test
  void aLiveMovableBoardCarriesItsSourceTemplateAndAction() {
    var board =
        Kanban.builder()
            .id("live")
            .moveActionId("moveTask")
            .rowsSource(RestDataSource.builder().url("/api/tasks").build())
            .columnField("status")
            .card(KanbanCard.builder().title("${row.title}").build())
            .cardColors(Map.of("urgent", "#dc2626"))
            .cardRoute("tasks/${row.id}")
            .build();
    assertThat(board.moveActionId()).isEqualTo("moveTask");
    assertThat(board.rowsSource().url()).isEqualTo("/api/tasks");
    assertThat(board.card().title()).isEqualTo("${row.title}");
    assertThat(board.cardColors()).containsEntry("urgent", "#dc2626");
    assertThat(board.cardRoute()).isEqualTo("tasks/${row.id}");
  }
}
