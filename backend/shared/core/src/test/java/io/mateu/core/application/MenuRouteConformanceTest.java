package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.MenuOptionDto;
import io.mateu.dtos.RuleDto;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.data.RouteTable;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A menu leaf that points at a route which resolves to nothing is a bug — the safety a typed-class
 * {@code @Menu} reference used to give at compile time. {@link MenuRouteConformance} finds those so
 * a CI/conformance check can fail on them instead of the app deriving a dead link silently.
 */
class MenuRouteConformanceTest {

  private static final RouteTable KNOWN =
      new RouteTable(List.of(RouteEntry.of("products", "X"), RouteEntry.of("orders/:id", "Y")));

  private static MenuOptionDto leaf(String label, String route) {
    return MenuOptionDto.builder().label(label).route(route).build();
  }

  @Test
  void aLeafPointingAtAKnownRouteIsFine() {
    var dangling =
        MenuRouteConformance.danglingRoutes(List.of(leaf("Products", "products")), KNOWN);
    assertThat(dangling).isEmpty();
  }

  @Test
  void aLeafPointingAtANonexistentRouteIsFlagged() {
    var menu = List.of(leaf("Products", "products"), leaf("Ghost", "does-not-exist"));
    assertThat(MenuRouteConformance.danglingRoutes(menu, KNOWN)).containsExactly("does-not-exist");
  }

  @Test
  void parameterisedRoutesResolve() {
    assertThat(MenuRouteConformance.danglingRoutes(List.of(leaf("Order", "orders/42")), KNOWN))
        .isEmpty();
  }

  @Test
  void ruleSeparatorRemoteExternalAndPlaceholderLeavesAreSkipped() {
    var rule =
        MenuOptionDto.builder()
            .label("Ping")
            .route("whatever")
            .rules(List.of(RuleDto.builder().actionId("x").build()))
            .build();
    var separator = MenuOptionDto.builder().separator(true).build();
    var remote = MenuOptionDto.builder().label("Remote").route("remote/x").remote(true).build();
    var external = leaf("Docs", "https://mateu.io/docs");
    var placeholder = MenuOptionDto.builder().label("Section").build();

    assertThat(
            MenuRouteConformance.danglingRoutes(
                List.of(rule, separator, remote, external, placeholder), KNOWN))
        .isEmpty();
  }

  @Test
  void recursesIntoSubmenus() {
    var group =
        MenuOptionDto.builder()
            .label("Group")
            .submenus(List.of(leaf("Products", "products"), leaf("Ghost", "nope")))
            .build();
    assertThat(MenuRouteConformance.danglingRoutes(List.of(group), KNOWN)).containsExactly("nope");
  }
}
