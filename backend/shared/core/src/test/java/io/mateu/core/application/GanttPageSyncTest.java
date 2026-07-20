package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.ganttpage.GanttPage;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CardDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.DrawerDto;
import io.mateu.dtos.GanttDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GanttTask;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The {@link GanttPage} archetype (Redwood Gantt page template) composes a full-bleed {@link
 * io.mateu.uidl.data.Gantt} canvas laid out edge-to-edge, with an optional detail panel docked
 * below it — pure composition of existing wire components.
 */
class GanttPageSyncTest {

  @SuppressWarnings("unused")
  @UI("/project-plan")
  @Title("Project plan")
  public static class ProjectPlan extends GanttPage {
    @Override
    protected List<GanttTask> tasks(HttpRequest httpRequest) {
      return List.of(
          new GanttTask(
              "t1", "Design", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 10), 100, null),
          new GanttTask(
              "t2", "Build", LocalDate.of(2026, 1, 11), LocalDate.of(2026, 2, 1), 40, null));
    }
  }

  @SuppressWarnings("unused")
  @UI("/project-plan-with-detail")
  @Title("Project plan + detail")
  public static class ProjectPlanWithDetail extends GanttPage {
    @Override
    protected List<GanttTask> tasks(HttpRequest httpRequest) {
      return List.of(
          new GanttTask(
              "t1", "Design", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 10), 100, null));
    }

    @Override
    protected Component detail(HttpRequest httpRequest) {
      return new Text("detail panel");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(ProjectPlan.class, ProjectPlanWithDetail.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static ServerSideComponentDto serverSideOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto server) {
        return server;
      }
    }
    throw new AssertionError("no server side component for " + route);
  }

  @Test
  void theGanttPageIsEdgeToEdgeAndCarriesTheGanttCanvas() {
    var server = serverSideOf("/project-plan");
    assertThat(server.pageWidth()).isEqualTo("edgeToEdge");
    var gantts = new ArrayList<GanttDto>();
    FieldKindsSyncTest.walk(server, GanttDto.class, gantts);
    assertThat(gantts).hasSize(1);
    assertThat(gantts.get(0).tasks()).hasSize(2);
    assertThat(gantts.get(0).tasks().get(0).title()).isEqualTo("Design");
  }

  @Test
  void theCanvasAdvertisesTheTaskSelectionAction() {
    var gantts = new ArrayList<GanttDto>();
    FieldKindsSyncTest.walk(serverSideOf("/project-plan"), GanttDto.class, gantts);
    assertThat(gantts.get(0).onTaskSelectionActionId()).isEqualTo("selectGanttTask");
  }

  @Test
  void clickingATaskOpensItInADrawer() {
    UIIncrementDto increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/project-plan")
                .actionId("selectGanttTask")
                .serverSideType(ProjectPlan.class.getName())
                .initiatorComponentId("cmp-1")
                .parameters(java.util.Map.of("_clickedTaskId", "t2"))
                .build());
    DrawerDto drawer = null;
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ClientSideComponentDto c
          && c.metadata() instanceof DrawerDto d) {
        drawer = d;
        break;
      }
    }
    assertThat(drawer).as("drawer fragment").isNotNull();
    assertThat(drawer.headerTitle()).isEqualTo("Build");
    assertThat(drawer.size()).isEqualTo("m");
  }

  @Test
  void theOptionalDetailPanelIsDockedAsACardBelowTheCanvas() {
    var server = serverSideOf("/project-plan-with-detail");
    var cards = new ArrayList<CardDto>();
    FieldKindsSyncTest.walk(server, CardDto.class, cards);
    assertThat(cards).isNotEmpty();
    var gantts = new ArrayList<GanttDto>();
    FieldKindsSyncTest.walk(server, GanttDto.class, gantts);
    assertThat(gantts).hasSize(1);
  }
}
