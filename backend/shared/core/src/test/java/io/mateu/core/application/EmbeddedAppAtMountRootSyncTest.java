package io.mateu.core.application;

import static io.mateu.core.application.NonRootAppMenuSyncTest.appOf;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.NonRootAppMenuSyncTest.Mount;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.Test;

/**
 * A whole app embedded as a micro frontend at its mount root ({@code route("")}) asks with {@code
 * consumedRoute ""}, not the {@code _empty} a top-level page load sends: it answered "Page not
 * found" (the Explorer had to spell {@code consumedRoute("_empty")}). The app's root is the app.
 */
class EmbeddedAppAtMountRootSyncTest {

  @Title("Welcome")
  public static class Welcome {
    String value = "welcome";
  }

  @UI("/apps/embedded")
  @Title("Embedded app")
  public static class EmbeddedApp {
    @Menu Welcome welcome;
  }

  @Test
  void anEmbeddedLoadOfTheMountRootAnswersTheApp() {
    try (var mateu = TestMateu.withUis(EmbeddedApp.class)) {
      var mount = new Mount(mateu, EmbeddedApp.class, "/apps/embedded");
      var increment =
          mount.run(
              RunActionRqDto.builder()
                  .route("")
                  .consumedRoute("")
                  .actionId("")
                  .initiatorComponentId("mfe_island")
                  .build());
      assertThat(appOf(increment)).as("the app shell, not 'Page not found'").isPresent();
    }
  }
}
