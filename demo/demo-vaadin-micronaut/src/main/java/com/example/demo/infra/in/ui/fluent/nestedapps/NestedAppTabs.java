package com.example.demo.infra.in.ui.fluent.nestedapps;

import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/nested-apps/tabs")
@HomeRoute("/nested-apps/tabs/home")
public class NestedAppTabs implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Nested fluent app")
                .title("Nested")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.TABS)
                .menu(List.of(
                        new RouteLink("/nested-apps/tabs/home", "Home"),
                        new RouteLink("/nested-apps/tabs/page1", "Page 1")
                ))
                .build();
    }
}
