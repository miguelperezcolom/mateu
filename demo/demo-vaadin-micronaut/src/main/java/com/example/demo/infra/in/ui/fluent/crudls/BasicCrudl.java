package com.example.demo.infra.in.ui.fluent.crudls;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

import java.util.List;

@Route("/fluent-app/crudls/basic")
public class BasicCrudl implements ComponentTreeSupplier, HandlesActions {



    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder() // vertical layout as default container for children
                .title("Basic crudl")
                .footer(List.of()) // will be placed in footer, between left and right side buttons
                .build();
    }

    @Override
    public boolean supportsAction(String actionId) {
        return !"create".equals(actionId);
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {

        System.out.println("received action: " + actionId);


        return Mono.just("hola");
    }
}
