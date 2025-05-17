package com.example.uis;

import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HasFavicon;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

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
  public Mono<?> handleAction(String actionId, HttpRequest httpRequest) {
    return Mono.just(this);
  }
}
