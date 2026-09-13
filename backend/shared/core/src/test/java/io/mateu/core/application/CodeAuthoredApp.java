package io.mateu.core.application;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleLink;
import io.mateu.uidl.fluent.AppShell;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * An app whose shell and menu are composed IN CODE via {@link AppSupplier}, exercised by {@link
 * AppSupplierSyncTest}. The menu mixes the two leaf kinds (a route link and a rule link) and a
 * submenu, all built fluently — no {@code @Menu}/{@code @App} annotations.
 */
@UI("/codeapp")
public class CodeAuthoredApp implements AppSupplier {

  @Override
  public AppShell getApp(HttpRequest httpRequest) {
    return AppShell.builder()
        .title("Code App")
        .homeRoute("/codeapp/home")
        .menu(
            List.of(
                new RouteLink("/codeapp/home", "Home"),
                new Menu(
                    "/codeapp/reports",
                    "Reports",
                    List.of(new RouteLink("/codeapp/reports/sales", "Sales"))),
                new RuleLink("Approve", List.of(Rule.builder().actionId("approve").build()))))
        .build();
  }
}
