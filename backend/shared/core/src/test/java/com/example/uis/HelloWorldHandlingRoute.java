package com.example.uis;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

@MateuUI("")
public class HelloWorldHandlingRoute implements HandlesRoute {
  @Override
  public Mono<?> handleRoute(String route, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
