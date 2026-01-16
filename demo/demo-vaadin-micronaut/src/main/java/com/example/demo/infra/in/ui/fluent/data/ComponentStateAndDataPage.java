package com.example.demo.infra.in.ui.fluent.data;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Route(value="/data/component-state-and-data", parentRoute="^$")
public class ComponentStateAndDataPage implements ComponentTreeSupplier, ActionHandler {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Component state and data")
                .content(List.of(
                        Text.builder()
                                .text("${JSON.stringify(state)}")
                                .build(),
                        Text.builder()
                                .text("${JSON.stringify(data)}")
                                .build(),
                        Button.builder()
                                .actionId("change-state")
                                .label("Change state")
                                .build(),
                        Button.builder()
                                .actionId("change-data")
                                .label("Change data")
                                .build()
                ))
                .build();
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        var value = UUID.randomUUID().toString();
        value = value.substring(value.length() - 8);
        if ("change-state".equals(actionId)) {
            return new State(Map.of("something", value));
        }
        return new Data(Map.of("something", value));
    }
}
