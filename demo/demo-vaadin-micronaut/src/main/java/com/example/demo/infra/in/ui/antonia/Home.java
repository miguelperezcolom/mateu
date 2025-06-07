package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

@Route("/app/home")
@Route("/fluent-app/home")
@Route("/fluent-app/nested-app/home")
@Route("/fluent-app/nested-app/nested-app/home")
public class Home implements HandlesActions, HasTitle, HasSubtitle, Form {

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
        return "Home";
    }

    @Override
    public String getSubtitle() {
        return "This is a simple subtitle";
    }
}
