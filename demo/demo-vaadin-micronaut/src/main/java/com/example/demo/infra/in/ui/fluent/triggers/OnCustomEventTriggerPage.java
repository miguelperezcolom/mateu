package com.example.demo.infra.in.ui.fluent.triggers;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Element;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/triggers/on-custom-event")
public class OnCustomEventTriggerPage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("On custom event trigger")
                .content(List.of(
                        new Element("div", Map.of(), "Please look at <a href='../actions/custom-event'>Custom events</a>.")
                ))
                .build();
    }
}
