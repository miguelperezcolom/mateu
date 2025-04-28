package com.example.components;

import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public class UsingInterfacesComponent implements HandlesActions {
    @Override
    public boolean supports(String actionId) {
        return "sayHello".equals(actionId);
    }

    @Override
    public Mono<?> handle(String actionId, HttpRequest httpRequest) {
        return Mono.just("Hola");
    }
}
