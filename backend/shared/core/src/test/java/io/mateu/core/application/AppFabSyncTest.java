package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An app-level {@code @Fab} (a method of the {@code @UI} app class) dispatches to the app instance
 * like a header action: the floating button lives on the shell, whatever screen is below it, so no
 * menu entry is actionable for its route. On a ROOT app (route "") it used to answer "Not found." —
 * the Redwood renderer posts it app-level with the app's serverSideType and route "". Own
 * TestMateu: a root app changes route resolution for every other fixture.
 */
class AppFabSyncTest {

  @SuppressWarnings("unused")
  @UI("")
  @Title("Fab app")
  public static class FabApp {

    @Menu String home = "/";

    @Fab(icon = "vaadin:refresh", label = "Quick sync")
    public Message quickSync() {
      return new Message("quick sync done");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(FabApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void anAppFabDispatchesToTheAppClassMethodOnARootApp() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("")
                .serverSideType(FabApp.class.getName())
                .actionId("quickSync")
                .initiatorComponentId("")
                .componentState(Map.of())
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("quick sync done");
  }
}
