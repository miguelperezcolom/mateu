package io.mateu.core.domain;

import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.List;
import reactor.core.publisher.Mono;

@Named
public class ReflectionUiMapper implements UiMapper {
  @Override
  public Mono<UIDto> map(Object uiInstance, String baseUrl, HttpRequest httpRequest) {
    if (uiInstance instanceof DynamicUI dynamicUI) {
      return dynamicUI.build(baseUrl, httpRequest);
    }
    return Mono.just(
        new UIDto(
            "fav_icon",
            "icon",
            "logo",
            "title",
            "subtitle",
            List.of(),
            "home_journey_type_id",
            "login_url",
            "welcome_message",
            "logout_url",
            List.of(),
            "context_data"));
  }
}
