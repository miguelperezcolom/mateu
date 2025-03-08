package io.mateu.core.domain;


import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

import java.util.Map;

public interface InstanceFactory {

    Mono<? extends Object> createInstance(String className, Map<String, Object> data, HttpRequest httpRequest);

}
