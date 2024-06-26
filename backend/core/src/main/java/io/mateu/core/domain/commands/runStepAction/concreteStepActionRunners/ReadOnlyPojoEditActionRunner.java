package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class ReadOnlyPojoEditActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof ReadOnlyPojo && "edit".equals(actionId);
  }

  @Override
  public Mono<Void> run(
      Object viewInstance,
      String journeyId,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    Object editor = ((ReadOnlyPojo) viewInstance).retrieveEditor();

    if (editor == null) {
      throw new Exception(
          "getEditor returned null for the ReadOnlyPojo "
              + viewInstance.getClass().getSimpleName());
    }

    store.setStep(journeyId, "edit", editor, serverHttpRequest);

    return Mono.empty();
  }
}
