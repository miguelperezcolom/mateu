package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.Page;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@MateuUI("")
public class HelloWorld implements HandlesRoute, HandlesActions, TitleSupplier, SubtitleSupplier, Page {
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
    public String title() {
        return "Hello World";
    }

    @Override
    public String subtitle() {
        return "This is a simple subtitle";
    }
}
