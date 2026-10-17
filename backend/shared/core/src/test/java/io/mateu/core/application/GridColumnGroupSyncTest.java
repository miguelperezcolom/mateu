package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.GridDto;
import io.mateu.dtos.GridGroupColumnDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Grid;
import io.mateu.uidl.data.GridColumn;
import io.mateu.uidl.data.GridGroupColumn;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A column group (a header spanning several columns) travels under its registered wire name with
 * its child columns: before, it left as {@code "GridGroupColumnDto"} (which no renderer dispatches
 * on) and with NO columns, so the grouped columns never reached the screen at all.
 */
class GridColumnGroupSyncTest {

  @UI("/grouped-grid")
  public static class GroupedGrid implements ComponentTreeSupplier {

    @Override
    public Component component(HttpRequest httpRequest) {
      return Grid.builder()
          .id("rooms")
          .content(
              List.of(
                  column("room", "Room"),
                  GridGroupColumn.builder()
                      .id("occupancy")
                      .label("Occupancy")
                      .columns(List.of(column("adults", "Adults"), column("children", "Children")))
                      .build()))
          .build();
    }

    private static GridColumn column(String id, String label) {
      return GridColumn.builder()
          .id(id)
          .label(label)
          .dataType(FieldDataType.string)
          .stereotype(FieldStereotype.regular)
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(GroupedGrid.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private GridDto grid() {
    var host = (ServerSideComponentDto) mateu.sync("/grouped-grid").fragments().get(0).component();
    return (GridDto) ((ClientSideComponentDto) host.children().get(0)).metadata();
  }

  @Test
  void theGroupCarriesItsChildColumns() {
    var content = grid().content();
    assertThat(content).hasSize(2);
    var group = (ClientSideComponentDto) content.get(1);
    assertThat(group.id()).isEqualTo("occupancy");
    var dto = (GridGroupColumnDto) group.metadata();
    assertThat(dto.label()).isEqualTo("Occupancy");
    assertThat(dto.columns())
        .extracting(c -> ((GridColumnDto) ((ClientSideComponentDto) c).metadata()).id())
        .containsExactly("adults", "children");
  }

  @Test
  void theGroupTravelsUnderTheNameTheRenderersDispatchOn() throws Exception {
    var json = new ObjectMapper().findAndRegisterModules().writeValueAsString(grid());
    assertThat(json).contains("\"type\":\"GridGroupColumn\"");
    assertThat(json).doesNotContain("GridGroupColumnDto");
    // the children are ordinary ClientSide-wrapped GridColumns, like the grid's own columns
    assertThat(json).contains("\"id\":\"adults\"").contains("\"id\":\"children\"");
  }
}
