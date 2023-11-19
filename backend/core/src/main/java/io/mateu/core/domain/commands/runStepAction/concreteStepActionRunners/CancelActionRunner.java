package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.editors.ObjectEditor;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import jakarta.persistence.Entity;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class CancelActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return (viewInstance instanceof ReadOnlyPojo
            || viewInstance instanceof PersistentPojo
            || viewInstance instanceof EntityEditor
            || viewInstance instanceof ObjectEditor
            || viewInstance.getClass().isAnnotationPresent(Entity.class))
        && "cancel".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Exception {
    String targetStepId = store.getInitialStep(journeyId).getId();
    if (stepId.endsWith("_edit")) {
      targetStepId = stepId.substring(0, stepId.length() - "_edit".length());
    }
    store.backToStep(journeyId, targetStepId);
    return Mono.empty();
  }
}
