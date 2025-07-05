package com.example.demo.infra.in.ui.fluent.forms;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import reactor.core.publisher.Mono;

import java.util.List;

@Route("/fluent-app/forms/counter2")
@Serdeable
public class Counter2 implements ComponentTreeSupplier {

    int count = 0;

    @Override
    public Component getComponent(HttpRequest httpRequest) {
        return new VerticalLayout(
                new Text("${data.count}"),
                new Button("Increment", (Runnable) () -> count++)
        );
    }

    // micronaut's serialization does not like lombok's @Getter and @Setter
    public int getCount() {
        return count;
    }
    public void setCount(int count) {
        this.count = count;
    }

}