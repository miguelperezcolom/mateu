package io.mateu.core.domain;

import io.mateu.dtos.UIDto;
import io.mateu.uidl.interfaces.DynamicUI;
import io.mateu.uidl.interfaces.HasPageTitle;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Named;
import java.util.List;
import reactor.core.publisher.Mono;

@Named
public class ReflectionUiMapper implements UiMapper {

  @Override
  public Mono<UIDto> map(Object uiInstance, String baseUrl, HttpRequest httpRequest) {
    if (uiInstance == null) {
      return null;
    }
    if (uiInstance instanceof DynamicUI dynamicUI) {
      return dynamicUI.build(baseUrl, httpRequest);
    }
    return Mono.just(
            new UIDto(
                    null,
                    null,
                    null,
                    getTitle(uiInstance),
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null
            ));
  }

  private String getTitle(Object uiInstance) {
    if (uiInstance instanceof HasPageTitle hasPageTitle) {
      return hasPageTitle.getPageTitle();
    }
    return Humanizer.capitalize(uiInstance.getClass().getSimpleName());
  }
}
