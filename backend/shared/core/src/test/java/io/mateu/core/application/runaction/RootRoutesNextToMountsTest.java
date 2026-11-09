package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.RouteEntry;
import java.net.URLClassLoader;
import org.junit.jupiter.api.Test;

/**
 * The conventional root {@code specs/ui/routes.yaml} and a {@code type: UI} mount at ANOTHER base
 * path live side by side (found building the Mateu Explorer, 3.0-beta.51): declaring the {@code
 * /yaml-mount} mount used to switch the root routes.yaml off — every route of the root app answered
 * "Not found" — because the file was read only when NO mount was declared at all. Only a mount AT
 * the root owns it.
 */
class RootRoutesNextToMountsTest {

  private static ClassLoader fixtureOnly() {
    var url = RootRoutesNextToMountsTest.class.getResource("/root-routes-and-mount/");
    return new URLClassLoader(new java.net.URL[] {url}, null);
  }

  @Test
  void theRootRoutesYamlIsReadNextToANonRootMount() {
    var routes =
        new RouteRegistry()
            .authoredFrom(fixtureOnly()).routes().stream().map(RouteEntry::route).toList();
    assertThat(routes).anyMatch(route -> route.replaceAll("^/", "").equals("hello"));
    assertThat(routes).anyMatch(route -> route.replaceAll("^/", "").equals("yaml-mount/second"));
  }
}
