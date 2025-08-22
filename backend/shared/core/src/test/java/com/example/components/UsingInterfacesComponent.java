package com.example.components;

import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public class UsingInterfacesComponent implements HandlesActions, HandlesRoute {
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
