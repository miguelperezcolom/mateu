package io.mateu.core.domain.queries.getStep;

import com.google.common.base.Strings;
import io.mateu.core.domain.apiClients.MateuRemoteClient;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.remote.dtos.Crud;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Serializer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetStepQueryHandler {

  @Autowired JourneyStoreService store;

  @Autowired MateuRemoteClient mateuRemoteClient;

  @Autowired
  Serializer serializer;

  public Mono<Step> run(GetStepQuery query) throws Exception {

    String journeyId = query.getJourneyId();
    String stepId = query.getStepId();
    ServerHttpRequest serverHttpRequest = query.getServerHttpRequest();

    JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);

    if (journeyContainer == null) {
      throw new Exception("No journey with id " + journeyId);
    }

    if (!Strings.isNullOrEmpty(journeyContainer.getRemoteJourneyTypeId())) {
      return mateuRemoteClient.getStep(
          journeyContainer.getRemoteBaseUrl(),
          journeyContainer.getRemoteJourneyTypeId(),
          journeyContainer.getJourneyId(),
          stepId,
          serverHttpRequest);
    }

    // dump(journeyContainer);

    Step step = store.getStepAndSetAsCurrent(journeyId, stepId);
    if (isCrud(step)) {
      step.getData().remove("__index");
      step.getData().remove("__count");
    }

    return Mono.just(step);
  }

  private boolean isCrud(Step step) {
    if (step == null
        || step.getView() == null
        || step.getView().getMain() == null
        || step.getView().getMain().getComponents() == null
        || step.getView().getMain().getComponents().isEmpty()
        || step.getView().getMain().getComponents().get(0) == null
        || step.getView().getMain().getComponents().get(0).getMetadata() == null) {
      return false;
    }
    return step.getView().getMain().getComponents().get(0).getMetadata() instanceof Crud;
  }

  private void dump(JourneyContainer journeyContainer) {

    log.info("-------------------------------------");
    log.info("journey id: " + journeyContainer.getJourneyId());
    journeyContainer.getSteps().values().stream()
        .forEach(
            s -> {
              log.info("step: " + s.getId());
              log.info("previous: " + s.getPreviousStepId());
              try {
                log.info("data: " + serializer.toJson(s.getData()));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
  }
}
