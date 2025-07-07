package com.example.demo.infra.in.ui.fluent.forms;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.fluent.HasTriggers;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;

import java.util.List;

@Route("/fluent-app/forms/counter5")
public class Counter5 implements ComponentTreeSupplier, HasActions, HasTriggers {

    int count = 0;

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("increment")
                        .confirmationRequired(true)
                        .background(true)
                        .build()
        );
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnLoadTrigger("increment")
        );
    }

    @Override
    public Component getComponent(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${data.count}"),
                new Button("Increment", (Runnable) () -> count++)
        );
    }

}