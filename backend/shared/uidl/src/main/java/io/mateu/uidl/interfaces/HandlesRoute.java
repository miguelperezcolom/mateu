package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

public interface HandlesRoute {

    Mono<?> handle(String route, HttpRequest httpRequest);

}
