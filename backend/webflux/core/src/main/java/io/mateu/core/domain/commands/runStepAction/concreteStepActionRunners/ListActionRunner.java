package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.dtos.UIIncrement;
import io.mateu.uidl.interfaces.Crud;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;
import reactor.core.publisher.Mono;

public interface ListActionRunner {

  boolean applies(Crud crud, String actionId);

  Mono<UIIncrement> run(
      Crud crud,
      String crudStepId,
      String actionId,
      Map<String, Object> data,
      Map<String, Object> contextData,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}
