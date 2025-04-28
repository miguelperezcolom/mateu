package com.example.ui;

import io.mateu.core.domain.InstanceFactory;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

import java.util.Map;

@Named
public class HolaMundoInstanceFactory implements InstanceFactory {
    @Override
    public boolean supports(String className) {
        return HolaMundo.class.getName().equals(className);
    }

    @Override
    public int priority() {
        return 0;
    }

    @Override
    public Mono<? extends Object> createInstance(String className, Map<String, Object> data, HttpRequest httpRequest) {
        return Mono.just(new HolaMundo("Hola, que tal?"));
    }
}
