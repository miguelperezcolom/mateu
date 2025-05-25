package com.example.demo.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.App;
import io.mateu.uidl.interfaces.Form;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HasSubtitle;
import io.mateu.uidl.interfaces.HasTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import io.micronaut.serde.annotation.Serdeable;
import reactor.core.publisher.Mono;

@Route("/app/home")
@Serdeable
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
