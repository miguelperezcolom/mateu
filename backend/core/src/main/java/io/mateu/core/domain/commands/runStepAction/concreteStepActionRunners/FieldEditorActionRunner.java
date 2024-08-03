package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.reflection.Field;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FieldEditorActionRunner implements ActionRunner {

  final JourneyContainerService store;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return actionId.startsWith("__editfield__");
  }

  @Override
  public Mono<Void> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    if (viewInstance instanceof FieldEditor) {
      store.setStep(journeyContainer, actionId, viewInstance, serverHttpRequest);
      return Mono.empty();
    }
    String fieldId = actionId.substring("__editfield__".length());

    Field field = reflectionHelper.getFieldByName(viewInstance.getClass(), fieldId);

    Object targetValue = reflectionHelper.getValue(field, viewInstance);

    if (targetValue == null) {
      targetValue = reflectionHelper.newInstance(field.getType());
    }

    store.setStep(
        journeyContainer,
        actionId,
        new FieldEditor(
            targetValue, fieldId, store.getCurrentStep(journeyContainer).getId(), serializer),
        serverHttpRequest);

    return Mono.empty();
  }
}
