package io.mateu.core.domain.out.fragmentmapper.mappers;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.dtos.MenuOptionDto;
import io.mateu.uidl.data.FieldLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.interfaces.Actionable;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * A {@code @Menu} field named like the menu that holds it — {@code users} inside a {@code users}
 * group, the natural spelling of a users CRUD in a "Users" section — is a child that shares the
 * name, not the group itself. It used to get the group's path ({@code /users}): its screen was
 * never reached (the route landed on the group's index) and, since every route of the group starts
 * with it, it was selected on all of them.
 */
class AppMenuLeafNamedLikeItsGroupTest {

  static class Holder {
    Object permissions;
    Object users;
  }

  private static AppShell app() {
    List<Actionable> entries =
        List.of(
            new FieldLink("/permissions", "Permissions", Holder.class, "permissions"),
            new FieldLink("/users", "Users", Holder.class, "users"));
    return AppShell.builder().menu(List.of(new Menu("/users", "Usuarios", entries))).build();
  }

  private static MenuOptionDto entry(List<MenuOptionDto> menu, String label) {
    return menu.getFirst().submenus().stream()
        .filter(o -> label.equals(o.label()))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void theLeafGoesBelowItsGroup() {
    var menu = AppMenuDtoBuilder.buildMenu(app(), "", "");
    assertThat(entry(menu, "Users").path()).isEqualTo("/users/users");
    assertThat(entry(menu, "Users").route()).isEqualTo("/users/users");
    assertThat(entry(menu, "Permissions").path()).isEqualTo("/users/permissions");
  }

  @Test
  void onlyTheEntryOfTheRouteIsSelected() {
    var menu = AppMenuDtoBuilder.buildMenu(app(), "/users/permissions", "");
    assertThat(entry(menu, "Permissions").selected()).isTrue();
    assertThat(entry(menu, "Users").selected()).isFalse();

    var onUsers = AppMenuDtoBuilder.buildMenu(app(), "/users/users", "");
    assertThat(entry(onUsers, "Users").selected()).isTrue();
    assertThat(entry(onUsers, "Permissions").selected()).isFalse();
  }

  @Test
  void anEntryAlreadyUnderItsGroupIsStillRoutedOnce() {
    List<Actionable> entries = List.of(new FieldLink("/users/roles", "Roles", Holder.class, "x"));
    var app = AppShell.builder().menu(List.of(new Menu("/users", "Usuarios", entries))).build();
    var menu = AppMenuDtoBuilder.buildMenu(app, "", "");
    assertThat(entry(menu, "Roles").path()).isEqualTo("/users/roles");
  }
}
