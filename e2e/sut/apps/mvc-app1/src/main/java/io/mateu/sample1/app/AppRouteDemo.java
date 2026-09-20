package io.mateu.sample1.app;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * An app declared with the SINGLE {@code @App(route = "/x")} annotation (coherence-plan #5) — no
 * separate {@code @UI}. It IS an app and IS served at /appdemo; the framework AP generates its
 * controller from {@code @App}. Backs the app-route e2e (app-route.spec.ts).
 */
@App(route = "/appdemo")
@Title("App via @App route")
public class AppRouteDemo implements HomeRouteSupplier {

  @Menu String screen = "/appdemo/screen";

  @Override
  public String homeRoute() {
    return "/appdemo/screen";
  }
}
