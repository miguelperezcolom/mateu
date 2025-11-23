package com.example.demo.ddd.pages.project.aggregates;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import jakarta.inject.Named;

@Title("Aggregates")
@Route("/projects/.*/aggregates")
@Named
public class Aggregates implements PostHydrationHandler {

    String id;

    String route;


    @Override
    public void onHydrated(HttpRequest httpRequest) {
        route = httpRequest.runActionRq().route();
    }

    public Aggregates load(String id) {
        this.id = id;
        return this;
    }
}
