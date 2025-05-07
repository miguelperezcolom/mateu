package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public interface RouteMatcher {

  Mono<?> map(Object ui, HttpRequest httpRequest);
}
