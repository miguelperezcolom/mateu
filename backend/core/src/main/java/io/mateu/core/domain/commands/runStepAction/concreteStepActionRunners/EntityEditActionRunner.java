package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.dtos.JourneyContainer;
import jakarta.persistence.Entity;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class EntityEditActionRunner implements ActionRunner {

  @Autowired JourneyContainerService store;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance.getClass().isAnnotationPresent(Entity.class) && "edit".equals(actionId);
  }

  @Override
  public Mono<JourneyContainer> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    journeyContainer = store.setStep(journeyContainer, "edit", viewInstance, serverHttpRequest);
    return Mono.just(journeyContainer);
  }
}
