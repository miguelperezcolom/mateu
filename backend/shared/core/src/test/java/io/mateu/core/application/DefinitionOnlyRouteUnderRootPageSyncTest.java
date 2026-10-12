package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A definition-only route ({@code /about} in the test routes.yaml) under a mount whose ROOT is a
 * plain {@code @UI("")} page — the shape of a code app that adds a few YAML screens. On a fresh
 * deep link (the browser's first load) the root class claimed the route by prefix and the user saw
 * the root page instead of the definition (found walking the actions surface, 2026-10-12).
 */
class DefinitionOnlyRouteUnderRootPageSyncTest {

  @UI("")
  @Title("Root page")
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

  @Test
  void aFreshDeepLinkToTheDefinitionRendersTheDefinitionNotTheRootPage() {
    var increment = mateu.sync("/about");
    assertThat(increment.fragments()).isNotEmpty();
    var component = increment.fragments().get(0).component();
    assertThat(
            component instanceof ServerSideComponentDto s
                && s.serverSideType().contains("RootPage"))
        .as("the root page answered a route bound to a definition")
        .isFalse();
  }

  @Test
  void theRootStillAnswersItself() {
    var component = (ServerSideComponentDto) mateu.sync("").fragments().get(0).component();
    assertThat(component.serverSideType()).contains("RootPage");
  }
}
