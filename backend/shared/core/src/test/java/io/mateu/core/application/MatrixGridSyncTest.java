package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.MatrixCellDto;
import io.mateu.dtos.MatrixGridDto;
import io.mateu.dtos.MatrixRowDto;
import io.mateu.dtos.MessageDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.MatrixCell;
import io.mateu.uidl.data.MatrixColumn;
import io.mateu.uidl.data.MatrixGrid;
import io.mateu.uidl.data.MatrixRow;
import io.mateu.uidl.data.MatrixSection;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The matrix grid (rows × date columns, collapsible sections, link and editable cells): the wire
 * carries one cell per column whatever the row declared, and a cell action receives the cell it
 * came from as parameters.
 */
class MatrixGridSyncTest {

  @SuppressWarnings("unused")
  @UI("/matrix")
  @Title("Availability")
  public static class AvailabilityPage {

    @Label("")
    Callable<Component> grid =
        () ->
            MatrixGrid.builder()
                .id("availability")
                .rowHeaderLabel("Room type")
                .cellActionId("openCell")
                .editActionId("setOverbooking")
                .columns(
                    List.of(
                        new MatrixColumn("2026-10-10", "Sat 10", "Oct 2026", "neutral"),
                        new MatrixColumn("2026-10-11", "Sun 11", "Oct 2026", "neutral"),
                        new MatrixColumn("2026-10-12", "Mon 12")))
                .sections(
                    List.of(
                        MatrixSection.builder()
                            .title("Occupancy")
                            .rows(
                                List.of(
                                    MatrixRow.builder()
                                        .id("available")
                                        .label("Available")
                                        .emphasis(true)
                                        .cells(
                                            List.of(
                                                MatrixCell.of(12),
                                                new MatrixCell("-1", "danger", true),
                                                MatrixCell.of(4)))
                                        .build()))
                            .build(),
                        MatrixSection.builder()
                            .id("controls")
                            .title("Controls")
                            .collapsed(true)
                            .rows(
                                List.of(
                                    MatrixRow.builder()
                                        .id("overbooking")
                                        .label("Overbooking")
                                        .editable(true)
                                        .cells(List.of(MatrixCell.of(2)))
                                        .build()))
                            .build()))
                .build();

    @Action
    public Object openCell(HttpRequest rq) {
      var p = rq.runActionRq().parameters();
      return new Message(p.get("_rowId") + "@" + p.get("_columnId") + "=" + p.get("_value"));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AvailabilityPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void gridTravelsWithSectionsAndOneCellPerColumn() {
    var increment = mateu.sync("/matrix");
    var grids =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), MatrixGridDto.class);
    assertThat(grids).hasSize(1);
    var grid = grids.get(0);
    assertThat(grid.rowHeaderLabel()).isEqualTo("Room type");
    assertThat(grid.cellActionId()).isEqualTo("openCell");
    assertThat(grid.editActionId()).isEqualTo("setOverbooking");
    assertThat(grid.columns())
        .extracting(c -> c.id(), c -> c.group(), c -> c.tone())
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("2026-10-10", "Oct 2026", "neutral"),
            org.assertj.core.groups.Tuple.tuple("2026-10-11", "Oct 2026", "neutral"),
            org.assertj.core.groups.Tuple.tuple("2026-10-12", null, null));
    // a section without id gets a stable one; the collapsed flag travels
    assertThat(grid.sections()).extracting(s -> s.id()).containsExactly("section0", "controls");
    assertThat(grid.sections().get(1).collapsed()).isTrue();
    var available = grid.sections().get(0).rows().get(0);
    assertThat(available.emphasis()).isTrue();
    assertThat(available.cells())
        .extracting(MatrixCellDto::value, MatrixCellDto::tone, MatrixCellDto::link)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("12", null, false),
            org.assertj.core.groups.Tuple.tuple("-1", "danger", true),
            org.assertj.core.groups.Tuple.tuple("4", null, false));
    // the overbooking row declared ONE cell: padded to the three columns
    MatrixRowDto overbooking = grid.sections().get(1).rows().get(0);
    assertThat(overbooking.editable()).isTrue();
    assertThat(overbooking.cells()).extracting(MatrixCellDto::value).containsExactly("2", "", "");
  }

  @Test
  void aCellActionReceivesTheCellItCameFrom() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/matrix")
                .actionId("openCell")
                .serverSideType(AvailabilityPage.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of())
                .parameters(
                    Map.of("_rowId", "available", "_columnId", "2026-10-11", "_value", "-1"))
                .build());
    assertThat(increment.messages())
        .extracting(MessageDto::text)
        .containsExactly("available@2026-10-11=-1");
  }
}
