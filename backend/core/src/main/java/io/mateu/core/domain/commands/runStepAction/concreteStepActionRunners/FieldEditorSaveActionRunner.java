package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.editors.FieldEditor;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.util.Serializer;
import io.mateu.remote.dtos.Step;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FieldEditorSaveActionRunner implements ActionRunner {

  final JourneyStoreService store;
  final Serializer serializer;
  final ValidationService validationService;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof FieldEditor && "save".equals(actionId);
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
    FieldEditor fieldEditor = (FieldEditor) viewInstance;

    Step initialStep = store.readStep(journeyId, fieldEditor.getInitialStep());

    Object object = serializer.fromJson(serializer.toJson(data), fieldEditor.getType());

    validationService.validate(object);

    data = serializer.toMap(object);
    data.put("__toString", "" + object);

    initialStep.getData().put(fieldEditor.getFieldId(), data);

    store.backToStep(journeyId, initialStep.getId()); // will save the step

    return Mono.empty();
  }
}
