package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.RouteEntry;
import java.net.URLClassLoader;
import org.junit.jupiter.api.Test;

/**
 * The derived half of the route table comes straight from the annotation processor's index (a route
 * and the class answering it), the app list merges it with the {@code type: UI} mounts — a DSL
 * mount replacing a class at the same base path — and a route file tagged with a base path no mount
 * owns is still applied (it resolves as an absolute path).
 */
class RouteRegistryIndexTest {

  private final RouteRegistry registry = new RouteRegistry();

  private static ClassLoader fixture() {
    var url = RouteRegistryIndexTest.class.getResource("/s1-route-index/");
    return new URLClassLoader(new java.net.URL[] {url}, null);
  }

  @Test
  void theIndexIsTheDerivedRouteTable() {
    var derived = registry.derivedFrom(fixture());
    assertThat(derived.routes())
        .extracting(RouteEntry::route, RouteEntry::viewModel)
        .contains(
            org.assertj.core.groups.Tuple.tuple("shop", "com.acme.Shop"),
            org.assertj.core.groups.Tuple.tuple("orders", "com.acme.Orders"));
    assertThat(registry.derivedFrom(fixture()).match("/orders"))
        .hasValueSatisfying(m -> assertThat(m.entry().viewModel()).isEqualTo("com.acme.Orders"));
  }

  @Test
  void aDslMountReplacesTheClassAtItsBasePathInTheAppList() {
    var apps = registry.appsFrom(fixture());
    var byRoute = new java.util.LinkedHashMap<String, RouteRegistry.AppRef>();
    apps.forEach(app -> byRoute.put(app.route(), app));

    assertThat(byRoute.get("shop").className()).isEqualTo("com.acme.Shop");
    assertThat(byRoute.get("shop").isDsl()).isFalse();
    var backOffice = byRoute.get("back-office");
    assertThat(backOffice.isDsl()).isTrue();
    assertThat(backOffice.definition()).isEqualTo("back-office-shell.yaml");
  }

  @Test
  void aRouteFileWithAnUnknownBasePathIsStillApplied() {
    var table = registry.load(fixture());
    assertThat(table.match("/shp/specials"))
        .hasValueSatisfying(m -> assertThat(m.entry().viewModel()).isEqualTo("com.acme.Specials"));
    assertThat(table.match("/back-office/reports"))
        .hasValueSatisfying(m -> assertThat(m.entry().definition()).isEqualTo("reports.yaml"));
  }
}
