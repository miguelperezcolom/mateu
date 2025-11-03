package com.example.demo;

import io.mateu.core.domain.ports.InstanceFactoryProvider;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@QuarkusTest
class DITest {

    @Inject
    InstanceFactoryProvider instanceFactoryProvider;

    @Test
    void instanceFactoryProviderIsInjected() {
        assertNotNull(instanceFactoryProvider);
    }

}