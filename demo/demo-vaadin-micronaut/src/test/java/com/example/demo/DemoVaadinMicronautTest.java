package com.example.demo;

import io.mateu.MicronautInstanceFactoryProvider;
import io.mateu.core.domain.DefaultInstanceFactoryProvider;
import io.mateu.core.domain.InstanceFactory;
import io.mateu.core.domain.InstanceFactoryProvider;
import io.micronaut.runtime.EmbeddedApplication;
import io.micronaut.test.extensions.junit5.annotation.MicronautTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Assertions;

import jakarta.inject.Inject;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@MicronautTest
class DemoVaadinMicronautTest {

    @Inject
    InstanceFactory instanceFactory;

    @Inject
    DefaultInstanceFactoryProvider defaultInstanceFactoryProvider;

    @Inject
    EmbeddedApplication<?> application;

    @Test
    void testItWorks() {
        Assertions.assertTrue(application.isRunning());
    }

    @Inject
    InstanceFactoryProvider instanceFactoryProvider;

    @Inject
    List<InstanceFactory> factories;

    @Test
    void instanceIsCreated() {
        assertNotNull(instanceFactory);
        assertNotNull(defaultInstanceFactoryProvider);
        assertNotNull(instanceFactoryProvider.get(Hello.class.getName()));
    }

    @Test
    void listIsInjected() {
        assertTrue(factories.size() > 0);
    }

    @Inject
    TestFactory testFactory;

    @Test
    void factoryIsInjected() {
        assertTrue(testFactory.factories.size() > 0);
    }

    @Inject
    FailingTestFactory failingTestFactory;

    @Test
    void factoryIsNotInjected() {
        assertTrue(failingTestFactory.getFactories().size() > 0);
    }

}
