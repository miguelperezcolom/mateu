package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@MateuUI("")
public class HelloWorld implements HandlesRoute, ReactiveHandlesActions, HasTitle, HasSubtitle, Form {
    @Override
    public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
        return Mono.just(this);
    }

    @Override
    public boolean supportsAction(String actionId) {
        return true;
    }

    @Override
    public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
        return Flux.just(this);
    }

    @Override
    public String getTitle() {
        return "Hello World";
    }

    @Override
    public String getSubtitle() {
        return "This is a simple subtitle";
    }
}
