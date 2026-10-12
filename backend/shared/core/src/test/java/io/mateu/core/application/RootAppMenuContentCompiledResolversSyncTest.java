package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.JsonSerializer;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * {@link RootAppMenuContentSyncTest} with the root app served the way the WebFlux, Quarkus and
 * Helidon processors serve it — a pre-compiled RouteResolver, no RoutedClassProvider. The Redwood
 * shell loads a menu page by route alone; on those adapters the root app was not found and every
 * page of a generated WebFlux + Redwood project answered "Page not found".
 */
class RootAppMenuContentCompiledResolversSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withCompiledRouteResolvers(RootAppMenuContentSyncTest.LandingShell.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aMenuRouteLoadedByRouteAloneAnswersItsScreen() {
    var wire =
        JsonSerializer.toJson(
            mateu.run(
                RunActionRqDto.builder()
                    .route("/home")
                    .consumedRoute("")
                    .actionId("")
                    .initiatorComponentId("content")
                    .componentState(Map.of())
                    .build()));
    assertThat(wire)
        .contains(RootAppMenuContentSyncTest.LandingHome.class.getName())
        .contains("Welcome aboard")
        .doesNotContain("NotFound");
  }
}
