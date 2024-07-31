package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.listActionRunners;

import io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners.ListActionRunner;
import io.mateu.core.domain.model.store.JourneyContainerService;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CrudNewActionRunner implements ListActionRunner {

  @Autowired JourneyContainerService store;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Crud crud, String actionId) {
    return "new".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Crud crud,
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
      store.setStep(journeyContainer, newStepId, editor, serverHttpRequest);

    } catch (Throwable e) {
      throw new Exception(
          "Crud onNew thrown " + e.getClass().getSimpleName() + ": " + e.getMessage());
    }

    return Mono.empty();
  }
}
