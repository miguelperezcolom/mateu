package com.example.uis.basic;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@MateuUI("/hello")
public class HelloWorld implements ActionHandler, RouteHandler {
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
