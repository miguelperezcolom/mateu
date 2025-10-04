package com.example.uis;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.RouteHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

@MateuUI("")
public class HelloWorldHandlingRoute implements RouteHandler {
  @Override
  public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
