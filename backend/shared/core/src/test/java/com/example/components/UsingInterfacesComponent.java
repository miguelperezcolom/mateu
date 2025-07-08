package com.example.components;

import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import reactor.core.publisher.Mono;

public class UsingInterfacesComponent implements ReactiveHandlesActions, HandlesRoute {
  @Override
  public boolean supportsAction(String actionId) {
    return "sayHello".equals(actionId);
  }

  @Override
  public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
    return Mono.just("Hola");
  }

  @Override
  public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
