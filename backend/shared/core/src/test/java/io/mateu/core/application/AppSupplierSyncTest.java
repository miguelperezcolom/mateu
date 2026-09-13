package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.MenuOptionDto;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An app defined IN CODE via {@link io.mateu.uidl.fluent.AppSupplier} — its shell and its whole
 * menu built fluently, no {@code @Menu}/{@code @App} annotations. Pins that the code-composed app
 * and its menu (both leaf kinds — a route link and a rule link — plus a submenu) reach the wire, so
 * the code-authoring path stays a guaranteed capability.
 */
class AppSupplierSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(CodeAuthoredApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void anAppAndItsMenuComposedInCodeReachTheWire() {
    var increment = mateu.sync("/codeapp");
    var app =
        FullSyncPipelineTest.findMetadata(increment.fragments().get(0).component(), AppDto.class);
    assertThat(app).isNotNull();
    assertThat(app.title()).isEqualTo("Code App");
    assertThat(app.menu()).extracting(MenuOptionDto::label).contains("Home", "Reports", "Approve");
  }

  @Test
  void aCodeComposedSubmenuNestsItsChildren() {
    var app =
        FullSyncPipelineTest.findMetadata(
            mateu.sync("/codeapp").fragments().get(0).component(), AppDto.class);
    var reports =
        app.menu().stream()
            .filter(option -> "Reports".equals(option.label()))
            .findFirst()
            .orElseThrow();
    assertThat(reports.submenus()).extracting(MenuOptionDto::label).contains("Sales");
  }

  @Test
  void aCodeComposedRuleLeafCarriesItsRulesInsteadOfARoute() {
    var app =
        FullSyncPipelineTest.findMetadata(
            mateu.sync("/codeapp").fragments().get(0).component(), AppDto.class);
    var approve =
        app.menu().stream()
            .filter(option -> "Approve".equals(option.label()))
            .findFirst()
            .orElseThrow();
    assertThat(approve.rules()).as("a rule leaf runs rules instead of navigating").isNotEmpty();
  }
}
