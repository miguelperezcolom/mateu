package io.mateu.core.domain;

import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Mono;

public interface UiIncrementMapper {

  Mono<UIIncrementDto> map(Object instance, String baseUrl, HttpRequest httpRequest);
}
