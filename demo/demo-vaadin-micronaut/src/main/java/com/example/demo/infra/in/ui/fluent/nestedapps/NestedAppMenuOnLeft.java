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

@Route(value="/components/high-level/nested-apps/left", parentRoute = "")
public class NestedAppMenuOnLeft implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Nested fluent app")
                .title("Nested")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.MENU_ON_LEFT)
                .homeRoute("/components/high-level/nested-apps/left/home")
                .menu(List.of(
                        new RouteLink("/home", "Home"),
                        new RouteLink("/page1", "Page 1"),
                        new Menu("/submenu","Submenu", List.of(
                                new RouteLink("/home", "Home"),
                                new RouteLink("/page1", "Page 1")
                                ))
                ))
                .build();
    }
}
