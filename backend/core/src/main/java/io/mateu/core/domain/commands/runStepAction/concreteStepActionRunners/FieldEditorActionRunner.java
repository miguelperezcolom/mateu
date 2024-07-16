package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.editors.FieldEditor;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.reflection.ReflectionHelper;
import io.mateu.core.domain.uidefinition.shared.reflection.FieldInterfaced;
import io.mateu.core.domain.util.Serializer;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FieldEditorActionRunner implements ActionRunner {

  final JourneyStoreService store;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

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

    FieldInterfaced field = reflectionHelper.getFieldByName(viewInstance.getClass(), fieldId);

    Object targetValue = reflectionHelper.getValue(field, viewInstance);

    if (targetValue == null) {
      targetValue = reflectionHelper.newInstance(field.getType());
    }

    store.setStep(
        journeyId,
        actionId,
        new FieldEditor(targetValue, fieldId, store.getCurrentStep(journeyId).getId(), serializer),
        serverHttpRequest);

    return Mono.empty();
  }
}
