package io.mateu.core.application;

import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.HttpRequest;
import reactor.core.publisher.Flux;

public interface MateuService {

  Flux<UIIncrementDto> runAction(
      String uiId, RunActionRqDto rq, String baseUrl, HttpRequest httpRequest) throws Throwable;
}
