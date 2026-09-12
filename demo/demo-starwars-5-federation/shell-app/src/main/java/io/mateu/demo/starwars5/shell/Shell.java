package io.mateu.demo.starwars5.shell;

import io.mateu.demo.starwars5.characters.Characters;
import io.mateu.demo.starwars5.planets.Planets;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * The federation shell. Each {@code @Menu} field points at a {@code @UI} class that lives in a
 * SEPARATE module ({@code characters-ui}, {@code planets-ui}) — authored and built on its own, pulled
 * in as a Maven dependency. Mateu's two-step annotation processing generated their controllers from
 * the modules' {@code META-INF/mateu/ui-registrations} index; the shell only names them.
 */
@UI("")
@Title("Star Wars — federated shell")
@App
public class Shell implements HomeRouteSupplier {

  @Menu Characters characters;

  @Menu Planets planets;

  @Override
  public String homeRoute() {
    return "characters";
  }
}
