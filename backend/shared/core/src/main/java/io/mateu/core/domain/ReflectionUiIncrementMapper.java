package io.mateu.core.domain;

import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MapsToDto;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

@Named
public class ReflectionUiIncrementMapper implements UiIncrementMapper {
  @Override
  public Mono<UIIncrementDto> map(Object instance, String baseUrl, HttpRequest httpRequest) {
    if (instance == null) {
      return Mono.empty();
    }
    if (instance instanceof UIIncrementDto uiIncrementDto) {
      return Mono.just(uiIncrementDto);
    }
    if (instance instanceof MapsToDto mapsToDto) {
      return Mono.just(mapsToDto.toUIIncrementDto());
    }
    return Mono.just(new UIIncrementDto(null, null, null, null));
  }
}
