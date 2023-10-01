package io.mateu.core.domain.commands.runStep.concreteActionRunners;

import io.mateu.core.domain.commands.runStep.ActionRunner;
import io.mateu.core.domain.store.JourneyStoreService;
import jakarta.persistence.Entity;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;

@Service
public class EntityEditActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance.getClass().isAnnotationPresent(Entity.class) && "edit".equals(actionId);
  }

  @Override
  public void run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    store.setStep(journeyId, "edit", viewInstance, serverHttpRequest);
  }
}
