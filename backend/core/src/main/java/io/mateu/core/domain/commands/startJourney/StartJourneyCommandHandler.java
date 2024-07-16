package io.mateu.core.domain.commands.startJourney;

import io.mateu.core.application.NotFoundException;
import io.mateu.core.domain.model.modelToDtoMappers.JourneyMapper;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.store.JourneyStoreService;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import io.mateu.dtos.Journey;
import io.mateu.dtos.Step;
import java.util.HashMap;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class StartJourneyCommandHandler {

  @Autowired JourneyStoreService store;

  public Mono<Void> handle(StartJourneyCommand command) throws Throwable {

    // listar todas las matu uis

    String journeyId = command.getJourneyId();
    String journeyTypeId = command.getJourneyTypeId();
    ServerHttpRequest serverHttpRequest = command.getServerHttpRequest();

    Journey journey = null;
    Object formInstance = null;

    JourneyContainer journeyContainer = store.findJourneyById(journeyId).orElse(null);
    if (journeyContainer == null) {

      try {

        formInstance = store.createInstanceFromJourneyTypeId(journeyTypeId, serverHttpRequest);

        if (formInstance == null) {
          throw new Exception();
        }

        // we are passing the form instance to avoid creating a new form instance,
        // even though we already have the step definition id, and we could recreate it
        journey = new JourneyMapper().map(formInstance);

      } catch (Exception e) {
        e.printStackTrace();
        log.error("error on getUi", e);
        throw new NotFoundException("No class with name " + journeyTypeId + " found");
      }

      Step step =
          store
              .getStepMapper()
              .map(
                  journeyContainer, getStepId(formInstance), null, formInstance, serverHttpRequest);
      journey.setCurrentStepId(step.getId());
      journey.setCurrentStepDefinitionId(step.getType());
      store(journeyId, journeyTypeId, journey, step);

    } else {
      journeyContainer.reset();
    }

    return Mono.empty().then();
  }

  private String getStepId(Object formInstance) {
    if (formInstance instanceof Listing) return "list";
    return "form";
  }

  private void store(String journeyId, String journeyTypeId, Journey journey, Step step) {
    JourneyContainer journeyContainer =
        JourneyContainer.builder()
            .journeyId(journeyId)
            .journeyTypeId(journeyTypeId)
            .journey(journey)
            .steps(Map.of(step.getId(), step))
            .initialStep(step)
            .lastUsedFilters(new HashMap<>())
            .lastUsedSorting(new HashMap<>())
            .build();
    store.save(journeyContainer);
  }
}
