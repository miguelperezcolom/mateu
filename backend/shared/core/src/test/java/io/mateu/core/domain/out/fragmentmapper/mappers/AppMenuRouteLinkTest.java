package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A menu RouteLink authored with a {@code route} and no {@code path} — the YAML menu shape — goes
 * where it says. Deriving the path from the label only worked while label and route were the same
 * word ("People" → /people); "Virtual cloud networks" → /virtualCloudNetworks pointed the menu at a
 * route that does not exist.
 */
class AppMenuRouteLinkTest {

  private static RouteLink routeOnly(String route, String label) {
    return new RouteLink(
        null, route, label, null, false, null, null, false, false, null, null, null, null, null,
        false);
  }

  @Test
  void aRouteLinkWithOnlyARouteGoesToThatRoute() {
    var app = AppShell.builder().menu(List.of(routeOnly("vcns", "Virtual cloud networks"))).build();
    var menu = AppMenuDtoBuilder.buildMenu(app, "", "");
    assertThat(menu)
        .singleElement()
        .satisfies(
            o -> {
              assertThat(o.path()).isEqualTo("/vcns");
              assertThat(o.route()).isEqualTo("/vcns");
            });
  }

  @Test
  void anExplicitPathStillWins() {
    var app = AppShell.builder().menu(List.of(new RouteLink("/people", "People"))).build();
    assertThat(AppMenuDtoBuilder.buildMenu(app, "", ""))
        .singleElement()
        .satisfies(o -> assertThat(o.path()).isEqualTo("/people"));
  }
}
