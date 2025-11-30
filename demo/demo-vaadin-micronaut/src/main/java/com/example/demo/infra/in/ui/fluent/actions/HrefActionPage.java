package com.example.demo.infra.in.ui.fluent.actions;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/actions/href", parentRoute="^$")
public class HrefActionPage implements ComponentTreeSupplier, ActionSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Href (go to external url) action")
                .content(List.of(
                        Button.builder()
                                .actionId("xx")
                                .label("Go to Google")
                                .build()
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("xx")
                        .href("https://www.google.es")
                        .build()
        );
    }
}
