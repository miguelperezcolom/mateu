package io.mateu.core.domain;

import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

import java.lang.reflect.InvocationTargetException;
import java.util.Map;

public interface ActionRunner {

    boolean supports(Object instance, String actionId);

    default int priority() {
        return Integer.MAX_VALUE;
    }

    Mono<?> run(Object instance, String actionId, Map<String, Object> data, HttpRequest httpRequest);

}
