package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A {@code @Menu} entry declared on a METHOD of a root app: the menu carries it at the method's
 * route, and a click runs the method and loads the page it returns into the content slot.
 */
class RootAppMenuEntriesSyncTest {

  /**
   * @Menu targets fields; a method entry is declared through a composed annotation.
   */
  @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
  @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
  @Menu
  @interface MenuMethod {}

  @Title("Report")
  public static class ReportPage {
    public String note = "monthly";
  }

  @SuppressWarnings("unused")
  @UI("")
  @Title("Root")
  public static class RootApp {
    @Menu String local = "/local";

    @MenuMethod
    public ReportPage report() {
      var page = new ReportPage();
      page.note = "built by the menu method";
      return page;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    // a root app changes route resolution for every fixture: its own harness
    mateu = TestMateu.withUis(RootApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void theMethodEntryIsInTheMenuAtTheMethodsRoute() {
    var app =
        FullSyncPipelineTest.findMetadata(
            mateu.sync("/").fragments().get(0).component(), AppDto.class);
    assertThat(app.menu())
        .filteredOn(option -> "Report".equals(option.label()))
        .singleElement()
        .extracting(MenuOptionDto::route)
        .isEqualTo("/report");
  }

  @Test
  @SuppressWarnings("unchecked")
  void clickingItRunsTheMethodAndLoadsThePageItReturns() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/report")
                .consumedRoute("")
                .serverSideType(RootApp.class.getName())
                .actionId("")
                .build());
    var content = (ServerSideComponentDto) increment.fragments().get(0).component();
    assertThat(content.serverSideType()).isEqualTo(ReportPage.class.getName());
    assertThat((Map<String, Object>) increment.fragments().get(0).state())
        .containsEntry("note", "built by the menu method");
  }
}
