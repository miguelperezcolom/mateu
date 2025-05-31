package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.RouteTarget;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.HasHomeRoute;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HasPageTitle;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/app")
public class App implements HasPageTitle, HasMenu, HasHomeRoute, io.mateu.uidl.interfaces.App {

    @Override
    public String getPageTitle() {
        return "Antonia";
    }


    @Override
    public List<Actionable> createMenu(HttpRequest httpRequest) {
        return List.of(
                new RouteLink("/app/home", "Home", true),
                new RouteLink("/app/page1", "Page 1"),
                new RouteLink("/app/page2", "Page 2")
        );
    }

    @Override
    public String getHomeRoute() {
        return "/app/home";
    }
}
