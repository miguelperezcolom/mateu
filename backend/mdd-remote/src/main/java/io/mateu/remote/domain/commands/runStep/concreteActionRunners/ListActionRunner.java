package io.mateu.remote.domain.commands.runStep.concreteActionRunners;

import io.mateu.mdd.core.interfaces.Crud;
import java.util.Map;
import org.springframework.http.server.reactive.ServerHttpRequest;

public interface ListActionRunner {

  boolean applies(Crud crud, String actionId);

  void run(
      Crud crud,
      String journeyId,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable;
}