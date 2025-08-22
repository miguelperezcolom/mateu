package com.example.uis.basic;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@MateuUI("/hello")
public class HelloWorld implements HandlesActions, HandlesRoute {
  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return Flux.just(this);
  }

  @Override
  public Mono<?> handleRoute(String actionId, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
