package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A route can seed the APP state on entry. The seed is applied on the response side, merged UNDER
 * the client's request app state, so it is a default the persisted {@code @AppContext} still wins.
 * The {@code appstate-seed} route (test {@code routes.yaml}) seeds {@code tenant: acme}.
 */
class AppStateSeedSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AppStateSeedView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  @SuppressWarnings("unchecked")
  void aRouteSeedsTheAppStateOnEntry() {
    var increment = mateu.sync("/appstate-seed");

    assertThat(increment.appState()).isInstanceOf(Map.class);
    assertThat((Map<String, Object>) increment.appState()).containsEntry("tenant", "acme");
  }
}
