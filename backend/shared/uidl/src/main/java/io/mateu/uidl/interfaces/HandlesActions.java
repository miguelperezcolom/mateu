package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

public interface HandlesActions {

    boolean supports(String actionId);

    Mono<?> handle(String actionId, HttpRequest httpRequest);

}
