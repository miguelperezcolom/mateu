package com.example.uis;

import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

@MateuUI("")
public class HelloWorldHandlingActions implements HandlesActions {
  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
