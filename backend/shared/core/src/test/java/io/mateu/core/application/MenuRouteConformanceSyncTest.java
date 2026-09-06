package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.application.runaction.RouteRegistry;
import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RuleDto;
import io.mateu.uidl.data.RouteTable;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * The conformance gate wired to REAL route loading — the CI form of {@link MenuRouteConformance}.
 * The dangling risk the unified menu-leaf model introduces is an AUTHORED (DSL/AppShell) leaf: it
 * carries a plain route STRING, so its wire route IS the literal target and it can point nowhere,
 * exactly the safety a typed-class {@code @Menu} reference used to give at compile time (the class
 * had to exist). A reflective {@code @Menu} field cannot dangle by construction — its wire route is
 * composed app-internally from the field and resolves through the app's own menu — so the failure
 * mode to guard is the authored one, checked here against a route table loaded from real YAML by
 * the live {@link RouteRegistry}. The pure-logic unit tests live in {@code
 * MenuRouteConformanceTest}.
 */
class MenuRouteConformanceSyncTest {

  /**
   * The merged table the deployment actually resolves against, loaded from the test fixture YAML.
   */
  private RouteTable knownRoutes() {
    return new RouteRegistry().authoredFrom(getClass().getClassLoader());
  }

  private static MenuOptionDto leaf(String label, String route) {
    return MenuOptionDto.builder().label(label).route(route).build();
  }

  @Test
  void anAuthoredLeafPointingAtARouteNoOneServesIsFlaggedAgainstTheRealTable() {
    // "orders" is in the fixture routes.yaml; "does-not-exist" is not.
    var menu = List.of(leaf("Orders", "orders"), leaf("Ghost", "does-not-exist"));

    var dangling = MenuRouteConformance.danglingRoutes(menu, knownRoutes());

    assertThat(dangling).containsExactly("does-not-exist");
  }

  @Test
  void aMenuWhoseAuthoredLeavesAllResolveIsClean() {
    var menu =
        List.of(
            leaf("Orders", "orders"),
            leaf("About", "about"),
            leaf("Pending", "orders/pending"),
            // a rule leaf never navigates, so a made-up route on it is not a dangling link
            MenuOptionDto.builder()
                .label("Ping")
                .route("whatever")
                .rules(List.of(RuleDto.builder().actionId("x").build()))
                .build());

    assertThat(MenuRouteConformance.danglingRoutes(menu, knownRoutes())).isEmpty();
  }
}
