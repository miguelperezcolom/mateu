package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.ContentLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.TextComponent;
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
                .variant(AppVariant.MENU_ON_TOP)
                .menu(List.of(
                        new RouteLink("/fluent-app/home", "Home"),
                        new RouteLink("/fluent-app/form1", "Form 1"),
                        new RouteLink("/fluent-app/page2", "Page 2", true),
                        new ContentLink("/fluent-app/content0", "Content 0", (rq) -> new TextComponent("Hola 0")),
                        new RouteLink("/fluent-app/nested-app", "Nested 0"),
                        new Menu("Page 3", List.of(
                                new ContentLink("/fluent-app/content1", "Content 1", (rq) -> new TextComponent("Hola 1")),
                                new ContentLink("/fluent-app/content2", "Content 2", (rq) -> new TextComponent("Hola 2")),
                                new Menu("Page 4", List.of(
                                        new ContentLink("/fluent-app/content3", "Content 3", (rq) -> new TextComponent("Hola 3")),
                                        new ContentLink("/fluent-app/content4", "Content 4", (rq) -> new TextComponent("Hola 4"))
                                ))
                        ))
                ))
                .build();
    }
}
