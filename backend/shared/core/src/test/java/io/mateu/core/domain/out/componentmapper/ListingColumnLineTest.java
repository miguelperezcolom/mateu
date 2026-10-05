package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.out.fragmentmapper.mappers.GridColumnMapper;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Line;
import io.mateu.uidl.data.GridColumn;
import org.junit.jupiter.api.Test;

/** Multi-line rows: {@code @Line} puts a listing column on a given line of the row. */
class ListingColumnLineTest {

  record Row(String hotel, String holder, @Line(2) String status, @Line(3) Integer version) {}

  static GridColumn column(String id) {
    return ListingColumnBuilder.getColumns(
            Row.class, null, "", "", "", new FakeHttpRequest(RunActionRqDto.builder().build()))
        .stream()
        .map(GridColumn.class::cast)
        .filter(c -> id.equals(c.id()))
        .findFirst()
        .orElseThrow();
  }

  static GridColumnDto dto(String id) {
    return (GridColumnDto)
        GridColumnMapper.mapGridColumnToDto(
                column(id), "", "", new FakeHttpRequest(RunActionRqDto.builder().build()))
            .metadata();
  }

  @Test
  void aColumnWithoutLineIsOnLineOne() {
    assertThat(column("hotel").line()).isEqualTo(1);
    // line 1 is the default and does not travel: a listing without @Line keeps its wire
    assertThat(dto("hotel").line()).isNull();
  }

  @Test
  void lineAssignsTheColumnToThatLine() {
    assertThat(column("status").line()).isEqualTo(2);
    assertThat(column("version").line()).isEqualTo(3);
    assertThat(dto("status").line()).isEqualTo(2);
    assertThat(dto("version").line()).isEqualTo(3);
  }

  @Test
  void columnsKeepTheirOrderWhateverTheirLine() {
    var ids =
        ListingColumnBuilder.getColumns(
                Row.class, null, "", "", "", new FakeHttpRequest(RunActionRqDto.builder().build()))
            .stream()
            .map(c -> ((GridColumn) c).id())
            .toList();
    assertThat(ids).containsExactly("hotel", "holder", "status", "version");
  }
}
