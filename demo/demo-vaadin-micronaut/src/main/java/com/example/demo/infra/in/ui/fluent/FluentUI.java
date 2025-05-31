package com.example.demo.infra.in.ui.fluent;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.fluent.UI;
import io.mateu.uidl.fluent.UISupplier;
import io.mateu.uidl.interfaces.HttpRequest;

@MateuUI("/fluent")
public class FluentUI implements UISupplier {
    @Override
    public UI getUI(HttpRequest httpRequest) {
        return UI.builder()
                .pageTitle("Fluent UI")
                .homeRoute("/fluent-app")
                .build();
    }
}
