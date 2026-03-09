package com.example.uis;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;

@UI("")
public class HelloWorldHandlingActions implements ActionHandler {
  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return Flux.just(this);
  }
}
