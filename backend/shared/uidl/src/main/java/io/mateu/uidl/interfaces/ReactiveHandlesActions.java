package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

public interface ReactiveHandlesActions {

  boolean supportsAction(String actionId);

  Mono<?> handleAction(String actionId, HttpRequest httpRequest);
}
