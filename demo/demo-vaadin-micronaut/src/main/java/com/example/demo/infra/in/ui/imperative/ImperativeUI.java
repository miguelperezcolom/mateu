package com.example.demo.infra.in.ui.imperative;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.PageTitleSupplier;

@MateuUI("/imperative")
public class ImperativeUI implements PageTitleSupplier, HomeRouteSupplier {

    @Override
    public String pageTitle() {
        return "Antonia";
    }

    @Override
    public String homeRoute() {
        return "/app";
    }
}
