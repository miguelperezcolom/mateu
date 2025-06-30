package com.example.demo.infra.in.ui.fluent.components;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.MicroFrontend;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/components/micro-frontend")
public class MicroFrontendComponentPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Micro frontend")
                .content(List.of(
                        MicroFrontend.builder()
                                .baseUrl("/fluent")
                                .route("/fluent-app/components/card")
                                .consumedRoute("/fluent-app")
                                .build()
                ))
                .build();
    }
}
