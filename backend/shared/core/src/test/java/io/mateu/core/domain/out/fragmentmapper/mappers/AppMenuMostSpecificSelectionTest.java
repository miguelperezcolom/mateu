package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * One place is selected in the menu: the entry matching the route most specifically (exact, else
 * the longest prefix) and the groups holding it. An entry matches every route below its own, so on
 * {@code /orders/pending} «Open orders» ({@code /orders}) used to stay selected beside «Pending».
 */
class AppMenuMostSpecificSelectionTest {

  private static AppShell app(List<Actionable> menu) {
    return AppShell.builder().menu(menu).build();
  }

  private static final List<Actionable> ORDERS =
      List.of(new RouteLink("/orders", "Open orders"), new RouteLink("/orders/pending", "Pending"));

  private static MenuOptionDto entry(List<MenuOptionDto> menu, String label) {
    for (var option : menu) {
      if (label.equals(option.label())) {
        return option;
      }
      for (var child : option.submenus()) {
        if (label.equals(child.label())) {
          return child;
        }
      }
    }
    throw new AssertionError("no entry " + label);
  }

  @Test
  void theLongerMatchWinsOverAPrefix() {
    var menu = AppMenuDtoBuilder.buildMenu(app(ORDERS), "/orders/pending", "");
    assertThat(entry(menu, "Pending").selected()).isTrue();
    assertThat(entry(menu, "Open orders").selected()).isFalse();
  }

  @Test
  void aPrefixStillSelectsTheEntryWhenNothingLongerMatches() {
    // a record opened from the listing keeps its entry selected
    var menu = AppMenuDtoBuilder.buildMenu(app(ORDERS), "/orders/42", "");
    assertThat(entry(menu, "Open orders").selected()).isTrue();
    assertThat(entry(menu, "Pending").selected()).isFalse();
  }

  @Test
  void theQueryIsNotPartOfTheRoute() {
    var menu = AppMenuDtoBuilder.buildMenu(app(ORDERS), "/orders/pending?status=archived", "");
    assertThat(entry(menu, "Pending").selected()).isTrue();
    assertThat(entry(menu, "Open orders").selected()).isFalse();
  }

  @Test
  void entriesSpelledWithTheMountAreComparedBelowIt() {
    // a class-declared non-root mount (@UI("/shop")): the request route is mount-relative, an
    // entry authored with the full path (/shop/orders/pending) is the same place
    List<Actionable> menu =
        List.of(
            new RouteLink("/shop/orders", "Open orders"),
            new RouteLink("/shop/orders/pending", "Pending"));
    var built = AppMenuDtoBuilder.buildMenu(app(menu), "/orders/pending", "", "/shop");
    assertThat(entry(built, "Pending").selected()).isTrue();
    assertThat(entry(built, "Open orders").selected()).isFalse();
  }

  @Test
  void theGroupHoldingTheMostSpecificEntryStaysSelected() {
    List<Actionable> menu =
        List.of(new Menu("/sales", "Sales", ORDERS), new RouteLink("/customers", "Customers"));
    var built = AppMenuDtoBuilder.buildMenu(app(menu), "/sales/orders/pending", "");
    assertThat(entry(built, "Sales").selected()).isTrue();
    assertThat(entry(built, "Pending").selected()).isTrue();
    assertThat(entry(built, "Open orders").selected()).isFalse();
    assertThat(entry(built, "Customers").selected()).isFalse();
  }
}
