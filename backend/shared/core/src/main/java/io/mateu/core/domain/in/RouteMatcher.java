package io.mateu.core.domain.in;

import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public interface RouteMatcher {

  Mono<?> map(Object ui, HttpRequest httpRequest);
}
