package com.example.demo;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HasPageTitle;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import reactor.core.publisher.Mono;

@MateuUI("/helloworld")
@Serdeable
public class HelloWorld implements HandlesRoute, HandlesActions, HasTitle, HasSubtitle, Form {
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

    @Override
    public String getTitle() {
        return "Hello World";
    }

    @Override
    public String getSubtitle() {
        return "This is a simple subtitle";
    }
}
