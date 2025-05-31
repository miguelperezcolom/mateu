package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HasHomeRoute;
import io.mateu.uidl.interfaces.HasPageTitle;

@MateuUI("/declarative")
public class DeclarativeUI implements HasPageTitle, HasHomeRoute {

    @Override
    public String getPageTitle() {
        return "Antonia";
    }

    @Override
    public String getHomeRoute() {
        return "/app";
    }
}
