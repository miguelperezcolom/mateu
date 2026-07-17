package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.PlanningBoardDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.PlanningBlock;
import io.mateu.uidl.data.PlanningBoard;
import io.mateu.uidl.data.PlanningResource;
import io.mateu.uidl.fluent.Component;
import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Planning board / tape chart: resources × days with colored blocks spanning date ranges — the
 * resources, the blocks (ISO dates), the visible window and the move/select action ids all travel
 * on the wire as PlanningBoardDto.
 */
class PlanningBoardSyncTest {

  @SuppressWarnings("unused")
  @UI("/planning")
  @Title("Room planning")
  public static class PlanningPage {
    @Label("")
    Callable<Component> board =
        () ->
            PlanningBoard.builder()
                .id("tape")
                .from(LocalDate.of(2026, 8, 1))
                .to(LocalDate.of(2026, 8, 21))
                .resources(
                    List.of(
                        PlanningResource.builder()
                            .id("101")
                            .label("Room 101")
                            .group("Floor 1")
                            .build(),
                        PlanningResource.builder()
                            .id("102")
                            .label("Room 102")
                            .group("Floor 1")
                            .build(),
                        PlanningResource.builder()
                            .id("201")
                            .label("Room 201")
                            .group("Floor 2")
                            .build()))
                .blocks(
                    List.of(
                        PlanningBlock.builder()
                            .id("b1")
                            .resourceId("101")
                            .start(LocalDate.of(2026, 8, 3))
                            .end(LocalDate.of(2026, 8, 7))
                            .label("Ada Lovelace")
                            .color("#3b82f6")
                            .status("confirmed")
                            .build(),
                        PlanningBlock.builder()
                            .id("b2")
                            .resourceId("201")
                            .start(LocalDate.of(2026, 8, 5))
                            .end(LocalDate.of(2026, 8, 12))
                            .label("Grace Hopper")
                            .build()))
                .moveActionId("moveBooking")
                .selectActionId("openBooking")
                .build();
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PlanningPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void planningBoardTravelsWithResourcesGroupsAndWindow() {
    var increment = mateu.sync("/planning");
    var boards =
        FieldKindsSyncTest.collect(
            increment.fragments().get(0).component(), PlanningBoardDto.class);
    assertThat(boards).hasSize(1);
    var board = boards.get(0);
    assertThat(board.from()).isEqualTo("2026-08-01");
    assertThat(board.to()).isEqualTo("2026-08-21");
    assertThat(board.resources()).hasSize(3);
    assertThat(board.resources().get(0).id()).isEqualTo("101");
    assertThat(board.resources().get(0).label()).isEqualTo("Room 101");
    assertThat(board.resources().get(0).group()).isEqualTo("Floor 1");
    assertThat(board.resources().get(2).group()).isEqualTo("Floor 2");
  }

  @Test
  void blocksSerializeIsoDatesColorAndStatus() {
    var increment = mateu.sync("/planning");
    var board =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), PlanningBoardDto.class)
            .get(0);
    assertThat(board.blocks()).hasSize(2);
    var first = board.blocks().get(0);
    assertThat(first.id()).isEqualTo("b1");
    assertThat(first.resourceId()).isEqualTo("101");
    assertThat(first.start()).isEqualTo("2026-08-03");
    assertThat(first.end()).isEqualTo("2026-08-07");
    assertThat(first.label()).isEqualTo("Ada Lovelace");
    assertThat(first.color()).isEqualTo("#3b82f6");
    assertThat(first.status()).isEqualTo("confirmed");
    assertThat(board.blocks().get(1).color()).isNull();
  }

  @Test
  void moveAndSelectActionIdsTravel() {
    var increment = mateu.sync("/planning");
    var board =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), PlanningBoardDto.class)
            .get(0);
    assertThat(board.moveActionId()).isEqualTo("moveBooking");
    assertThat(board.selectActionId()).isEqualTo("openBooking");
  }
}
