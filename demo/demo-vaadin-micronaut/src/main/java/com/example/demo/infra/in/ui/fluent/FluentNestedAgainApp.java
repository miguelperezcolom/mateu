package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/nested-app/nested-app")
public class FluentNestedAgainApp implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .pageTitle("Nested fluent app")
                .title("Nested")
                .subtitle("This is the subtitle bla, bla, bla")
                .variant(AppVariant.TABS)
                .menu(List.of(
                        new RouteLink("/fluent-app/nested-app/nested-app/home", "Home"),
                        new RouteLink("/fluent-app/nested-app/nested-app/page1", "Page 1")
                ))
                .build();
    }
}
