package com.example.demo.antonia;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.data.GoToRoute;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteTarget;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.HasHomeRoute;
import io.mateu.uidl.interfaces.HasMenu;
import io.mateu.uidl.interfaces.HasPageTitle;
import io.mateu.uidl.interfaces.HasTitle;

import java.util.List;

@MateuUI("/antonia")
public class AntoniaApp implements HasPageTitle, HasHomeRoute {

    @Override
    public String getPageTitle() {
        return "Antonia";
    }

    @Override
    public String getHomeRoute() {
        return "/app";
    }
}
