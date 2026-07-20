package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.GanttDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Gantt;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The {@link DataManagement} archetype (Redwood Data management template) presents the same data as
 * a grid and as a Gantt with a toolbar switcher: it is full-width, shows the grid view by default,
 * and flips to the Gantt view when the user switches (re-rendering in place).
 */
class DataManagementSyncTest {

  @SuppressWarnings("unused")
  @UI("/schedule-board")
  @Title("Schedule board")
  public static class ScheduleBoard extends DataManagement {
    @Override
    protected Component gridView(HttpRequest httpRequest) {
      return new Text("grid-view", "the data grid");
    }

    @Override
    protected Component ganttView(HttpRequest httpRequest) {
      return Gantt.builder()
          .id("gv")
          .tasks(
              List.of(
                  new GanttTask(
                      "t1",
                      "Task 1",
                      LocalDate.of(2026, 1, 1),
                      LocalDate.of(2026, 1, 5),
                      50,
                      null)))
          .build();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ScheduleBoard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto serverSideOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto server) {
        return server;
      }
    }
    throw new AssertionError("no server side component");
  }

  private static <T> List<T> collect(UIIncrementDto increment, Class<T> type) {
    var out = new ArrayList<T>();
    for (var fragment : increment.fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), type, out);
    }
    return out;
  }

  @Test
  void thePageIsFullWidthAndShowsTheGridViewByDefault() {
    var increment = mateu.sync("/schedule-board");
    assertThat(serverSideOf(increment).pageWidth()).isEqualTo("fullWidth");
    assertThat(collect(increment, TextDto.class)).anyMatch(t -> "the data grid".equals(t.text()));
    assertThat(collect(increment, GanttDto.class)).isEmpty();
    // the switcher buttons are present
    assertThat(collect(increment, io.mateu.dtos.ButtonDto.class))
        .extracting(io.mateu.dtos.ButtonDto::actionId)
        .contains("switchToGrid", "switchToGantt");
  }

  @Test
  void switchingToGanttShowsTheGanttViewInstead() {
    var increment =
        mateu.run(
            io.mateu.dtos.RunActionRqDto.builder()
                .route("/schedule-board")
                .actionId("switchToGantt")
                .serverSideType(ScheduleBoard.class.getName())
                .initiatorComponentId("cmp-1")
                .componentState(Map.of("_view", "grid"))
                .build());
    assertThat(collect(increment, GanttDto.class)).hasSize(1);
    assertThat(collect(increment, TextDto.class)).noneMatch(t -> "the data grid".equals(t.text()));
  }
}
