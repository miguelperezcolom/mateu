package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.data.GridColumn;
import org.junit.jupiter.api.Test;

class ListingColumnWidthTest {

  record Row(String since, @ColumnWidth("420px") String title, boolean seen) {}

  GridColumn column(String id) {
    return ListingColumnBuilder.getColumns(
            Row.class, null, "", "", "", new FakeHttpRequest(RunActionRqDto.builder().build()))
        .stream()
        .map(GridColumn.class::cast)
        .filter(c -> id.equals(c.id()))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void aColumnWidthIsTheColumnsWidthNotJustAWeight() {
    var title = column("title");
    assertThat(title.width()).isEqualTo("420px");
    assertThat(title.flexGrow()).isEqualTo("0");
    assertThat(title.tooltipPath()).isEqualTo("title");
  }

  @Test
  void aColumnWithoutOneStillGrows() {
    var since = column("since");
    assertThat(since.width()).isNull();
    assertThat(since.flexGrow()).isNull();
    assertThat(since.tooltipPath()).isNull();
  }
}
