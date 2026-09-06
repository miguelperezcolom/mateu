package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A DEFINITION-ONLY route (a {@code definition:} with NO {@code viewModel}) can now be SEEDED by
 * the route, exactly like a class-backed one: {@code state:} literals reach the page state and a
 * {@code data:} source is fetched on load.
 *
 * <p>Before, only the class path applied a route's seeds — a bare {@code spec.layout()} was mapped
 * as a static tree with no state and no triggers, so a pure-DSL detail page ({@code definition +
 * data}) could not read {@code ${state.x}} nor fetch its record. The {@code seeded-yaml-detail}
 * route (test {@code routes.yaml}) has no view model, seeds {@code tab: summary} and declares
 * {@code data: reportData}; the fix wraps the layout so the increment carries that state and the
 * synthetic {@code __restdata__} action + OnLoad the client uses to fetch and merge the record.
 */
class DefinitionRouteDataSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis();
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aDefinitionOnlyRouteSeedsStateAndSourcesItsData() throws Exception {
    var increment = mateu.sync("/seeded-yaml-detail");
    var wire = new ObjectMapper().writeValueAsString(increment);

    // the data source is wired on the definition-only path: __restdata__ action + OnLoad + the ref
    assertThat(wire).contains("__restdata__");
    assertThat(wire).contains("reportData");
    // the state seed reached the page state, so ${state.tab} resolves
    assertThat(wire).contains("summary");
  }
}
