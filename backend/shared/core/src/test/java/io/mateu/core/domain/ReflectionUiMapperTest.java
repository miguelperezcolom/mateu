package io.mateu.core.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.AnnotatedUI;
import com.example.uis.UsingInterfacesUI;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class ReflectionUiMapperTest {

    final String baseUrl = "http://example.com";
    final HttpRequest httpRequest = new FakeHttpRequest();
    final UiMapper reflectionUiMapper = new ReflectionUiMapper();

    @Test
    void mapsToDto() {
        var instance = new Object();
        var dto = reflectionUiMapper.map(instance, "/", new FakeHttpRequest()).block();
        assertNotNull(dto);
    }

    @Test
    void buildIsCalled() {
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

    @Test
    void favIconIsFilled() {
        for (var instance : List.of(new AnnotatedUI(), new UsingInterfacesUI())) {
            var dto = reflectionUiMapper.map(instance, baseUrl, httpRequest).block();
            assertNotNull(dto);
            assertThat(dto.favIcon()).isNotNull();
            assertThat(dto.favIcon()).isEqualTo("fav_icon");
        };
    }


}