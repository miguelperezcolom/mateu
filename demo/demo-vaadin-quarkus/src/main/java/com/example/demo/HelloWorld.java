package com.example.demo;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

@MateuUI("/helloworld")
public class HelloWorld implements HandlesRoute, HandlesActions {
    @Override
    public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
        return Mono.just(this);
    }

    @Override
    public boolean supportsAction(String actionId) {
        return true;
    }

    @Override
    public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
        return Mono.just(this);
    }
}
