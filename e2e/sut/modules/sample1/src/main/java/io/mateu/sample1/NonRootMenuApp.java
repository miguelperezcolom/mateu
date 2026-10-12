package io.mateu.sample1;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.Submenu;

/**
 * A NON-ROOT app whose menu entries are typed with PAGE classes (view models), plus a nested group
 * and a route-typed entry whose field name differs from the route it names. Backs
 * nonroot-menu.spec.ts: menu click, deep link and reload must land on the page instead of
 * reloading the shell.
 */
@UI("/e2-demo")
@Title("E2 demo")
@App(AppVariant.MENU_ON_TOP)
public class NonRootMenuApp {

  public static class Reports implements Submenu {
    @Menu Section2 monthly;
  }

  @Menu Section1 page;

  @Menu Reports reports;

  @Menu ValidationForm validation;

  @Menu String routedPage = "/e2-demo/routed-page";
}
