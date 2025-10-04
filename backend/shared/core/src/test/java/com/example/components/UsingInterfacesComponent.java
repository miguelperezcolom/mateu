package com.example.components;

import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class UsingInterfacesComponent implements ActionHandler, RouteHandler {
  @Override
  public boolean supportsAction(String actionId) {
    return "sayHello".equals(actionId);
  }

  @Override
  public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return Flux.just("Hola");
  }

  @Override
  public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
