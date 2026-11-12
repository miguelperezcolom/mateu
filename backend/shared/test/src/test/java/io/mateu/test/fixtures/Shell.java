package io.mateu.test.fixtures;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/** The starter's shell. */
@UI("")
@Title("My app")
public class Shell implements HomeRouteSupplier {

  @Menu Home home;

  @Menu Products products;

  @Menu Greeting greeting;

  @Override
  public String homeRoute() {
    return "home";
  }
}
