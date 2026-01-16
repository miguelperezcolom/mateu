package com.example.demo.infra.in.ui.fluent.data;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Route(value="/data/component-state", parentRoute="^$")
public class ComponentStatePage implements ComponentTreeSupplier, ActionHandler {

    String name = "Mateu";

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Component state")
                .content(List.of(
                        Text.builder()
                                .text("${JSON.stringify(state)}")
                                .build(),
                        Button.builder()
                                .id("change-state")
                                .label("Change state")
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        var value = UUID.randomUUID().toString();
        value = value.substring(value.length() - 8);
        return new State(Map.of("something", value));
    }
}
