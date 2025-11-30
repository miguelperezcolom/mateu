package com.example.demo.infra.in.ui.fluent.usecases;


import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.swagger.v3.oas.annotations.media.Schema;
import reactor.core.publisher.Flux;

import java.util.List;

@Route(value="/use-cases/booking-detail", parentRoute="^$")
@Schema
public class BookingDetailPage implements ComponentTreeSupplier, ActionHandler {

    @Override
    public Component component(HttpRequest httpRequest) {
        return VerticalLayout.builder()
                .content(List.of(
                ))
                .build();
    }

    @Override
    public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
        return Flux.just(this);
    }

}