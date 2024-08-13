package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.MethodParametersEditor;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class MethodParametersEditorCancelActionRunner implements ActionRunner {

  @Autowired JourneyContainerService store;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance instanceof MethodParametersEditor && "cancel".equals(actionId);
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
    MethodParametersEditor methodParametersEditor = (MethodParametersEditor) viewInstance;
    journeyContainer = store.backToStep(journeyContainer, methodParametersEditor.getInitialStep());
    return Mono.just(journeyContainer);
  }
}
