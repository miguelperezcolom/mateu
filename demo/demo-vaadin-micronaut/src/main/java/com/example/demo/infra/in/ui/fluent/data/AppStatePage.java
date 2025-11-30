package com.example.demo.infra.in.ui.fluent.data;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.AppState;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
class NestedAppStateForm implements ComponentTreeSupplier, ActionHandler {

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        log.info("app state is {}", httpRequest.getAppState(Map.class));
        if ("set-random-tenant-id".equals(actionId)) {
            var appState = new HashMap<>(httpRequest.getAppState(Map.class));
            var config = new HashMap<>((Map) appState.getOrDefault("config", new HashMap<>()));
            config.put("tenantId", UUID.randomUUID().toString());
            appState.put("config", config);
            return new AppState(appState);
        }
        if ("noop".equals(actionId)) {
            return this;
        }
        return null;
    }


    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Nested form")
                .toolbar(List.of(
                        Button.builder()
                                .label("Set random tenant id")
                                .actionId("set-random-tenant-id")
                                .build(),
                        Button.builder()
                                .label("NOOP")
                                .actionId("noop")
                                .build()
                ))
                .content(List.of(
                        Text.builder()
                                .text("${JSON.stringify(appState)}")
                                .build()
                ))
                .build();
    }
}


@Slf4j
@Route(value="/data/app-state", parentRoute="^$")
public class AppStatePage implements ComponentTreeSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("App state")
                .content(List.of(
                        Text.builder()
                                .text("${JSON.stringify(appState)}")
                                .build(),
                        new NestedAppStateForm()
                ))
                .build();
    }

}
