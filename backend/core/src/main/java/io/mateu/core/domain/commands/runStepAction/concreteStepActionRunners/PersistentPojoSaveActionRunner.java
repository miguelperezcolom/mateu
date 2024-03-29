package io.mateu.core.domain.commands.runStepAction.concreteStepActionRunners;

import io.mateu.core.domain.commands.runStepAction.ActionRunner;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.mdd.core.interfaces.PersistentPojo;
import io.mateu.mdd.core.interfaces.ReadOnlyPojo;
import io.mateu.mdd.shared.data.Destination;
import io.mateu.mdd.shared.data.DestinationType;
import io.mateu.mdd.shared.data.Result;
import io.mateu.mdd.shared.data.ResultType;
import io.mateu.remote.dtos.Step;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PersistentPojoSaveActionRunner implements ActionRunner {

  final JourneyStoreService store;
  final ValidationService validationService;

  @Override
  public boolean applies(Object viewInstance, String actionId) {
    return viewInstance instanceof PersistentPojo && "save".equals(actionId);
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
    validationService.validate(viewInstance);
    ((PersistentPojo) viewInstance).save();
    refreshDetailView(journeyId, stepId, serverHttpRequest);

    Step initialStep = store.getInitialStep(journeyId);

    Step currentStep = store.readStep(journeyId, stepId);

    List<Destination> youMayBeInterestedIn = new ArrayList<>();
    Step detail = store.readStep(journeyId, currentStep.getPreviousStepId());
    if (detail != null) {
      youMayBeInterestedIn.add(
          new Destination(
              DestinationType.ActionId,
              "Return to " + detail.getName() + " detail",
              detail.getId()));
    }

    Result whatToShow =
        new Result(
            ResultType.Success,
            "" + viewInstance.toString() + " has been saved",
            youMayBeInterestedIn,
            new Destination(
                DestinationType.ActionId,
                "Return to " + initialStep.getName(),
                initialStep.getId()),
            null);
    String newStepId = "result_" + UUID.randomUUID().toString();
    store.setStep(journeyId, newStepId, whatToShow, serverHttpRequest);

    return Mono.empty();
  }

  private void refreshDetailView(
      String journeyId, String stepId, ServerHttpRequest serverHttpRequest) throws Throwable {
    if ("list_view_edit".equals(stepId)) {
      Object detailView = store.getViewInstance(journeyId, "list_view", serverHttpRequest);
      if (detailView instanceof ReadOnlyPojo) {
        ((ReadOnlyPojo) detailView).load(((ReadOnlyPojo) detailView).retrieveId());
        store.updateStep(journeyId, "list_view", detailView, serverHttpRequest);
      }
    }
  }
}
