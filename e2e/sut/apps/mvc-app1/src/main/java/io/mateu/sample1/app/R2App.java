package io.mateu.sample1.app;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * A multi-screen app whose home is a DISTINCT Screen ({@link R2HomeScreen}), not the app itself
 * (coherence-plan #5, R2). Loading /r2home mounts R2HomeScreen in the content slot; the app renders
 * only the chrome. Backs the R2 e2e (app-not-home.spec.ts).
 */
@UI("/r2home")
@Title("R2 app")
public class R2App implements HomeRouteSupplier {

  @Menu String screen = "/r2home/screen";

  @Override
  public String homeRoute() {
    return "/r2home/screen";
  }
}
