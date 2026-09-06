package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.testutil.TestMateu;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A route can declare an APP-SCOPE data source ({@code appData}). It is emitted on the app shell
 * ({@code AppDto.appDataSource}) so the client fetches it once, on boot, into the app-data store —
 * shared across routes. The {@code appdata-app} route (test {@code routes.yaml}) references {@code
 * appMetrics}.
 */
class AppDataSourceSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AppDataApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void anAppEmitsItsAppScopeDataSourceOnTheShell() throws Exception {
    var wire = new ObjectMapper().writeValueAsString(mateu.sync("/appdata-app"));

    assertThat(wire).contains("appDataSource");
    assertThat(wire).contains("appMetrics");
  }
}
