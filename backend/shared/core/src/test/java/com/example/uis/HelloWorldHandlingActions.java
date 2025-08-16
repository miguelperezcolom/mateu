package com.example.uis;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import reactor.core.publisher.Mono;

@MateuUI("")
public class HelloWorldHandlingActions implements ReactiveHandlesActions {
  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Mono<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
