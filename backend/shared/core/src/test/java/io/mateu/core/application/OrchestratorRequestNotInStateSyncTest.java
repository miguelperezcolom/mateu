package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * The archetypes that keep the request of the current call in a field (to hand it to their hooks
 * while building the tree) must not ship it to the client as state: it carried the base url and the
 * caller's remote address, and the next action failed to write it back ("Could not hydrate field
 * 'currentRequest'"). Framework fields are {@code transient}, and transient fields never travel.
 */
class OrchestratorRequestNotInStateSyncTest {

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            TodoListSyncTest.MyTasks.class,
            CalendarPageSyncTest.TeamCalendar.class,
            CollectionDetailSyncTest.HotelDirectory.class,
            GeneralOverviewSyncTest.RequisitionOverview.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @ParameterizedTest
  @ValueSource(
      strings = {"/my-tasks", "/team-calendar", "/hotel-directory", "/requisition-overview"})
  @SuppressWarnings("unchecked")
  void theCurrentRequestNeverTravelsInTheState(String route) {
    var increment = mateu.sync(route);
    var states =
        increment.fragments().stream()
            .map(fragment -> fragment.state())
            .filter(state -> state instanceof Map<?, ?>)
            .map(state -> (Map<String, Object>) state)
            .toList();
    assertThat(states).isNotEmpty();
    states.forEach(
        state -> {
          assertThat(state).doesNotContainKey("currentRequest");
          assertThat(state.keySet())
              .noneMatch(key -> String.valueOf(key).startsWith("currentRequest-"));
          assertThat(String.valueOf(state)).doesNotContain("remoteAddress");
        });
  }
}
