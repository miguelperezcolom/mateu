package io.mateu.core.domain.queries.getStep;

import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.util.Serializer;
import io.mateu.dtos.Crud;
import io.mateu.dtos.Step;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class GetStepQueryHandler {

  @Autowired JourneyStoreService store;

  @Autowired Serializer serializer;

  public Mono<Step> run(GetStepQuery query) throws Exception {

    String stepId = query.getStepId();
    ServerHttpRequest serverHttpRequest = query.getServerHttpRequest();

    Step step = store.getStepAndSetAsCurrent(query.getJourneyContainer(), stepId);
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
}
