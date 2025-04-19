package io.mateu.core.domain;

import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HttpRequest;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

class ReflectionUiMapperTest {

    @Test
    void mapsToDto() {
        var reflectionUiMapper = new ReflectionUiMapper();
        var instance = new Object();
        var dto = reflectionUiMapper.map(instance, "/", new FakeHttpRequest()).block();
        assertNotNull(dto);
    }

    @Test
    void buildIsCalled() {
        var baseUrl = "http://example.com";
        var httpRequest = new FakeHttpRequest();
        var reflectionUiMapper = new ReflectionUiMapper();
        var expectedDto = new UIDto(
                baseUrl,
                httpRequest.toString(),
                "logo",
                "title",
                "subtitle",
                List.of(),
                "home_journey_type_id",
                "login_url",
                "welcome_message",
                "logout_url",
                List.of(),
                "context_data"
        );
        var instance = new DynamicUI() {
            @Override
            public Mono<UIDto> build(String baseUrl, HttpRequest httpRequest) {
                return Mono.just(new UIDto(
                        baseUrl,
                        httpRequest.toString(),
                        "logo",
                        "title",
                        "subtitle",
                        List.of(),
                        "home_journey_type_id",
                        "login_url",
                        "welcome_message",
                        "logout_url",
                        List.of(),
                        "context_data"
                ));
            }
        };
        var dto = reflectionUiMapper.map(instance, baseUrl, httpRequest).block();
        assertNotNull(dto);
        assertThat(dto)
                .usingRecursiveComparison()
                .isEqualTo(expectedDto);
    }

}