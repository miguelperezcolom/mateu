package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.PageTitleSupplier;

@MateuUI("/antonia")
public class AntoniaApp implements PageTitleSupplier, HomeRouteSupplier {

    @Override
    public String pageTitle() {
        return "Antonia";
    }

    @Override
    public String homeRoute() {
        return "/app";
    }
}
