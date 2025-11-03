package io.mateu.core.domain;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import io.mateu.core.domain.out.ComponentUiMapper;
import io.mateu.core.infra.FakeHttpRequest;
import io.mateu.uidl.fluent.UI;
import io.mateu.uidl.fluent.UISupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;
import org.junit.jupiter.api.Test;

class ComponentUiMapperTest {

  final String baseUrl = "http://example.com";
  final HttpRequest httpRequest = new FakeHttpRequest();
  final ComponentUiMapper componentUiMapper = new ComponentUiMapper();

  @Test
  void supportsUISuppliers() {
    var uiSupplier =
        new UISupplier() {
          @Override
          public UI getUI(HttpRequest httpRequest) {
            return UI.builder().build();
          }
        };
    ;
    assertTrue(componentUiMapper.supports(uiSupplier));
    assertFalse(componentUiMapper.supports(""));
  }

  @Test
  void mapsToDto() {
    var instance =
        new UISupplier() {
          @Override
          public UI getUI(HttpRequest httpRequest) {
            return UI.builder()
                .favicon("fav_icon")
                .pageTitle("page_title")
                .homeRoute("home_rouute")
                .build();
          }
        };
    var dto =
        componentUiMapper.map(instance, "/", "/home", Map.of(), new FakeHttpRequest()).block();
    assertNotNull(dto);
  }
}
