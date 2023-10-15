package io.mateu.core.domain.commands.runStep.concreteActionRunners;

import io.mateu.core.domain.commands.runStep.ActionRunner;
import io.mateu.core.domain.model.editors.FieldEditor;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.shared.reflection.FieldInterfaced;
import io.mateu.reflection.ReflectionHelper;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class FieldEditorActionRunner implements ActionRunner {

  @Autowired JourneyStoreService store;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return actionId.startsWith("__editfield__");
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
    if (viewInstance instanceof FieldEditor) {
      store.setStep(journeyId, actionId, viewInstance, serverHttpRequest);
      return Mono.empty();
    }
    String fieldId = actionId.substring("__editfield__".length());

    FieldInterfaced field = ReflectionHelper.getFieldByName(viewInstance.getClass(), fieldId);

    Object targetValue = ReflectionHelper.getValue(field, viewInstance);

    if (targetValue == null) {
      targetValue = ReflectionHelper.newInstance(field.getType());
    }

    store.setStep(
        journeyId,
        actionId,
        new FieldEditor(targetValue, fieldId, store.getCurrentStep(journeyId).getId()),
        serverHttpRequest);

    return Mono.empty();
  }
}
