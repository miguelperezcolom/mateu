package com.example.demo.infra.in.ui.fluent.actions;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.SneakyThrows;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/actions/confirmation-required")
public class ConfirmationRequiredActionPage implements ComponentTreeSupplier, ActionSupplier, ActionHandler {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Run action in foreground")
                .content(List.of(
                        VerticalLayout.builder()
                                .content(List.of(

                                        Text.builder()
                                                .text("${state.count}")
                                                .build(),

                                        Button.builder()
                                                .actionId("action")
                                                .label("Count")
                                                .build()
                                ))
                                .spacing(true)
                                .build()
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(Action.builder()
                .id("action")
                        .confirmationRequired(true)
                        .confirmationTexts(new ConfirmationTexts("title", "message", "confirmation-text", "denial-text"))
                .build());
    }

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return new State(Map.of("count", httpRequest.getInt("count") + 1));
    }
}