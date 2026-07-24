package io.mateu.redwoodvb.ui;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/**
 * Fase 2 — the application shell. {@code @App} + three {@code @Menu} entries. Loading the root route
 * returns the App metadata (menu → the VB navigator); clicking an entry loads that screen's route as
 * content, without reloading the shell.
 */
@UI("")
@Title("Mateu on Visual Builder")
@App(value = AppVariant.MENU_ON_TOP, themeToggle = true)
public class RedwoodVbApp {
  @Menu Home home;
  @Menu Reports reports;
  @Menu Settings settings;
}
