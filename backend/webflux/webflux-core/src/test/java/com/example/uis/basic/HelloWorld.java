package com.example.uis.basic;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import reactor.core.publisher.Mono;

@MateuUI("/hello")
public class HelloWorld implements ReactiveHandlesActions, HandlesRoute {
  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Mono<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return Mono.just(this);
  }

  @Override
  public Mono<?> handleRoute(String actionId, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
