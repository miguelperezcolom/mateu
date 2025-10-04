package com.example.demo.infra.in.ui.antonia;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.interfaces.Page;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.SubtitleSupplier;
import io.mateu.uidl.interfaces.TitleSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;

@Route("/app/home")
@Route("/fluent-app/home")
@Route("/fluent-app/nested-apps/left/home")
@Route("/fluent-app/nested-apps/top/home")
@Route("/fluent-app/nested-apps/tabs/home")
public class Home implements HandlesActions, TitleSupplier, SubtitleSupplier, Page {

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
        return "Home";
    }

    @Override
    public String subtitle() {
        return "This is a simple subtitle";
    }
}
