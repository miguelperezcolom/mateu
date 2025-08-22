package com.example.uis;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;

@MateuUI("")
public class HelloWorldHandlingActions implements HandlesActions {
  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return Flux.just(this);
  }
}
