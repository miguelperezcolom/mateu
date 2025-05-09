package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

public interface HandlesActions {

    boolean supportsAction(String actionId);

    Mono<?> handleAction(String actionId, HttpRequest httpRequest);

}
