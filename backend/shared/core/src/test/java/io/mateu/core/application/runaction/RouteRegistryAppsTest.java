package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URLClassLoader;
import org.junit.jupiter.api.Test;

/**
 * A jar can ship a 100%-DSL app — a {@code type: UI} mount declared in {@code specs/ui/**} with NO
 * Java class — and it is announced by {@link RouteRegistry#apps()} exactly like a class-based
 * {@code @UI} app. Two producers, one table (authored — the DSL mount — wins on a base-path
 * collision), the same rule the routes and sources use.
 */
class RouteRegistryAppsTest {

  private final RouteRegistry registry = new RouteRegistry();

  /**
   * A class loader that sees ONLY the DSL-mount fixture (no parent, so no shared specs/ui leaks).
   */
  private static ClassLoader dslMountOnly() {
    var url = RouteRegistryAppsTest.class.getResource("/dsl-mount/");
    return new URLClassLoader(new java.net.URL[] {url}, null);
  }

  @Test
  void aClassLessDslMountIsAnnouncedAsAnApp() {
    var apps = registry.appsFrom(dslMountOnly());

    var backOffice =
        apps.stream().filter(app -> "back-office".equals(app.route())).findFirst().orElseThrow();

    assertThat(backOffice.isDsl()).as("no Java class backs it").isTrue();
    assertThat(backOffice.className()).isNull();
    assertThat(backOffice.definition()).isEqualTo("back-office-shell.yaml");
  }
}
