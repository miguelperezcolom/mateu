package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.Crud;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudNewActionRunner implements ListActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Crud crud, String actionId) {
    return "new".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      Crud crud,
      String journeyId,
      String stepId,
      String listId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {

    try {

      Object editor = crud.getNewRecordForm();

      if (editor == null) {
        throw new Exception("Crud onNew and onEdit returned null");
      }

      String newStepId = "new_" + UUID.randomUUID().toString();
      store.setStep(journeyId, newStepId, editor, serverHttpRequest);

    } catch (Throwable e) {
      throw new Exception(
          "Crud onNew thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    return Mono.empty();
  }
}
