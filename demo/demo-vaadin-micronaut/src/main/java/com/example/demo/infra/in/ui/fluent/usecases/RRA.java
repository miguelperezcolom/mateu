package com.example.demo.infra.in.ui.fluent.usecases;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.MenuSeparator;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.App;
import io.mateu.uidl.fluent.AppSupplier;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/use-cases/rra")
public class RRA implements AppSupplier {

    @Override
    public App getApp(HttpRequest httpRequest) {
        return App.builder()
                .variant(AppVariant.TABS)
                .cssClasses("tabs-at-bottom")
                .menu(List.of(
                        RouteLink.builder()
                                .route("/fluent-app/use-cases/rra/home")
                                .label("Home")
                                .build(),
                        RouteLink.builder()
                                .route("/fluent-app/use-cases/rra/orders")
                                .label("Orders")
                                .build(),
                        RouteLink.builder()
                                .route("/fluent-app/use-cases/rra/inventory")
                                .label("Inventory")
                                .build(),
                        RouteLink.builder()
                                .route("/fluent-app/use-cases/rra/training")
                                .label("Training")
                                .build()
                ))
                .build();
    }

    @Override
    public String style() {
        return "width: 100%; height: calc(100vh - 58px);";
    }

    @Override
    public String cssClasses() {
        return "tabs-at-bottom";
    }
}
