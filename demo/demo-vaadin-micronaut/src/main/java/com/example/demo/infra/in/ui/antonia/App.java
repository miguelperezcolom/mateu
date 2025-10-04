package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/app")
public class App implements PageTitleSupplier, MenuSupplier, HomeRouteSupplier, io.mateu.uidl.interfaces.App {

    @Override
    public String pageTitle() {
        return "Antonia";
    }


    @Override
    public List<Actionable> menu(HttpRequest httpRequest) {
        return List.of(
                new RouteLink("/app/home", "Home", true),
                new RouteLink("/app/page1", "Page 1"),
                new RouteLink("/app/page2", "Page 2")
        );
    }

    @Override
    public String homeRoute() {
        return "/app/home";
    }
}
