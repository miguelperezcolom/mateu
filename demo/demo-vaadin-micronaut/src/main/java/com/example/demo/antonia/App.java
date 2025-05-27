package com.example.demo.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteTarget;
import io.mateu.uidl.interfaces.HasHomeRoute;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HasPageTitle;
import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

@Route("/app")
@Serdeable
public class App implements HasPageTitle, HasMenu, HasHomeRoute, io.mateu.uidl.interfaces.App {

    @Override
    public String getPageTitle() {
        return "Antonia";
    }


    @Override
    public List<Menu> createMenu() {
        return List.of(
                new Menu("Home", new RouteLink("/app/home", RouteTarget.Top), List.of(), true),
                new Menu("Page 1", new RouteLink("/app/page1", RouteTarget.Top), List.of(), false),
                new Menu("Page 2", new RouteLink("/app/page2", RouteTarget.Top), List.of(), false)
        );
    }

    @Override
    public String getHomeRoute() {
        return "/app/home";
    }
}
