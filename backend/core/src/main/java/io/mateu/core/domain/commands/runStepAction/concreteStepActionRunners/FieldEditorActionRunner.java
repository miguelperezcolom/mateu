package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.JourneyContainer;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class FieldEditorActionRunner implements ActionRunner {

  final JourneyContainerService store;
  final ReflectionHelper reflectionHelper;
  final Serializer serializer;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return actionId.startsWith("__editfield__");
  }

  @Override
  public Mono<JourneyContainer> run(
      JourneyContainer journeyContainer,
      Object viewInstance,
      String stepId,
      String componentId,
      String actionId,
      Map<String, Object> data,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    if (viewInstance instanceof FieldEditor) {
      journeyContainer = store.setStep(journeyContainer, actionId, viewInstance, serverHttpRequest);
      return Mono.just(journeyContainer);
    }
    String fieldId = actionId.substring("__editfield__".length());

    Field field = reflectionHelper.getFieldByName(viewInstance.getClass(), fieldId);

    Object targetValue = reflectionHelper.getValue(field, viewInstance);

    if (targetValue == null) {
      targetValue = reflectionHelper.newInstance(field.getType());
    }

    journeyContainer =
        store.setStep(
            journeyContainer,
            actionId,
            new FieldEditor(
                targetValue, fieldId, store.getCurrentStep(journeyContainer).id(), serializer),
            serverHttpRequest);

    return Mono.just(journeyContainer);
  }
}
