package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.YamlAppLoader;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppVariant;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The root of a mount authored entirely in YAML — an {@code app:} block in {@code routes.yaml}, no
 * {@code @App} class — renders the app shell (title, menu, widgets) through the same machinery an
 * {@code @App} class uses. A stub {@link YamlAppLoader} stands in for the classpath file so this
 * test doesn't have to plant a global {@code routes.yaml} that would leak into the rest of the
 * suite.
 */
class YamlAppShellRoutingTest {

  /** A YAML mount shell, as {@link YamlAppLoader} would build it from the {@code app:} block. */
  static final class StubAppLoader extends YamlAppLoader {
    @Override
    public AppShell app() {
      return AppShell.builder()
          .title("Back office")
          .subtitle("Operations")
          .variant(AppVariant.MENU_ON_TOP)
          .menuItem(RouteLink.builder().label("Orders").route("orders").path("/orders").build())
          .menuItem(RouteLink.builder().label("Users").route("users").path("/users").build())
          .build();
    }
  }

  @Test
  void theRootOfAYamlOnlyMountRendersTheAppShell() {
    // No @UI/@Route fixtures: nothing resolves the root by class, so the classless path runs and
    // finds the data-authored shell.
    try (var mateu = TestMateu.withUisAndBeans(List.of(new StubAppLoader()))) {
      var increment = mateu.sync("");

      assertThat(increment.fragments()).isNotEmpty();
      var app =
          FullSyncPipelineTest.findMetadata(increment.fragments().get(0).component(), AppDto.class);

      assertThat(app).as("the increment carries an app shell DTO").isNotNull();
      assertThat(app.title()).isEqualTo("Back office");
      assertThat(app.subtitle()).isEqualTo("Operations");
      assertThat(app.menu()).extracting("label").contains("Orders", "Users");
    }
  }
}
