package com.example.demo.infra.in.ui.imperative;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HasHomeRoute;
import io.mateu.uidl.interfaces.HasPageTitle;

@MateuUI("/imperative")
public class ImperativeUI implements HasPageTitle, HasHomeRoute {

    @Override
    public String getPageTitle() {
        return "Antonia";
    }

    @Override
    public String getHomeRoute() {
        return "/app";
    }
}
