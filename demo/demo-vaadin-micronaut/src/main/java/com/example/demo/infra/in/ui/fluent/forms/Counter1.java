package com.example.demo.infra.in.ui.fluent.forms;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import reactor.core.publisher.Flux;

import java.util.List;

@Route("/forms/counter1")
@Schema
public class Counter1 implements ComponentTreeSupplier, ActionHandler {

    int count = 0;

    @Override
    public Component component(HttpRequest httpRequest) {
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
        return !"".equals(actionId);
    }

    @Override
    public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
        count++;
        return Flux.just(this);
    }


    // required for micronaut
    public int getCount() {
        return count;
    }

    public void setCount(int count) {
        this.count = count;
    }
}