package com.example.demo;

import io.mateu.core.domain.InstanceFactory;
import jakarta.inject.Inject;
import jakarta.inject.Named;

import java.util.List;

@Named
public class FailingTestFactory {

    private final List<InstanceFactory> factories;

    public FailingTestFactory(List<InstanceFactory> factories) {
        this.factories = factories;
    }

    public List<InstanceFactory> getFactories() {
        return factories;
    }

}
