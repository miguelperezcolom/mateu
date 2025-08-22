package com.example.uis;

import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HasFavicon;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;

public class UsingInterfacesUI implements HasFavicon, HandlesActions {

  @Override
  public String getFavicon() {
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
