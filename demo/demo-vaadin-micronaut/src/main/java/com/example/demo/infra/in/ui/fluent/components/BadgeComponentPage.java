package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.BadgeColor;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/badge")
public class BadgeComponentPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Badge")
                .content(List.of(
                        Badge.builder()
                                .text("Hola")
                                .pill(true)
                                .primary(true)
                                .color(BadgeColor.success)
                                .build(),
                        Badge.builder()
                                .text("Hola")
                                .color(BadgeColor.error)
                                .small(true)
                                .build()
                ))
                .build();
    }
}
