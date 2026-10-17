package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.UICommandDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A definition-only YAML page (a route with {@code layout:} and no view model) names the window
 * like any other page. It used to send no SetWindowTitle at all, so the tab kept the ROOT page's
 * title ("Simple form") and screen readers heard no route change.
 */
class DefinitionOnlyWindowTitleSyncTest {

  @UI("")
  @Title("Simple form")
  public static class RootPage {
    String name;
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RootPage.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<Object> windowTitles(UIIncrementDto increment) {
    return increment.commands().stream()
        .filter(c -> c.type() == UICommandTypeDto.SetWindowTitle)
        .map(UICommandDto::data)
        .toList();
  }

  @Test
  void aStaticDefinitionWithNoTitleIsNamedAfterItsRoute() {
    assertThat(windowTitles(mateu.sync("/about"))).containsExactly("About");
  }

  @Test
  void aDefinitionNamesTheWindowWithItsOwnTitle() {
    assertThat(windowTitles(mateu.sync("/template-form-header"))).containsExactly("Sign up");
  }

  @Test
  void aDefinitionThatDeclaresActionsIsNamedWithItsTitleToo() {
    assertThat(windowTitles(mateu.sync("/bulk-list"))).containsExactly("Bulk");
  }

  @Test
  void theRootStillNamesItself() {
    assertThat(windowTitles(mateu.sync(""))).contains("Simple form");
  }
}
