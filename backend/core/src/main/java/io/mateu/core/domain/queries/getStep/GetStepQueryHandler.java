package io.mateu.core.domain.queries.getStep;

import com.google.common.base.Strings;
import io.mateu.core.domain.apiClients.MateuRemoteClient;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.remote.dtos.Step;
import io.mateu.util.Helper;
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

    dump(journeyContainer);

    Step step = store.getStep(journeyId, stepId);
    if ("list".equals(stepId)) {
      step.getData().remove("__index");
      step.getData().remove("__count");
    }

    return Mono.just(step);
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
                log.info("data: " + Helper.toJson(s.getData()));
              } catch (Exception e) {
                e.printStackTrace();
              }
            });
  }
}
