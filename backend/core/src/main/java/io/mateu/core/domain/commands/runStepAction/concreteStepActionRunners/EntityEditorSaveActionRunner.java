package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.editors.EntityEditor;
import io.mateu.core.domain.model.persistence.Merger;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.uidefinition.shared.data.Destination;
import io.mateu.core.domain.uidefinition.shared.data.DestinationType;
import io.mateu.core.domain.uidefinition.shared.data.Result;
import io.mateu.core.domain.uidefinition.shared.data.ResultType;
import io.mateu.remote.dtos.Step;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class EntityEditorSaveActionRunner implements ActionRunner {

  final JourneyStoreService store;
  final ValidationService validationService;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof EntityEditor && "save".equals(actionId);
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
    EntityEditor entityEditor = (EntityEditor) viewInstance;
    Merger merger = store.getApplicationContext().getBean(Merger.class);
    var entity = merger.getEntity(data, entityEditor.getEntityClass());
    validationService.validate(entity);
    merger.mergeAndCommit(data, entityEditor.getEntityClass());
    data.remove("__entityClassName__");
    entityEditor.setData(data);
    store.setStep(journeyId, stepId, entityEditor, serverHttpRequest);

    Step initialStep = store.getInitialStep(journeyId);

    Result whatToShow =
        new Result(
            ResultType.Success,
            "" + viewInstance.toString() + " has been saved",
            List.of(),
            new Destination(
                DestinationType.ActionId, "Back to " + initialStep.getName(), initialStep.getId()),
            null);
    String newStepId = "result_" + UUID.randomUUID().toString();
    store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);

    return Mono.empty();
  }
}
