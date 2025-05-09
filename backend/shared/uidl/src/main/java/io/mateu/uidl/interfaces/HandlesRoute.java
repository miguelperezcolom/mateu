package io.mateu.uidl.interfaces;

import reactor.core.publisher.Mono;

public interface HandlesRoute {

    Mono<?> handleRoute(String route, HttpRequest httpRequest);

}
