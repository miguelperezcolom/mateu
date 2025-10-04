package com.example.demo.infra.in.ui.imperative;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.MenuSupplier;
import io.mateu.uidl.interfaces.PageTitleSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/app")
public class ImperativeApp implements PageTitleSupplier, MenuSupplier, HomeRouteSupplier, App {

    @Override
    public String pageTitle() {
        return "Antonia";
    }


    @Override
    public List<Actionable> menu(HttpRequest httpRequest) {
        return List.of(
                new RouteLink("/app/home", "Home", true),
                new RouteLink("/app/page1", "Page 1"),
                new RouteLink("/app/page2", "Page 2"),
                new Menu("Page 3", List.of(
                        new ContentLink("/app/content1", "Content 1", (rq) -> new Text("Hola 1")),
                        new ContentLink("/app/content2", "Content 2", (rq) -> new Text("Hola 2")),
                        new Menu("Page 4", List.of(
                                new ContentLink("/app/content3", "Content 3", (rq) -> new Text("Hola 3")),
                                new ContentLink("/app/content4", "Content 4", (rq) -> new Text("Hola 4"))
                        ))
                ))
        );
    }

    @Override
    public String homeRoute() {
        return "/app/home";
    }
}
