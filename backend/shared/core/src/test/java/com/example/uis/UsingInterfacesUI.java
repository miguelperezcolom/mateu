package com.example.uis;

import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.FaviconSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;

public class UsingInterfacesUI implements FaviconSupplier, ActionHandler {

  @Override
  public String favicon() {
    return "fav_icon";
  }

  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Flux<Object> handleAction(String actionId, HttpRequest httpRequest) {
    return Flux.just(this);
  }
}
