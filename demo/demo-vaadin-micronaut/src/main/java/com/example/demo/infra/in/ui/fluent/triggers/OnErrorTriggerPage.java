package com.example.demo.infra.in.ui.fluent.triggers;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnErrorTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.SneakyThrows;

import java.util.List;

@Route("/fluent-app/triggers/on-error")
public class OnErrorTriggerPage implements ComponentTreeSupplier, ActionSupplier, TriggersSupplier, HandlesActions {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("On error trigger")
                .content(List.of(
                        Button.builder()
                                .actionId("server-call")
                                .label("Call to server")
                                .build(),
                        new Text("Call error should trigger a console log")
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("action")
                        .js("console.log('failed')")
                        .build()
        );
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnErrorTrigger("action", "server-call", null)
        );
    }

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        throw new Exception("An error");
    }
}
