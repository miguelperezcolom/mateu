package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.interfaces.Crud;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface ListActionRunner {

  boolean applies(Crud crud, String actionId);

  Mono<UIIncrementDto> run(
      Crud crud,
      String crudStepId,
      String actionId,
      String componentId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      String baseUrl,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
