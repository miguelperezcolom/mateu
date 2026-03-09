package com.example.uis;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RouteHandler;
import reactor.core.publisher.Mono;

@UI("")
public class HelloWorldHandlingRoute implements RouteHandler {
  @Override
  public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
