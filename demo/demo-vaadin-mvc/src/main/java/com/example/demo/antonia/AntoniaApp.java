package com.example.demo.antonia;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HasHomeRoute;
import io.mateu.uidl.interfaces.HasPageTitle;

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
