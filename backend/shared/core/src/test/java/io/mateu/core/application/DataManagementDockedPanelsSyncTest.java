package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.datamanagement.DataManagement;
import io.mateu.core.testutil.TestMateu;
import io.mateu.core.testutil.WireWalk;
import io.mateu.dtos.ButtonDto;
import io.mateu.dtos.ResponsiveGridDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DockedPanel;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The data management page's docked panels: an end panel and a bottom panel, each with a toolbar
 * toggle and a ✕, open or closed as declared and flipped by their toggle actions, the end panel
 * pushing the content into a two-track grid at its declared width; switching back to the grid view.
 */
class DataManagementDockedPanelsSyncTest {

  @UI("/docked-board")
  public static class DockedBoard extends DataManagement {
    @Override
    protected Component gridView(HttpRequest httpRequest) {
      return new Text("grid-view", "the grid");
    }

    @Override
    protected Component ganttView(HttpRequest httpRequest) {
      return new Text("gantt-view", "the gantt");
    }

    @Override
    protected DockedPanel endPanel(HttpRequest httpRequest) {
      return new DockedPanel(
          "details", "Details", new Text("end-body", "details body"), "30rem", false);
    }

    @Override
    protected DockedPanel bottomPanel(HttpRequest httpRequest) {
      return new DockedPanel(null, "Log", null, null, true);
    }

    @Override
    protected String heading() {
      return " ";
    }

    @Override
    protected String gridLabel() {
      return "Table";
    }

    @Override
    protected String ganttLabel() {
      return "Timeline";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(DockedBoard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static UIIncrementDto run(String actionId, Map<String, Object> state) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/docked-board")
            .actionId(actionId)
            .serverSideType(DockedBoard.class.getName())
            .initiatorComponentId("dm")
            .componentState(new HashMap<>(state))
            .build());
  }

  private static List<String> texts(UIIncrementDto increment) {
    return WireWalk.all(increment, TextDto.class).stream().map(TextDto::text).toList();
  }

  private static List<ButtonDto> buttons(UIIncrementDto increment) {
    return WireWalk.all(increment, ButtonDto.class);
  }

  @Test
  void panelsStartAsDeclaredWithTheirTogglesInTheToolbar() {
    var increment = mateu.sync("/docked-board");
    assertThat(buttons(increment))
        .extracting(ButtonDto::label)
        .contains("Table", "Timeline", "Details", "Log", "✕");
    // a blank heading draws no title; the closed end panel's body is not rendered
    assertThat(texts(increment)).contains("the grid", "Log").doesNotContain("details body", " ");
    assertThat(WireWalk.all(increment, ResponsiveGridDto.class)).isEmpty();
  }

  @Test
  void theEndToggleOpensItBesideTheContentAndTheBottomToggleClosesTheBottomPanel() {
    var opened = run("toggleEndPanel", Map.of("_view", "grid"));
    assertThat(texts(opened)).contains("details body", "the grid");
    assertThat(String.valueOf(WireWalk.all(opened, ResponsiveGridDto.class))).contains("30rem");

    var closedAgain = run("toggleEndPanel", Map.of("_view", "grid", "_endOpen", true));
    assertThat(texts(closedAgain)).doesNotContain("details body");

    var bottomClosed = run("toggleBottomPanel", Map.of("_view", "grid"));
    assertThat(texts(bottomClosed)).doesNotContain("Log");
    var bottomReopened = run("toggleBottomPanel", Map.of("_view", "grid", "_bottomOpen", false));
    assertThat(texts(bottomReopened)).contains("Log");
  }

  @Test
  void switchingBackToTheGridLeavesTheGantt() {
    var grid = run("switchToGrid", Map.of("_view", "gantt"));
    assertThat(texts(grid)).contains("the grid").doesNotContain("the gantt");
  }
}
