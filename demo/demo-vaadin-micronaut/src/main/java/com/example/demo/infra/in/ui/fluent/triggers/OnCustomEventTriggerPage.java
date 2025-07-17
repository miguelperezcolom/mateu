package com.example.demo.infra.in.ui.fluent.triggers;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/fluent-app/triggers/on-custom-event")
public class OnCustomEventTriggerPage implements ComponentTreeSupplier {
    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("On custom event trigger")
                .content(List.of(
                ))
                .build();
    }
}
