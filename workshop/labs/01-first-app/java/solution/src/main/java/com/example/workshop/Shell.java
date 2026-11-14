package com.example.workshop;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * The app shell, mounted at the app root: the title and the menu around every screen. Each {@code
 * @Menu} field is a menu entry leading to that screen's route; {@link HomeRouteSupplier} names the
 * one the app opens on.
 */
@UI("")
@Title("Workshop")
public class Shell implements HomeRouteSupplier {

  @Menu Home home;

  @Menu Products products;

  // Workshop, lab 01: one field, one menu entry, one route (/quote).
  @Menu Quote quote;

  @Override
  public String homeRoute() {
    return "home";
  }
}
