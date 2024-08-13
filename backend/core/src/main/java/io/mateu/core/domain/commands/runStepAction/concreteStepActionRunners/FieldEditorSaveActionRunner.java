package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.inbound.JourneyContainerService;
import io.mateu.core.domain.model.inbound.editors.FieldEditor;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.dtos.JourneyContainer;
import io.mateu.dtos.Step;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FieldEditorSaveActionRunner implements ActionRunner {

  final JourneyContainerService store;
  final Serializer serializer;
  final ValidationService validationService;

  @Override
  public boolean applies(JourneyContainer journeyContainer, Object viewInstance, String actionId) {
    return viewInstance instanceof FieldEditor && "save".equals(actionId);
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
    FieldEditor fieldEditor = (FieldEditor) viewInstance;

    Step initialStep = store.readStep(journeyContainer, fieldEditor.getInitialStep());

    Object object = serializer.fromJson(serializer.toJson(data), fieldEditor.getType());

    validationService.validate(object);

    data = serializer.toMap(object);
    data.put("__toString", "" + object);

    var newData = new HashMap<>(initialStep.data());
    newData.put(fieldEditor.getFieldId(), data);

    journeyContainer
        .getSteps()
        .put(
            initialStep.id(),
            new Step(
                initialStep.id(),
                initialStep.name(),
                initialStep.type(),
                initialStep.view(),
                newData,
                initialStep.rules(),
                initialStep.previousStepId(),
                initialStep.target()));

    store.backToStep(journeyContainer, initialStep.id()); // will save the step

    return Mono.empty();
  }
}
