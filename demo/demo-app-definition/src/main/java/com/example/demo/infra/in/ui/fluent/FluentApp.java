package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app")
public class FluentApp implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Fluent app")
                .title("Antonia")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.MENU_ON_LEFT)
                .menu(List.of(
                        new Menu("Home", new RouteLink("/fluent-app/home"), true),
                        new Menu("Page 1", new RouteLink("/fluent-app/page1")),
                        new Menu("Page 2", new RouteLink("/fluent-app/page2"))
                ))
                .build();
    }
}
