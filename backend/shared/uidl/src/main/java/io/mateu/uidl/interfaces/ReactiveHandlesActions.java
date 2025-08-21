package io.mateu.uidl.interfaces;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ReactiveHandlesActions {

  boolean supportsAction(String actionId);

  Flux<Object> handleAction(String actionId, HttpRequest httpRequest);
}
