package com.example.demo.infra.in.ui.fluent.forms;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Binding;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import lombok.Getter;
import reactor.core.publisher.Mono;

import java.util.List;

@Route("/fluent-app/forms/counter1")
@Serdeable
public class Counter1 implements ComponentTreeSupplier, HandlesActions {

    int count = 0;

    @Override
    public Component getComponent(HttpRequest httpRequest) {
        return VerticalLayout.builder()
                .content(List.of(
                                new Text("" + count),
                        Button.builder()
                                .label("Increment")
                                .actionId("increment")
                                .build()
                ))
                .build();
    }

    @Override
    public boolean supportsAction(String actionId) {
        return !"create".equals(actionId);
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
        count++;
        return Mono.just(this);
    }

    // micronaut's serialization does not like lombok's @Getter and @Setter
    public int getCount() {
        return count;
    }
    public void setCount(int count) {
        this.count = count;
    }

}