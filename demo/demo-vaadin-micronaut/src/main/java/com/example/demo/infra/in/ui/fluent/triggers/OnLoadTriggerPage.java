package com.example.demo.infra.in.ui.fluent.triggers;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/triggers/on-load", parentRoute="^$")
public class OnLoadTriggerPage implements ComponentTreeSupplier, ActionSupplier, TriggersSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("On load trigger")
                .content(List.of(
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("action")
                        .js("alert('loaded!')")
                        .build()
        );
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnLoadTrigger("action", 0, 0, null)
        );
    }

}