package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.GridColumn;
import java.util.List;
import org.junit.jupiter.api.Test;

/** A row's trailing action columns stay on screen: frozen to the end of a wide grid. */
class ListingColumnFrozenActionTest {

  record Trailing(
      String id, String name, String form, String due, ColumnAction run, ColumnActionGroup more) {}

  record Leading(ColumnAction run, String id, String name) {}

  record Between(String id, ColumnAction run, String name) {}

  List<GridColumn> columns(Class<?> rowClass) {
    return ListingColumnBuilder.getColumns(
            rowClass, null, "", "", "", new FakeHttpRequest(RunActionRqDto.builder().build()))
        .stream()
        .map(GridColumn.class::cast)
        .toList();
  }

  GridColumn column(Class<?> rowClass, String id) {
    return columns(rowClass).stream().filter(c -> id.equals(c.id())).findFirst().orElseThrow();
  }

  @Test
  void trailingActionColumnsAreFrozenToTheEnd() {
    assertThat(column(Trailing.class, "run").frozenToEnd()).isTrue();
    assertThat(column(Trailing.class, "more").frozenToEnd()).isTrue();
    assertThat(column(Trailing.class, "due").frozenToEnd()).isFalse();
    assertThat(column(Trailing.class, "id").frozenToEnd()).isFalse();
  }

  @Test
  void anActionColumnTheAuthorPutBeforeTheDataStaysWhereItIs() {
    assertThat(column(Leading.class, "run").frozenToEnd()).isFalse();
    assertThat(column(Between.class, "run").frozenToEnd()).isFalse();
  }

  @Test
  void theColumnOrderIsUnchanged() {
    assertThat(columns(Trailing.class).stream().map(GridColumn::id))
        .containsExactly("id", "name", "form", "due", "run", "more");
  }

  @Test
  void theFreezeReachesTheWire() {
    var wire =
        (io.mateu.dtos.GridColumnDto)
            io.mateu.core.domain.out.fragmentmapper.mappers.GridColumnMapper.mapGridColumnToDto(
                    column(Trailing.class, "run"),
                    "",
                    "",
                    new FakeHttpRequest(RunActionRqDto.builder().build()))
                .metadata();
    assertThat(wire.frozenToEnd()).isTrue();
  }
}
