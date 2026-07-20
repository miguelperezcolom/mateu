package com.example.demo;

import io.micronaut.context.ApplicationContext;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpStatus;
import io.micronaut.http.MediaType;
import io.micronaut.http.client.HttpClient;
import io.micronaut.runtime.server.EmbeddedServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Boots the real server and exercises mateu over HTTP, to prove that the zero-configuration
 * onboarding works: the application carries no @Import/@SerdeImport, so every mateu bean,
 * introspection and serde must come from the io.mateu:micronaut-core jar.
 */
class MateuHttpE2eTest {

    private static EmbeddedServer server;
    private static HttpClient client;

    @BeforeAll
    static void setupServer() {
        server = ApplicationContext.run(EmbeddedServer.class, Map.of("micronaut.server.port", "-1"));
        client = server.getApplicationContext().createBean(HttpClient.class, server.getURL());
    }

    @AfterAll
    static void stopServer() {
        if (server != null) {
            server.stop();
        }
        if (client != null) {
            client.stop();
        }
    }

    @Test
    void indexIsServedForUiRoute() {
        var response = client.toBlocking().exchange("/anothercounter", String.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertTrue(response.body().contains("<mateu-ui baseUrl=\"/anothercounter\""));
    }

    @Test
    void spaSubRouteServesTheSameIndex() {
        var response = client.toBlocking().exchange("/fluent/section1", String.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertTrue(response.body().contains("<mateu-ui baseUrl=\"/fluent\""));
    }

    @Test
    void runActionExecutesTheActionAndReturnsTheNewState() {
        var response = client.toBlocking().exchange(
                HttpRequest.POST("/anothercounter/mateu/v3/x", runActionPayload("add"))
                        .contentType(MediaType.APPLICATION_JSON),
                String.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertTrue(response.body().contains("\"count\":1"), "expected incremented state: " + response.body());
    }

    @Test
    void runActionSseStreamsTheUiIncrement() {
        var response = client.toBlocking().exchange(
                HttpRequest.POST("/anothercounter/mateu/v3/sse/x", runActionPayload("add"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.TEXT_EVENT_STREAM),
                String.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertEquals(MediaType.TEXT_EVENT_STREAM_TYPE, response.getContentType().orElseThrow());
        assertTrue(response.body().contains("\"count\":1"), "expected incremented state: " + response.body());
    }

    @Test
    void initialLoadReturnsTheAppComponentTree() {
        var response = client.toBlocking().exchange(
                HttpRequest.POST("/fluent/mateu/v3/x",
                                runActionPayload("", "/fluent", "com.example.demo.infra.in.ui.fluent.FluentApp"))
                        .contentType(MediaType.APPLICATION_JSON),
                String.class);

        assertEquals(HttpStatus.OK, response.getStatus());
        assertTrue(response.body().contains("Fluent Demo App"), "expected app metadata: " + response.body());
    }

    private static Map<String, Object> runActionPayload(String actionId) {
        return runActionPayload(actionId, "/anothercounter", "com.example.demo.infra.in.ui.AnotherCounter");
    }

    private static Map<String, Object> runActionPayload(String actionId, String route, String serverSideType) {
        return Map.of(
                "componentState", Map.of(),
                "appState", Map.of(),
                "parameters", Map.of(),
                "actionId", actionId,
                "route", route,
                "serverSideType", serverSideType);
    }
}
