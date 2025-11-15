package com.example.demo.infra.in.ui.fluent.triggers;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnSuccessTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route("/triggers/on-success")
public class OnSuccessTriggerPage implements ComponentTreeSupplier, ActionSupplier, TriggersSupplier, ActionHandler {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("On success trigger")
                .content(List.of(
                        Button.builder()
                                .actionId("server-call")
                                .label("Call to server")
                                .build(),
                        new Text("Call success should trigger a console log")
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("action")
                        .js("console.log('succeeded')")
                        .build()
        );
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnSuccessTrigger("action", "server-call", null)
        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return null;
    }
}
