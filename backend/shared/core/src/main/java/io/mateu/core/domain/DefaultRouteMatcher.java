package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HandlesRoute;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

@Named
public class DefaultRouteMatcher implements RouteMatcher {
  @Override
  public Mono<?> map(Object ui, HttpRequest httpRequest) {
    if (ui instanceof HandlesRoute handlesRoute) {
      return Mono.just(handlesRoute);
    }
    return Mono.empty();
  }
}
