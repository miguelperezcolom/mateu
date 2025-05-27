package io.mateu.core.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import com.example.uis.AnnotatedUI;
import com.example.uis.UsingInterfacesUI;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.dtos.UIDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.fluent.UI;
import io.mateu.uidl.fluent.UISupplier;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Mono;

class ReflectionUiMapperTest {

  final String baseUrl = "http://example.com";
  final HttpRequest httpRequest = new FakeHttpRequest();
  final ReflectionUiMapper reflectionUiMapper = new ReflectionUiMapper();

  @Test
  void doesNotSupportUISuppliers() {
    var uiSupplier =
        new UISupplier() {
          @Override
          public UI getUI(HttpRequest httpRequest) {
            return UI.builder().build();
          }
        };
    ;
    assertFalse(reflectionUiMapper.supports(uiSupplier));
    assertTrue(reflectionUiMapper.supports(""));
  }

  @Test
  void mapsToDto() {
    var instance = new Object();
    var dto =
        reflectionUiMapper.map(instance, "/", "/home", Map.of(), new FakeHttpRequest()).block();
    assertNotNull(dto);
  }

  @Test
  void buildIsCalled() {
    var expectedDto =
        new UIDto(
            baseUrl,
            httpRequest.toString(),
            "home_route",
            new UIIncrementDto(List.of(), List.of(), List.of(), Map.of(), Map.of()));
    var instance =
        new DynamicUI() {
          @Override
          public Mono<UIDto> build(String baseUrl, HttpRequest httpRequest) {
            return Mono.just(
                new UIDto(
                    baseUrl,
                    httpRequest.toString(),
                    "home_route",
                    new UIIncrementDto(List.of(), List.of(), List.of(), Map.of(), Map.of())));
          }
        };
    var dto = reflectionUiMapper.map(instance, baseUrl, "/home", Map.of(), httpRequest).block();
    assertNotNull(dto);
    assertThat(dto).usingRecursiveComparison().isEqualTo(expectedDto);
  }

  @Test
  void favIconIsFilled() {
    for (var instance : List.of(new AnnotatedUI(), new UsingInterfacesUI())) {
      var dto = reflectionUiMapper.map(instance, baseUrl, "/home", Map.of(), httpRequest).block();
      assertNotNull(dto);
      assertThat(dto.favIcon()).isNotNull();
      assertThat(dto.favIcon()).isEqualTo("fav_icon");
    }
    ;
  }

  @Test
  void homeRouteIsReturned() {
    var homeRoute = reflectionUiMapper.getHomeRoute(new AnnotatedUI(), "");
    assertThat(homeRoute).isEqualTo("/home");
    homeRoute = reflectionUiMapper.getHomeRoute(new AnnotatedUI(), "/");
    assertThat(homeRoute).isEqualTo("/home");
    homeRoute = reflectionUiMapper.getHomeRoute(new AnnotatedUI(), "/xxx");
    assertThat(homeRoute).isEqualTo("/xxx");
  }
}
