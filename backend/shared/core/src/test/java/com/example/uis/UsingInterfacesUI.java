package com.example.uis;

import io.mateu.uidl.interfaces.HasFavicon;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ReactiveHandlesActions;
import reactor.core.publisher.Mono;

public class UsingInterfacesUI implements HasFavicon, ReactiveHandlesActions {

  @Override
  public String getFavicon() {
    return "fav_icon";
  }

  @Override
  public boolean supportsAction(String actionId) {
    return true;
  }

  @Override
  public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
