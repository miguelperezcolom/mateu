package com.example.demo.infra.in.ui.declarative;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.PageTitleSupplier;

@MateuUI("/declarative")
public class DeclarativeUI implements PageTitleSupplier, HomeRouteSupplier {

    @Override
    public String pageTitle() {
        return "Declarative";
    }

    @Override
    public String homeRoute() {
        return "/app";
    }
}
